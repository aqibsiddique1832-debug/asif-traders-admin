// ────────────────────────────────────────────────────────────
// Premium Quotes — Part 2B-2
// 9-stage workflow · KPIs · detail drawer · convert to order
// ────────────────────────────────────────────────────────────

import { useEffect, useState } from 'react';
import {
  FileText, Search, Download, MoreVertical, X, Edit, Eye,
  Send, Check, XCircle, Clock, ChevronRight, ChevronDown,
  Calendar, User as UserIcon, Mail, Phone, MapPin, Package,
  DollarSign, Truck, ArrowRight, FileCheck, AlertCircle,
  CheckCircle2, RefreshCcw, Plus, ShoppingCart, Hash,
} from 'lucide-react';
import clsx from 'clsx';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  Card, CardHeader, CardBody, Button, Badge, PageHeader, EmptyState,
  Skeleton, Modal, ConfirmDialog, Pagination, Tabs,
} from '../components/ui/StatCard';
import { quoteService } from '../lib/services';
import { formatCurrency, formatDate, relativeTime } from '../lib/auth';
import type { Quote } from '../types';

// ─── 9-stage workflow ──────────────────────────────────────
type QuoteStatus = 'DRAFT' | 'SUBMITTED' | 'REVIEWED' | 'QUOTED' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED' | 'CONVERTED';

const STATUS_FLOW: QuoteStatus[] = ['DRAFT', 'SUBMITTED', 'REVIEWED', 'QUOTED', 'ACCEPTED', 'CONVERTED'];

const STATUS_MAP: Record<QuoteStatus, { label: string; variant: any; color: string; bg: string; icon: any; step: number }> = {
  DRAFT:     { label: 'Draft',     variant: 'ink',     color: 'text-ink-700',     bg: 'bg-ink-100',     icon: Edit,         step: 0 },
  SUBMITTED: { label: 'Submitted', variant: 'info',    color: 'text-info-700',    bg: 'bg-info-subtle', icon: Send,         step: 1 },
  REVIEWED:  { label: 'Reviewed',  variant: 'info',    color: 'text-info-700',    bg: 'bg-info-subtle', icon: Eye,          step: 2 },
  QUOTED:    { label: 'Quoted',    variant: 'accent',  color: 'text-accent-700',  bg: 'bg-accent-50',   icon: FileText,     step: 3 },
  ACCEPTED:  { label: 'Accepted',  variant: 'success', color: 'text-success-700', bg: 'bg-success-subtle', icon: CheckCircle2, step: 4 },
  REJECTED:  { label: 'Rejected',  variant: 'danger',  color: 'text-danger-700',  bg: 'bg-danger-subtle', icon: XCircle,    step: -1 },
  EXPIRED:   { label: 'Expired',   variant: 'warning', color: 'text-warning-700', bg: 'bg-warning-subtle', icon: Clock,     step: -1 },
  CONVERTED: { label: 'Converted', variant: 'success', color: 'text-success-700', bg: 'bg-success-subtle', icon: ShoppingCart, step: 5 },
};

export default function Quotes() {
  const [data, setData] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize] = useState(20);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [stats, setStats] = useState<{ total: number; byStatus: Record<string, number> }>({ total: 0, byStatus: {} });

  const [detail, setDetail] = useState<Quote | null>(null);
  const [statusModal, setStatusModal] = useState<Quote | null>(null);
  const [convertConfirm, setConvertConfirm] = useState<Quote | null>(null);

  useEffect(() => {
    loadStats();
  }, []);

  useEffect(() => {
    load();
  }, [page, statusFilter, search]);

  const loadStats = async () => {
    try {
      const res = await quoteService.stats();
      setStats(res);
    } catch (err) {}
  };

  const load = async () => {
    try {
      setLoading(true);
      const params: any = { page, limit: pageSize };
      if (search) params.search = search;
      if (statusFilter !== 'all') params.status = statusFilter;
      const res = await quoteService.list(params);
      setData((res as any).data || []);
      const total = (res as any).total ?? (res as any).pagination?.total ?? 0;
      const totalPages = (res as any).totalPages ?? (res as any).pagination?.totalPages ?? 1;
      setTotal(total);
      setTotalPages(totalPages);
    } catch (err) {
      toast.error('Failed to load quotes');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (quote: Quote, newStatus: string) => {
    try {
      await quoteService.changeStatus(quote.id, newStatus);
      toast.success(`Quote updated to ${STATUS_MAP[newStatus as QuoteStatus]?.label || newStatus}`);
      load();
      loadStats();
      setStatusModal(null);
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || 'Update failed');
    }
  };

  const handleConvert = async (quote: Quote) => {
    try {
      const order = await quoteService.convertToOrder(quote.id) as any;
      toast.success(`Quote converted to order ${order.orderNumber || ''}`);
      setConvertConfirm(null);
      setDetail(null);
      load();
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || 'Conversion failed');
    }
  };

  const kpis = [
    { label: 'Total Quotes',   value: stats.total,                                         icon: FileText,     accent: 'info' as const },
    { label: 'Submitted',      value: stats.byStatus.SUBMITTED || 0,                       icon: Send,         accent: 'info' as const },
    { label: 'Quoted',         value: stats.byStatus.QUOTED || 0,                          icon: FileText,     accent: 'accent' as const },
    { label: 'Accepted',       value: stats.byStatus.ACCEPTED || 0,                        icon: CheckCircle2, accent: 'success' as const },
    { label: 'Converted',      value: stats.byStatus.CONVERTED || 0,                       icon: ShoppingCart, accent: 'success' as const },
    { label: 'Rejected',       value: stats.byStatus.REJECTED || 0,                        icon: XCircle,      accent: 'danger' as const },
    { label: 'Pending Review', value: stats.byStatus.DRAFT || 0,                           icon: Clock,        accent: 'warning' as const },
  ];

  return (
    <div className="space-y-6 animate-fade-in pb-24">
      <PageHeader
        title="Quotes"
        description={`${total} quotes · ${stats.byStatus.SUBMITTED || 0} awaiting response`}
        breadcrumbs={[{ label: 'Sales' }, { label: 'Quotes' }]}
        actions={
          <>
            <Button variant="secondary" leftIcon={Download}>Export</Button>
            <Button variant="primary" leftIcon={Plus} disabled>
              New Quote
            </Button>
          </>
        }
      />

      {/* ─── 7 KPI cards ─────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {kpis.map((k) => <MiniStat key={k.label} {...k} />)}
      </div>

      {/* ─── Tabs ────────────────────────────────────────── */}
      <Tabs
        active={statusFilter}
        onChange={(v) => { setStatusFilter(v); setPage(1); }}
        tabs={[
          { value: 'all',         label: 'All',         count: total },
          { value: 'DRAFT',      label: 'Draft',       count: stats.byStatus.DRAFT || 0 },
          { value: 'SUBMITTED',  label: 'Submitted',   count: stats.byStatus.SUBMITTED || 0 },
          { value: 'QUOTED',     label: 'Quoted',      count: stats.byStatus.QUOTED || 0 },
          { value: 'ACCEPTED',   label: 'Accepted',    count: stats.byStatus.ACCEPTED || 0 },
          { value: 'CONVERTED',  label: 'Converted',   count: stats.byStatus.CONVERTED || 0 },
          { value: 'REJECTED',   label: 'Rejected',    count: stats.byStatus.REJECTED || 0 },
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
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search by quote #, name, subject…"
              className="input pl-10"
            />
          </div>
        </div>
      </Card>

      {/* ─── Table ───────────────────────────────────────── */}
      {loading ? (
        <Card>
          <div className="p-4 space-y-2">
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
          </div>
        </Card>
      ) : data.length === 0 ? (
        <Card>
          <EmptyState
            icon={FileText}
            title="No quotes found"
            description={search ? 'Try a different search term' : 'Customer quote requests will appear here.'}
          />
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto scroll-thin">
            <table className="w-full text-sm">
              <thead className="bg-ink-50/80 border-b border-ink-200">
                <tr>
                  <th className="px-4 py-3 text-left text-2xs font-bold text-ink-500 uppercase tracking-wider">Quote #</th>
                  <th className="px-4 py-3 text-left text-2xs font-bold text-ink-500 uppercase tracking-wider">Date</th>
                  <th className="px-4 py-3 text-left text-2xs font-bold text-ink-500 uppercase tracking-wider">Customer</th>
                  <th className="px-4 py-3 text-left text-2xs font-bold text-ink-500 uppercase tracking-wider">Subject</th>
                  <th className="px-4 py-3 text-right text-2xs font-bold text-ink-500 uppercase tracking-wider">Qty</th>
                  <th className="px-4 py-3 text-left text-2xs font-bold text-ink-500 uppercase tracking-wider">Budget</th>
                  <th className="px-4 py-3 text-right text-2xs font-bold text-ink-500 uppercase tracking-wider">Total</th>
                  <th className="px-4 py-3 text-left text-2xs font-bold text-ink-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-2xs font-bold text-ink-500 uppercase tracking-wider">Workflow</th>
                  <th className="w-10 px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {data.map((q) => {
                  const status = STATUS_MAP[q.status] || STATUS_MAP.DRAFT;
                  const min = q.budgetMin ? parseFloat(q.budgetMin) : 0;
                  const max = q.budgetMax ? parseFloat(q.budgetMax) : 0;
                  const final = q.finalTotal ? parseFloat(q.finalTotal) : 0;
                  return (
                    <tr
                      key={q.id}
                      className="hover:bg-ink-50/60 transition-colors cursor-pointer"
                      onClick={() => setDetail(q)}
                    >
                      <td className="px-4 py-3">
                        <p className="font-mono font-semibold text-ink-900">{q.quoteNumber}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-ink-700 text-xs">{formatDate(q.createdAt)}</p>
                        <p className="text-2xs text-ink-500">{relativeTime(q.createdAt)}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-ink-900 text-sm truncate max-w-[140px]">{q.name}</p>
                        {q.company && <p className="text-2xs text-ink-500 truncate max-w-[140px]">{q.company}</p>}
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-ink-700 text-sm truncate max-w-[200px]">{q.subject}</p>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="font-semibold text-ink-900 tabular-nums">{q.quantityNeeded || '—'}</span>
                      </td>
                      <td className="px-4 py-3">
                        {min > 0 || max > 0 ? (
                          <p className="text-xs text-ink-700 tabular-nums">
                            {formatCurrency(min)} – {formatCurrency(max)}
                          </p>
                        ) : <span className="text-ink-400 text-xs">—</span>}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {final > 0 ? (
                          <p className="font-bold text-ink-900 tabular-nums">{formatCurrency(final)}</p>
                        ) : <span className="text-ink-400 text-xs">—</span>}
                      </td>
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <button onClick={() => setStatusModal(q)}>
                          <Badge variant={status.variant} dot>{status.label}</Badge>
                        </button>
                      </td>
                      <td className="px-4 py-3 min-w-[140px]">
                        <WorkflowProgress status={q.status} />
                      </td>
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <ChevronRight className="w-4 h-4 text-ink-400" />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* ─── Pagination ──────────────────────────────────── */}
      {!loading && data.length > 0 && (
        <Card>
          <Pagination page={page} totalPages={totalPages} total={total} limit={pageSize} onPageChange={setPage} />
        </Card>
      )}

      {/* ─── Detail drawer ───────────────────────────────── */}
      <QuoteDetailDrawer
        quote={detail}
        onClose={() => setDetail(null)}
        onStatusChange={setStatusModal}
        onConvert={setConvertConfirm}
      />

      {/* ─── Status change modal ─────────────────────────── */}
      <StatusChangeModal quote={statusModal} onClose={() => setStatusModal(null)} onConfirm={handleStatusChange} />

      {/* ─── Convert confirm ─────────────────────────────── */}
      <ConfirmDialog
        open={!!convertConfirm}
        onClose={() => setConvertConfirm(null)}
        onConfirm={() => convertConfirm && handleConvert(convertConfirm)}
        title="Convert to Order?"
        description={`Quote ${convertConfirm?.quoteNumber} will be converted to a new order. The quote will be marked as CONVERTED.`}
        confirmText="Convert"
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
    accent:  'bg-accent-50 text-accent-600',
    ink:     'bg-ink-100 text-ink-600',
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

// ─── Workflow progress mini-bar ─────────────────────────────
function WorkflowProgress({ status }: { status: string }) {
  const step = STATUS_MAP[status as QuoteStatus]?.step ?? -1;
  if (step === -1) return <span className="text-2xs text-ink-500 italic">{STATUS_MAP[status as QuoteStatus]?.label || status}</span>;
  return (
    <div className="flex items-center gap-0.5">
      {STATUS_FLOW.map((_, i) => (
        <div
          key={i}
          className={clsx('h-1.5 flex-1 rounded-pill', i <= step ? 'bg-accent-500' : 'bg-ink-200')}
        />
      ))}
    </div>
  );
}

// ─── Quote detail drawer ───────────────────────────────────
function QuoteDetailDrawer({ quote, onClose, onStatusChange, onConvert }: {
  quote: Quote | null;
  onClose: () => void;
  onStatusChange: (q: Quote) => void;
  onConvert: (q: Quote) => void;
}) {
  if (!quote) return null;
  const status = STATUS_MAP[quote.status] || STATUS_MAP.DRAFT;
  const min = quote.budgetMin ? parseFloat(quote.budgetMin) : 0;
  const max = quote.budgetMax ? parseFloat(quote.budgetMax) : 0;
  const subtotal = quote.finalSubtotal ? parseFloat(quote.finalSubtotal) : 0;
  const tax = quote.finalTaxAmount ? parseFloat(quote.finalTaxAmount) : 0;
  const shipping = quote.finalShippingAmount ? parseFloat(quote.finalShippingAmount) : 0;
  const total = quote.finalTotal ? parseFloat(quote.finalTotal) : 0;

  return (
    <div className="fixed inset-0 z-50 animate-fade-in">
      <div className="absolute inset-0 bg-ink-900/40 backdrop-blur-sm" onClick={onClose} />
      <div
        className="absolute top-0 right-0 h-full bg-white shadow-modal flex flex-col animate-slide-right"
        style={{ width: 'min(720px, 100vw)', borderTopLeftRadius: 24, borderBottomLeftRadius: 24 }}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-ink-200 flex-shrink-0">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="text-2xs font-bold text-ink-500 uppercase tracking-wider">Quote</p>
                <Badge variant={status.variant} dot>{status.label}</Badge>
              </div>
              <h2 className="text-lg font-bold text-ink-900 font-mono mt-0.5">{quote.quoteNumber}</h2>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-lg text-ink-500 hover:bg-ink-100 hover:text-ink-900 flex items-center justify-center">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto scroll-thin px-6 py-5 space-y-5">
          {/* Workflow timeline */}
          <div>
            <p className="text-2xs font-bold text-ink-500 uppercase tracking-wider mb-3">9-Stage Workflow</p>
            <WorkflowTimeline status={quote.status} />
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-2">
            <Button variant="primary" size="sm" leftIcon={Edit} onClick={() => onStatusChange(quote)}>
              Update Status
            </Button>
            {(quote.status === 'ACCEPTED' || quote.status === 'QUOTED') && (
            <Button variant="primary" size="sm" leftIcon={ShoppingCart} onClick={() => onConvert(quote)}>
                Convert to Order
              </Button>
            )}
            <Button variant="secondary" size="sm" leftIcon={Send}>Send to Customer</Button>
            <Button variant="secondary" size="sm" leftIcon={Download}>Download PDF</Button>
          </div>

          {/* Customer */}
          <Card>
            <CardBody>
              <p className="text-2xs font-bold text-ink-500 uppercase tracking-wider mb-2">Customer</p>
              <p className="font-bold text-ink-900 text-base">{quote.name}</p>
              {quote.company && <p className="text-sm text-ink-700">{quote.company}</p>}
              <div className="mt-2 space-y-0.5 text-xs text-ink-600">
                <p className="flex items-center gap-1.5"><Mail className="w-3 h-3" /> {quote.email}</p>
                <p className="flex items-center gap-1.5"><Phone className="w-3 h-3" /> {quote.phone}</p>
                {quote.gstin && <p className="flex items-center gap-1.5"><Hash className="w-3 h-3" /> GSTIN: {quote.gstin}</p>}
              </div>
            </CardBody>
          </Card>

          {/* Subject + Message */}
          <Card>
            <CardBody>
              <p className="text-2xs font-bold text-ink-500 uppercase tracking-wider mb-1">Subject</p>
              <p className="font-semibold text-ink-900">{quote.subject}</p>
              <p className="text-2xs font-bold text-ink-500 uppercase tracking-wider mt-3 mb-1">Message</p>
              <p className="text-sm text-ink-700 whitespace-pre-wrap">{quote.message}</p>
              {quote.productInterest && (
                <>
                  <p className="text-2xs font-bold text-ink-500 uppercase tracking-wider mt-3 mb-1">Product Interest</p>
                  <p className="text-sm text-ink-700">{quote.productInterest}</p>
                </>
              )}
            </CardBody>
          </Card>

          {/* Pricing summary */}
          <Card>
            <CardHeader title="Quote Pricing" description="Final terms & amounts" />
            <CardBody>
              <div className="space-y-1.5 text-sm">
                {quote.quantityNeeded && (
                  <div className="flex justify-between">
                    <span className="text-ink-600">Quantity</span>
                    <span className="font-semibold text-ink-900 tabular-nums">{quote.quantityNeeded}</span>
                  </div>
                )}
                {min > 0 && (
                  <div className="flex justify-between">
                    <span className="text-ink-600">Budget Range</span>
                    <span className="font-semibold text-ink-900 tabular-nums">{formatCurrency(min)} – {formatCurrency(max)}</span>
                  </div>
                )}
                {quote.deliveryDays && (
                  <div className="flex justify-between">
                    <span className="text-ink-600">Delivery Days</span>
                    <span className="font-semibold text-ink-900 tabular-nums">{quote.deliveryDays}</span>
                  </div>
                )}
                {(subtotal > 0 || tax > 0 || shipping > 0) && (
                  <>
                    <div className="border-t border-ink-100 my-2" />
                    {subtotal > 0 && <SummaryRow label="Subtotal" value={formatCurrency(subtotal)} />}
                    {tax > 0 && <SummaryRow label="Tax" value={formatCurrency(tax)} />}
                    {shipping > 0 && <SummaryRow label="Shipping" value={formatCurrency(shipping)} />}
                  </>
                )}
                {total > 0 && (
                  <>
                    <div className="border-t border-ink-100 pt-2 mt-2 flex items-center justify-between">
                      <p className="font-bold text-ink-900">Final Total</p>
                      <p className="text-lg font-bold text-ink-900 tabular-nums">{formatCurrency(total)}</p>
                    </div>
                  </>
                )}
              </div>
            </CardBody>
          </Card>

          {/* Terms */}
          {(quote.finalTerms || quote.paymentTerms) && (
            <Card>
              <CardHeader title="Terms" />
              <CardBody className="space-y-2">
                {quote.paymentTerms && (
                  <div>
                    <p className="text-2xs font-bold text-ink-500 uppercase tracking-wider">Payment Terms</p>
                    <p className="text-sm text-ink-700 mt-0.5">{quote.paymentTerms}</p>
                  </div>
                )}
                {quote.finalTerms && (
                  <div>
                    <p className="text-2xs font-bold text-ink-500 uppercase tracking-wider">Final Terms</p>
                    <p className="text-sm text-ink-700 mt-0.5 whitespace-pre-wrap">{quote.finalTerms}</p>
                  </div>
                )}
              </CardBody>
            </Card>
          )}

          {/* Internal notes */}
          {quote.internalNotes && (
            <Card>
              <CardBody>
                <p className="text-2xs font-bold text-ink-500 uppercase tracking-wider">Internal Notes</p>
                <p className="text-sm text-ink-700 mt-1 whitespace-pre-wrap">{quote.internalNotes}</p>
              </CardBody>
            </Card>
          )}

          {quote.customerNotes && (
            <Card>
              <CardBody>
                <p className="text-2xs font-bold text-ink-500 uppercase tracking-wider">Customer Notes</p>
                <p className="text-sm text-ink-700 mt-1 whitespace-pre-wrap">{quote.customerNotes}</p>
              </CardBody>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-ink-600">{label}</span>
      <span className="font-semibold text-ink-900 tabular-nums">{value}</span>
    </div>
  );
}

// ─── Workflow timeline ─────────────────────────────────────
function WorkflowTimeline({ status }: { status: string }) {
  const step = STATUS_MAP[status as QuoteStatus]?.step ?? -1;
  const isFailed = status === 'REJECTED' || status === 'EXPIRED';
  return (
    <div className="flex items-center gap-1 overflow-x-auto scroll-thin pb-1">
      {STATUS_FLOW.map((s, i) => {
        const cfg = STATUS_MAP[s];
        const isDone = !isFailed && i < step;
        const isCurrent = !isFailed && i === step;
        return (
          <div key={s} className="flex items-center gap-1 flex-shrink-0">
            <div className="flex flex-col items-center gap-1.5 min-w-[80px]">
              <div
                className={clsx(
                  'w-8 h-8 rounded-full flex items-center justify-center transition-all',
                  isCurrent && 'bg-accent-500 text-white ring-4 ring-accent-200 scale-110',
                  isDone && 'bg-accent-500 text-white',
                  !isDone && !isCurrent && 'bg-ink-100 text-ink-400',
                )}
              >
                {isDone ? <Check className="w-3.5 h-3.5" strokeWidth={3} /> :
                 isCurrent ? <cfg.icon className="w-4 h-4" strokeWidth={2.5} /> :
                 <cfg.icon className="w-4 h-4" strokeWidth={1.75} />}
              </div>
              <p className={clsx(
                'text-2xs font-semibold text-center leading-tight',
                (isCurrent || isDone) ? 'text-ink-900' : 'text-ink-400',
              )}>
                {cfg.label}
              </p>
            </div>
            {i < STATUS_FLOW.length - 1 && (
              <div className={clsx('h-0.5 w-3 sm:w-6 mb-5', isDone ? 'bg-accent-500' : 'bg-ink-200')} />
            )}
          </div>
        );
      })}
      {isFailed && (
        <div className="flex items-center gap-1 ml-2">
          <div className={clsx('w-8 h-8 rounded-full text-white flex items-center justify-center', status === 'REJECTED' ? 'bg-danger-500' : 'bg-warning-500')}>
            {status === 'REJECTED' ? <XCircle className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
          </div>
          <p className={clsx('text-2xs font-semibold', status === 'REJECTED' ? 'text-danger-700' : 'text-warning-700')}>
            {STATUS_MAP[status as QuoteStatus]?.label}
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Status change modal ───────────────────────────────────
function StatusChangeModal({ quote, onClose, onConfirm }: { quote: Quote | null; onClose: () => void; onConfirm: (q: Quote, s: string) => void }) {
  const [selected, setSelected] = useState<string | null>(null);
  useEffect(() => {
    if (quote) setSelected(quote.status);
  }, [quote?.id]);
  if (!quote) return null;
  return (
    <Modal
      open={!!quote}
      onClose={onClose}
      title={`Update Status: ${quote.quoteNumber}`}
      size="md"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="primary" disabled={!selected || selected === quote.status} onClick={() => onConfirm(quote, selected!)} leftIcon={Check}>
            Update
          </Button>
        </>
      }
    >
      <div className="space-y-2">
        <p className="text-sm text-ink-600 mb-3">Current: <Badge variant={STATUS_MAP[quote.status].variant} dot>{STATUS_MAP[quote.status].label}</Badge></p>
        {(Object.keys(STATUS_MAP) as QuoteStatus[]).map((s) => {
          const cfg = STATUS_MAP[s];
          const isSelected = selected === s;
          return (
            <button
              key={s}
              onClick={() => setSelected(s)}
              className={clsx(
                'w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left',
                isSelected ? 'border-accent-500 bg-accent-50/50' : 'border-ink-200 hover:border-ink-300',
                s === quote.status && 'opacity-50',
              )}
            >
              <div className={clsx('w-9 h-9 rounded-xl flex items-center justify-center', cfg.bg, cfg.color)}>
                <cfg.icon className="w-4 h-4" strokeWidth={2.25} />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm text-ink-900">{cfg.label}</p>
                <p className="text-2xs text-ink-500">
                  {s === 'DRAFT' && 'Created but not submitted'}
                  {s === 'SUBMITTED' && 'Customer sent the request'}
                  {s === 'REVIEWED' && 'Admin reviewed the request'}
                  {s === 'QUOTED' && 'Pricing sent to customer'}
                  {s === 'ACCEPTED' && 'Customer accepted the quote'}
                  {s === 'REJECTED' && 'Customer rejected the quote'}
                  {s === 'EXPIRED' && 'Quote validity expired'}
                  {s === 'CONVERTED' && 'Converted to an order'}
                </p>
              </div>
              {isSelected && <Check className="w-4 h-4 text-accent-600" strokeWidth={3} />}
            </button>
          );
        })}
      </div>
    </Modal>
  );
}

// Avoid unused warnings
void Link;
void MoreVertical;
void RefreshCcw;
void FileCheck;
void ArrowRight;
void DollarSign;
void Truck;
void Package;
void UserIcon;
void Calendar;
void MapPin;
void AlertCircle;
void ChevronDown;
