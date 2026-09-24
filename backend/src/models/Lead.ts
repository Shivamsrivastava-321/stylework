import mongoose, { Document, Schema } from 'mongoose';

export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';

export interface ILead extends Document {
  _id: mongoose.Types.ObjectId;
  // Meta Ads fields
  formId: string;
  adId?: string;
  adName?: string;
  campaignId?: string;
  campaignName?: string;
  // Lead person info
  fullName: string;
  email: string;
  phone?: string;
  // System fields
  status: LeadStatus;
  source: string;
  rawPayload: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const LeadSchema = new Schema<ILead>(
  {
    formId: { type: String, required: true, index: true },
    adId: { type: String },
    adName: { type: String },
    campaignId: { type: String },
    campaignName: { type: String },
    fullName: { type: String, required: true },
    email: { type: String, required: true, index: true },
    phone: { type: String },
    status: {
      type: String,
      enum: ['new', 'contacted', 'qualified', 'converted', 'lost'],
      default: 'new',
      index: true,
    },
    source: { type: String, default: 'meta_ads' },
    rawPayload: { type: Schema.Types.Mixed, default: {} },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Text search index
LeadSchema.index({ fullName: 'text', email: 'text' });

export const Lead = mongoose.model<ILead>('Lead', LeadSchema);
