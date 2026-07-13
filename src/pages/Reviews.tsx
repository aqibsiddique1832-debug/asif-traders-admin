// ────────────────────────────────────────────────────────────
// Reviews — Part 2B-2
// Backend has no review endpoint yet. Placeholder with roadmap.
// ────────────────────────────────────────────────────────────

import { Star, Sparkles, MessageSquare, ThumbsUp, Flag } from 'lucide-react';
import { Card, CardHeader, CardBody, PageHeader, EmptyState, Badge } from '../components/ui/StatCard';

export default function Reviews() {
  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Reviews"
        description="Customer product reviews and ratings"
        breadcrumbs={[{ label: 'Engage' }, { label: 'Reviews' }]}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <KPI label="Total Reviews" value="—" icon={MessageSquare} accent="info" />
        <KPI label="Average Rating" value="—" icon={Star} accent="warning" />
        <KPI label="Pending Approval" value="—" icon={Flag} accent="danger" />
        <KPI label="Helpful Votes" value="—" icon={ThumbsUp} accent="success" />
      </div>

      <Card>
        <CardHeader title="Product Reviews" description="All customer reviews" actions={<Badge variant="info">Coming Soon</Badge>} />
        <CardBody>
          <EmptyState
            icon={Star}
            title="Reviews feature coming soon"
            description="Backend review endpoints are not yet implemented. The reviews system will include: star ratings, verified buyer badges, photo uploads, helpful votes, moderation queue, and response threads."
            action={
              <div className="flex items-center gap-2 text-sm text-ink-500">
                <Sparkles className="w-4 h-4 text-accent-500" />
                <span>Planned for Part 3A — Analytics & Engagement enhancements</span>
              </div>
            }
          />
        </CardBody>
      </Card>
    </div>
  );
}

function KPI({ label, value, icon: Icon, accent }: any) {
  const map: any = {
    info:    'bg-info-subtle text-info-600',
    success: 'bg-success-subtle text-success-600',
    warning: 'bg-warning-subtle text-warning-600',
    danger:  'bg-danger-subtle text-danger-600',
  };
  return (
    <div className="card-hover p-3 sm:p-4 flex items-center gap-3">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${map[accent]}`}>
        <Icon className="w-4 h-4" strokeWidth={2.25} />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-ink-500 truncate">{label}</p>
        <p className="text-lg font-bold text-ink-900 tabular-nums">{value}</p>
      </div>
    </div>
  );
}
