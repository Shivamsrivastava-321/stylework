import mongoose, { Document, Schema } from 'mongoose';

export type ActivityAction =
  | 'lead_created'
  | 'lead_updated'
  | 'status_changed'
  | 'webhook_received';

export interface IActivity extends Document {
  _id: mongoose.Types.ObjectId;
  leadId: mongoose.Types.ObjectId;
  action: ActivityAction;
  description: string;
  metadata?: Record<string, unknown>;
  performedBy: string;
  createdAt: Date;
}

const ActivitySchema = new Schema<IActivity>(
  {
    leadId: {
      type: Schema.Types.ObjectId,
      ref: 'Lead',
      required: true,
      index: true,
    },
    action: {
      type: String,
      enum: ['lead_created', 'lead_updated', 'status_changed', 'webhook_received'],
      required: true,
    },
    description: { type: String, required: true },
    metadata: { type: Schema.Types.Mixed },
    performedBy: { type: String, default: 'system' },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

export const Activity = mongoose.model<IActivity>('Activity', ActivitySchema);
