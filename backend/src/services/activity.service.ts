import { Activity, ActivityAction } from '../models/Activity';
import mongoose from 'mongoose';

interface CreateActivityParams {
  leadId: mongoose.Types.ObjectId | string;
  action: ActivityAction;
  description: string;
  metadata?: Record<string, unknown>;
  performedBy?: string;
}

export const createActivity = async (params: CreateActivityParams): Promise<void> => {
  const { leadId, action, description, metadata, performedBy = 'system' } = params;

  await Activity.create({
    leadId,
    action,
    description,
    metadata,
    performedBy,
  });
};

export const getActivitiesForLead = async (leadId: string) => {
  return Activity.find({ leadId: new mongoose.Types.ObjectId(leadId) })
    .sort({ createdAt: -1 })
    .lean();
};
