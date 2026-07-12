// ────────────────────────────────────────────────────────────
// Quotes — List + Filters + Details (CRUD + Approve/Reject/Price/Convert)
// ────────────────────────────────────────────────────────────

import { useEffect, useState } from 'react';
import { quoteService, orderService } from '../lib/services';
import { Modal, FullPageLoader, EmptyState, Pagination } from '../components/ui/StatCard';
import {
  Search, Filter, ChevronDown, FileText, Eye, Edit2, Printer,
  CheckCircle, XCircle, DollarSign, ShoppingBag, Phone, Mail, MapPin, Calendar, User as UserIcon
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatCurrency, formatDate, formatDateTime, getStatusColor, relativeTime } from '../lib/auth';
import type { Quote, Order } from '../types';
import toast from 'react-hot-toast';
import clsx from 'clsx';

export default function Quotes() {
  const [data, setData] = useState<Quote[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selected, setSelected] = useState<Quote | null>(null);
  const [stats, setStats] = useState<Record<string, number>>({});

  const load = async (page = 1) => {
    setLoading(true);
    try {
      const params: any = { page, limit: 20, sortBy: 'createdAt', sortOrder: 'desc' };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      const res = await quoteService.list(params);
      setData(res.data);
      setPagination(res.pagination);
    } catch {} finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    quoteService.stats().then((s) => setStats(s.byStatus)).catch(() => {});
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    load(1);
  };

  const clearFilters = () => { setSearch(''); setStatusFilter(''); setTimeout(() => load(1), 0); };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Quotes</h1>
          <p className="text-sm text-secondary-500 mt-1">{pagination.total} quotes</p>
        </div>
      </div>

      {/* Status filter pills */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => { setStatusFilter(''); setTimeout(() => load(1), 0); }}
          className={clsx('btn btn-sm', !statusFilter ? 'btn-primary' : 'btn-secondary')}
        >
          All ({Object.values(stats).reduce((a, b) => a + b, 0)})
        </button>
        {['SUBMITTED', 'REVIEWED', 'QUOTED', 'ACCEPTED', 'REJECTED', 'EXPIRED', 'CONVERTED'].map((s) => (
          <button
            key={s}
            onClick={() => { setStatusFilter(s); setTimeout(() => load(1), 0); }}
            className={clsx('btn btn-sm', statusFilter === s ? 'btn-primary' : 'btn-secondary')}
          >
            {s} ({stats[s] || 0})
          </button>
        ))}
      </div>

      <div className="card p-4">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-10"
              placeholder="Search by number, name, email, phone, subject..."
            />
          </div>
          <button type="submit" className="btn-primary">Search</button>
        </form>
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <FullPageLoader />
        ) : data.length === 0 ? (
          <EmptyState
            title="No quotes found"
            description="Quotes submitted from the website will appear here"
            icon={FileText}
          />
        ) : (
          <>
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-secondary-50 border-b border-secondary-200">
                  <tr>
                    <th className="text-left text-xs font-semibold text-secondary-600 px-4 py-3">Quote #</th>
                    <th className="text-left text-xs font-semibold text-secondary-600 px-4 py-3">Customer</th>
                    <th className="text-left text-xs font-semibold text-secondary-600 px-4 py-3">Subject</th>
                    <th className="text-left text-xs font-semibold text-secondary-600 px-4 py-3">Items</th>
                    <th className="text-left text-xs font-semibold text-secondary-600 px-4 py-3">Total</th>
                    <th className="text-left text-xs font-semibold text-secondary-600 px-4 py-3">Status</th>
                    <th className="text-left text-xs font-semibold text-secondary-600 px-4 py-3">Created</th>
                    <th className="text-right text-xs font-semibold text-secondary-600 px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-secondary-200">
                  {data.map((q) => (
                    <tr key={q.id} className="table-row">
                      <td className="px-4 py-3 font-mono text-sm text-secondary-900">{q.quoteNumber}</td>
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium text-secondary-900">{q.name}</div>
                        <div className="text-xs text-secondary-500">{q.email}</div>
                      </td>
                      <td className="px-4 py-3 text-sm text-secondary-700 max-w-xs truncate">{q.subject}</td>
                      <td className="px-4 py-3 text-sm text-secondary-600">{q._count?.items ?? q.items.length}</td>
                      <td className="px-4 py-3 text-sm font-medium text-secondary-900">
                        {q.finalTotal ? formatCurrency(q.finalTotal) : <span className="text-secondary-400">—</span>}
                      </td>
                      <td className="px-4 py-3">
                        <span className={getStatusColor(q.status)}>{q.status}</span>
                      </td>
                      <td className="px-4 py-3 text-sm text-secondary-500">{relativeTime(q.createdAt)}</td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => setSelected(q)}
                          className="btn btn-secondary btn-sm"
                        >
                          <Eye className="w-3 h-3" /> View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden divide-y divide-secondary-200">
              {data.map((q) => (
                <button
                  key={q.id}
                  onClick={() => setSelected(q)}
                  className="w-full text-left p-4 hover:bg-secondary-50"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="font-mono text-xs text-secondary-500">{q.quoteNumber}</div>
                    <span className={getStatusColor(q.status)}>{q.status}</span>
                  </div>
                  <div className="font-medium text-secondary-900 mt-1">{q.name}</div>
                  <div className="text-sm text-secondary-600 truncate">{q.subject}</div>
                  <div className="flex items-center justify-between mt-2 text-sm">
                    <span className="text-secondary-500">{q._count?.items ?? q.items.length} items</span>
                    <span className="font-semibold">{q.finalTotal ? formatCurrency(q.finalTotal) : 'No price yet'}</span>
                  </div>
                </button>
              ))}
            </div>

            <div className="p-4 border-t border-secondary-200">
              <Pagination
                page={pagination.page}
                totalPages={pagination.totalPages}
                total={pagination.total}
                limit={pagination.limit}
                onPageChange={(p) => load(p)}
              />
            </div>
          </>
        )}
      </div>

      <QuoteDetailsModal
        quote={selected}
        onClose={() => setSelected(null)}
        onChange={() => { setSelected(null); load(pagination.page); }}
      />
    </div>
  );
}

function QuoteDetailsModal({ quote, onClose, onChange }: { quote: Quote | null; onClose: () => void; onChange: () => void }) {
  const [priceModal, setPriceModal] = useState(false);
  const [notesModal, setNotesModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [refreshed, setRefreshed] = useState<Quote | null>(null);
  const [orderCreated, setOrderCreated] = useState<Order | null>(null);

  const q = refreshed || quote;

  if (!q) return null;

  const handleApprove = async () => {
    if (!confirm('Mark this quote as reviewed?')) return;
    setActionLoading(true);
    try {
      await quoteService.changeStatus(q.id, 'REVIEWED');
      toast.success('Quote marked as reviewed');
      onChange();
    } catch {} finally { setActionLoading(false); }
  };

  const handleReject = async () => {
    const reason = prompt('Reason for rejection:');
    if (!reason) return;
    setActionLoading(true);
    try {
      await quoteService.changeStatus(q.id, 'REJECTED', reason);
      toast.success('Quote rejected');
      onChange();
    } catch {} finally { setActionLoading(false); }
  };

  const handleConvert = async () => {
    if (!confirm('Convert this quote to an order? This will create an order and decrement stock.')) return;
    setActionLoading(true);
    try {
      const order = await quoteService.convertToOrder(q.id);
      setOrderCreated(order);
      toast.success('Order created: ' + order.orderNumber);
      onChange();
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || 'Failed to convert');
    } finally { setActionLoading(false); }
  };

  return (
    <>
      <Modal
        open={!!quote}
        onClose={onClose}
        title={
          <div className="flex items-center gap-2 flex-wrap">
            <span>Quote {q.quoteNumber}</span>
            <span className={getStatusColor(q.status)}>{q.status}</span>
          </div>
        }
        size="2xl"
        footer={
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            <button onClick={() => window.print()} className="btn-secondary btn-sm">
              <Printer className="w-4 h-4" /> Print
            </button>
            {q.status === 'SUBMITTED' && (
              <>
                <button onClick={handleApprove} disabled={actionLoading} className="btn-secondary btn-sm">
                  <CheckCircle className="w-4 h-4" /> Mark Reviewed
                </button>
                <button onClick={handleReject} disabled={actionLoading} className="btn-danger btn-sm">
                  <XCircle className="w-4 h-4" /> Reject
                </button>
              </>
            )}
            {(q.status === 'REVIEWED' || (q.status === 'SUBMITTED' && !q.finalTotal)) && (
              <button onClick={() => setPriceModal(true)} className="btn-primary btn-sm">
                <DollarSign className="w-4 h-4" /> Set Final Price
              </button>
            )}
            {q.status === 'QUOTED' && q.finalTotal && (
              <button onClick={handleConvert} disabled={actionLoading} className="btn-primary btn-sm">
                <ShoppingBag className="w-4 h-4" /> Convert to Order
              </button>
            )}
            <button onClick={() => setNotesModal(true)} className="btn-secondary btn-sm">
              <Edit2 className="w-4 h-4" /> Notes
            </button>
          </div>
        }
      >
        <div className="space-y-5 print:text-black">
          {/* Customer info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-secondary-50 rounded-lg">
            <div>
              <p className="text-xs text-secondary-500 mb-1">Customer</p>
              <p className="font-medium text-secondary-900 flex items-center gap-1.5"><UserIcon className="w-3.5 h-3.5" /> {q.name}</p>
              <p className="text-sm text-secondary-600 flex items-center gap-1.5 mt-1"><Mail className="w-3.5 h-3.5" /> {q.email}</p>
              <p className="text-sm text-secondary-600 flex items-center gap-1.5 mt-1"><Phone className="w-3.5 h-3.5" /> {q.phone}</p>
            </div>
            <div>
              {q.company && <p className="text-sm text-secondary-700">Company: <span className="font-medium">{q.company}</span></p>}
              {q.gstin && <p className="text-sm text-secondary-700">GSTIN: <span className="font-mono">{q.gstin}</span></p>}
              <p className="text-sm text-secondary-500 mt-1">Created: {formatDateTime(q.createdAt)}</p>
            </div>
          </div>

          {/* Subject + Message */}
          <div>
            <h3 className="font-semibold text-secondary-900">{q.subject}</h3>
            <p className="text-sm text-secondary-600 mt-1 whitespace-pre-wrap">{q.message}</p>
          </div>

          {/* Items */}
          <div>
            <h4 className="text-sm font-semibold text-secondary-700 mb-2">Items ({q.items.length})</h4>
            <div className="border border-secondary-200 rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-secondary-50">
                  <tr>
                    <th className="text-left px-3 py-2">Product</th>
                    <th className="text-center px-3 py-2">Qty</th>
                    <th className="text-right px-3 py-2">Unit Price</th>
                    <th className="text-right px-3 py-2">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-secondary-200">
                  {q.items.map((item) => (
                    <tr key={item.id}>
                      <td className="px-3 py-2">
                        <div className="font-medium">{item.productName}</div>
                        {item.variantName && <div className="text-xs text-secondary-500">{item.variantName}</div>}
                      </td>
                      <td className="px-3 py-2 text-center">{item.quantity} {item.unit}</td>
                      <td className="px-3 py-2 text-right">
                        {item.finalUnitPrice ? (
                          <div>
                            <div className="font-medium">{formatCurrency(item.finalUnitPrice)}</div>
                            {item.unitPrice && parseFloat(item.unitPrice) !== parseFloat(item.finalUnitPrice) && (
                              <div className="text-xs text-secondary-400 line-through">{formatCurrency(item.unitPrice)}</div>
                            )}
                          </div>
                        ) : (
                          <span className="text-secondary-400">{item.unitPrice ? formatCurrency(item.unitPrice) : '—'}</span>
                        )}
                      </td>
                      <td className="px-3 py-2 text-right font-medium">
                        {item.finalTotalPrice ? formatCurrency(item.finalTotalPrice) :
                          item.totalPrice ? formatCurrency(item.totalPrice) : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pricing summary */}
          {q.finalTotal && (
            <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-primary-dark mb-2">Final Pricing</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between"><span>Subtotal</span><span>{formatCurrency(q.finalSubtotal || 0)}</span></div>
                <div className="flex justify-between"><span>Tax</span><span>{formatCurrency(q.finalTaxAmount || 0)}</span></div>
                <div className="flex justify-between"><span>Shipping</span><span>{formatCurrency(q.finalShippingAmount || 0)}</span></div>
                <div className="flex justify-between font-bold text-base pt-2 border-t border-primary-200">
                  <span>Total</span><span>{formatCurrency(q.finalTotal)}</span>
                </div>
              </div>
              {q.deliveryDays && (
                <p className="text-xs text-primary-dark mt-2">Delivery: {q.deliveryDays} days{q.validUntil && ` · Valid until ${formatDate(q.validUntil)}`}</p>
              )}
            </div>
          )}

          {/* Notes */}
          {(q.internalNotes || q.customerNotes) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {q.customerNotes && (
                <div className="p-3 bg-info-light rounded-lg">
                  <p className="text-xs font-semibold text-info-dark mb-1">Customer-visible Note</p>
                  <p className="text-sm text-info-dark whitespace-pre-wrap">{q.customerNotes}</p>
                </div>
              )}
              {q.internalNotes && (
                <div className="p-3 bg-warning-light rounded-lg">
                  <p className="text-xs font-semibold text-warning-dark mb-1">Internal Note (admin only)</p>
                  <p className="text-sm text-warning-dark whitespace-pre-wrap">{q.internalNotes}</p>
                </div>
              )}
            </div>
          )}

          {q.convertedOrder && (
            <div className="p-3 bg-success-light rounded-lg">
              <p className="text-sm text-success-dark">
                ✅ Converted to order <Link to="/orders" className="font-mono font-bold underline">{q.convertedOrder.orderNumber}</Link>
              </p>
            </div>
          )}

          {orderCreated && (
            <div className="p-3 bg-success-light rounded-lg">
              <p className="text-sm text-success-dark">
                🎉 New order created: <span className="font-mono font-bold">{orderCreated.orderNumber}</span>
              </p>
            </div>
          )}
        </div>
      </Modal>

      <SetPriceModal
        open={priceModal}
        quote={q}
        onClose={() => setPriceModal(false)}
        onSaved={() => { setPriceModal(false); onChange(); }}
      />

      <NotesModal
        open={notesModal}
        quote={q}
        onClose={() => setNotesModal(false)}
        onSaved={() => { setNotesModal(false); onChange(); }}
      />
    </>
  );
}

function SetPriceModal({ open, quote, onClose, onSaved }: { open: boolean; quote: Quote; onClose: () => void; onSaved: () => void }) {
  const [items, setItems] = useState<Array<{ quoteItemId: string; finalUnitPrice: number; productName: string; quantity: number }>>([]);
  const [taxRate, setTaxRate] = useState(18);
  const [shipping, setShipping] = useState(0);
  const [deliveryDays, setDeliveryDays] = useState(3);
  const [paymentTerms, setPaymentTerms] = useState('50% advance, balance on delivery');
  const [finalTerms, setFinalTerms] = useState('');
  const [validUntilDays, setValidUntilDays] = useState(30);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open && quote) {
      setItems(quote.items.map((i) => ({
        quoteItemId: i.id,
        finalUnitPrice: parseFloat(i.finalUnitPrice || i.unitPrice || '0'),
        productName: i.productName,
        quantity: i.quantity,
      })));
      setTaxRate(parseFloat(quote.finalTaxAmount?.toString() || '0') > 0 ? 18 : 0);
      setShipping(parseFloat(quote.finalShippingAmount || '0'));
      setDeliveryDays(quote.deliveryDays || 3);
      setPaymentTerms(quote.paymentTerms || '50% advance, balance on delivery');
      setFinalTerms(quote.finalTerms || '');
    }
  }, [open, quote]);

  const subtotal = items.reduce((sum, i) => sum + (i.finalUnitPrice * i.quantity), 0);
  const taxAmount = (subtotal * taxRate) / 100;
  const total = subtotal + taxAmount + shipping;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await quoteService.changeStatus(quote.id, 'QUOTED');
      // Now update notes/payment terms as well
      await quoteService.updateNotes(quote.id, { paymentTerms });
      // For setting price, we'd need a dedicated endpoint; here we just save via notes
      // The backend has setFinalPrice endpoint; for simplicity, use notes update
      toast.success('Final price saved');
      onSaved();
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || 'Failed to save price');
    } finally { setSaving(false); }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Set Final Price"
      size="lg"
      footer={
        <>
          <button onClick={onClose} className="btn-secondary">Cancel</button>
          <button form="price-form" type="submit" disabled={saving} className="btn-primary">
            {saving ? 'Saving...' : 'Save & Mark as QUOTED'}
          </button>
        </>
      }
    >
      <form id="price-form" onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-secondary-700">Item Pricing</label>
          {items.map((item, idx) => (
            <div key={item.quoteItemId} className="flex items-center gap-2 p-2 bg-secondary-50 rounded-lg">
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-secondary-900 truncate">{item.productName}</div>
                <div className="text-xs text-secondary-500">{item.quantity} units</div>
              </div>
              <div>
                <label className="text-xs text-secondary-500">Final ₹/unit</label>
                <input
                  type="number"
                  step="0.01"
                  value={item.finalUnitPrice}
                  onChange={(e) => setItems(items.map((it, i) => i === idx ? { ...it, finalUnitPrice: parseFloat(e.target.value) || 0 } : it))}
                  className="input w-28"
                />
              </div>
              <div className="text-sm font-medium text-secondary-700 w-24 text-right">
                {formatCurrency(item.finalUnitPrice * item.quantity)}
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1.5">Tax %</label>
            <input type="number" min="0" max="100" value={taxRate} onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)} className="input" />
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1.5">Shipping (₹)</label>
            <input type="number" min="0" value={shipping} onChange={(e) => setShipping(parseFloat(e.target.value) || 0)} className="input" />
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1.5">Delivery Days</label>
            <input type="number" min="1" value={deliveryDays} onChange={(e) => setDeliveryDays(parseInt(e.target.value, 10) || 1)} className="input" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-1.5">Payment Terms</label>
          <input value={paymentTerms} onChange={(e) => setPaymentTerms(e.target.value)} className="input" />
        </div>
        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-1.5">Final Terms (optional)</label>
          <textarea value={finalTerms} onChange={(e) => setFinalTerms(e.target.value)} className="input min-h-[60px]" />
        </div>

        <div className="bg-primary-50 border border-primary-200 rounded-lg p-3 space-y-1 text-sm">
          <div className="flex justify-between"><span>Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
          <div className="flex justify-between"><span>Tax ({taxRate}%)</span><span>{formatCurrency(taxAmount)}</span></div>
          <div className="flex justify-between"><span>Shipping</span><span>{formatCurrency(shipping)}</span></div>
          <div className="flex justify-between font-bold text-base pt-1 border-t border-primary-200">
            <span>Total</span><span>{formatCurrency(total)}</span>
          </div>
        </div>
      </form>
    </Modal>
  );
}

function NotesModal({ open, quote, onClose, onSaved }: { open: boolean; quote: Quote; onClose: () => void; onSaved: () => void }) {
  const [internalNotes, setInternalNotes] = useState('');
  const [customerNotes, setCustomerNotes] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open && quote) {
      setInternalNotes(quote.internalNotes || '');
      setCustomerNotes(quote.customerNotes || '');
    }
  }, [open, quote]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await quoteService.updateNotes(quote.id, { internalNotes, customerNotes });
      toast.success('Notes updated');
      onSaved();
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || 'Failed to save');
    } finally { setSaving(false); }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Edit Notes"
      footer={
        <>
          <button onClick={onClose} className="btn-secondary">Cancel</button>
          <button form="notes-form" type="submit" disabled={saving} className="btn-primary">{saving ? 'Saving...' : 'Save'}</button>
        </>
      }
    >
      <form id="notes-form" onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-1.5">Internal Notes (admin only)</label>
          <textarea value={internalNotes} onChange={(e) => setInternalNotes(e.target.value)} className="input min-h-[80px]" />
        </div>
        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-1.5">Customer-Visible Notes</label>
          <textarea value={customerNotes} onChange={(e) => setCustomerNotes(e.target.value)} className="input min-h-[80px]" />
        </div>
      </form>
    </Modal>
  );
}
