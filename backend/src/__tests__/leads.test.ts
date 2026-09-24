import request from 'supertest';
import mongoose from 'mongoose';
import app from '../app';

// We mock mongoose to avoid real DB calls in unit tests
jest.mock('mongoose', () => {
  const actual = jest.requireActual('mongoose');
  return {
    ...actual,
    connect: jest.fn().mockResolvedValue({}),
  };
});

// Mock Lead model
jest.mock('../models/Lead', () => ({
  Lead: {
    create: jest.fn(),
    find: jest.fn(),
    findById: jest.fn(),
    countDocuments: jest.fn(),
  },
}));

// Mock Activity model
jest.mock('../models/Activity', () => ({
  Activity: {
    create: jest.fn(),
    find: jest.fn(),
  },
}));

const { Lead } = require('../models/Lead');
const { Activity } = require('../models/Activity');

describe('GET /health', () => {
  it('should return 200 with status ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});

describe('POST /webhook/meta-lead', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const validPayload = {
    form_id: 'form_123',
    ad_id: 'ad_456',
    ad_name: 'Test Ad',
    campaign_id: 'camp_789',
    campaign_name: 'Test Campaign',
    field_data: [
      { name: 'full_name', values: ['John Doe'] },
      { name: 'email', values: ['john@example.com'] },
      { name: 'phone_number', values: ['+1234567890'] },
    ],
  };

  it('should create a lead from valid webhook payload', async () => {
    const mockLead = {
      _id: new mongoose.Types.ObjectId(),
      ...validPayload,
      status: 'new',
    };

    Lead.create.mockResolvedValue(mockLead);
    Activity.create.mockResolvedValue({});

    const res = await request(app).post('/webhook/meta-lead').send(validPayload);

    expect(res.status).toBe(201);
    expect(res.body.count).toBe(1);
  });

  it('should return 400 on empty body', async () => {
    const res = await request(app).post('/webhook/meta-lead').send({});
    expect(res.status).toBe(400);
  });
});

describe('GET /leads', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return paginated leads', async () => {
    const mockLeads = [
      { _id: new mongoose.Types.ObjectId(), fullName: 'Jane Doe', status: 'new' },
    ];

    Lead.find.mockReturnValue({
      sort: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue(mockLeads),
    });
    Lead.countDocuments.mockResolvedValue(1);

    const res = await request(app).get('/leads');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.pagination).toBeDefined();
  });
});

describe('GET /leads/:id', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 404 when lead not found', async () => {
    Lead.findById.mockReturnValue({
      lean: jest.fn().mockResolvedValue(null),
    });

    const fakeId = new mongoose.Types.ObjectId().toString();
    const res = await request(app).get(`/leads/${fakeId}`);

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Lead not found');
  });

  it('should return lead with activities', async () => {
    const leadId = new mongoose.Types.ObjectId();
    const mockLead = { _id: leadId, fullName: 'Jane Doe', status: 'new' };

    Lead.findById.mockReturnValue({
      lean: jest.fn().mockResolvedValue(mockLead),
    });
    Activity.find.mockReturnValue({
      sort: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue([]),
    });

    const res = await request(app).get(`/leads/${leadId.toString()}`);

    expect(res.status).toBe(200);
    expect(res.body.lead).toBeDefined();
    expect(res.body.activities).toBeDefined();
  });
});

describe('PATCH /leads/:id/status', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 400 for invalid status', async () => {
    const fakeId = new mongoose.Types.ObjectId().toString();
    const res = await request(app)
      .patch(`/leads/${fakeId}/status`)
      .send({ status: 'invalid_status' });

    expect(res.status).toBe(400);
  });

  it('should return 404 when lead not found', async () => {
    Lead.findById.mockResolvedValue(null);

    const fakeId = new mongoose.Types.ObjectId().toString();
    const res = await request(app)
      .patch(`/leads/${fakeId}/status`)
      .send({ status: 'contacted' });

    expect(res.status).toBe(404);
  });
});
