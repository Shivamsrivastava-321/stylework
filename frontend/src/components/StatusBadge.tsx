import type { LeadStatus } from '../types';

interface StatusBadgeProps {
  status: LeadStatus;
  className?: string;
}

const STATUS_LABELS: Record<LeadStatus, string> = {
  new: 'New',
  contacted: 'Contacted',
  qualified: 'Qualified',
  converted: 'Converted',
  lost: 'Lost',
};

export default function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  return (
    <span className={`status-badge status-${status} ${className}`}>
      {STATUS_LABELS[status]}
    </span>
  );
}
