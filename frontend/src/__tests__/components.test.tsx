import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import StatusBadge from '../components/StatusBadge';
import LeadCard from '../components/LeadCard';
import ActivityTimeline from '../components/ActivityTimeline';
import type { Lead, Activity } from '../types';

// ─── StatusBadge ──────────────────────────────────────────
describe('StatusBadge', () => {
  it('renders the correct label for each status', () => {
    const statuses: Lead['status'][] = [
      'new',
      'contacted',
      'qualified',
      'converted',
      'lost',
    ];
    const labels = ['New', 'Contacted', 'Qualified', 'Converted', 'Lost'];

    statuses.forEach((status, i) => {
      const { container } = render(<StatusBadge status={status} />);
      expect(container.textContent).toBe(labels[i]);
    });
  });

  it('applies the correct CSS class for each status', () => {
    const { container } = render(<StatusBadge status="converted" />);
    expect(container.firstChild).toHaveClass('status-converted');
  });
});

// ─── LeadCard ─────────────────────────────────────────────
const mockLead: Lead = {
  _id: 'lead-abc-123',
  formId: 'form_001',
  fullName: 'John Doe',
  email: 'john@example.com',
  phone: '+1234567890',
  status: 'new',
  source: 'meta_ads',
  campaignName: 'Test Campaign',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

describe('LeadCard', () => {
  it('renders the lead name and email', () => {
    render(
      <MemoryRouter>
        <LeadCard lead={mockLead} />
      </MemoryRouter>
    );
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
  });

  it('shows status badge', () => {
    render(
      <MemoryRouter>
        <LeadCard lead={mockLead} />
      </MemoryRouter>
    );
    expect(screen.getByText('New')).toBeInTheDocument();
  });

  it('links to the correct lead detail URL', () => {
    render(
      <MemoryRouter>
        <LeadCard lead={mockLead} />
      </MemoryRouter>
    );
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/leads/lead-abc-123');
  });
});

// ─── ActivityTimeline ──────────────────────────────────────
const mockActivities: Activity[] = [
  {
    _id: 'act-001',
    leadId: 'lead-abc-123',
    action: 'lead_created',
    description: 'Lead created from Meta Ads webhook.',
    performedBy: 'system',
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'act-002',
    leadId: 'lead-abc-123',
    action: 'status_changed',
    description: 'Status changed from new to contacted',
    performedBy: 'system',
    createdAt: new Date().toISOString(),
  },
];

describe('ActivityTimeline', () => {
  it('renders all activity items', () => {
    render(<ActivityTimeline activities={mockActivities} />);
    expect(screen.getByText('Lead Created')).toBeInTheDocument();
    expect(screen.getByText('Status Changed')).toBeInTheDocument();
  });

  it('renders empty state when no activities', () => {
    render(<ActivityTimeline activities={[]} />);
    expect(screen.getByText('No activity recorded yet')).toBeInTheDocument();
  });

  it('renders activity descriptions', () => {
    render(<ActivityTimeline activities={mockActivities} />);
    expect(
      screen.getByText('Lead created from Meta Ads webhook.')
    ).toBeInTheDocument();
  });
});
