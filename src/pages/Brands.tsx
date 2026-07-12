// ────────────────────────────────────────────────────────────
// Brands — Placeholder (Part 2A-1)
// Backend doesn't have brands endpoint yet. Coming in Part 2A-2A or later.
// ────────────────────────────────────────────────────────────

import { Tags, Plus, Sparkles } from 'lucide-react';
import { Card, CardHeader, CardBody, Button, PageHeader, EmptyState } from '../components/ui/StatCard';

export default function Brands() {
  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Brands"
        description="Manage product brands and manufacturers"
        breadcrumbs={[{ label: 'Catalog' }, { label: 'Brands' }]}
        actions={
          <Button variant="primary" leftIcon={Plus} disabled>
            Add Brand
          </Button>
        }
      />

      <Card>
        <CardBody>
          <EmptyState
            icon={Tags}
            title="Brands coming soon"
            description="Brand management is part of the upcoming catalog enhancements. Backend API endpoints will be added in a future release."
            action={
              <div className="flex items-center gap-2 text-sm text-ink-500">
                <Sparkles className="w-4 h-4 text-accent-500" />
                <span>Part of Part 2A-2A — Add/Edit Product wizard</span>
              </div>
            }
          />
        </CardBody>
      </Card>
    </div>
  );
}
