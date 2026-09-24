import { Router } from 'express';
import {
  getLeads,
  getLeadById,
  updateLeadStatus,
} from '../controllers/leads.controller';

export const leadsRouter = Router();

/**
 * GET /leads
 * Returns paginated lead list with optional status filter and search
 */
leadsRouter.get('/', getLeads);

/**
 * GET /leads/:id
 * Returns a single lead with activity timeline
 */
leadsRouter.get('/:id', getLeadById);

/**
 * PATCH /leads/:id/status
 * Updates lead status and records audit entry
 */
leadsRouter.patch('/:id/status', updateLeadStatus);
