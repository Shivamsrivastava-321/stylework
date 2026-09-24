import { format } from 'date-fns';
import { UserPlus, RefreshCw, GitMerge, Webhook } from 'lucide-react';
import type { Activity } from '../types';

interface ActivityTimelineProps {
  activities: Activity[];
}

const ACTION_CONFIG = {
  lead_created: {
    icon: UserPlus,
    label: 'Lead Created',
    dotClass: 'timeline-dot-created',
  },
  lead_updated: {
    icon: RefreshCw,
    label: 'Lead Updated',
    dotClass: 'timeline-dot-updated',
  },
  status_changed: {
    icon: GitMerge,
    label: 'Status Changed',
    dotClass: 'timeline-dot-status',
  },
  webhook_received: {
    icon: Webhook,
    label: 'Webhook Received',
    dotClass: 'timeline-dot-webhook',
  },
} as const;

export default function ActivityTimeline({ activities }: ActivityTimelineProps) {
  if (activities.length === 0) {
    return (
      <div className="empty-state" style={{ padding: 'var(--space-8)' }}>
        <div className="empty-icon">
          <RefreshCw size={24} />
        </div>
        <p className="empty-desc">No activity recorded yet</p>
      </div>
    );
  }

  return (
    <div className="timeline">
      {activities.map((activity, index) => {
        const config = ACTION_CONFIG[activity.action] ?? ACTION_CONFIG.lead_updated;
        const Icon = config.icon;

        return (
          <div
            key={activity._id}
            className="timeline-item animate-fade-in"
            style={{ animationDelay: `${index * 50}ms` }}
            id={`activity-${activity._id}`}
          >
            <div className={`timeline-dot ${config.dotClass}`}>
              <Icon size={14} />
            </div>
            <div className="timeline-content">
              <div className="timeline-title">{config.label}</div>
              <div className="timeline-desc">{activity.description}</div>
              <div className="timeline-time">
                {format(new Date(activity.createdAt), 'MMM d, yyyy · h:mm a')}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
