import { Router } from 'express';
import { receiveMetaWebhook } from '../controllers/leads.controller';

export const webhookRouter = Router();

/**
 * POST /webhook/meta-lead
 * Entry point for Meta Ads lead gen webhook
 */
webhookRouter.post('/meta-lead', receiveMetaWebhook);
