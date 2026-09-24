import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Zap, Plus, Trash2, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import { sendWebhook } from '../api/client';
import type { WebhookPayload } from '../types';

const DEFAULT_PAYLOAD: WebhookPayload = {
  form_id: 'form_' + Math.random().toString(36).slice(2, 10),
  ad_id: 'ad_' + Math.random().toString(36).slice(2, 10),
  ad_name: 'Summer Sale Ad',
  campaign_id: 'camp_' + Math.random().toString(36).slice(2, 10),
  campaign_name: 'Q3 Lead Gen Campaign',
  field_data: [
    { name: 'full_name', values: ['Jane Smith'] },
    { name: 'email', values: ['jane.smith@example.com'] },
    { name: 'phone_number', values: ['+1 (555) 867-5309'] },
  ],
};

export default function WebhookTestPage() {
  const queryClient = useQueryClient();
  const [payload, setPayload] = useState<WebhookPayload>(DEFAULT_PAYLOAD);
  const [jsonMode, setJsonMode] = useState(false);
  const [jsonText, setJsonText] = useState(JSON.stringify(DEFAULT_PAYLOAD, null, 2));
  const [jsonError, setJsonError] = useState('');

  const { mutate, isPending, data: lastResponse } = useMutation({
    mutationFn: (p: WebhookPayload) => sendWebhook(p),
    onSuccess: (res) => {
      toast.success(`✅ ${res.count} lead(s) created successfully!`);
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    },
    onError: (err: Error) => {
      toast.error(err.message ?? 'Webhook failed');
    },
  });

  const handleSubmit = () => {
    if (jsonMode) {
      try {
        const parsed = JSON.parse(jsonText) as WebhookPayload;
        setJsonError('');
        mutate(parsed);
      } catch {
        setJsonError('Invalid JSON — please fix the syntax errors');
        return;
      }
    } else {
      mutate(payload);
    }
  };

  const addField = () => {
    setPayload((p) => ({
      ...p,
      field_data: [...p.field_data, { name: '', values: [''] }],
    }));
  };

  const removeField = (index: number) => {
    setPayload((p) => ({
      ...p,
      field_data: p.field_data.filter((_, i) => i !== index),
    }));
  };

  const updateField = (index: number, key: 'name' | 'value', val: string) => {
    setPayload((p) => {
      const updated = [...p.field_data];
      if (key === 'name') {
        updated[index] = { ...updated[index], name: val };
      } else {
        updated[index] = { ...updated[index], values: [val] };
      }
      return { ...p, field_data: updated };
    });
  };

  const randomize = () => {
    const names = ['Alex Johnson', 'Maria Garcia', 'Liam Chen', 'Sofia Patel', 'Noah Williams'];
    const random = names[Math.floor(Math.random() * names.length)];
    const email = random.toLowerCase().replace(' ', '.') + `${Math.floor(Math.random() * 100)}@example.com`;
    setPayload({
      form_id: 'form_' + Math.random().toString(36).slice(2, 10),
      ad_id: 'ad_' + Math.random().toString(36).slice(2, 10),
      ad_name: ['Winter Promo', 'Spring Deals', 'Flash Sale', 'Brand Awareness'][Math.floor(Math.random() * 4)],
      campaign_id: 'camp_' + Math.random().toString(36).slice(2, 10),
      campaign_name: ['Q4 Leads', 'Awareness 2025', 'Retargeting', 'Lookalike Audience'][Math.floor(Math.random() * 4)],
      field_data: [
        { name: 'full_name', values: [random] },
        { name: 'email', values: [email] },
        { name: 'phone_number', values: [`+1 (${Math.floor(Math.random() * 900 + 100)}) ${Math.floor(Math.random() * 900 + 100)}-${Math.floor(Math.random() * 9000 + 1000)}`] },
      ],
    });
  };

  return (
    <>
      {/* Header */}
      <div className="page-header">
        <div className="flex items-center gap-3">
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, var(--color-accent-primary), var(--color-cyan))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Zap size={20} color="white" />
          </div>
          <div>
            <h1 className="page-title" style={{ fontSize: '1.4rem' }}>
              Webhook Simulator
            </h1>
            <p className="page-subtitle">
              Send a simulated Meta Ads lead gen webhook to test the intake pipeline
            </p>
          </div>
        </div>
      </div>

      <div className="webhook-grid">
        {/* Left — Form */}
        <div className="flex flex-col gap-6">
          {/* Mode toggle */}
          <div className="card-glass">
            <div className="flex items-center justify-between mb-4">
              <h3 style={{ fontSize: '0.9rem', fontWeight: 600 }}>Payload Builder</h3>
              <div className="flex items-center gap-2">
                <button
                  className={`btn btn-sm ${!jsonMode ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setJsonMode(false)}
                  id="mode-form"
                >
                  Form
                </button>
                <button
                  className={`btn btn-sm ${jsonMode ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => {
                    setJsonMode(true);
                    setJsonText(JSON.stringify(payload, null, 2));
                  }}
                  id="mode-json"
                >
                  JSON
                </button>
              </div>
            </div>

            {jsonMode ? (
              <>
                <textarea
                  id="json-input"
                  className="textarea"
                  style={{ minHeight: 300, fontFamily: 'monospace', fontSize: 12 }}
                  value={jsonText}
                  onChange={(e) => setJsonText(e.target.value)}
                />
                {jsonError && (
                  <p style={{ color: '#f87171', fontSize: 12, marginTop: 8 }}>{jsonError}</p>
                )}
              </>
            ) : (
              <div className="flex flex-col gap-4">
                {/* Meta fields */}
                <div className="form-group">
                  <label className="form-label">Form ID</label>
                  <input
                    id="field-form-id"
                    className="input"
                    value={payload.form_id}
                    onChange={(e) => setPayload((p) => ({ ...p, form_id: e.target.value }))}
                  />
                </div>
                <div className="webhook-fields-grid">
                  <div className="form-group">
                    <label className="form-label">Ad Name</label>
                    <input
                      id="field-ad-name"
                      className="input"
                      value={payload.ad_name ?? ''}
                      onChange={(e) => setPayload((p) => ({ ...p, ad_name: e.target.value }))}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Campaign Name</label>
                    <input
                      id="field-campaign-name"
                      className="input"
                      value={payload.campaign_name ?? ''}
                      onChange={(e) =>
                        setPayload((p) => ({ ...p, campaign_name: e.target.value }))
                      }
                    />
                  </div>
                </div>

                {/* Field data */}
                <div className="divider" />
                <div className="flex items-center justify-between">
                  <label className="form-label">Field Data</label>
                  <button className="btn btn-sm btn-ghost" onClick={addField} id="add-field-btn">
                    <Plus size={12} /> Add Field
                  </button>
                </div>

                {payload.field_data.map((field, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      className="input"
                      placeholder="field name"
                      value={field.name}
                      onChange={(e) => updateField(idx, 'name', e.target.value)}
                      id={`field-name-${idx}`}
                      style={{ flex: 1 }}
                    />
                    <input
                      className="input"
                      placeholder="value"
                      value={field.values[0] ?? ''}
                      onChange={(e) => updateField(idx, 'value', e.target.value)}
                      id={`field-value-${idx}`}
                      style={{ flex: 2 }}
                    />
                    <button
                      className="btn btn-icon btn-ghost"
                      onClick={() => removeField(idx)}
                      id={`remove-field-${idx}`}
                    >
                      <Trash2 size={13} style={{ color: '#f87171' }} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button
              id="send-webhook-btn"
              className="btn btn-primary"
              onClick={handleSubmit}
              disabled={isPending}
              style={{ flex: 1 }}
            >
              <Send size={14} />
              {isPending ? 'Sending…' : 'Send Webhook'}
            </button>
            <button
              id="randomize-btn"
              className="btn btn-secondary"
              onClick={randomize}
              disabled={isPending}
            >
              🎲 Randomize
            </button>
          </div>
        </div>

        {/* Right — Response */}
        <div className="flex flex-col gap-6">
          <div className="card-glass" style={{ flex: 1 }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: 'var(--space-4)' }}>
              Server Response
            </h3>
            {lastResponse ? (
              <>
                <div
                  className="flex items-center gap-2"
                  style={{
                    background: 'rgba(16, 185, 129, 0.1)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    borderRadius: 'var(--radius-md)',
                    padding: 'var(--space-3) var(--space-4)',
                    marginBottom: 'var(--space-4)',
                  }}
                >
                  <span style={{ color: '#34d399', fontWeight: 700 }}>201 Created</span>
                  <span className="text-xs text-muted">— {lastResponse.count} lead(s) stored</span>
                </div>
                <div className="json-block" id="response-block">
                  {JSON.stringify(lastResponse, null, 2)}
                </div>
              </>
            ) : (
              <div className="empty-state" style={{ padding: 'var(--space-10)' }}>
                <div className="empty-icon">
                  <Send size={22} />
                </div>
                <p className="empty-desc">
                  Send a webhook to see the server response here
                </p>
              </div>
            )}
          </div>

          {/* Info box */}
          <div className="card-glass">
            <h4 style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: 'var(--space-3)' }}>
              📡 Meta Ads Webhook Format
            </h4>
            <p className="text-xs text-muted">
              This simulator supports both the simplified format above and the full Meta Ads
              webhook format with <code className="font-mono text-accent">entry[].changes[].value</code> nesting.
              Recognized field names: <code className="font-mono text-accent">full_name</code>,{' '}
              <code className="font-mono text-accent">email</code>,{' '}
              <code className="font-mono text-accent">phone_number</code>,{' '}
              <code className="font-mono text-accent">first_name</code>,{' '}
              <code className="font-mono text-accent">last_name</code>.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
