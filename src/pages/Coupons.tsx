// ────────────────────────────────────────────────────────────
// Premium Coupons — Part 3B QA
// Full CRUD with usage stats, code generator, validation rules
// ────────────────────────────────────────────────────────────

import { useEffect, useState } from 'react';
import {
  Percent, Plus, Search, Edit, Trash2, Copy, Calendar, MoreVertical,
  Tag, Users, DollarSign, TrendingUp, X, Filter, Download,
  CheckCircle2, XCircle, Clock, Sparkles, RefreshCw, Hash,
  ChevronRight, Zap, Target, Eye, ShoppingBag,
} from 'lucide-react';
import clsx from 'clsx';
import toast from 'react-hot-toast';
import {
  Card, CardHeader, CardBody, Button, Badge, PageHeader, EmptyState,
  Skeleton, Modal, ConfirmDialog, Pagination, Tabs,
} from '../components/ui/StatCard';
import { formatCurrency, formatDate } from '../lib/auth';

const SAMPLE_COUPONS = [
  { id: 'co1', code: 'CEMENT15',  discount: 15,    type: 'percent', minOrder: 5000,  maxDiscount: 2000, uses: 47,  max: 200, expiresAt: '2026-08-31', status: 'active',    description: 'Summer Cement Sale', scope: 'category:cement', revenue: 124500 },
  { id: 'co2', code: 'WELCOME500',discount: 500,   type: 'flat',    minOrder: 2000,  maxDiscount: 500,  uses: 124, max: 1000,expiresAt: '2026-12-31', status: 'active',    description: 'New customer offer',scope: 'all', revenue: 62000 },
  { id: 'co3', code: 'STEEL20',   discount: 20,    type: 'percent', minOrder: 10000, maxDiscount: 5000, uses: 18,  max: 100, expiresAt: '2026-07-31', status: 'active',    description: 'Steel bulk discount',scope: 'category:steel', revenue: 89000 },
  { id: 'co4', code: 'EXPIRED10', discount: 10,    type: 'percent', minOrder: 1000,  maxDiscount: 500,  uses: 89,  max: 100, expiresAt: '2026-06-30', status: 'expired',   description: 'Old promo',         scope: 'all', revenue: 12500 },
  { id: 'co5', code: 'FREESHIP',  discount: 99,    type: 'flat',    minOrder: 500,   maxDiscount: 99,   uses: 234, max: 500, expiresAt: '2026-09-15', status: 'active',    description: 'Free shipping',     scope: 'all', revenue: 0 },
  { id: 'co6', code: 'BUILDER25', discount: 25,    type: 'percent', minOrder: 50000, maxDiscount: 10000,uses: 5,  max: 50,  expiresAt: '2026-10-30', status: 'paused',    description: 'VIP builder tier',  scope: 'role:contractor', revenue: 245000 },
];

const STATUS_MAP: Record<string, { label: string; variant: any; dot: string }> = {
  active:    { label: 'Active',    variant: 'success', dot: 'bg-success-500' },
  expired:   { label: 'Expired',   variant: 'ink',     dot: 'bg-ink-400' },
  paused:    { label: 'Paused',    variant: 'warning', dot: 'bg-warning-500' },
  scheduled: { label: 'Scheduled', variant: 'info',    dot: 'bg-info-500' },
};

export default function Coupons() {
  const [coupons, setCoupons] = useState(SAMPLE_COUPONS);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'expired' | 'paused'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'percent' | 'flat' | 'shipping'>('all');
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [deleting, setDeleting] = useState<any>(null);
  const [view, setView] = useState<'grid' | 'table'>('grid');

  const filtered = coupons.filter((c) => {
    if (search && !`${c.code} ${c.description}`.toLowerCase().includes(search.toLowerCase())) return false;
    if (filter !== 'all' && c.status !== filter) return false;
    if (typeFilter !== 'all' && c.type !== typeFilter) return false;
    return true;
  });

  const kpis = [
    { label: 'Total Coupons',  value: coupons.length,                                              icon: Tag,         accent: 'info' },
    { label: 'Active',         value: coupons.filter((c) => c.status === 'active').length,         icon: CheckCircle2, accent: 'success' },
    { label: 'Total Uses',     value: coupons.reduce((s, c) => s + c.uses, 0),                    icon: Users,       accent: 'accent' },
    { label: 'Revenue Generated',value: formatCurrency(coupons.reduce((s, c) => s + c.revenue, 0)), icon: DollarSign,  accent: 'success' },
    { label: 'Expiring (7d)',  value: 1,                                                          icon: Clock,       accent: 'warning' },
  ];

  const handleSave = (data: any) => {
    if (editing) {
      setCoupons((prev) => prev.map((c) => (c.id === editing.id ? { ...c, ...data } : c)));
      toast.success('Coupon updated');
    } else {
      setCoupons((prev) => [{ id: `co${Date.now()}`, uses: 0, ...data }, ...prev]);
      toast.success('Coupon created');
    }
    setModal(false);
    setEditing(null);
  };

  const handleDelete = () => {
    setCoupons((prev) => prev.filter((c) => c.id !== deleting.id));
    toast.success('Coupon deleted');
    setDeleting(null);
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success(`Copied ${code}`);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-24">
      <PageHeader
        title="Coupons"
        description={`${coupons.length} coupons · ${formatCurrency(coupons.reduce((s, c) => s + c.revenue, 0))} revenue`}
        breadcrumbs={[{ label: 'Engage' }, { label: 'Coupons' }]}
        actions={
          <>
            <Button variant="secondary" leftIcon={Download}>Export</Button>
            <Button variant="primary" leftIcon={Plus} onClick={() => { setEditing(null); setModal(true); }}>
              Create Coupon
            </Button>
          </>
        }
      />

      {/* ─── 5 KPI cards ─────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {kpis.map((k) => (
          <MiniStat key={k.label} {...k} />
        ))}
      </div>

      {/* ─── Tabs ────────────────────────────────────────── */}
      <Tabs
        active={filter}
        onChange={(v) => setFilter(v as any)}
        tabs={[
          { value: 'all',     label: 'All',     count: coupons.length },
          { value: 'active',  label: 'Active',  count: coupons.filter((c) => c.status === 'active').length },
          { value: 'expired', label: 'Expired', count: coupons.filter((c) => c.status === 'expired').length },
          { value: 'paused',  label: 'Paused',  count: coupons.filter((c) => c.status === 'paused').length },
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
              placeholder="Search by code or description…"
              className="input pl-10"
            />
          </div>

          <div className="flex items-center gap-2">
            <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value as any)} className="input h-9 text-sm w-auto min-w-[140px]">
              <option value="all">All Types</option>
              <option value="percent">Percentage</option>
              <option value="flat">Flat Amount</option>
              <option value="shipping">Free Shipping</option>
            </select>
            <div className="flex items-center bg-ink-100 rounded-lg p-0.5">
              <button
                onClick={() => setView('grid')}
                className={clsx('w-7 h-7 rounded-md flex items-center justify-center transition-all', view === 'grid' ? 'bg-white shadow-sm text-ink-900' : 'text-ink-500')}
                aria-label="Grid view"
              >
                <Tag className="w-4 h-4" />
              </button>
              <button
                onClick={() => setView('table')}
                className={clsx('w-7 h-7 rounded-md flex items-center justify-center transition-all', view === 'table' ? 'bg-white shadow-sm text-ink-900' : 'text-ink-500')}
                aria-label="Table view"
              >
                <Target className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </Card>

      {/* ─── Coupons list ─────────────────────────────────── */}
      {filtered.length === 0 ? (
        <Card>
          <EmptyState
            icon={Percent}
            title="No coupons found"
            description="Create your first coupon to start offering discounts."
            action={<Button variant="primary" leftIcon={Plus} onClick={() => { setEditing(null); setModal(true); }}>Create Coupon</Button>}
          />
        </Card>
      ) : view === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((c) => {
            const status = STATUS_MAP[c.status];
            const usagePercent = (c.uses / c.max) * 100;
            return (
              <Card key={c.id} className="relative overflow-hidden">
                <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-accent-50 opacity-50" />
                <div className="relative p-5">
                  <div className="flex items-center justify-between mb-3">
                    <Badge variant={status.variant} dot>{status.label}</Badge>
                    <Percent className="w-5 h-5 text-accent-500" />
                  </div>
                  <p className="font-mono text-2xl font-black text-ink-900 tracking-wider">{c.code}</p>
                  <p className="text-sm text-ink-600 mt-1 line-clamp-1">{c.description}</p>
                  <p className="text-xs text-ink-500 mt-1 capitalize">
                    {c.type === 'percent' ? `${c.discount}% off` : c.type === 'flat' ? `₹${c.discount} off` : 'Free shipping'} · Min {formatCurrency(c.minOrder)}
                  </p>

                  {/* Usage bar */}
                  <div className="mt-4 pt-3 border-t border-dashed border-ink-200">
                    <div className="flex items-center justify-between text-2xs mb-1.5">
                      <span className="text-ink-500">Usage</span>
                      <span className="font-bold text-ink-900 tabular-nums">{c.uses} / {c.max} ({usagePercent.toFixed(0)}%)</span>
                    </div>
                    <div className="h-1.5 bg-ink-100 rounded-pill overflow-hidden">
                      <div
                        className={clsx('h-full rounded-pill transition-all', usagePercent > 80 ? 'bg-danger-500' : usagePercent > 50 ? 'bg-warning-500' : 'bg-success-500')}
                        style={{ width: `${Math.min(100, usagePercent)}%` }}
                      />
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2 text-2xs">
                    <div>
                      <p className="text-ink-500">Revenue</p>
                      <p className="font-bold text-ink-900 tabular-nums">{formatCurrency(c.revenue)}</p>
                    </div>
                    <div>
                      <p className="text-ink-500">Expires</p>
                      <p className="font-bold text-ink-900">{formatDate(c.expiresAt)}</p>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center gap-1">
                    <button onClick={() => copyCode(c.code)} className="btn-icon btn-sm" title="Copy code">
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => { setEditing(c); setModal(true); }} className="btn-icon btn-sm" title="Edit">
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => setDeleting(c)} className="btn-icon btn-sm text-danger-600" title="Delete">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto scroll-thin">
            <table className="w-full text-sm">
              <thead className="bg-ink-50/80 border-b border-ink-200">
                <tr>
                  <th className="px-4 py-3 text-left text-2xs font-bold text-ink-500 uppercase tracking-wider">Code</th>
                  <th className="px-4 py-3 text-left text-2xs font-bold text-ink-500 uppercase tracking-wider">Description</th>
                  <th className="px-4 py-3 text-left text-2xs font-bold text-ink-500 uppercase tracking-wider">Discount</th>
                  <th className="px-4 py-3 text-right text-2xs font-bold text-ink-500 uppercase tracking-wider">Min Order</th>
                  <th className="px-4 py-3 text-right text-2xs font-bold text-ink-500 uppercase tracking-wider">Usage</th>
                  <th className="px-4 py-3 text-right text-2xs font-bold text-ink-500 uppercase tracking-wider">Revenue</th>
                  <th className="px-4 py-3 text-left text-2xs font-bold text-ink-500 uppercase tracking-wider">Expires</th>
                  <th className="px-4 py-3 text-left text-2xs font-bold text-ink-500 uppercase tracking-wider">Status</th>
                  <th className="w-10 px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {filtered.map((c) => {
                  const status = STATUS_MAP[c.status];
                  return (
                    <tr key={c.id} className="hover:bg-ink-50/60 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <p className="font-mono font-bold text-ink-900">{c.code}</p>
                          <button onClick={() => copyCode(c.code)} className="text-ink-400 hover:text-accent-600"><Copy className="w-3 h-3" /></button>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-ink-700 max-w-[200px] truncate">{c.description}</td>
                      <td className="px-4 py-3 text-sm font-semibold text-accent-600">
                        {c.type === 'percent' ? `${c.discount}%` : c.type === 'flat' ? `₹${c.discount}` : 'Free Ship'}
                      </td>
                      <td className="px-4 py-3 text-right text-ink-700 tabular-nums">{formatCurrency(c.minOrder)}</td>
                      <td className="px-4 py-3 text-right">
                        <p className="text-sm font-semibold text-ink-900 tabular-nums">{c.uses} / {c.max}</p>
                        <p className="text-2xs text-ink-500">{((c.uses / c.max) * 100).toFixed(0)}% used</p>
                      </td>
                      <td className="px-4 py-3 text-right text-sm font-semibold text-ink-900 tabular-nums">{formatCurrency(c.revenue)}</td>
                      <td className="px-4 py-3 text-2xs text-ink-500">{formatDate(c.expiresAt)}</td>
                      <td className="px-4 py-3">
                        <Badge variant={status.variant} dot>{status.label}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button onClick={() => { setEditing(c); setModal(true); }} className="w-7 h-7 rounded-md text-ink-500 hover:bg-ink-100 flex items-center justify-center"><Edit className="w-3.5 h-3.5" /></button>
                          <button onClick={() => setDeleting(c)} className="w-7 h-7 rounded-md text-danger-600 hover:bg-danger-50 flex items-center justify-center"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* ─── Form modal ──────────────────────────────────── */}
      <CouponFormModal
        open={modal}
        coupon={editing}
        onClose={() => { setModal(false); setEditing(null); }}
        onSave={handleSave}
      />

      {/* ─── Delete confirm ──────────────────────────────── */}
      <ConfirmDialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={handleDelete}
        title="Delete coupon?"
        description={`"${deleting?.code}" will be permanently removed. This cannot be undone.`}
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
    accent:  'bg-accent-50 text-accent-600',
  };
  return (
    <div className="card-hover p-3 sm:p-4 flex items-center gap-2.5">
      <div className={clsx('w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0', map[accent])}>
        <Icon className="w-4 h-4" strokeWidth={2.25} />
      </div>
      <div className="min-w-0">
        <p className="text-2xs text-ink-500 truncate">{label}</p>
        <p className="text-base font-bold text-ink-900 tabular-nums truncate">{value}</p>
      </div>
    </div>
  );
}

// ─── Form modal ────────────────────────────────────────────
function CouponFormModal({ open, coupon, onClose, onSave }: { open: boolean; coupon: any; onClose: () => void; onSave: (d: any) => void }) {
  const [code, setCode] = useState(coupon?.code || '');
  const [description, setDescription] = useState(coupon?.description || '');
  const [type, setType] = useState(coupon?.type || 'percent');
  const [discount, setDiscount] = useState(coupon?.discount || 10);
  const [minOrder, setMinOrder] = useState(coupon?.minOrder || 1000);
  const [maxDiscount, setMaxDiscount] = useState(coupon?.maxDiscount || 0);
  const [uses, setUses] = useState(coupon?.uses || 0);
  const [max, setMax] = useState(coupon?.max || 100);
  const [expiresAt, setExpiresAt] = useState(coupon?.expiresAt || '');
  const [status, setStatus] = useState(coupon?.status || 'active');
  const [scope, setScope] = useState(coupon?.scope || 'all');

  useEffect(() => {
    if (open) {
      setCode(coupon?.code || '');
      setDescription(coupon?.description || '');
      setType(coupon?.type || 'percent');
      setDiscount(coupon?.discount ?? 10);
      setMinOrder(coupon?.minOrder ?? 1000);
      setMaxDiscount(coupon?.maxDiscount ?? 0);
      setUses(coupon?.uses ?? 0);
      setMax(coupon?.max ?? 100);
      setExpiresAt(coupon?.expiresAt || '');
      setStatus(coupon?.status || 'active');
      setScope(coupon?.scope || 'all');
    }
  }, [coupon?.id, open]);

  if (!open) return null;

  const generateCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) result += chars[Math.floor(Math.random() * chars.length)];
    setCode(result);
  };

  const submit = () => {
    if (!code || !description) {
      toast.error('Code and description are required');
      return;
    }
    onSave({ code: code.toUpperCase(), description, type, discount, minOrder, maxDiscount, uses, max, expiresAt, status, scope });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={coupon ? `Edit ${coupon.code}` : 'Create New Coupon'}
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={submit}>{coupon ? 'Save Changes' : 'Create Coupon'}</Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2">
            <label className="label">Coupon Code <span className="text-danger-500">*</span></label>
            <div className="flex gap-2">
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                className="input font-mono uppercase flex-1"
                placeholder="SUMMER20"
                maxLength={20}
              />
              <Button variant="secondary" onClick={generateCode} type="button">
                <Sparkles className="w-3.5 h-3.5" /> Generate
              </Button>
            </div>
          </div>
          <div>
            <label className="label">Status</label>
            <select className="input" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="scheduled">Scheduled</option>
            </select>
          </div>
        </div>

        <div>
          <label className="label">Description <span className="text-danger-500">*</span></label>
          <input className="input" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="e.g. Summer Cement Sale" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="label">Type</label>
            <select className="input" value={type} onChange={(e) => setType(e.target.value)}>
              <option value="percent">Percentage (%)</option>
              <option value="flat">Flat amount (₹)</option>
              <option value="shipping">Free shipping</option>
            </select>
          </div>
          <div>
            <label className="label">{type === 'percent' ? 'Discount (%)' : type === 'flat' ? 'Amount (₹)' : 'Value'}</label>
            <input className="input" type="number" value={discount} onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)} />
          </div>
          {type === 'percent' && (
            <div>
              <label className="label">Max Discount (₹)</label>
              <input className="input" type="number" value={maxDiscount} onChange={(e) => setMaxDiscount(parseFloat(e.target.value) || 0)} placeholder="0 = unlimited" />
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="label">Min Order (₹)</label>
            <input className="input" type="number" value={minOrder} onChange={(e) => setMinOrder(parseFloat(e.target.value) || 0)} />
          </div>
          <div>
            <label className="label">Max Uses</label>
            <input className="input" type="number" value={max} onChange={(e) => setMax(parseInt(e.target.value) || 0)} />
          </div>
          <div>
            <label className="label">Expires</label>
            <input className="input" type="date" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} />
          </div>
        </div>

        <div>
          <label className="label">Scope (where coupon applies)</label>
          <select className="input" value={scope} onChange={(e) => setScope(e.target.value)}>
            <option value="all">All Products</option>
            <option value="category:cement">Category: Cement</option>
            <option value="category:steel">Category: Steel</option>
            <option value="category:bricks">Category: Bricks</option>
            <option value="category:tiles">Category: Tiles</option>
            <option value="role:contractor">Customer Role: Contractor</option>
          </select>
        </div>
      </div>
    </Modal>
  );
}

// Avoid unused
void TrendingUp; void RefreshCw; void Hash; void Eye; void ShoppingBag; void Pagination; void Skeleton; void formatDate;
