// ────────────────────────────────────────────────────────────
// Orders — List + Filters + Details + Timeline + Cancel + Complete
// ────────────────────────────────────────────────────────────

import { useEffect, useState } from 'react';
import { orderService } from '../lib/services';
import { Modal, FullPageLoader, EmptyState, Pagination } from '../components/ui/StatCard';
import {
  Search, Eye, ShoppingBag, Printer, XCircle, CheckCircle,
  Truck, MapPin, Phone, Mail, Calendar, User as UserIcon, Package
} from 'lucide-react';
import { formatCurrency, formatDate, formatDateTime, getStatusColor } from '../lib/auth';
import type { Order } from '../types';
import toast from 'react-hot-toast';
import clsx from 'clsx';

export default function Orders() {
  const [data, setData] = useState<Order[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('');
  const [selected, setSelected] = useState<Order | null>(null);

  const load = async (page = 1) => {
    setLoading(true);
    try {
      const params: any = { page, limit: 20 };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      if (paymentFilter) params.paymentStatus = paymentFilter;
      const res = await orderService.list(params);
      setData(res.data);
      setPagination(res.pagination);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); load(1); };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Orders</h1>
          <p className="text-sm text-secondary-500 mt-1">{pagination.total} orders</p>
        </div>
      </div>

      <div className="card p-4">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-10"
              placeholder="Search by order #, customer..."
            />
          </div>
          <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setTimeout(() => load(1), 0); }} className="input sm:w-40">
            <option value="">All statuses</option>
            <option value="PENDING">Pending</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="PROCESSING">Processing</option>
            <option value="SHIPPED">Shipped</option>
            <option value="OUT_FOR_DELIVERY">Out for delivery</option>
            <option value="DELIVERED">Delivered</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="REFUNDED">Refunded</option>
          </select>
          <select value={paymentFilter} onChange={(e) => { setPaymentFilter(e.target.value); setTimeout(() => load(1), 0); }} className="input sm:w-40">
            <option value="">All payments</option>
            <option value="PENDING">Pending</option>
            <option value="PAID">Paid</option>
            <option value="FAILED">Failed</option>
            <option value="REFUNDED">Refunded</option>
          </select>
          <button type="submit" className="btn-primary">Search</button>
        </form>
      </div>

      <div className="card overflow-hidden">
        {loading ? <FullPageLoader /> : data.length === 0 ? (
          <EmptyState title="No orders found" description="Orders placed from the website will appear here" icon={ShoppingBag} />
        ) : (
          <>
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-secondary-50 border-b border-secondary-200">
                  <tr>
                    <th className="text-left text-xs font-semibold text-secondary-600 px-4 py-3">Order #</th>
                    <th className="text-left text-xs font-semibold text-secondary-600 px-4 py-3">Customer</th>
                    <th className="text-left text-xs font-semibold text-secondary-600 px-4 py-3">Date</th>
                    <th className="text-left text-xs font-semibold text-secondary-600 px-4 py-3">Total</th>
                    <th className="text-left text-xs font-semibold text-secondary-600 px-4 py-3">Payment</th>
                    <th className="text-left text-xs font-semibold text-secondary-600 px-4 py-3">Status</th>
                    <th className="text-right text-xs font-semibold text-secondary-600 px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-secondary-200">
                  {data.map((o) => (
                    <tr key={o.id} className="table-row">
                      <td className="px-4 py-3 font-mono text-sm font-medium text-secondary-900">{o.orderNumber}</td>
                      <td className="px-4 py-3 text-sm">
                        <div className="font-medium text-secondary-900">{o.user?.firstName || o.user?.email?.split('@')[0]}</div>
                        <div className="text-xs text-secondary-500">{o.user?.email}</div>
                      </td>
                      <td className="px-4 py-3 text-sm text-secondary-500">{formatDate(o.createdAt)}</td>
                      <td className="px-4 py-3 text-sm font-semibold text-secondary-900">{formatCurrency(o.total)}</td>
                      <td className="px-4 py-3">
                        <span className={getStatusColor(o.paymentStatus)}>{o.paymentStatus}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={getStatusColor(o.status)}>{o.status}</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => setSelected(o)} className="btn btn-secondary btn-sm">
                          <Eye className="w-3 h-3" /> View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="md:hidden divide-y divide-secondary-200">
              {data.map((o) => (
                <button key={o.id} onClick={() => setSelected(o)} className="w-full text-left p-4 hover:bg-secondary-50">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs text-secondary-500">{o.orderNumber}</span>
                    <span className={getStatusColor(o.status)}>{o.status}</span>
                  </div>
                  <div className="font-medium text-secondary-900 mt-1">{o.user?.firstName || o.user?.email}</div>
                  <div className="flex items-center justify-between mt-1 text-sm">
                    <span className="text-secondary-500">{formatDate(o.createdAt)}</span>
                    <span className="font-semibold">{formatCurrency(o.total)}</span>
                  </div>
                </button>
              ))}
            </div>

            <div className="p-4 border-t border-secondary-200">
              <Pagination page={pagination.page} totalPages={pagination.totalPages} total={pagination.total} limit={pagination.limit} onPageChange={load} />
            </div>
          </>
        )}
      </div>

      <OrderDetailsModal order={selected} onClose={() => setSelected(null)} onChange={() => { setSelected(null); load(pagination.page); }} />
    </div>
  );
}

function OrderDetailsModal({ order, onClose, onChange }: { order: Order | null; onClose: () => void; onChange: () => void }) {
  const [statusModal, setStatusModal] = useState(false);
  const [cancelModal, setCancelModal] = useState(false);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [loadingTimeline, setLoadingTimeline] = useState(false);

  useEffect(() => {
    if (order) {
      setLoadingTimeline(true);
      orderService.timeline(order.id).then((r) => setTimeline(r.timeline || [])).catch(() => {}).finally(() => setLoadingTimeline(false));
    }
  }, [order]);

  if (!order) return null;

  const handleComplete = async () => {
    if (!confirm('Mark this order as delivered?')) return;
    try {
      await orderService.complete(order.id);
      toast.success('Order marked as delivered');
      onChange();
    } catch (err: any) { toast.error(err.response?.data?.error?.message || 'Failed'); }
  };

  return (
    <>
      <Modal
        open={!!order}
        onClose={onClose}
        title={<div className="flex items-center gap-2 flex-wrap"><span>Order {order.orderNumber}</span><span className={getStatusColor(order.status)}>{order.status}</span></div>}
        size="2xl"
        footer={
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            <button onClick={() => window.print()} className="btn-secondary btn-sm"><Printer className="w-4 h-4" /> Print / Invoice</button>
            {order.status !== 'CANCELLED' && order.status !== 'DELIVERED' && (
              <>
                <button onClick={() => setStatusModal(true)} className="btn-primary btn-sm"><Truck className="w-4 h-4" /> Update Status</button>
                <button onClick={handleComplete} className="btn-secondary btn-sm"><CheckCircle className="w-4 h-4" /> Complete</button>
                <button onClick={() => setCancelModal(true)} className="btn-danger btn-sm"><XCircle className="w-4 h-4" /> Cancel</button>
              </>
            )}
          </div>
        }
      >
        <div className="space-y-5 print:text-black">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-secondary-50 rounded-lg">
              <h4 className="text-xs font-semibold text-secondary-500 uppercase mb-2">Customer</h4>
              <p className="font-medium text-secondary-900 flex items-center gap-1.5"><UserIcon className="w-3.5 h-3.5" /> {order.user?.firstName} {order.user?.lastName}</p>
              <p className="text-sm text-secondary-600 flex items-center gap-1.5 mt-1"><Mail className="w-3.5 h-3.5" /> {order.user?.email}</p>
              {order.user?.phone && <p className="text-sm text-secondary-600 flex items-center gap-1.5 mt-1"><Phone className="w-3.5 h-3.5" /> {order.user.phone}</p>}
            </div>
            <div className="p-4 bg-secondary-50 rounded-lg">
              <h4 className="text-xs font-semibold text-secondary-500 uppercase mb-2">Shipping Address</h4>
              {order.address ? (
                <>
                  <p className="font-medium text-secondary-900">{order.address.fullName}</p>
                  <p className="text-sm text-secondary-600 mt-1">{order.address.line1}{order.address.line2 ? `, ${order.address.line2}` : ''}</p>
                  <p className="text-sm text-secondary-600">{order.address.city}, {order.address.state} - {order.address.pincode}</p>
                  <p className="text-sm text-secondary-600 flex items-center gap-1.5 mt-1"><Phone className="w-3.5 h-3.5" /> {order.address.phone}</p>
                </>
              ) : <p className="text-sm text-secondary-500">No address</p>}
            </div>
          </div>

          {order.fromQuote && (
            <div className="p-3 bg-info-light rounded-lg text-sm text-info-dark">
              📋 Created from quote <span className="font-mono font-bold">{order.fromQuote.quoteNumber}</span>
            </div>
          )}

          <div>
            <h4 className="text-sm font-semibold text-secondary-700 mb-2">Items ({order.items.length})</h4>
            <div className="border border-secondary-200 rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-secondary-50">
                  <tr>
                    <th className="text-left px-3 py-2">Product</th>
                    <th className="text-center px-3 py-2">Qty</th>
                    <th className="text-right px-3 py-2">Price</th>
                    <th className="text-right px-3 py-2">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-secondary-200">
                  {order.items.map((item) => (
                    <tr key={item.id}>
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-2">
                          {item.productImage ? <img src={item.productImage} className="w-8 h-8 rounded object-cover" /> : <Package className="w-8 h-8 text-secondary-300" />}
                          <div>
                            <div className="font-medium">{item.productName}</div>
                            {item.variantName && <div className="text-xs text-secondary-500">{item.variantName}</div>}
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-2 text-center">{item.quantity} {item.unit}</td>
                      <td className="px-3 py-2 text-right">{formatCurrency(item.unitPrice)}</td>
                      <td className="px-3 py-2 text-right font-medium">{formatCurrency(item.totalPrice)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1 text-sm">
              <div className="flex justify-between"><span className="text-secondary-600">Subtotal</span><span>{formatCurrency(order.subtotal)}</span></div>
              <div className="flex justify-between"><span className="text-secondary-600">Tax</span><span>{formatCurrency(order.taxAmount)}</span></div>
              <div className="flex justify-between"><span className="text-secondary-600">Shipping</span><span>{formatCurrency(order.shippingAmount)}</span></div>
              {parseFloat(order.discountAmount) > 0 && <div className="flex justify-between text-success-dark"><span>Discount</span><span>-{formatCurrency(order.discountAmount)}</span></div>}
              <div className="flex justify-between font-bold text-base pt-1 border-t border-secondary-200">
                <span>Total</span><span>{formatCurrency(order.total)}</span>
              </div>
            </div>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between"><span className="text-secondary-600">Payment Method</span><span className="font-medium">{order.paymentMethod}</span></div>
              <div className="flex justify-between"><span className="text-secondary-600">Payment Status</span><span className={getStatusColor(order.paymentStatus)}>{order.paymentStatus}</span></div>
              {order.trackingNumber && <div className="flex justify-between"><span className="text-secondary-600">Tracking</span><span className="font-mono">{order.trackingNumber}</span></div>}
              {order.carrier && <div className="flex justify-between"><span className="text-secondary-600">Carrier</span><span>{order.carrier}</span></div>}
            </div>
          </div>

          {/* Timeline */}
          <div>
            <h4 className="text-sm font-semibold text-secondary-700 mb-2">Order Timeline</h4>
            {loadingTimeline ? <div className="text-sm text-secondary-500">Loading...</div> : (
              <div className="space-y-2">
                {timeline.length === 0 ? <p className="text-sm text-secondary-500">No timeline events yet</p> : timeline.map((t, idx) => (
                  <div key={t.id} className="flex gap-3 p-3 bg-secondary-50 rounded-lg">
                    <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                      {timeline.length - idx}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={getStatusColor(t.status)}>{t.status}</span>
                        <span className="text-xs text-secondary-500">{formatDateTime(t.createdAt)}</span>
                      </div>
                      {t.message && <p className="text-sm text-secondary-700 mt-1">{t.message}</p>}
                      {t.changedBy && <p className="text-xs text-secondary-500 mt-0.5">by {t.changedBy.firstName || t.changedBy.email}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </Modal>

      <UpdateStatusModal
        open={statusModal}
        order={order}
        onClose={() => setStatusModal(false)}
        onSaved={() => { setStatusModal(false); onChange(); }}
      />
      <CancelOrderModal
        open={cancelModal}
        order={order}
        onClose={() => setCancelModal(false)}
        onSaved={() => { setCancelModal(false); onChange(); }}
      />
    </>
  );
}

function UpdateStatusModal({ open, order, onClose, onSaved }: { open: boolean; order: Order; onClose: () => void; onSaved: () => void }) {
  const validNext: Record<string, string[]> = {
    PENDING: ['CONFIRMED', 'CANCELLED'],
    CONFIRMED: ['PROCESSING', 'CANCELLED'],
    PROCESSING: ['SHIPPED', 'CANCELLED'],
    SHIPPED: ['OUT_FOR_DELIVERY', 'DELIVERED', 'RETURNED'],
    OUT_FOR_DELIVERY: ['DELIVERED', 'RETURNED'],
    DELIVERED: ['REFUNDED', 'RETURNED'],
    RETURNED: ['REFUNDED'],
  };
  const [status, setStatus] = useState('');
  const [message, setMessage] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [carrier, setCarrier] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open && order) {
      setTrackingNumber(order.trackingNumber || '');
      setCarrier(order.carrier || '');
      setMessage('');
    }
  }, [open, order]);

  const options = validNext[order.status] || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!status) { toast.error('Select a status'); return; }
    setSaving(true);
    try {
      await orderService.updateStatus(order.id, { status, message, trackingNumber: trackingNumber || undefined, carrier: carrier || undefined });
      toast.success('Status updated');
      onSaved();
    } catch (err: any) { toast.error(err.response?.data?.error?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  return (
    <Modal open={open} onClose={onClose} title="Update Order Status" footer={
      <>
        <button onClick={onClose} className="btn-secondary">Cancel</button>
        <button form="status-form" type="submit" disabled={saving || !status} className="btn-primary">{saving ? 'Saving...' : 'Update'}</button>
      </>
    }>
      <form id="status-form" onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-1.5">New Status *</label>
          <select required value={status} onChange={(e) => setStatus(e.target.value)} className="input">
            <option value="">Select status</option>
            {options.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        {(status === 'SHIPPED' || status === 'OUT_FOR_DELIVERY') && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1.5">Tracking #</label>
              <input value={trackingNumber} onChange={(e) => setTrackingNumber(e.target.value)} className="input" />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1.5">Carrier</label>
              <input value={carrier} onChange={(e) => setCarrier(e.target.value)} className="input" placeholder="e.g. FedEx" />
            </div>
          </div>
        )}
        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-1.5">Note (optional)</label>
          <textarea value={message} onChange={(e) => setMessage(e.target.value)} className="input" rows={2} />
        </div>
      </form>
    </Modal>
  );
}

function CancelOrderModal({ open, order, onClose, onSaved }: { open: boolean; order: Order; onClose: () => void; onSaved: () => void }) {
  const [reason, setReason] = useState('');
  const [restoreStock, setRestoreStock] = useState(true);
  const [refund, setRefund] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (reason.length < 3) { toast.error('Reason is required'); return; }
    setSaving(true);
    try {
      await orderService.cancel(order.id, { reason, restoreStock, refund });
      toast.success('Order cancelled');
      onSaved();
    } catch (err: any) { toast.error(err.response?.data?.error?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  return (
    <Modal open={open} onClose={onClose} title="Cancel Order" footer={
      <>
        <button onClick={onClose} className="btn-secondary">Keep Order</button>
        <button form="cancel-form" type="submit" disabled={saving} className="btn-danger">{saving ? 'Cancelling...' : 'Cancel Order'}</button>
      </>
    }>
      <form id="cancel-form" onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-1.5">Reason *</label>
          <textarea required minLength={3} value={reason} onChange={(e) => setReason(e.target.value)} className="input" rows={3} placeholder="Why is this order being cancelled?" />
        </div>
        <div className="space-y-2">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={restoreStock} onChange={(e) => setRestoreStock(e.target.checked)} className="w-4 h-4 text-primary border-secondary-300 rounded" />
            <span className="text-sm text-secondary-700">Restore stock to inventory</span>
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={refund} onChange={(e) => setRefund(e.target.checked)} className="w-4 h-4 text-primary border-secondary-300 rounded" />
            <span className="text-sm text-secondary-700">Mark payment as refunded</span>
          </label>
        </div>
      </form>
    </Modal>
  );
}
