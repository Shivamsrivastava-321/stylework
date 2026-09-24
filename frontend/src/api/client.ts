import axios from 'axios';
import type {
  LeadsResponse,
  LeadDetailResponse,
  Lead,
  WebhookPayload,
} from '../types';

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';

export const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.error ??
      error.response?.data?.message ??
      error.message ??
      'An unexpected error occurred';
    return Promise.reject(new Error(message));
  }
);

// ── Lead API functions ────────────────────────────────────

export const fetchLeads = async (params: {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}): Promise<LeadsResponse> => {
  const { data } = await api.get<LeadsResponse>('/leads', { params });
  return data;
};

export const fetchLeadById = async (id: string): Promise<LeadDetailResponse> => {
  const { data } = await api.get<LeadDetailResponse>(`/leads/${id}`);
  return data;
};

export const updateLeadStatus = async (
  id: string,
  status: Lead['status']
): Promise<{ lead: Lead; message: string }> => {
  const { data } = await api.patch(`/leads/${id}/status`, { status });
  return data;
};

export const sendWebhook = async (
  payload: WebhookPayload
): Promise<{ message: string; count: number; leads: Lead[] }> => {
  const { data } = await api.post('/webhook/meta-lead', payload);
  return data;
};

export const checkHealth = async (): Promise<{ status: string }> => {
  const { data } = await api.get('/health');
  return data;
};
