import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import {
  ArrowLeft,
  Code2,
  RefreshCw,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { fetchLeadById, updateLeadStatus } from '../api/client';
import type { LeadStatus } from '../types';
import StatusBadge from '../components/StatusBadge';
import ActivityTimeline from '../components/ActivityTimeline';

const STATUSES: { value: LeadStatus; label: string; cls: string }[] = [
  { value: 'new', label: 'New', cls: 'opt-new' },
  { value: 'contacted', label: 'Contacted', cls: 'opt-contacted' },
  { value: 'qualified', label: 'Qualified', cls: 'opt-qualified' },
  { value: 'converted', label: 'Converted', cls: 'opt-converted' },
  { value: 'lost', label: 'Lost', cls: 'opt-lost' },
];

function DetailField({
  label,
  value,
  mono = false,
}: {
  label: string;
  value?: string | null;
  mono?: boolean;
}) {
  if (!value) return null;
  return (
    <div className="detail-field">
      <div className="detail-field-label">{label}</div>
      <div className={`detail-field-value ${mono ? 'font-mono text-sm' : ''}`}>
        {value}
      </div>
    </div>
  );
}

export default function LeadDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showRaw, setShowRaw] = useState(false);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['lead', id],
    queryFn: () => fetchLeadById(id!),
    enabled: !!id,
  });

  const { mutate: changeStatus, isPending: isUpdating } = useMutation({
    mutationFn: ({ status }: { status: LeadStatus }) =>
      updateLeadStatus(id!, status),
    onSuccess: (res) => {
      toast.success(`Status updated to "${res.lead.status}"`);
      queryClient.invalidateQueries({ queryKey: ['lead', id] });
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    },
    onError: (err: Error) => {
      toast.error(err.message ?? 'Failed to update status');
    },
  });

  if (isLoading) {
    return (
      <div className="page-container">
        <div className="flex items-center gap-3 mb-6">
          <div className="skeleton" style={{ width: 80, height: 32, borderRadius: 8 }} />
        </div>
        <div className="card skeleton" style={{ height: 300 }} />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="card empty-state">
        <p style={{ color: '#f87171' }}>
          {(error as Error)?.message ?? 'Lead not found'}
        </p>
        <button className="btn btn-secondary mt-4" onClick={() => navigate('/')}>
          ← Back to Dashboard
        </button>
      </div>
    );
  }

  const { lead, activities } = data;

  return (
    <>
      {/* Back button + Title */}
      <div className="flex items-center gap-4 mb-6">
        <button
          id="back-btn"
          className="btn btn-ghost btn-sm"
          onClick={() => navigate('/')}
        >
          <ArrowLeft size={14} /> Back
        </button>
        <div>
          <h1 className="page-title" style={{ fontSize: '1.4rem' }}>
            {lead.fullName}
          </h1>
          <p className="page-subtitle">{lead.email}</p>
        </div>
      </div>

      {/* Main Grid */}
      <div className="detail-grid">
        {/* Left column */}
        <div className="flex flex-col gap-6">
          {/* Lead Info Card */}
          <div className="card-glass">
            <div className="flex items-center justify-between mb-6">
              <h2 style={{ fontSize: '1rem', fontWeight: 600 }}>Lead Information</h2>
              <StatusBadge status={lead.status} />
            </div>
            <div className="detail-fields-grid">
              <DetailField label="Full Name" value={lead.fullName} />
              <DetailField label="Email" value={lead.email} />
              <DetailField label="Phone" value={lead.phone} />
              <DetailField label="Source" value={lead.source} />
              <DetailField label="Form ID" value={lead.formId} mono />
              <DetailField label="Ad Name" value={lead.adName} />
              <DetailField label="Campaign" value={lead.campaignName} />
              <DetailField label="Ad ID" value={lead.adId} mono />
              <DetailField
                label="Created At"
                value={format(new Date(lead.createdAt), 'MMM d, yyyy · h:mm a')}
              />
              <DetailField
                label="Last Updated"
                value={format(new Date(lead.updatedAt), 'MMM d, yyyy · h:mm a')}
              />
            </div>
          </div>

          {/* Raw Payload */}
          <div className="card-glass">
            <button
              className="flex items-center gap-2 w-full"
              onClick={() => setShowRaw(!showRaw)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--color-text-secondary)',
              }}
              id="toggle-raw-payload"
            >
              <Code2 size={14} />
              <span style={{ fontWeight: 600, fontSize: 13 }}>Raw Webhook Payload</span>
              <span style={{ marginLeft: 'auto', fontSize: 12 }}>
                {showRaw ? '▲ Hide' : '▼ Show'}
              </span>
            </button>
            {showRaw && (
              <div className="json-block mt-4" id="raw-payload-block">
                {JSON.stringify(lead.rawPayload, null, 2)}
              </div>
            )}
          </div>
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-6">
          {/* Status Update */}
          <div className="card-glass">
            <div className="flex items-center gap-2 mb-4">
              <RefreshCw size={14} style={{ color: 'var(--color-text-accent)' }} />
              <h3 style={{ fontSize: '0.9rem', fontWeight: 600 }}>Update Status</h3>
            </div>
            <div className="status-selector" id="status-selector">
              {STATUSES.map((s) => (
                <button
                  key={s.value}
                  id={`status-btn-${s.value}`}
                  className={`status-option ${s.cls} ${lead.status === s.value ? 'selected' : ''}`}
                  onClick={() =>
                    lead.status !== s.value && changeStatus({ status: s.value })
                  }
                  disabled={isUpdating}
                >
                  {s.label}
                </button>
              ))}
            </div>
            {isUpdating && (
              <p className="text-xs text-muted mt-4">Updating status…</p>
            )}
          </div>

          {/* Activity Timeline */}
          <div className="card-glass" style={{ flex: 1 }}>
            <div className="flex items-center gap-2 mb-6">
              <h3 style={{ fontSize: '0.9rem', fontWeight: 600 }}>Activity Timeline</h3>
              <span className="badge-count">{activities.length}</span>
            </div>
            <ActivityTimeline activities={activities} />
          </div>
        </div>
      </div>
    </>
  );
}
