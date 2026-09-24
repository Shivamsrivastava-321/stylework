import { z } from 'zod';

// Meta Ads webhook field_data format
const FieldDataSchema = z.object({
  name: z.string(),
  values: z.array(z.string()),
});

// Full Meta Ads Lead Gen webhook payload schema
export const MetaWebhookSchema = z.object({
  object: z.string().optional(),
  entry: z
    .array(
      z.object({
        id: z.string(),
        changes: z.array(
          z.object({
            value: z.object({
              form_id: z.string(),
              leadgen_id: z.string().optional(),
              ad_id: z.string().optional(),
              ad_name: z.string().optional(),
              campaign_id: z.string().optional(),
              campaign_name: z.string().optional(),
              field_data: z.array(FieldDataSchema),
            }),
            field: z.string().optional(),
          })
        ),
      })
    )
    .optional(),
  // Allow direct field_data submission for simpler testing
  form_id: z.string().optional(),
  leadgen_id: z.string().optional(),
  ad_id: z.string().optional(),
  ad_name: z.string().optional(),
  campaign_id: z.string().optional(),
  campaign_name: z.string().optional(),
  field_data: z.array(FieldDataSchema).optional(),
});

export type MetaWebhookPayload = z.infer<typeof MetaWebhookSchema>;

export const UpdateLeadStatusSchema = z.object({
  status: z.enum(['new', 'contacted', 'qualified', 'converted', 'lost']),
});

export type UpdateLeadStatusPayload = z.infer<typeof UpdateLeadStatusSchema>;
