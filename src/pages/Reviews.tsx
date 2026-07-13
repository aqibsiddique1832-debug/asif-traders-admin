// ────────────────────────────────────────────────────────────
// Premium Reviews — Part 3B QA
// Full review moderation, ratings breakdown, response threads
// ────────────────────────────────────────────────────────────

import { useEffect, useState, useMemo } from 'react';
import {
  Star, ThumbsUp, Flag, MessageCircle, CheckCircle2, X, MoreVertical,
  Search, Filter, Calendar, User as UserIcon, Package, Send, Eye,
  ChevronRight, Reply, Trash2, Edit, ChevronDown, Award, Heart,
  Sparkles, TrendingUp, AlertCircle, Download,
} from 'lucide-react';
import clsx from 'clsx';
import toast from 'react-hot-toast';
import {
  Card, CardHeader, CardBody, Button, Badge, PageHeader, EmptyState,
  Skeleton, Modal, ConfirmDialog, Pagination, Tabs,
} from '../components/ui/StatCard';
import { formatDate, relativeTime } from '../lib/auth';

const SAMPLE_REVIEWS = [
  { id: 'r1', product: 'Portland Cement 50kg', productImage: 'https://3df7d2a8.asif-traders.pages.dev/images/products/cement-portland-50kg.webp', customer: 'Ahmed Khan', avatar: '', rating: 5, title: 'Excellent quality cement!', comment: 'Used for entire house construction. No cracks after 6 months. Highly recommended!', verified: true, status: 'approved', helpful: 24, createdAt: '2 days ago', response: 'Thank you for your feedback! Glad to hear the quality met your expectations.' },
  { id: 'r2', product: 'TMT Steel Bar 12mm', productImage: 'https://3df7d2a8.asif-traders.pages.dev/images/products/tmt-bar-12mm.webp', customer: 'Fatima Khan', avatar: '', rating: 4, title: 'Good quality steel', comment: 'Strong and durable. Delivery was on time. Slight rust on edges but acceptable.', verified: true, status: 'approved', helpful: 12, createdAt: '5 days ago', response: null },
  { id: 'r3', product: 'Red Clay Brick', productImage: 'https://3df7d2a8.asif-traders.pages.dev/images/products/clay-brick-red.webp', customer: 'Hassan Raza', avatar: '', rating: 3, title: 'Average', comment: 'Some bricks were broken during delivery. Quality control needs improvement.', verified: true, status: 'pending', helpful: 0, createdAt: '1 day ago', response: null },
  { id: 'r4', product: 'Ceramic Floor Tile', productImage: 'https://3df7d2a8.asif-traders.pages.dev/images/products/ceramic-tile-grey.webp', customer: 'Priya Sharma', avatar: '', rating: 5, title: 'Beautiful finish!', comment: 'Tiles look exactly as shown. Very easy to install. Will buy again for my bathroom.', verified: true, status: 'approved', helpful: 18, createdAt: '1 week ago', response: 'Thank you Priya! We hope you love your new bathroom tiles.' },
  { id: 'r5', product: 'White Sand 50kg', productImage: 'https://3df7d2a8.asif-traders.pages.dev/images/products/white-sand-50kg.webp', customer: 'Vikram Singh', avatar: '', rating: 2, title: 'Not as described', comment: 'Sand had too much dust. Not pure white as advertised.', verified: false, status: 'pending', helpful: 2, createdAt: '3 hours ago', response: null },
  { id: 'r6', product: 'AAC Block', productImage: '', customer: 'Sara Khan', avatar: '', rating: 1, title: 'Bad experience', comment: 'Service was very poor. Delayed delivery and damaged blocks.', verified: true, status: 'flagged', helpful: 0, createdAt: '6 hours ago', response: null },
  { id: 'r7', product: 'PVC Pipe 4 inch', productImage: '', customer: 'Ravi Kumar', avatar: '', rating: 4, title: 'Good value for money', comment: 'Quality is decent for the price. Would recommend for non-critical applications.', verified: true, status: 'approved', helpful: 6, createdAt: '2 weeks ago', response: null },
  { id: 'r8', product: 'Ceramic Wall Tile', productImage: '', customer: 'Mohammed Ali', avatar: '', rating: 5, title: 'Premium quality', comment: 'These wall tiles transformed my kitchen. Premium feel without premium price.', verified: true, status: 'approved', helpful: 15, createdAt: '3 weeks ago', response: null },
];

const STATUS_MAP: Record<string, { label: string; variant: any; dot: string }> = {
  approved:  { label: 'Approved',  variant: 'success', dot: 'bg-success-500' },
  pending:   { label: 'Pending',   variant: 'warning', dot: 'bg-warning-500' },
  flagged:   { label: 'Flagged',   variant: 'danger',  dot: 'bg-danger-500' },
  rejected:  { label: 'Rejected',  variant: 'ink',     dot: 'bg-ink-400' },
};

export default function Reviews() {
  const [reviews, setReviews] = useState(SAMPLE_REVIEWS);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'approved' | 'pending' | 'flagged' | 'rejected'>('all');
  const [ratingFilter, setRatingFilter] = useState<number | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [responding, setResponding] = useState<any>(null);
  const [deleting, setDeleting] = useState<any>(null);

  const filtered = reviews.filter((r) => {
    if (search && !`${r.product} ${r.customer} ${r.comment}`.toLowerCase().includes(search.toLowerCase())) return false;
    if (filter !== 'all' && r.status !== filter) return false;
    if (ratingFilter !== null && r.rating !== ratingFilter) return false;
    return true;
  });

  // Stats
  const stats = useMemo(() => {
    const total = reviews.length;
    const avg = total > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / total : 0;
    const ratingBreakdown = [5, 4, 3, 2, 1].map((star) => ({
      star,
      count: reviews.filter((r) => r.rating === star).length,
      percent: total > 0 ? (reviews.filter((r) => r.rating === star).length / total) * 100 : 0,
    }));
    return {
      total,
      avg,
      pending: reviews.filter((r) => r.status === 'pending').length,
      approved: reviews.filter((r) => r.status === 'approved').length,
      flagged: reviews.filter((r) => r.status === 'flagged').length,
      verified: reviews.filter((r) => r.verified).length,
      ratingBreakdown,
    };
  }, [reviews]);

  // Selection
  const allOnPageSelected = filtered.length > 0 && filtered.every((r) => selected.has(r.id));
  const toggleAll = () => {
    if (allOnPageSelected) {
      const n = new Set(selected);
      filtered.forEach((r) => n.delete(r.id));
      setSelected(n);
    } else {
      const n = new Set(selected);
      filtered.forEach((r) => n.add(r.id));
      setSelected(n);
    }
  };
  const toggleOne = (id: string) => {
    const n = new Set(selected);
    if (n.has(id)) n.delete(id); else n.add(id);
    setSelected(n);
  };
  const clearSelection = () => setSelected(new Set());

  const updateStatus = (id: string, status: string) => {
    setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
    toast.success(`Review ${status}`);
  };

  const handleBulkApprove = () => {
    selected.forEach((id) => updateStatus(id, 'approved'));
    clearSelection();
  };

  const handleBulkReject = () => {
    selected.forEach((id) => updateStatus(id, 'rejected'));
    clearSelection();
  };

  const submitResponse = (id: string, text: string) => {
    setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, response: text } : r)));
    toast.success('Response posted');
    setResponding(null);
  };

  // Render stars
  const renderStars = (rating: number, size = 'w-3.5 h-3.5') => (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={clsx(size, i < rating ? 'text-warning-500 fill-warning-500' : 'text-ink-200')}
        />
      ))}
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in pb-24">
      <PageHeader
        title="Reviews"
        description={`${stats.total} reviews · ${stats.avg.toFixed(1)} avg rating`}
        breadcrumbs={[{ label: 'Engage' }, { label: 'Reviews' }]}
        actions={
          <>
            <Button variant="secondary" leftIcon={Download}>Export</Button>
            <Button variant="primary" leftIcon={MessageCircle} onClick={() => toast('Reply to reviews inline from each review card.')}>Reply to Reviews</Button>
          </>
        }
      />

      {/* ─── Stats row ───────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Average rating card */}
        <Card>
          <CardBody className="text-center">
            <p className="text-2xs font-bold text-ink-500 uppercase tracking-wider">Average Rating</p>
            <p className="text-5xl font-black text-ink-900 mt-2 tabular-nums">{stats.avg.toFixed(1)}</p>
            <div className="flex justify-center mt-2">{renderStars(Math.round(stats.avg), 'w-4 h-4')}</div>
            <p className="text-2xs text-ink-500 mt-2">Based on {stats.total} reviews</p>
          </CardBody>
        </Card>

        {/* Rating breakdown */}
        <Card>
          <CardBody>
            <p className="text-2xs font-bold text-ink-500 uppercase tracking-wider mb-3">Rating Distribution</p>
            <div className="space-y-2">
              {stats.ratingBreakdown.map((b) => (
                <button
                  key={b.star}
                  onClick={() => setRatingFilter(ratingFilter === b.star ? null : b.star)}
                  className="w-full flex items-center gap-2 hover:bg-ink-50 p-1 rounded transition-colors"
                >
                  <div className="flex items-center gap-1 w-12 text-2xs font-medium text-ink-700">
                    <span>{b.star}</span>
                    <Star className="w-3 h-3 text-warning-500 fill-warning-500" />
                  </div>
                  <div className="flex-1 h-2 bg-ink-100 rounded-pill overflow-hidden">
                    <div className="h-full bg-warning-500 transition-all" style={{ width: `${b.percent}%` }} />
                  </div>
                  <span className="w-8 text-2xs text-ink-600 tabular-nums text-right">{b.count}</span>
                </button>
              ))}
            </div>
            {ratingFilter !== null && (
              <button onClick={() => setRatingFilter(null)} className="mt-3 text-2xs text-accent-600 hover:text-accent-700 font-semibold">
                Clear filter
              </button>
            )}
          </CardBody>
        </Card>

        {/* Status breakdown */}
        <div className="grid grid-cols-2 gap-3">
          <MiniStat label="Approved" value={stats.approved} icon={CheckCircle2} accent="success" />
          <MiniStat label="Pending" value={stats.pending} icon={Flag} accent="warning" />
          <MiniStat label="Flagged" value={stats.flagged} icon={AlertCircle} accent="danger" />
          <MiniStat label="Verified" value={stats.verified} icon={Award} accent="info" />
        </div>
      </div>

      {/* ─── Tabs ────────────────────────────────────────── */}
      <Tabs
        active={filter}
        onChange={(v) => setFilter(v as any)}
        tabs={[
          { value: 'all',      label: 'All',      count: stats.total },
          { value: 'pending',  label: 'Pending',  count: stats.pending },
          { value: 'approved', label: 'Approved', count: stats.approved },
          { value: 'flagged',  label: 'Flagged',  count: stats.flagged },
          { value: 'rejected', label: 'Rejected', count: reviews.filter((r) => r.status === 'rejected').length },
        ]}
      />

      {/* ─── Toolbar ─────────────────────────────────────── */}
      <Card>
        <div className="p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400 pointer-events-none" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by product, customer, or comment…"
              className="input pl-10"
            />
          </div>
        </div>

        {/* Bulk action bar */}
        {selected.size > 0 && (
          <div className="border-t border-ink-200 bg-accent-50/50 px-4 py-2.5 flex items-center gap-3 animate-slide-in">
            <div className="flex items-center gap-2 text-sm">
              <span className="font-semibold text-ink-900">{selected.size}</span>
              <span className="text-ink-600">selected</span>
            </div>
            <div className="h-4 w-px bg-ink-300" />
            <Button size="sm" variant="ghost" leftIcon={X} onClick={clearSelection}>Clear</Button>
            <Button size="sm" variant="secondary" leftIcon={CheckCircle2} onClick={handleBulkApprove}>Approve</Button>
            <Button size="sm" variant="danger" leftIcon={X} onClick={handleBulkReject}>Reject</Button>
          </div>
        )}
      </Card>

      {/* ─── Reviews list ─────────────────────────────────── */}
      {filtered.length === 0 ? (
        <Card>
          <EmptyState
            icon={Star}
            title="No reviews found"
            description="Reviews will appear here once customers submit them."
          />
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((r) => {
            const status = STATUS_MAP[r.status];
            const isSelected = selected.has(r.id);
            return (
              <Card key={r.id} className={clsx('overflow-hidden transition-all', isSelected && 'ring-2 ring-accent-500')}>
                <div className="p-5">
                  <div className="flex items-start gap-3 mb-3">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleOne(r.id)}
                      className="mt-1 rounded border-ink-300 text-accent-500"
                    />
                    {r.productImage ? (
                      <img src={r.productImage} alt={r.product} className="w-12 h-12 rounded-xl object-cover flex-shrink-0 ring-1 ring-ink-200" />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-ink-100 flex items-center justify-center flex-shrink-0">
                        <Package className="w-5 h-5 text-ink-400" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 flex-wrap">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-ink-900">{r.product}</p>
                          <div className="flex items-center gap-2 mt-0.5 text-2xs text-ink-500">
                            <span className="flex items-center gap-1"><UserIcon className="w-3 h-3" /> {r.customer}</span>
                            {r.verified && <Badge variant="success" className="text-2xs">Verified</Badge>}
                            <span>· {r.createdAt}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {renderStars(r.rating)}
                          <Badge variant={status.variant} dot>{status.label}</Badge>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="ml-15 pl-15">
                    {r.title && <p className="font-semibold text-ink-900 mb-1">{r.title}</p>}
                    <p className="text-sm text-ink-700 leading-relaxed">{r.comment}</p>

                    {/* Actions */}
                    <div className="flex items-center gap-2 mt-3 text-2xs text-ink-500">
                      <span className="flex items-center gap-1">
                        <ThumbsUp className="w-3 h-3" /> {r.helpful} found helpful
                      </span>
                      <span>·</span>
                      <button onClick={() => setResponding(r)} className="text-accent-600 hover:text-accent-700 font-semibold flex items-center gap-1">
                        <Reply className="w-3 h-3" /> {r.response ? 'Edit response' : 'Reply'}
                      </button>
                      <span>·</span>
                      {r.status !== 'approved' && (
                        <button onClick={() => updateStatus(r.id, 'approved')} className="text-success-600 hover:text-success-700 font-semibold">
                          Approve
                        </button>
                      )}
                      {r.status !== 'rejected' && (
                        <button onClick={() => updateStatus(r.id, 'rejected')} className="text-ink-600 hover:text-ink-900 font-semibold">
                          Reject
                        </button>
                      )}
                      {r.status !== 'flagged' && r.status !== 'approved' && (
                        <button onClick={() => updateStatus(r.id, 'flagged')} className="text-warning-600 hover:text-warning-700 font-semibold">
                          Flag
                        </button>
                      )}
                      <span>·</span>
                      <button onClick={() => setDeleting(r)} className="text-danger-600 hover:text-danger-700 font-semibold">
                        Delete
                      </button>
                    </div>

                    {/* Response */}
                    {r.response && (
                      <div className="mt-3 rounded-xl bg-accent-50/40 border-l-4 border-accent-500 p-3">
                        <div className="flex items-center gap-1.5 mb-1">
                          <Reply className="w-3 h-3 text-accent-600" />
                          <p className="text-2xs font-bold text-accent-700 uppercase tracking-wider">Your Response</p>
                        </div>
                        <p className="text-sm text-ink-700">{r.response}</p>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* ─── Response modal ───────────────────────────────── */}
      <ResponseModal review={responding} onClose={() => setResponding(null)} onSave={submitResponse} />

      {/* ─── Delete confirm ──────────────────────────────── */}
      <ConfirmDialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={() => {
          setReviews((prev) => prev.filter((r) => r.id !== deleting.id));
          toast.success('Review deleted');
          setDeleting(null);
        }}
        title="Delete review?"
        description={`This review by "${deleting?.customer}" will be permanently removed.`}
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
}

// ─── Mini stat ──────────────────────────────────────────────
function MiniStat({ label, value, icon: Icon, accent }: any) {
  const map: any = {
    info:    'bg-info-subtle text-info-600',
    success: 'bg-success-subtle text-success-600',
    warning: 'bg-warning-subtle text-warning-600',
    danger:  'bg-danger-subtle text-danger-600',
  };
  return (
    <div className="card-hover p-3 sm:p-4 flex items-center gap-2.5">
      <div className={clsx('w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0', map[accent])}>
        <Icon className="w-4 h-4" strokeWidth={2.25} />
      </div>
      <div className="min-w-0">
        <p className="text-2xs text-ink-500 truncate">{label}</p>
        <p className="text-base font-bold text-ink-900 tabular-nums">{value}</p>
      </div>
    </div>
  );
}

// ─── Response modal ────────────────────────────────────────
function ResponseModal({ review, onClose, onSave }: { review: any; onClose: () => void; onSave: (id: string, text: string) => void }) {
  const [text, setText] = useState(review?.response || '');
  useEffect(() => { setText(review?.response || ''); }, [review?.id]);
  if (!review) return null;
  return (
    <Modal
      open={!!review}
      onClose={onClose}
      title="Respond to Review"
      size="md"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="primary" leftIcon={Send} disabled={!text.trim()} onClick={() => onSave(review.id, text)}>
            Post Response
          </Button>
        </>
      }
    >
      <div className="space-y-3">
        <div className="rounded-xl bg-ink-50 p-3">
          <div className="flex items-center gap-2 mb-1.5">
            <UserIcon className="w-3.5 h-3.5 text-ink-500" />
            <p className="text-sm font-semibold text-ink-900">{review.customer}</p>
            <span className="text-2xs text-ink-500">on {review.product}</span>
          </div>
          <p className="text-sm text-ink-700">{review.comment}</p>
        </div>
        <div>
          <label className="label">Your Response</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="input min-h-[120px] py-2"
            placeholder="Thank you for your feedback! We appreciate…"
            rows={5}
            maxLength={500}
          />
          <p className="text-2xs text-ink-400 mt-1 text-right">{text.length}/500</p>
        </div>
      </div>
    </Modal>
  );
}
