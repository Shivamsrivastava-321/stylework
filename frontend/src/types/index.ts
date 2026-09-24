export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';

export type ActivityAction =
  | 'lead_created'
  | 'lead_updated'
  | 'status_changed'
  | 'webhook_received';

export interface Lead {
  _id: string;
  formId: string;
  adId?: string;
  adName?: string;
  campaignId?: string;
  campaignName?: string;
  fullName: string;
  email: string;
  phone?: string;
  status: LeadStatus;
  source: string;
  rawPayload?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface Activity {
  _id: string;
  leadId: string;
  action: ActivityAction;
  description: string;
  metadata?: Record<string, unknown>;
  performedBy: string;
  createdAt: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface LeadsResponse {
  data: Lead[];
  pagination: Pagination;
}

export interface LeadDetailResponse {
  lead: Lead;
  activities: Activity[];
}

export interface WebhookPayload {
  form_id: string;
  ad_id?: string;
  ad_name?: string;
  campaign_id?: string;
  campaign_name?: string;
  field_data: Array<{ name: string; values: string[] }>;
}
