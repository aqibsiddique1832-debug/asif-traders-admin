// ────────────────────────────────────────────────────────────
// Customers — List + Details + Status + Quotes + Orders
// ────────────────────────────────────────────────────────────

import { useEffect, useState } from 'react';
import { customerService } from '../lib/services';
import { Modal, FullPageLoader, EmptyState, Pagination } from '../components/ui/StatCard';
import { Search, Eye, Mail, Phone, Calendar, FileText, ShoppingBag, User as UserIcon } from 'lucide-react';
import { formatCurrency, formatDate, getStatusColor } from '../lib/auth';
import type { User, Quote, Order } from '../types';
import toast from 'react-hot-toast';
import clsx from 'clsx';

export default function Customers() {
  const [data, setData] = useState<User[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selected, setSelected] = useState<User | null>(null);

  const load = async (page = 1) => {
    setLoading(true);
    try {
      const params: any = { page, limit: 20 };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      const res = await customerService.list(params);
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
          <h1 className="text-2xl font-bold text-secondary-900">Customers</h1>
          <p className="text-sm text-secondary-500 mt-1">{pagination.total} customers</p>
        </div>
      </div>

      <div className="card p-4">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} className="input pl-10" placeholder="Search by email, name, phone..." />
          </div>
          <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setTimeout(() => load(1), 0); }} className="input sm:w-40">
            <option value="">All statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
            <option value="SUSPENDED">Suspended</option>
            <option value="PENDING_VERIFICATION">Pending</option>
          </select>
          <button type="submit" className="btn-primary">Search</button>
        </form>
      </div>

      <div className="card overflow-hidden">
        {loading ? <FullPageLoader /> : data.length === 0 ? (
          <EmptyState title="No customers found" icon={UserIcon} />
        ) : (
          <>
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-secondary-50 border-b border-secondary-200">
                  <tr>
                    <th className="text-left text-xs font-semibold text-secondary-600 px-4 py-3">Customer</th>
                    <th className="text-left text-xs font-semibold text-secondary-600 px-4 py-3">Phone</th>
                    <th className="text-left text-xs font-semibold text-secondary-600 px-4 py-3">Orders</th>
                    <th className="text-left text-xs font-semibold text-secondary-600 px-4 py-3">Quotes</th>
                    <th className="text-left text-xs font-semibold text-secondary-600 px-4 py-3">Status</th>
                    <th className="text-left text-xs font-semibold text-secondary-600 px-4 py-3">Joined</th>
                    <th className="text-right text-xs font-semibold text-secondary-600 px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-secondary-200">
                  {data.map((c) => (
                    <tr key={c.id} className="table-row">
                      <td className="px-4 py-3">
                        <div className="font-medium text-secondary-900">{c.firstName} {c.lastName}</div>
                        <div className="text-xs text-secondary-500">{c.email}</div>
                      </td>
                      <td className="px-4 py-3 text-sm text-secondary-600">{c.phone || '—'}</td>
                      <td className="px-4 py-3 text-sm text-secondary-700">{c._count?.orders ?? 0}</td>
                      <td className="px-4 py-3 text-sm text-secondary-700">{c._count?.quotes ?? 0}</td>
                      <td className="px-4 py-3"><span className={getStatusColor(c.status)}>{c.status}</span></td>
                      <td className="px-4 py-3 text-sm text-secondary-500">{formatDate(c.createdAt)}</td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => setSelected(c)} className="btn btn-secondary btn-sm"><Eye className="w-3 h-3" /> View</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="md:hidden divide-y divide-secondary-200">
              {data.map((c) => (
                <button key={c.id} onClick={() => setSelected(c)} className="w-full text-left p-4 hover:bg-secondary-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-secondary-900">{c.firstName} {c.lastName}</div>
                      <div className="text-xs text-secondary-500">{c.email}</div>
                    </div>
                    <span className={getStatusColor(c.status)}>{c.status}</span>
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

      <CustomerDetailsModal customer={selected} onClose={() => setSelected(null)} onChange={() => { setSelected(null); load(pagination.page); }} />
    </div>
  );
}

function CustomerDetailsModal({ customer, onClose, onChange }: { customer: User | null; onClose: () => void; onChange: () => void }) {
  const [details, setDetails] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'quotes' | 'orders'>('info');
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [statusModal, setStatusModal] = useState(false);

  useEffect(() => {
    if (customer) {
      setLoading(true);
      customerService.get(customer.id).then(setDetails).catch(() => {}).finally(() => setLoading(false));
      customerService.quotes(customer.id).then((r) => setQuotes(r.data)).catch(() => {});
      customerService.orders(customer.id).then((r) => setOrders(r.data)).catch(() => {});
    }
  }, [customer]);

  if (!customer) return null;

  return (
    <Modal open={!!customer} onClose={onClose} title={`${customer.firstName} ${customer.lastName}`} size="2xl"
      footer={
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          {customer.status === 'ACTIVE' ? (
            <button onClick={() => setStatusModal(true)} className="btn-danger btn-sm">Disable Customer</button>
          ) : (
            <button onClick={() => setStatusModal(true)} className="btn-primary btn-sm">Enable Customer</button>
          )}
        </div>
      }
    >
      {loading ? <FullPageLoader /> : details && (
        <div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
            <div className="p-3 bg-secondary-50 rounded-lg">
              <p className="text-xs text-secondary-500">Orders</p>
              <p className="text-2xl font-bold text-secondary-900">{details._count?.orders ?? 0}</p>
            </div>
            <div className="p-3 bg-secondary-50 rounded-lg">
              <p className="text-xs text-secondary-500">Quotes</p>
              <p className="text-2xl font-bold text-secondary-900">{details._count?.quotes ?? 0}</p>
            </div>
            <div className="p-3 bg-secondary-50 rounded-lg">
              <p className="text-xs text-secondary-500">Status</p>
              <p className="text-lg font-bold"><span className={getStatusColor(details.status)}>{details.status}</span></p>
            </div>
          </div>

          <div className="border-b border-secondary-200 mb-3 flex gap-4">
            {(['info', 'quotes', 'orders'] as const).map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={clsx('py-2 px-1 text-sm font-medium border-b-2 -mb-px', activeTab === tab ? 'border-primary text-primary' : 'border-transparent text-secondary-500 hover:text-secondary-700')}>
                {tab === 'info' ? 'Info' : tab === 'quotes' ? `Quotes (${quotes.length})` : `Orders (${orders.length})`}
              </button>
            ))}
          </div>

          {activeTab === 'info' && (
            <div className="space-y-2 text-sm">
              <p className="flex items-center gap-2"><Mail className="w-4 h-4 text-secondary-400" />{details.email}</p>
              {details.phone && <p className="flex items-center gap-2"><Phone className="w-4 h-4 text-secondary-400" />{details.phone}</p>}
              <p className="flex items-center gap-2"><Calendar className="w-4 h-4 text-secondary-400" />Joined {formatDate(details.createdAt)}</p>
              {details.lastLoginAt && <p className="flex items-center gap-2"><Calendar className="w-4 h-4 text-secondary-400" />Last login {formatDate(details.lastLoginAt)}</p>}
            </div>
          )}

          {activeTab === 'quotes' && (
            <div className="space-y-2">
              {quotes.length === 0 ? <p className="text-sm text-secondary-500 text-center py-4">No quotes</p> : quotes.map((q) => (
                <div key={q.id} className="p-3 bg-secondary-50 rounded-lg flex items-center justify-between">
                  <div>
                    <div className="font-mono text-xs text-secondary-500">{q.quoteNumber}</div>
                    <div className="text-sm font-medium">{q.subject}</div>
                  </div>
                  <span className={getStatusColor(q.status)}>{q.status}</span>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="space-y-2">
              {orders.length === 0 ? <p className="text-sm text-secondary-500 text-center py-4">No orders</p> : orders.map((o) => (
                <div key={o.id} className="p-3 bg-secondary-50 rounded-lg flex items-center justify-between">
                  <div>
                    <div className="font-mono text-xs text-secondary-500">{o.orderNumber}</div>
                    <div className="text-sm font-medium">{formatCurrency(o.total)}</div>
                  </div>
                  <span className={getStatusColor(o.status)}>{o.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <CustomerStatusModal
        open={statusModal}
        customer={customer}
        onClose={() => setStatusModal(false)}
        onSaved={() => { setStatusModal(false); onChange(); }}
      />
    </Modal>
  );
}

function CustomerStatusModal({ open, customer, onClose, onSaved }: { open: boolean; customer: User; onClose: () => void; onSaved: () => void }) {
  const [status, setStatus] = useState('SUSPENDED');
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await customerService.updateStatus(customer.id, status, reason);
      toast.success(`Customer ${status.toLowerCase()}`);
      onSaved();
    } catch (err: any) { toast.error(err.response?.data?.error?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  return (
    <Modal open={open} onClose={onClose} title={customer.status === 'ACTIVE' ? 'Disable Customer' : 'Enable Customer'} footer={
      <>
        <button onClick={onClose} className="btn-secondary">Cancel</button>
        <button form="status-form" type="submit" disabled={saving} className="btn-primary">{saving ? 'Saving...' : 'Confirm'}</button>
      </>
    }>
      <form id="status-form" onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-1.5">New Status *</label>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="input">
            <option value="ACTIVE">Active (re-enable)</option>
            <option value="SUSPENDED">Suspended</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-1.5">Reason</label>
          <textarea value={reason} onChange={(e) => setReason(e.target.value)} className="input" rows={2} />
        </div>
      </form>
    </Modal>
  );
}
