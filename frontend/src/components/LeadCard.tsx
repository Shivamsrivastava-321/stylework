import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { Phone, Mail, ChevronRight } from 'lucide-react';
import type { Lead } from '../types';
import StatusBadge from './StatusBadge';

interface LeadCardProps {
  lead: Lead;
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export default function LeadCard({ lead }: LeadCardProps) {
  const timeAgo = formatDistanceToNow(new Date(lead.createdAt), { addSuffix: true });

  return (
    <Link to={`/leads/${lead._id}`} className="lead-card" id={`lead-card-${lead._id}`}>
      {/* Avatar */}
      <div className="lead-avatar">{getInitials(lead.fullName)}</div>

      {/* Info */}
      <div className="lead-info">
        <div className="lead-name">{lead.fullName}</div>
        <div className="flex items-center gap-3 mt-2">
          <span className="flex items-center gap-1 text-xs text-muted">
            <Mail size={11} />
            {lead.email}
          </span>
          {lead.phone && (
            <span className="flex items-center gap-1 text-xs text-muted">
              <Phone size={11} />
              {lead.phone}
            </span>
          )}
        </div>
        {lead.campaignName && (
          <div className="text-xs text-muted mt-2" style={{ marginTop: '4px' }}>
            📣 {lead.campaignName}
          </div>
        )}
      </div>

      {/* Right side */}
      <div className="lead-meta">
        <StatusBadge status={lead.status} />
        <div className="lead-date">{timeAgo}</div>
      </div>

      <ChevronRight size={16} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} />
    </Link>
  );
}
