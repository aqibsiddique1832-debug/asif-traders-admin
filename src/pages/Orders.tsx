// ────────────────────────────────────────────────────────────
// Premium Orders — Part 2B-1A
// 10 KPIs · 8-stage workflow · 11-col table · detail drawer
// ────────────────────────────────────────────────────────────

import { useEffect, useState, useMemo } from 'react';
import {
  ShoppingBag, Search, Filter, Download, Printer, Truck, X, Check,
  CheckCircle2, AlertTriangle, Clock, XCircle, Package, DollarSign,
  TrendingUp, Calendar, ChevronRight, MoreVertical, Eye, MapPin,
  Phone, Mail, Hash, ArrowRight, User as UserIcon, RotateCcw,
  List as ListIcon, Grid3x3, GitBranch, Layers, FileText, Edit2,
  ChevronDown, Plus, CreditCard, Box, Activity, ArrowUpRight,
  Pause, Play, Ban, RefreshCcw, Send, Copy,
} from 'lucide-react';
import clsx from 'clsx';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  Card, CardHeader, CardBody, Button, Badge, PageHeader, EmptyState,
  Skeleton, Modal, ConfirmDialog, Pagination, Tabs,
} from '../components/ui/StatCard';
import { orderService } from '../lib/services';
import { formatCurrency, formatDate, relativeTime } from '../lib/auth';
import type { Order, Address } from '../types';
import { PrintModal, StatusAutomationPanel } from '../components/orders/PrintModal';

// ─── Status config (8-stage workflow) ──────────────────────
type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED' | 'REFUNDED' | 'RETURNED';

const STATUS_FLOW: OrderStatus[] = [
  'PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED',
];

const STATUS_MAP: Record<OrderStatus, { label: string; variant: any; color: string; bg: string; icon: any; step: number }> = {
  PENDING:         { label: 'Pending',          variant: 'warning', color: 'text-warning-700', bg: 'bg-warning-subtle',  icon: Clock,         step: 0 },
  CONFIRMED:       { label: 'Confirmed',        variant: 'info',    color: 'text-info-700',    bg: 'bg-info-subtle',     icon: CheckCircle2,  step: 1 },
  PROCESSING:      { label: 'Processing',       variant: 'info',    color: 'text-info-700',    bg: 'bg-info-subtle',     icon: Box,           step: 2 },
  SHIPPED:         { label: 'Shipped',          variant: 'accent',  color: 'text-accent-700',  bg: 'bg-accent-50',       icon: Truck,         step: 3 },
  OUT_FOR_DELIVERY:{ label: 'Out for Delivery', variant: 'accent',  color: 'text-accent-700',  bg: 'bg-accent-50',       icon: Truck,         step: 4 },
  DELIVERED:       { label: 'Delivered',        variant: 'success', color: 'text-success-700', bg: 'bg-success-subtle', icon: CheckCircle2,  step: 5 },
  CANCELLED:       { label: 'Cancelled',        variant: 'danger',  color: 'text-danger-700',  bg: 'bg-danger-subtle',   icon: XCircle,       step: -1 },
  REFUNDED:        { label: 'Refunded',         variant: 'danger',  color: 'text-danger-700',  bg: 'bg-danger-subtle',   icon: RotateCcw,     step: -1 },
  RETURNED:        { label: 'Returned',         variant: 'warning', color: 'text-warning-700', bg: 'bg-warning-subtle', icon: RotateCcw,     step: -1 },
};

const PAYMENT_STATUS_MAP: Record<string, { label: string; variant: any; icon: any }> = {
  PENDING:  { label: 'Pending',  variant: 'warning', icon: Clock },
  PAID:     { label: 'Paid',     variant: 'success', icon: CheckCircle2 },
  FAILED:   { label: 'Failed',   variant: 'danger',  icon: XCircle },
  REFUNDED: { label: 'Refunded', variant: 'info',    icon: RotateCcw },
};

// ─── View modes ─────────────────────────────────────────────
type ViewMode = 'table' | 'grid' | 'timeline';

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [pageSize] = useState(20);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState('newest');

  // Stats from /admin/orders/stats
  const [stats, setStats] = useState<{ total: number; today: number; byStatus: Record<string, number> }>({ total: 0, today: 0, byStatus: {} });
  const [revenue, setRevenue] = useState({ total: 0, thisMonth: 0, lastMonth: 0 });

  // Selection
  const [selected, setSelected] = useState<Set<string>>(new Set());

  // View
  const [view, setView] = useState<ViewMode>('table');

  // Detail
  const [detail, setDetail] = useState<Order | null>(null);
  const [statusModal, setStatusModal] = useState<Order | null>(null);
  const [printingOrder, setPrintingOrder] = useState<Order | null>(null);
  const [showAutomation, setShowAutomation] = useState(false);

  useEffect(() => {
    loadData();
  }, [page, statusFilter, paymentFilter, sortBy, search]);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const res = await orderService.stats();
      setStats(res);
      // Calculate revenue from visible orders
      const allOrders = await orderService.list({ limit: 100 });
      const list = (allOrders as any).data || [];
      const totalRev = list.reduce((s: number, o: Order) => s + parseFloat(o.total), 0);
      const now = new Date();
      const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
      const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).getTime();
      const thisMonth = list.filter((o: Order) => new Date(o.createdAt).getTime() >= thisMonthStart).reduce((s: number, o: Order) => s + parseFloat(o.total), 0);
      const lastMonth = list.filter((o: Order) => {
        const t = new Date(o.createdAt).getTime();
        return t >= lastMonthStart && t < thisMonthStart;
      }).reduce((s: number, o: Order) => s + parseFloat(o.total), 0);
      setRevenue({ total: totalRev, thisMonth, lastMonth });
    } catch (err) {
      console.error(err);
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const params: any = { page, limit: pageSize };
      if (search) params.search = search;
      if (statusFilter !== 'all') params.status = statusFilter;
      if (paymentFilter !== 'all') params.paymentStatus = paymentFilter;
      params.sortBy = sortBy === 'newest' ? 'createdAt' : sortBy === 'oldest' ? 'createdAt' : 'total';
      params.sortOrder = sortBy === 'oldest' ? 'asc' : 'desc';
      const res = await orderService.list(params);
      setOrders((res as any).data || []);
      const total = (res as any).total ?? (res as any).pagination?.total ?? 0;
      const totalPages = (res as any).totalPages ?? (res as any).pagination?.totalPages ?? 1;
      setTotal(total);
      setTotalPages(totalPages);
    } catch (err) {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  // ─── Stats ────────────────────────────────────────────
  const kpis = useMemo(() => [
    { label: 'Total Orders',     value: stats.total,                              icon: ShoppingBag,  accent: 'info' as const,    badge: 'all' },
    { label: 'Today',            value: stats.today,                              icon: Calendar,     accent: 'accent' as const,  badge: 'today' },
    { label: 'Pending',          value: stats.byStatus.PENDING || 0,              icon: Clock,        accent: 'warning' as const, badge: 'PENDING' },
    { label: 'Confirmed',        value: stats.byStatus.CONFIRMED || 0,            icon: CheckCircle2, accent: 'info' as const,    badge: 'CONFIRMED' },
    { label: 'Processing',       value: stats.byStatus.PROCESSING || 0,           icon: Box,          accent: 'info' as const,    badge: 'PROCESSING' },
    { label: 'Shipped',          value: stats.byStatus.SHIPPED || 0,              icon: Truck,        accent: 'accent' as const,  badge: 'SHIPPED' },
    { label: 'Out for Delivery', value: stats.byStatus.OUT_FOR_DELIVERY || 0,      icon: Truck,        accent: 'accent' as const,  badge: 'OUT_FOR_DELIVERY' },
    { label: 'Delivered',        value: stats.byStatus.DELIVERED || 0,            icon: CheckCircle2, accent: 'success' as const, badge: 'DELIVERED' },
    { label: 'Cancelled',        value: (stats.byStatus.CANCELLED || 0) + (stats.byStatus.REFUNDED || 0) + (stats.byStatus.RETURNED || 0), icon: XCircle, accent: 'danger' as const, badge: 'CANCELLED' },
    { label: 'Revenue (₹)',      value: formatCurrency(revenue.thisMonth),        icon: DollarSign,   accent: 'success' as const, badge: 'revenue' },
  ], [stats, revenue]);

  // ─── Selection ────────────────────────────────────────
  const allOnPageSelected = orders.length > 0 && orders.every((o) => selected.has(o.id));
  const someOnPageSelected = orders.some((o) => selected.has(o.id)) && !allOnPageSelected;
  const toggleAll = () => {
    if (allOnPageSelected) {
      const n = new Set(selected);
      orders.forEach((o) => n.delete(o.id));
      setSelected(n);
    } else {
      const n = new Set(selected);
      orders.forEach((o) => n.add(o.id));
      setSelected(n);
    }
  };
  const toggleOne = (id: string) => {
    const n = new Set(selected);
    if (n.has(id)) n.delete(id); else n.add(id);
    setSelected(n);
  };
  const clearSelection = () => setSelected(new Set());

  // ─── Status change handler ───────────────────────────
  const handleStatusChange = async (order: Order, newStatus: OrderStatus) => {
    try {
      await orderService.updateStatus(order.id, { status: newStatus });
      toast.success(`Order updated to ${STATUS_MAP[newStatus].label}`);
      loadData();
      loadStats();
      setStatusModal(null);
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || 'Update failed');
    }
  };

  // ─── Bulk status advance ──────────────────────────────
  const handleBulkAdvance = async (targetStatus: string) => {
    if (selected.size === 0) {
      toast.error('Select orders first');
      return;
    }
    try {
      await Promise.all(
        Array.from(selected).map((id) => orderService.updateStatus(id, { status: targetStatus })),
      );
      toast.success(`Updated ${selected.size} orders to ${STATUS_MAP[targetStatus as OrderStatus]?.label || targetStatus}`);
      clearSelection();
      loadData();
      loadStats();
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || 'Bulk update failed');
    }
  };

  const handleSchedule = () => toast.success('Schedule update — coming soon');
  const handleNotify = () => toast.success('Customer notification sent (simulated)');

  return (
    <div className="space-y-6 animate-fade-in pb-24">
      <PageHeader
        title="Orders"
        description={`${total} orders · ${formatCurrency(revenue.thisMonth)} revenue this month`}
        breadcrumbs={[{ label: 'Sales' }, { label: 'Orders' }]}
        actions={
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button variant="secondary" leftIcon={Download} className="flex-1 sm:flex-none justify-center">Export</Button>
            <Button variant="secondary" leftIcon={Printer} className="flex-1 sm:flex-none justify-center">Print Queue</Button>
          </div>
        }
      />

      {/* ─── 10 KPI cards ──────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {kpis.map((k) => (
          <KPICard
            key={k.label}
            {...k}
            onClick={() => {
              if (k.badge === 'all' || k.badge === 'today' || k.badge === 'revenue') {
                setStatusFilter('all');
              } else {
                setStatusFilter(k.badge);
              }
              setPage(1);
            }}
            active={
              (k.badge === 'all' && statusFilter === 'all') ||
              (k.badge !== 'all' && k.badge !== 'today' && k.badge !== 'revenue' && statusFilter === k.badge)
            }
          />
        ))}
      </div>

      {/* ─── Tabs (quick status filter) ─────────────────── */}
      <Tabs
        active={statusFilter}
        onChange={(v) => { setStatusFilter(v); setPage(1); clearSelection(); }}
        tabs={[
          { value: 'all',              label: 'All',              count: total },
          { value: 'PENDING',          label: 'Pending',          count: stats.byStatus.PENDING || 0 },
          { value: 'CONFIRMED',        label: 'Confirmed',        count: stats.byStatus.CONFIRMED || 0 },
          { value: 'PROCESSING',       label: 'Processing',       count: stats.byStatus.PROCESSING || 0 },
          { value: 'SHIPPED',          label: 'Shipped',          count: stats.byStatus.SHIPPED || 0 },
          { value: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', count: stats.byStatus.OUT_FOR_DELIVERY || 0 },
          { value: 'DELIVERED',        label: 'Delivered',        count: stats.byStatus.DELIVERED || 0 },
          { value: 'CANCELLED',        label: 'Cancelled',        count: stats.byStatus.CANCELLED || 0 },
        ]}
      />

      {/* ─── Status Automation Panel ────────────────────── */}
      <StatusAutomationPanel
        selectedCount={selected.size}
        onBulkAdvance={handleBulkAdvance}
        onSchedule={handleSchedule}
        onNotify={handleNotify}
      />

      {/* ─── Toolbar ────────────────────────────────────── */}
      <Card>
        <div className="p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400 pointer-events-none" />
            <input
              type="search"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search by order #, customer, phone…"
              className="input pl-10"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={paymentFilter}
              onChange={(e) => { setPaymentFilter(e.target.value); setPage(1); }}
              className="input h-9 text-sm w-auto min-w-[120px]"
            >
              <option value="all">All payments</option>
              <option value="PAID">Paid</option>
              <option value="PENDING">Pending</option>
              <option value="FAILED">Failed</option>
              <option value="REFUNDED">Refunded</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="input h-9 text-sm w-auto min-w-[140px]"
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="total-desc">Total high→low</option>
              <option value="total-asc">Total low→high</option>
            </select>

            <div className="flex items-center bg-ink-100 rounded-lg p-0.5">
              <button
                onClick={() => setView('table')}
                className={clsx('flex items-center justify-center w-7 h-7 rounded-md transition-all', view === 'table' ? 'bg-white shadow-sm text-ink-900' : 'text-ink-500 hover:text-ink-900')}
                aria-label="Table view"
                title="Table"
              >
                <ListIcon className="w-4 h-4" />
              </button>
              <button
                onClick={() => setView('grid')}
                className={clsx('flex items-center justify-center w-7 h-7 rounded-md transition-all', view === 'grid' ? 'bg-white shadow-sm text-ink-900' : 'text-ink-500 hover:text-ink-900')}
                aria-label="Grid view"
                title="Grid"
              >
                <Grid3x3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setView('timeline')}
                className={clsx('flex items-center justify-center w-7 h-7 rounded-md transition-all', view === 'timeline' ? 'bg-white shadow-sm text-ink-900' : 'text-ink-500 hover:text-ink-900')}
                aria-label="Timeline view"
                title="Timeline"
              >
                <GitBranch className="w-4 h-4" />
              </button>
            </div>
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
            <Button size="sm" variant="secondary" leftIcon={Check}>Mark Confirmed</Button>
            <Button size="sm" variant="secondary" leftIcon={Truck}>Mark Shipped</Button>
            <Button size="sm" variant="secondary" leftIcon={Printer}>Print Invoices</Button>
            <div className="flex-1" />
            <Button size="sm" variant="danger" leftIcon={Ban}>Cancel</Button>
          </div>
        )}
      </Card>

      {/* ─── Content ─────────────────────────────────────── */}
      {loading ? (
        <Card>
          <div className="p-4 space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </Card>
      ) : orders.length === 0 ? (
        <Card>
          <EmptyState
            icon={ShoppingBag}
            title="No orders found"
            description={search || statusFilter !== 'all' ? 'Try adjusting filters' : 'Orders will appear here once customers place them.'}
          />
        </Card>
      ) : view === 'table' ? (
        <OrdersTable
          orders={orders}
          selected={selected}
          allSelected={allOnPageSelected}
          someSelected={someOnPageSelected}
          onToggleAll={toggleAll}
          onToggleOne={toggleOne}
          onView={setDetail}
          onStatusChange={setStatusModal}
        />
      ) : view === 'grid' ? (
        <OrdersGrid
          orders={orders}
          selected={selected}
          onToggleOne={toggleOne}
          onView={setDetail}
        />
      ) : (
        <OrdersTimeline orders={orders} onView={setDetail} />
      )}

      {/* ─── Pagination ──────────────────────────────────── */}
      {!loading && orders.length > 0 && (
        <Card>
          <Pagination
            page={page}
            totalPages={totalPages}
            total={total}
            limit={pageSize}
            onPageChange={(p) => { setPage(p); clearSelection(); }}
          />
        </Card>
      )}

      {/* ─── Order detail drawer ─────────────────────────── */}
      <OrderDetailDrawer order={detail} onClose={() => setDetail(null)} onStatusChange={setStatusModal} onPrint={setPrintingOrder} />

      {/* ─── Print modal ────────────────────────────────── */}
      <PrintModal open={!!printingOrder} onClose={() => setPrintingOrder(null)} order={printingOrder} />

      {/* ─── Status change modal ─────────────────────────── */}
      <StatusChangeModal
        order={statusModal}
        onClose={() => setStatusModal(null)}
        onConfirm={handleStatusChange}
      />
    </div>
  );
}

// ─── KPI card ───────────────────────────────────────────────
function KPICard({ label, value, icon: Icon, accent, onClick, active }: any) {
  const accentMap: any = {
    info:    { bg: 'bg-info-subtle text-info-600',     ring: 'ring-info-200' },
    success: { bg: 'bg-success-subtle text-success-600', ring: 'ring-success-200' },
    warning: { bg: 'bg-warning-subtle text-warning-600', ring: 'ring-warning-200' },
    danger:  { bg: 'bg-danger-subtle text-danger-600',  ring: 'ring-danger-200' },
    accent:  { bg: 'bg-accent-50 text-accent-600',      ring: 'ring-accent-200' },
  };
  return (
    <button
      onClick={onClick}
      className={clsx(
        'card-hover p-4 text-left transition-all w-full',
        active && 'ring-2 ring-accent-500 border-accent-300',
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-2xs font-bold text-ink-500 uppercase tracking-wider truncate">{label}</p>
          <p className={clsx(
            'text-2xl font-bold mt-1.5 tabular-nums truncate',
            typeof value === 'string' ? 'text-lg' : 'text-2xl',
            active ? 'text-accent-700' : 'text-ink-900',
          )}>{value}</p>
        </div>
        <div className={clsx('w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ring-1', accentMap[accent].bg, accentMap[accent].ring)}>
          <Icon className="w-4 h-4" strokeWidth={2.25} />
        </div>
      </div>
    </button>
  );
}

// ─── 11-col table view ──────────────────────────────────────
function OrdersTable({ orders, selected, allSelected, someSelected, onToggleAll, onToggleOne, onView, onStatusChange }: any) {
  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto scroll-thin">
        <table className="w-full text-sm">
          <thead className="bg-ink-50/80 border-b border-ink-200">
            <tr>
              <th className="w-10 px-3 py-3 text-left">
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={(el) => { if (el) el.indeterminate = someSelected; }}
                  onChange={onToggleAll}
                  className="rounded border-ink-300 text-accent-500 focus:ring-accent-500"
                />
              </th>
              <th className="px-3 py-3 text-left text-2xs font-bold text-ink-500 uppercase tracking-wider">Order #</th>
              <th className="px-3 py-3 text-left text-2xs font-bold text-ink-500 uppercase tracking-wider">Date</th>
              <th className="px-3 py-3 text-left text-2xs font-bold text-ink-500 uppercase tracking-wider">Customer</th>
              <th className="px-3 py-3 text-right text-2xs font-bold text-ink-500 uppercase tracking-wider">Items</th>
              <th className="px-3 py-3 text-right text-2xs font-bold text-ink-500 uppercase tracking-wider">Total</th>
              <th className="px-3 py-3 text-left text-2xs font-bold text-ink-500 uppercase tracking-wider">Payment</th>
              <th className="px-3 py-3 text-left text-2xs font-bold text-ink-500 uppercase tracking-wider">Status</th>
              <th className="px-3 py-3 text-left text-2xs font-bold text-ink-500 uppercase tracking-wider">Tracking</th>
              <th className="px-3 py-3 text-left text-2xs font-bold text-ink-500 uppercase tracking-wider">8-Stage Progress</th>
              <th className="w-10 px-3 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-100">
            {orders.map((o: Order) => {
              const status = STATUS_MAP[o.status];
              const payStatus = PAYMENT_STATUS_MAP[o.paymentStatus] || PAYMENT_STATUS_MAP.PENDING;
              const customerName = `${o.user?.firstName || ''} ${o.user?.lastName || ''}`.trim() || o.user?.email || 'Customer';
              const isSelected = selected.has(o.id);
              return (
                <tr
                  key={o.id}
                  className={clsx('transition-colors cursor-pointer', isSelected ? 'bg-accent-50/50' : 'hover:bg-ink-50/60')}
                  onClick={() => onView(o)}
                >
                  <td className="px-3 py-3" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => onToggleOne(o.id)}
                      className="rounded border-ink-300 text-accent-500 focus:ring-accent-500"
                    />
                  </td>
                  <td className="px-3 py-3">
                    <p className="font-semibold text-ink-900 font-mono text-xs">{o.orderNumber}</p>
                  </td>
                  <td className="px-3 py-3">
                    <p className="text-ink-700 text-xs">{formatDate(o.createdAt)}</p>
                    <p className="text-2xs text-ink-500">{relativeTime(o.createdAt)}</p>
                  </td>
                  <td className="px-3 py-3">
                    <p className="text-ink-900 font-semibold text-sm truncate max-w-[140px]">{customerName}</p>
                    {o.user?.phone && <p className="text-2xs text-ink-500">{o.user.phone}</p>}
                  </td>
                  <td className="px-3 py-3 text-right">
                    <p className="font-semibold text-ink-900 tabular-nums">{o.items?.length || 0}</p>
                    <p className="text-2xs text-ink-500">{(o.items || []).reduce((s, i) => s + i.quantity, 0)} units</p>
                  </td>
                  <td className="px-3 py-3 text-right">
                    <p className="font-bold text-ink-900 tabular-nums">{formatCurrency(parseFloat(o.total))}</p>
                    {o.discountAmount && parseFloat(o.discountAmount) > 0 && (
                      <p className="text-2xs text-success-600">− {formatCurrency(parseFloat(o.discountAmount))}</p>
                    )}
                  </td>
                  <td className="px-3 py-3">
                    <Badge variant={payStatus.variant} dot>{payStatus.label}</Badge>
                    <p className="text-2xs text-ink-500 mt-0.5 uppercase">{o.paymentMethod}</p>
                  </td>
                  <td className="px-3 py-3" onClick={(e) => e.stopPropagation()}>
                    <button onClick={() => onStatusChange(o)}>
                      <Badge variant={status.variant} dot>{status.label}</Badge>
                    </button>
                  </td>
                  <td className="px-3 py-3">
                    {o.trackingNumber ? (
                      <div>
                        <p className="font-mono text-2xs text-ink-700">{o.trackingNumber}</p>
                        <p className="text-2xs text-ink-500">{o.carrier}</p>
                      </div>
                    ) : (
                      <span className="text-ink-400 text-2xs">—</span>
                    )}
                  </td>
                  <td className="px-3 py-3 min-w-[160px]">
                    <WorkflowProgress currentStatus={o.status} />
                  </td>
                  <td className="px-3 py-3" onClick={(e) => e.stopPropagation()}>
                    <ChevronRight className="w-4 h-4 text-ink-400" />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

// ─── Workflow progress (8-stage mini bar) ──────────────────
function WorkflowProgress({ currentStatus }: { currentStatus: string }) {
  const step = STATUS_MAP[currentStatus as OrderStatus]?.step ?? -1;
  if (step === -1) {
    return (
      <span className="text-2xs text-ink-500 italic">
        {STATUS_MAP[currentStatus as OrderStatus]?.label || currentStatus}
      </span>
    );
  }
  return (
    <div className="flex items-center gap-0.5">
      {STATUS_FLOW.map((_, i) => (
        <div
          key={i}
          className={clsx(
            'h-1.5 flex-1 rounded-pill',
            i <= step ? 'bg-accent-500' : 'bg-ink-200',
          )}
        />
      ))}
    </div>
  );
}

// ─── Grid view ──────────────────────────────────────────────
function OrdersGrid({ orders, selected, onToggleOne, onView }: any) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {orders.map((o: Order) => {
        const status = STATUS_MAP[o.status];
        const customerName = `${o.user?.firstName || ''} ${o.user?.lastName || ''}`.trim() || o.user?.email || 'Customer';
        return (
          <Card
            key={o.id}
            className={clsx(
              'cursor-pointer hover:border-accent-300 transition-all',
              selected.has(o.id) && 'ring-2 ring-accent-500',
            )}
            onClick={() => onView(o)}
          >
            <div className="p-4">
              <div className="flex items-start justify-between gap-2 mb-3">
                <div>
                  <p className="font-semibold text-ink-900 font-mono text-sm">{o.orderNumber}</p>
                  <p className="text-2xs text-ink-500 mt-0.5">{relativeTime(o.createdAt)}</p>
                </div>
                <input
                  type="checkbox"
                  checked={selected.has(o.id)}
                  onChange={(e) => { e.stopPropagation(); onToggleOne(o.id); }}
                  onClick={(e) => e.stopPropagation()}
                  className="rounded border-ink-300 text-accent-500 focus:ring-accent-500"
                />
              </div>

              <div className="space-y-2 mb-3">
                <div className="flex items-center gap-2 text-sm">
                  <UserIcon className="w-3.5 h-3.5 text-ink-400" />
                  <span className="text-ink-700 truncate">{customerName}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Package className="w-3.5 h-3.5 text-ink-400" />
                  <span className="text-ink-700">{o.items?.length || 0} items</span>
                </div>
              </div>

              <div className="flex items-end justify-between pt-3 border-t border-ink-100">
                <div>
                  <p className="text-2xs text-ink-500">Total</p>
                  <p className="text-lg font-bold text-ink-900 tabular-nums">{formatCurrency(parseFloat(o.total))}</p>
                </div>
                <Badge variant={status.variant} dot>{status.label}</Badge>
              </div>

              <div className="mt-3">
                <WorkflowProgress currentStatus={o.status} />
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

// ─── Timeline view (grouped by date) ────────────────────────
function OrdersTimeline({ orders, onView }: any) {
  const groups = useMemo(() => {
    const map = new Map<string, Order[]>();
    orders.forEach((o: Order) => {
      const key = new Date(o.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(o);
    });
    return Array.from(map.entries());
  }, [orders]);

  return (
    <div className="space-y-6">
      {groups.map(([date, list]) => (
        <div key={date} className="relative pl-8 sm:pl-12">
          {/* Date marker */}
          <div className="absolute left-0 top-0 bottom-0 w-px bg-ink-200" />
          <div className="absolute left-0 top-2 -translate-x-1/2 w-7 h-7 rounded-full bg-white border-2 border-accent-500 flex items-center justify-center">
            <Calendar className="w-3 h-3 text-accent-600" />
          </div>
          <div className="absolute left-0 top-12 -translate-x-1/2 w-2 h-2 rounded-pill bg-accent-500" />

          <div className="mb-3">
            <p className="text-sm font-bold text-ink-900">{date}</p>
            <p className="text-2xs text-ink-500">{list.length} order{list.length > 1 ? 's' : ''}</p>
          </div>

          <div className="space-y-2">
            {list.map((o: Order) => {
              const status = STATUS_MAP[o.status];
              const customerName = `${o.user?.firstName || ''} ${o.user?.lastName || ''}`.trim() || o.user?.email || 'Customer';
              return (
                <button
                  key={o.id}
                  onClick={() => onView(o)}
                  className="w-full card-hover p-3 text-left flex items-center gap-3"
                >
                  <div className={clsx('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0', status.bg, status.color)}>
                    <status.icon className="w-4 h-4" strokeWidth={2.25} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-sm text-ink-900 font-mono">{o.orderNumber}</p>
                      <span className="text-2xs text-ink-500">·</span>
                      <p className="text-sm text-ink-700 truncate">{customerName}</p>
                    </div>
                    <p className="text-2xs text-ink-500 mt-0.5">
                      {o.items?.length || 0} items · {new Date(o.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <p className="font-bold text-ink-900 tabular-nums">{formatCurrency(parseFloat(o.total))}</p>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Order detail drawer (right slide-in) ───────────────────
function OrderDetailDrawer({ order, onClose, onStatusChange, onPrint }: { order: Order | null; onClose: () => void; onStatusChange: (o: Order) => void; onPrint: (o: Order) => void }) {
  const [downloading, setDownloading] = useState<string | null>(null);
  const handleDownload = async (type: 'invoice' | 'delivery-note') => {
    if (!order) return;
    setDownloading(type);
    try {
      const API_BASE = (import.meta as any).env?.VITE_API_URL || 'https://asifbhai-production.up.railway.app/api/v1';
      const token = localStorage.getItem('admin_token');
      const url = `${API_BASE}/admin/orders/${order.id}/${type}.pdf`;
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const blob = await res.blob();
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `${type === 'invoice' ? 'Invoice' : 'Delivery-Note'}-${order.orderNumber}.pdf`;
      a.click();
      URL.revokeObjectURL(a.href);
      toast.success(`${type === 'invoice' ? 'Invoice' : 'Delivery note'} downloaded`);
    } catch (err: any) {
      toast.error(`Failed to download: ${err.message}`);
    } finally {
      setDownloading(null);
    }
  };
  if (!order) return null;
  const status = STATUS_MAP[order.status];
  const payStatus = PAYMENT_STATUS_MAP[order.paymentStatus] || PAYMENT_STATUS_MAP.PENDING;
  const customerName = `${order.user?.firstName || ''} ${order.user?.lastName || ''}`.trim() || order.user?.email || 'Customer';
  const subtotal = parseFloat(order.subtotal);
  const tax = parseFloat(order.taxAmount);
  const shipping = parseFloat(order.shippingAmount);
  const discount = parseFloat(order.discountAmount);
  const total = parseFloat(order.total);

  return (
    <div className="fixed inset-0 z-50 animate-fade-in">
      <div className="absolute inset-0 bg-ink-900/40 backdrop-blur-sm" onClick={onClose} />
      <div
        className="absolute top-0 right-0 h-full bg-white shadow-modal flex flex-col animate-slide-right"
        style={{ width: 'min(640px, 100vw)', borderTopLeftRadius: 24, borderBottomLeftRadius: 24 }}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-ink-200 flex-shrink-0">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="text-2xs font-bold text-ink-500 uppercase tracking-wider">Order</p>
                <Badge variant={status.variant} dot>{status.label}</Badge>
              </div>
              <h2 className="text-lg font-bold text-ink-900 font-mono mt-0.5">{order.orderNumber}</h2>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-lg text-ink-500 hover:bg-ink-100 hover:text-ink-900 flex items-center justify-center">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto scroll-thin px-6 py-5 space-y-5">
          {/* Workflow timeline */}
          <div>
            <p className="text-2xs font-bold text-ink-500 uppercase tracking-wider mb-3">Workflow Progress</p>
            <WorkflowTimeline currentStatus={order.status} />
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-2">
            <Button variant="primary" size="sm" leftIcon={Edit2} onClick={() => onStatusChange(order)}>
              Update Status
            </Button>
            <Button variant="secondary" size="sm" leftIcon={Printer} onClick={() => onPrint(order)}>Print Invoice</Button>
            <Button variant="secondary" size="sm" leftIcon={Download} onClick={() => handleDownload('invoice')} disabled={downloading === 'invoice'}>Invoice PDF</Button>
            <Button variant="secondary" size="sm" leftIcon={Truck} onClick={() => handleDownload('delivery-note')} disabled={downloading === 'delivery-note'}>Delivery Note</Button>
            <Button variant="secondary" size="sm" leftIcon={Copy}>Copy Details</Button>
            {order.status !== 'CANCELLED' && order.status !== 'DELIVERED' && (
              <Button variant="danger" size="sm" leftIcon={Ban}>Cancel</Button>
            )}
          </div>

          {/* Customer */}
          <Card>
            <CardBody>
              <p className="text-2xs font-bold text-ink-500 uppercase tracking-wider mb-2">Customer</p>
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-pill bg-gradient-to-br from-accent-400 to-accent-600 text-white font-semibold flex items-center justify-center">
                  {customerName.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-ink-900 truncate">{customerName}</p>
                  {order.user?.email && (
                    <p className="text-2xs text-ink-500 flex items-center gap-1 truncate">
                      <Mail className="w-3 h-3" /> {order.user.email}
                    </p>
                  )}
                  {order.user?.phone && (
                    <p className="text-2xs text-ink-500 flex items-center gap-1">
                      <Phone className="w-3 h-3" /> {order.user.phone}
                    </p>
                  )}
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Address */}
          {order.address && (
            <Card>
              <CardBody>
                <p className="text-2xs font-bold text-ink-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> Delivery Address
                </p>
                <div className="text-sm text-ink-700 space-y-0.5">
                  <p className="font-semibold text-ink-900">{order.address.fullName || customerName}</p>
                  {order.address.line1 && <p>{order.address.line1}</p>}
                  {order.address.line2 && <p>{order.address.line2}</p>}
                  <p>{[order.address.city, order.address.state, order.address.pincode].filter(Boolean).join(', ')}</p>
                  {order.address.phone && <p className="text-ink-500">📞 {order.address.phone}</p>}
                </div>
              </CardBody>
            </Card>
          )}

          {/* Items */}
          <Card>
            <CardHeader title="Items" description={`${order.items?.length || 0} product${(order.items?.length || 0) > 1 ? 's' : ''}`} />
            <div className="divide-y divide-ink-100">
              {(order.items || []).map((item) => (
                <div key={item.id} className="flex items-center gap-3 px-5 py-3">
                  <div className="w-12 h-12 rounded-xl bg-ink-100 ring-1 ring-ink-200 overflow-hidden flex-shrink-0">
                    {item.productImage ? (
                      <img src={item.productImage} alt={item.productName} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-4 h-4 text-ink-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-ink-900 text-sm truncate">{item.productName}</p>
                    {item.variantName && <p className="text-2xs text-ink-500">{item.variantName}</p>}
                    <p className="text-2xs text-ink-500 mt-0.5">
                      {item.quantity} × {formatCurrency(parseFloat(item.unitPrice || (item as any).finalUnitPrice || '0'))}
                    </p>
                  </div>
                  <p className="font-semibold text-ink-900 tabular-nums">
                    {formatCurrency(parseFloat(item.totalPrice || (item as any).finalTotalPrice || '0'))}
                  </p>
                </div>
              ))}
            </div>
          </Card>

          {/* Payment summary */}
          <Card>
            <CardBody className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-2xs font-bold text-ink-500 uppercase tracking-wider">Payment</p>
                <Badge variant={payStatus.variant} dot>{payStatus.label}</Badge>
              </div>
              <p className="text-2xs text-ink-500 uppercase">{order.paymentMethod}</p>
              {order.paymentRef && (
                <p className="text-2xs text-ink-500 font-mono">Ref: {order.paymentRef}</p>
              )}
              <div className="border-t border-ink-100 pt-2 mt-2 space-y-1 text-sm">
                <SummaryRow label="Subtotal" value={formatCurrency(subtotal)} />
                {tax > 0 && <SummaryRow label="Tax" value={formatCurrency(tax)} />}
                {shipping > 0 && <SummaryRow label="Shipping" value={formatCurrency(shipping)} />}
                {discount > 0 && <SummaryRow label="Discount" value={`− ${formatCurrency(discount)}`} color="success" />}
                <div className="border-t border-ink-100 pt-2 mt-2 flex items-center justify-between">
                  <p className="font-bold text-ink-900">Total</p>
                  <p className="text-lg font-bold text-ink-900 tabular-nums">{formatCurrency(total)}</p>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Tracking */}
          {(order.trackingNumber || order.carrier) && (
            <Card>
              <CardBody>
                <p className="text-2xs font-bold text-ink-500 uppercase tracking-wider mb-2">Tracking</p>
                <div className="text-sm space-y-1">
                  {order.carrier && <p><span className="text-ink-500">Carrier:</span> <span className="font-semibold text-ink-900">{order.carrier}</span></p>}
                  {order.trackingNumber && <p><span className="text-ink-500">Tracking #:</span> <span className="font-mono font-semibold text-ink-900">{order.trackingNumber}</span></p>}
                </div>
              </CardBody>
            </Card>
          )}

          {/* Notes */}
          {(order.notes || order.internalNotes) && (
            <Card>
              <CardBody>
                {order.notes && (
                  <div className="mb-2">
                    <p className="text-2xs font-bold text-ink-500 uppercase tracking-wider">Customer Note</p>
                    <p className="text-sm text-ink-700 mt-1">{order.notes}</p>
                  </div>
                )}
                {order.internalNotes && (
                  <div>
                    <p className="text-2xs font-bold text-ink-500 uppercase tracking-wider">Internal Note</p>
                    <p className="text-sm text-ink-700 mt-1">{order.internalNotes}</p>
                  </div>
                )}
              </CardBody>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function SummaryRow({ label, value, color }: { label: string; value: string; color?: 'success' }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-ink-600">{label}</span>
      <span className={clsx('font-semibold tabular-nums', color === 'success' && 'text-success-700')}>{value}</span>
    </div>
  );
}

// ─── 8-stage workflow timeline ──────────────────────────────
function WorkflowTimeline({ currentStatus }: { currentStatus: string }) {
  const step = STATUS_MAP[currentStatus as OrderStatus]?.step ?? -1;
  const isCancelled = currentStatus === 'CANCELLED' || currentStatus === 'REFUNDED' || currentStatus === 'RETURNED';

  return (
    <div className="flex items-center gap-1 overflow-x-auto scroll-thin pb-1">
      {STATUS_FLOW.map((status, i) => {
        const cfg = STATUS_MAP[status];
        const isDone = !isCancelled && i < step;
        const isCurrent = !isCancelled && i === step;
        return (
          <div key={status} className="flex items-center gap-1 flex-shrink-0">
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
              <div className={clsx(
                'h-0.5 w-3 sm:w-6 mb-5',
                isDone ? 'bg-accent-500' : 'bg-ink-200',
              )} />
            )}
          </div>
        );
      })}
      {isCancelled && (
        <div className="flex items-center gap-1 ml-2">
          <div className="w-8 h-8 rounded-full bg-danger-500 text-white flex items-center justify-center">
            <Ban className="w-4 h-4" />
          </div>
          <p className="text-2xs font-semibold text-danger-700">{STATUS_MAP[currentStatus as OrderStatus]?.label}</p>
        </div>
      )}
    </div>
  );
}

// ─── Status change modal ────────────────────────────────────
function StatusChangeModal({ order, onClose, onConfirm }: { order: Order | null; onClose: () => void; onConfirm: (o: Order, s: OrderStatus) => void }) {
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | null>(null);
  useEffect(() => {
    if (order) setSelectedStatus(order.status as OrderStatus);
  }, [order?.id]);
  if (!order) return null;

  return (
    <Modal
      open={!!order}
      onClose={onClose}
      title={`Update Status: ${order.orderNumber}`}
      size="md"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button
            variant="primary"
            disabled={!selectedStatus || selectedStatus === order.status}
            onClick={() => onConfirm(order, selectedStatus!)}
            leftIcon={Check}
          >
            Update Status
          </Button>
        </>
      }
    >
      <div className="space-y-2">
        <p className="text-sm text-ink-600 mb-3">Current status: <Badge variant={STATUS_MAP[order.status].variant} dot>{STATUS_MAP[order.status].label}</Badge></p>
        {STATUS_FLOW.concat(['CANCELLED', 'REFUNDED', 'RETURNED'] as OrderStatus[]).map((s) => {
          const cfg = STATUS_MAP[s];
          const isSelected = selectedStatus === s;
          return (
            <button
              key={s}
              onClick={() => setSelectedStatus(s)}
              className={clsx(
                'w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left',
                isSelected ? 'border-accent-500 bg-accent-50/50' : 'border-ink-200 hover:border-ink-300',
                s === order.status && 'opacity-50',
              )}
            >
              <div className={clsx('w-9 h-9 rounded-xl flex items-center justify-center', cfg.bg, cfg.color)}>
                <cfg.icon className="w-4 h-4" strokeWidth={2.25} />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm text-ink-900">{cfg.label}</p>
                <p className="text-2xs text-ink-500">
                  {s === 'PENDING' && 'Order placed, awaiting confirmation'}
                  {s === 'CONFIRMED' && 'Order confirmed, ready to process'}
                  {s === 'PROCESSING' && 'Being packed and prepared'}
                  {s === 'SHIPPED' && 'Handed over to carrier'}
                  {s === 'OUT_FOR_DELIVERY' && 'Out for delivery to customer'}
                  {s === 'DELIVERED' && 'Successfully delivered'}
                  {s === 'CANCELLED' && 'Order cancelled by customer or admin'}
                  {s === 'REFUNDED' && 'Payment refunded to customer'}
                  {s === 'RETURNED' && 'Customer returned the product'}
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
void Activity;
void ArrowUpRight;
void Filter;
void RefreshCcw;
void Send;
void CreditCard;
void Pause;
void Play;
void ArrowRight;
void Plus;
void ChevronDown;
