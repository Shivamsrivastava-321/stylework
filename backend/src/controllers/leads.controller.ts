import { Request, Response, NextFunction } from 'express';
import { Lead } from '../models/Lead';
import { Activity } from '../models/Activity';
import { createActivity } from '../services/activity.service';
import {
  MetaWebhookSchema,
  UpdateLeadStatusSchema,
} from '../validators/lead.validator';

// Helper to extract field value from Meta Ads field_data
const extractField = (
  fieldData: { name: string; values: string[] }[],
  fieldName: string
): string => {
  const field = fieldData.find((f) => f.name === fieldName);
  return field?.values?.[0] ?? '';
};

// Helper to extract name fields (Meta sends 'full_name' or 'first_name'+'last_name')
const extractName = (fieldData: { name: string; values: string[] }[]): string => {
  const fullName = extractField(fieldData, 'full_name');
  if (fullName) return fullName;
  const firstName = extractField(fieldData, 'first_name');
  const lastName = extractField(fieldData, 'last_name');
  return [firstName, lastName].filter(Boolean).join(' ') || 'Unknown';
};

/**
 * POST /webhook/meta-lead
 * Receives Meta Ads lead gen webhook payload
 */
export const receiveMetaWebhook = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const parsed = MetaWebhookSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        error: 'Invalid webhook payload',
        details: parsed.error.flatten(),
      });
      return;
    }

    const payload = parsed.data;
    const createdLeads = [];

    // Handle Meta Ads full webhook format (entry > changes > value)
    if (payload.entry && payload.entry.length > 0) {
      for (const entry of payload.entry) {
        for (const change of entry.changes) {
          const { value } = change;
          const { field_data, form_id, ad_id, ad_name, campaign_id, campaign_name } = value;

          const email = extractField(field_data, 'email');
          const phone = extractField(field_data, 'phone_number');
          const fullName = extractName(field_data);

          const lead = await Lead.create({
            formId: form_id,
            adId: ad_id,
            adName: ad_name,
            campaignId: campaign_id,
            campaignName: campaign_name,
            fullName,
            email: email || `unknown-${Date.now()}@meta.com`,
            phone,
            rawPayload: req.body as Record<string, unknown>,
          });

          await createActivity({
            leadId: lead._id,
            action: 'lead_created',
            description: `Lead created from Meta Ads webhook. Form ID: ${form_id}`,
            metadata: { formId: form_id, adId: ad_id, campaignId: campaign_id },
          });

          createdLeads.push(lead);
        }
      }
    }
    // Handle simplified direct format (for testing / manual submission)
    else if (payload.field_data && payload.form_id) {
      const { field_data, form_id, ad_id, ad_name, campaign_id, campaign_name } = payload;

      const email = extractField(field_data, 'email');
      const phone = extractField(field_data, 'phone_number');
      const fullName = extractName(field_data);

      const lead = await Lead.create({
        formId: form_id,
        adId: ad_id,
        adName: ad_name,
        campaignId: campaign_id,
        campaignName: campaign_name,
        fullName,
        email: email || `unknown-${Date.now()}@meta.com`,
        phone,
        rawPayload: req.body as Record<string, unknown>,
      });

      await createActivity({
        leadId: lead._id,
        action: 'lead_created',
        description: `Lead created from Meta Ads webhook. Form ID: ${form_id}`,
        metadata: { formId: form_id, adId: ad_id, campaignId: campaign_id },
      });

      createdLeads.push(lead);
    } else {
      res.status(400).json({ error: 'Webhook payload missing required fields' });
      return;
    }

    res.status(201).json({
      message: 'Leads received and stored successfully',
      count: createdLeads.length,
      leads: createdLeads,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /leads
 * Returns paginated list of leads with optional filtering
 */
export const getLeads = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = {};

    if (req.query.status) {
      filter.status = req.query.status;
    }

    if (req.query.search) {
      const searchStr = req.query.search as string;
      filter.$or = [
        { fullName: { $regex: searchStr, $options: 'i' } },
        { email: { $regex: searchStr, $options: 'i' } },
      ];
    }

    const [leads, total] = await Promise.all([
      Lead.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Lead.countDocuments(filter),
    ]);

    res.json({
      data: leads,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /leads/:id
 * Returns a single lead with its activity timeline
 */
export const getLeadById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    const lead = await Lead.findById(id).lean();
    if (!lead) {
      res.status(404).json({ error: 'Lead not found' });
      return;
    }

    const activities = await Activity.find({ leadId: lead._id })
      .sort({ createdAt: -1 })
      .lean();

    res.json({ lead, activities });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /leads/:id/status
 * Updates the status of a lead and records the change
 */
export const updateLeadStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    const parsed = UpdateLeadStatusSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        error: 'Invalid status value',
        details: parsed.error.flatten(),
      });
      return;
    }

    const { status } = parsed.data;

    const lead = await Lead.findById(id);
    if (!lead) {
      res.status(404).json({ error: 'Lead not found' });
      return;
    }

    const previousStatus = lead.status;

    if (previousStatus === status) {
      res.json({ lead, message: 'Status unchanged' });
      return;
    }

    lead.status = status;
    await lead.save();

    await createActivity({
      leadId: lead._id,
      action: 'status_changed',
      description: `Lead status changed from "${previousStatus}" to "${status}"`,
      metadata: { previousStatus, newStatus: status },
    });

    await createActivity({
      leadId: lead._id,
      action: 'lead_updated',
      description: `Lead record updated`,
      metadata: { field: 'status', from: previousStatus, to: status },
    });

    res.json({ lead, message: 'Status updated successfully' });
  } catch (error) {
    next(error);
  }
};
