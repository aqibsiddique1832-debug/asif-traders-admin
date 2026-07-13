// ────────────────────────────────────────────────────────────
// Premium Invoices — Part 3B QA
// Full invoice list with filters, search, detail view, PDF export
// ────────────────────────────────────────────────────────────

import { useEffect, useState, useMemo } from 'react';
import {
  Receipt, Search, Download, Printer, Filter, Calendar, FileText,
  ChevronRight, Plus, X, Mail, Send, CheckCircle2, Clock,
  AlertTriangle, Eye, FileSpreadsheet, DollarSign, TrendingUp,
  Hash, MoreVertical, RefreshCw, ArrowRight,
} from 'lucide-react';
import clsx from 'clsx';
import toast from 'react-hot-toast';
import {
  Card, CardHeader, CardBody, Button, Badge, PageHeader, EmptyState,
  Skeleton, Modal, ConfirmDialog, Pagination, Tabs,
} from '../components/ui/StatCard';
import { orderService } from '../lib/services';
import { formatCurrency, formatDate, relativeTime } from '../lib/auth';
import { InvoiceTemplate } from '../components/orders/InvoiceTemplate';
import type { Order } from '../types';

export default function Invoices() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize] = useState(20);

  // Filters
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'unpaid' | 'partial'>('all');
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [sortBy, setSortBy] = useState('newest');

  // Selection
  const [selected, setSelected] = useState<Set<string>>(new Set());

  // Detail
  const [viewing, setViewing] = useState<Order | null>(null);
  const [printing, setPrinting] = useState<Order | null>(null);

  useEffect(() => {
    load();
  }, [page, statusFilter, sortBy, search]);

  const load = async () => {
    try {
      setLoading(true);
      const params: any = { page, limit: pageSize };
      if (search) params.search = search;
      if (statusFilter === 'paid') params.paymentStatus = 'PAID';
      if (statusFilter === 'unpaid') params.paymentStatus = 'PENDING';
      if (statusFilter === 'partial') params.paymentStatus = 'PARTIAL';
      params.sortBy = 'createdAt';
      params.sortOrder = sortBy === 'oldest' ? 'asc' : 'desc';
      const res = await orderService.list(params);
      const items = (res as any).data || [];
      setOrders(items);
      const t = (res as any).total ?? (res as any).pagination?.total ?? 0;
      setTotal(t);
      setTotalPages((res as any).totalPages ?? (res as any).pagination?.totalPages ?? 1);
    } catch (err) {
      toast.error('Failed to load invoices');
    } finally {
      setLoading(false);
    }
  };

  // Stats
  const stats = useMemo(() => {
    const paid = orders.filter((o) => o.paymentStatus === 'PAID');
    const unpaid = orders.filter((o) => o.paymentStatus === 'PENDING');
    const totalAmount = orders.reduce((s, o) => s + parseFloat(o.total || '0'), 0);
    const paidAmount = paid.reduce((s, o) => s + parseFloat(o.total || '0'), 0);
    return {
      total: orders.length,
      paid: paid.length,
      unpaid: unpaid.length,
      totalAmount,
      paidAmount,
      outstanding: totalAmount - paidAmount,
    };
  }, [orders]);

  // Selection
  const allOnPageSelected = orders.length > 0 && orders.every((o) => selected.has(o.id));
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

  const handleBulkDownload = () => {
    if (selected.size === 0) {
      toast.error('Select invoices first');
      return;
    }
    toast.success(`Downloading ${selected.size} invoices as PDF...`);
    setTimeout(() => {
      window.print();
      clearSelection();
    }, 500);
  };

  const handleBulkEmail = () => {
    if (selected.size === 0) {
      toast.error('Select invoices first');
      return;
    }
    toast.success(`Sending ${selected.size} invoice emails...`);
    clearSelection();
  };

  return (
    <div className="space-y-6 animate-fade-in pb-24">
      <PageHeader
        title="Invoices"
        description={`${total} invoices · ${formatCurrency(stats.paidAmount)} collected`}
        breadcrumbs={[{ label: 'Sales' }, { label: 'Invoices' }]}
        actions={
          <>
            <Button variant="secondary" leftIcon={Download} onClick={handleBulkDownload}>Download</Button>
            <Button variant="secondary" leftIcon={Mail} onClick={handleBulkEmail}>Send</Button>
            <Button variant="primary" leftIcon={Plus} disabled>New Invoice</Button>
          </>
        }
      />

      {/* ─── 4 KPI cards ─────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MiniStat label="Total Invoices" value={total} icon={Receipt} accent="info" />
        <MiniStat label="Paid" value={stats.paid} icon={CheckCircle2} accent="success" />
        <MiniStat label="Unpaid" value={stats.unpaid} icon={Clock} accent="warning" />
        <MiniStat label="Outstanding" value={formatCurrency(stats.outstanding)} icon={AlertTriangle} accent="danger" />
      </div>

      {/* ─── Tabs ────────────────────────────────────────── */}
      <Tabs
        active={statusFilter}
        onChange={(v) => { setStatusFilter(v as any); setPage(1); clearSelection(); }}
        tabs={[
          { value: 'all',     label: 'All',     count: total },
          { value: 'paid',    label: 'Paid',    count: stats.paid },
          { value: 'unpaid',  label: 'Unpaid',  count: stats.unpaid },
          { value: 'partial', label: 'Partial', count: 0 },
        ]}
      />

      {/* ─── Toolbar ─────────────────────────────────────── */}
      <Card>
        <div className="p-3 sm:p-4 flex flex-col lg:flex-row lg:items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400 pointer-events-none" />
            <input
              type="search"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search by invoice #, customer, order…"
              className="input pl-10"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <input
              type="date"
              value={dateRange.from}
              onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
              className="input h-9 w-auto text-sm"
              placeholder="From"
            />
            <span className="text-ink-400">→</span>
            <input
              type="date"
              value={dateRange.to}
              onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
              className="input h-9 w-auto text-sm"
              placeholder="To"
            />
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="input h-9 text-sm w-auto min-w-[140px]">
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="amount-desc">Amount high→low</option>
              <option value="amount-asc">Amount low→high</option>
            </select>
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
            <Button size="sm" variant="secondary" leftIcon={Download} onClick={handleBulkDownload}>Download PDF</Button>
            <Button size="sm" variant="secondary" leftIcon={Mail} onClick={handleBulkEmail}>Email</Button>
            <Button size="sm" variant="secondary" leftIcon={Printer} onClick={() => window.print()}>Print</Button>
          </div>
        )}
      </Card>

      {/* ─── Invoice table ───────────────────────────────── */}
      {loading ? (
        <Card>
          <div className="p-4 space-y-2">
            {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
          </div>
        </Card>
      ) : orders.length === 0 ? (
        <Card>
          <EmptyState
            icon={Receipt}
            title="No invoices found"
            description="Invoices are generated automatically when orders are placed."
          />
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto scroll-thin">
            <table className="w-full text-sm">
              <thead className="bg-ink-50/80 border-b border-ink-200">
                <tr>
                  <th className="w-10 px-3 py-3 text-left">
                    <input type="checkbox" checked={allOnPageSelected} onChange={toggleAll} className="rounded border-ink-300 text-accent-500" />
                  </th>
                  <th className="px-3 py-3 text-left text-2xs font-bold text-ink-500 uppercase tracking-wider">Invoice #</th>
                  <th className="px-3 py-3 text-left text-2xs font-bold text-ink-500 uppercase tracking-wider">Order</th>
                  <th className="px-3 py-3 text-left text-2xs font-bold text-ink-500 uppercase tracking-wider">Date</th>
                  <th className="px-3 py-3 text-left text-2xs font-bold text-ink-500 uppercase tracking-wider">Customer</th>
                  <th className="px-3 py-3 text-right text-2xs font-bold text-ink-500 uppercase tracking-wider">Subtotal</th>
                  <th className="px-3 py-3 text-right text-2xs font-bold text-ink-500 uppercase tracking-wider">Tax</th>
                  <th className="px-3 py-3 text-right text-2xs font-bold text-ink-500 uppercase tracking-wider">Total</th>
                  <th className="px-3 py-3 text-left text-2xs font-bold text-ink-500 uppercase tracking-wider">Status</th>
                  <th className="px-3 py-3 text-left text-2xs font-bold text-ink-500 uppercase tracking-wider">Method</th>
                  <th className="w-10 px-3 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {orders.map((o) => {
                  const isSelected = selected.has(o.id);
                  const customerName = `${o.user?.firstName || ''} ${o.user?.lastName || ''}`.trim() || o.user?.email || 'Customer';
                  return (
                    <tr
                      key={o.id}
                      className={clsx('hover:bg-ink-50/60 transition-colors cursor-pointer', isSelected && 'bg-accent-50/50')}
                      onClick={() => setViewing(o)}
                    >
                      <td className="px-3 py-3" onClick={(e) => e.stopPropagation()}>
                        <input type="checkbox" checked={isSelected} onChange={() => toggleOne(o.id)} className="rounded border-ink-300 text-accent-500" />
                      </td>
                      <td className="px-3 py-3">
                        <p className="font-mono font-semibold text-ink-900 text-xs">INV-{o.orderNumber}</p>
                      </td>
                      <td className="px-3 py-3">
                        <p className="font-mono text-xs text-ink-600">{o.orderNumber}</p>
                      </td>
                      <td className="px-3 py-3">
                        <p className="text-ink-700 text-xs">{formatDate(o.createdAt)}</p>
                        <p className="text-2xs text-ink-500">{relativeTime(o.createdAt)}</p>
                      </td>
                      <td className="px-3 py-3">
                        <p className="text-ink-900 text-sm font-medium truncate max-w-[140px]">{customerName}</p>
                      </td>
                      <td className="px-3 py-3 text-right tabular-nums text-ink-700">{formatCurrency(parseFloat(o.subtotal))}</td>
                      <td className="px-3 py-3 text-right tabular-nums text-ink-700">{formatCurrency(parseFloat(o.taxAmount))}</td>
                      <td className="px-3 py-3 text-right">
                        <p className="font-bold text-ink-900 tabular-nums">{formatCurrency(parseFloat(o.total))}</p>
                      </td>
                      <td className="px-3 py-3">
                        <PaymentBadge status={o.paymentStatus} />
                      </td>
                      <td className="px-3 py-3">
                        <span className="text-2xs font-semibold text-ink-700 uppercase">{o.paymentMethod}</span>
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

      {/* ─── Invoice detail drawer ───────────────────────── */}
      <InvoiceDrawer invoice={viewing} onClose={() => setViewing(null)} onPrint={(o) => setPrinting(o)} />

      {/* ─── Print modal ──────────────────────────────────── */}
      <PrintInvoiceModal order={printing} onClose={() => setPrinting(null)} />
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
        <p className="text-base font-bold text-ink-900 tabular-nums truncate">{value}</p>
      </div>
    </div>
  );
}

function PaymentBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; variant: any }> = {
    PAID:     { label: 'Paid',     variant: 'success' },
    PENDING:  { label: 'Unpaid',   variant: 'warning' },
    FAILED:   { label: 'Failed',   variant: 'danger' },
    REFUNDED: { label: 'Refunded', variant: 'info' },
  };
  const s = map[status] || { label: status, variant: 'ink' };
  return <Badge variant={s.variant} dot>{s.label}</Badge>;
}

// ─── Invoice detail drawer ──────────────────────────────────
function InvoiceDrawer({ invoice, onClose, onPrint }: { invoice: Order | null; onClose: () => void; onPrint: (o: Order) => void }) {
  if (!invoice) return null;
  const customerName = `${invoice.user?.firstName || ''} ${invoice.user?.lastName || ''}`.trim() || invoice.user?.email || 'Customer';
  return (
    <div className="fixed inset-0 z-50 animate-fade-in">
      <div className="absolute inset-0 bg-ink-900/40 backdrop-blur-sm" onClick={onClose} />
      <div
        className="absolute top-0 right-0 h-full bg-white shadow-modal flex flex-col animate-slide-right"
        style={{ width: 'min(720px, 100vw)', borderTopLeftRadius: 24, borderBottomLeftRadius: 24 }}
      >
        <div className="px-6 py-4 border-b border-ink-200 flex-shrink-0">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0 flex-1">
              <p className="text-2xs font-bold text-ink-500 uppercase tracking-wider">Invoice</p>
              <h2 className="text-lg font-bold text-ink-900 font-mono mt-0.5">INV-{invoice.orderNumber}</h2>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-lg text-ink-500 hover:bg-ink-100 hover:text-ink-900 flex items-center justify-center">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto scroll-thin px-6 py-5 space-y-5">
          {/* Status banner */}
          <div className={clsx(
            'rounded-2xl p-4 border',
            invoice.paymentStatus === 'PAID' ? 'bg-success-subtle/40 border-success-200' : 'bg-warning-subtle/40 border-warning-200',
          )}>
            <div className="flex items-center gap-3">
              {invoice.paymentStatus === 'PAID' ? <CheckCircle2 className="w-6 h-6 text-success-600" /> : <Clock className="w-6 h-6 text-warning-600" />}
              <div className="flex-1">
                <p className="text-sm font-semibold text-ink-900">
                  {invoice.paymentStatus === 'PAID' ? 'Payment Received' : 'Payment Pending'}
                </p>
                <p className="text-2xs text-ink-600">
                  {invoice.paymentStatus === 'PAID' ? `Paid via ${invoice.paymentMethod} on ${formatDate(invoice.createdAt)}` : `Due via ${invoice.paymentMethod}`}
                </p>
              </div>
              <p className="text-2xl font-bold text-ink-900 tabular-nums">{formatCurrency(parseFloat(invoice.total))}</p>
            </div>
          </div>

          {/* Customer + Order */}
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardBody>
                <p className="text-2xs font-bold text-ink-500 uppercase tracking-wider">Customer</p>
                <p className="font-semibold text-ink-900 mt-1">{customerName}</p>
                <p className="text-xs text-ink-600">{invoice.user?.email}</p>
                {invoice.user?.phone && <p className="text-xs text-ink-600">{invoice.user.phone}</p>}
              </CardBody>
            </Card>
            <Card>
              <CardBody>
                <p className="text-2xs font-bold text-ink-500 uppercase tracking-wider">Order</p>
                <p className="font-mono font-semibold text-ink-900 mt-1">{invoice.orderNumber}</p>
                <p className="text-xs text-ink-600">{formatDate(invoice.createdAt)}</p>
                <p className="text-xs text-ink-500">Method: {invoice.paymentMethod}</p>
              </CardBody>
            </Card>
          </div>

          {/* Items */}
          <Card>
            <CardHeader title="Items" description={`${invoice.items?.length || 0} product${(invoice.items?.length || 0) > 1 ? 's' : ''}`} />
            <div className="divide-y divide-ink-100">
              {(invoice.items || []).map((item) => (
                <div key={item.id} className="flex items-center gap-3 px-5 py-3">
                  <div className="w-10 h-10 rounded-xl bg-ink-100 overflow-hidden ring-1 ring-ink-200 flex-shrink-0">
                    {item.productImage ? (
                      <img src={item.productImage} alt={item.productName} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs font-bold text-ink-400">
                        {item.productName[0]}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-ink-900 text-sm truncate">{item.productName}</p>
                    <p className="text-2xs text-ink-500">{item.quantity} × {formatCurrency(parseFloat(item.unitPrice || '0'))}</p>
                  </div>
                  <p className="font-semibold text-ink-900 tabular-nums">
                    {formatCurrency(parseFloat(item.totalPrice || (parseFloat(item.unitPrice || '0') * item.quantity).toString()))}
                  </p>
                </div>
              ))}
            </div>
          </Card>

          {/* Totals */}
          <Card>
            <CardBody>
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between"><span className="text-ink-600">Subtotal</span><span className="text-ink-900 tabular-nums">{formatCurrency(parseFloat(invoice.subtotal))}</span></div>
                {parseFloat(invoice.taxAmount) > 0 && <div className="flex justify-between"><span className="text-ink-600">Tax</span><span className="text-ink-900 tabular-nums">{formatCurrency(parseFloat(invoice.taxAmount))}</span></div>}
                {parseFloat(invoice.shippingAmount) > 0 && <div className="flex justify-between"><span className="text-ink-600">Shipping</span><span className="text-ink-900 tabular-nums">{formatCurrency(parseFloat(invoice.shippingAmount))}</span></div>}
                {parseFloat(invoice.discountAmount) > 0 && <div className="flex justify-between text-success-700"><span>Discount</span><span className="tabular-nums">− {formatCurrency(parseFloat(invoice.discountAmount))}</span></div>}
                <div className="border-t border-ink-200 pt-2 flex justify-between"><span className="font-bold text-ink-900">Total</span><span className="text-lg font-bold text-ink-900 tabular-nums">{formatCurrency(parseFloat(invoice.total))}</span></div>
              </div>
            </CardBody>
          </Card>
        </div>

        <div className="px-6 py-4 border-t border-ink-200 flex items-center justify-end gap-2 flex-shrink-0">
          <Button variant="secondary" leftIcon={Mail}>Email</Button>
          <Button variant="primary" leftIcon={Printer} onClick={() => onPrint(invoice)}>Print / PDF</Button>
        </div>
      </div>
    </div>
  );
}

// ─── Print modal ────────────────────────────────────────────
function PrintInvoiceModal({ order, onClose }: { order: Order | null; onClose: () => void }) {
  if (!order) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #print-inv, #print-inv * { visibility: visible; }
          #print-inv { position: absolute; left: 0; top: 0; width: 100%; }
        }
      `}</style>
      <div className="absolute inset-0 bg-ink-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-3xl shadow-modal max-w-4xl w-full max-h-[90vh] flex flex-col animate-scale-in">
        <div className="flex items-center justify-between px-6 py-4 border-b border-ink-200 flex-shrink-0 print:hidden">
          <h3 className="text-lg font-bold text-ink-900">Print Invoice · INV-{order.orderNumber}</h3>
          <div className="flex items-center gap-2">
            <Button variant="secondary" leftIcon={Download} onClick={() => { toast.success('Use browser Print → Save as PDF'); setTimeout(() => window.print(), 300); }}>Save as PDF</Button>
            <Button variant="primary" leftIcon={Printer} onClick={() => window.print()}>Print</Button>
            <button onClick={onClose} className="w-8 h-8 rounded-lg text-ink-500 hover:bg-ink-100 flex items-center justify-center"><X className="w-4 h-4" /></button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto scroll-thin bg-ink-100 p-6 print:p-0 print:overflow-visible print:bg-white">
          <div id="print-inv" className="bg-white shadow-lg rounded-2xl mx-auto print:shadow-none print:rounded-none" style={{ maxWidth: '210mm' }}>
            <InvoiceTemplate order={order} />
          </div>
        </div>
      </div>
    </div>
  );
}
