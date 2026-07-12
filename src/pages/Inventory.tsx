// ────────────────────────────────────────────────────────────
// Inventory — Summary + Low/Out of Stock + Bulk Update + History
// ────────────────────────────────────────────────────────────

import { useEffect, useState } from 'react';
import { inventoryService, productService } from '../lib/services';
import { Modal, FullPageLoader, EmptyState, Pagination, StatCard } from '../components/ui/StatCard';
import { Plus, Search, AlertTriangle, Edit2, History, Package, TrendingUp, TrendingDown, X, Save } from 'lucide-react';
import { formatDateTime, formatNumber, getStatusColor } from '../lib/auth';
import type { InventoryRecord } from '../types';
import toast from 'react-hot-toast';
import clsx from 'clsx';

export default function Inventory() {
  const [activeTab, setActiveTab] = useState<'overview' | 'low' | 'out' | 'history'>('overview');
  const [summary, setSummary] = useState<any>(null);
  const [lowStock, setLowStock] = useState<any[]>([]);
  const [outOfStock, setOutOfStock] = useState<any[]>([]);
  const [history, setHistory] = useState<InventoryRecord[]>([]);
  const [historyPagination, setHistoryPagination] = useState({ page: 1, limit: 30, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [singleStockProduct, setSingleStockProduct] = useState<any | null>(null);

  useEffect(() => {
    loadSummary();
  }, []);

  useEffect(() => {
    if (activeTab === 'low') loadLowStock();
    if (activeTab === 'out') loadOutOfStock();
    if (activeTab === 'history') loadHistory(1);
  }, [activeTab]);

  const loadSummary = async () => {
    setLoading(true);
    try { setSummary(await inventoryService.summary()); } catch {} finally { setLoading(false); }
  };
  const loadLowStock = async () => {
    setLoading(true);
    try { const r = await inventoryService.lowStock(); setLowStock(r.data); } catch {} finally { setLoading(false); }
  };
  const loadOutOfStock = async () => {
    setLoading(true);
    try { const r = await inventoryService.outOfStock(); setOutOfStock(r.data); } catch {} finally { setLoading(false); }
  };
  const loadHistory = async (page: number) => {
    setLoading(true);
    try {
      const r = await inventoryService.history({ page, limit: 30 });
      setHistory(r.data);
      setHistoryPagination(r.pagination);
    } catch {} finally { setLoading(false); }
  };

  if (loading && !summary) return <FullPageLoader />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Inventory</h1>
          <p className="text-sm text-secondary-500 mt-1">Track stock levels, alerts, and movement history</p>
        </div>
        <button onClick={() => setBulkOpen(true)} className="btn-primary"><Plus className="w-4 h-4" /> Bulk Update Stock</button>
      </div>

      {/* Tabs */}
      <div className="border-b border-secondary-200 flex gap-4 overflow-x-auto">
        {([
          { id: 'overview', label: 'Overview' },
          { id: 'low', label: `Low Stock (${summary?.lowStockCount ?? 0})` },
          { id: 'out', label: `Out of Stock (${summary?.outOfStockCount ?? 0})` },
          { id: 'history', label: 'History' },
        ] as const).map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={clsx('py-2 px-1 text-sm font-medium border-b-2 -mb-px whitespace-nowrap',
              activeTab === tab.id ? 'border-primary text-primary' : 'border-transparent text-secondary-500 hover:text-secondary-700')}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview */}
      {activeTab === 'overview' && summary && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <StatCard label="Total Products" value={formatNumber(summary.totalProducts)} icon={Package} color="primary" />
          <StatCard label="In Stock" value={formatNumber(summary.inStockCount)} icon={Package} color="success" />
          <StatCard label="Low Stock" value={formatNumber(summary.lowStockCount)} icon={AlertTriangle} color="warning" />
          <StatCard label="Out of Stock" value={formatNumber(summary.outOfStockCount)} icon={AlertTriangle} color="danger" />
        </div>
      )}

      {/* Low stock */}
      {activeTab === 'low' && (
        <StockList products={lowStock} loading={loading} onUpdate={setSingleStockProduct} showAlert emptyMsg="No low-stock products" />
      )}

      {/* Out of stock */}
      {activeTab === 'out' && (
        <StockList products={outOfStock} loading={loading} onUpdate={setSingleStockProduct} showAlert emptyMsg="No out-of-stock products" />
      )}

      {/* History */}
      {activeTab === 'history' && (
        <div className="card overflow-hidden">
          {loading ? <FullPageLoader /> : history.length === 0 ? (
            <EmptyState title="No history" description="Stock changes will appear here" icon={History} />
          ) : (
            <>
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-secondary-50 border-b border-secondary-200">
                    <tr>
                      <th className="text-left text-xs font-semibold text-secondary-600 px-4 py-3">Date</th>
                      <th className="text-left text-xs font-semibold text-secondary-600 px-4 py-3">Product</th>
                      <th className="text-left text-xs font-semibold text-secondary-600 px-4 py-3">Type</th>
                      <th className="text-right text-xs font-semibold text-secondary-600 px-4 py-3">Change</th>
                      <th className="text-left text-xs font-semibold text-secondary-600 px-4 py-3">Reason</th>
                      <th className="text-left text-xs font-semibold text-secondary-600 px-4 py-3">By</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-secondary-200">
                    {history.map((h) => (
                      <tr key={h.id} className="table-row">
                        <td className="px-4 py-3 text-secondary-500">{formatDateTime(h.createdAt)}</td>
                        <td className="px-4 py-3 font-medium">{h.product?.name || '—'}</td>
                        <td className="px-4 py-3"><span className={getStatusColor(h.changeType === 'PURCHASE' ? 'ACTIVE' : h.changeType === 'SALE' ? 'OUT_FOR_DELIVERY' : 'REVIEWED')}>{h.changeType}</span></td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            {h.quantityChange > 0 ? <TrendingUp className="w-3.5 h-3.5 text-success" /> : <TrendingDown className="w-3.5 h-3.5 text-danger" />}
                            <span className={h.quantityChange > 0 ? 'text-success-dark' : 'text-danger-dark'}>
                              {h.quantityChange > 0 ? '+' : ''}{h.quantityChange}
                            </span>
                            <span className="text-xs text-secondary-400">({h.quantityBefore} → {h.quantityAfter})</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-secondary-600 text-xs">{h.reason || '—'}</td>
                        <td className="px-4 py-3 text-secondary-500 text-xs">{h.performedBy?.email || 'System'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="md:hidden divide-y divide-secondary-200">
                {history.map((h) => (
                  <div key={h.id} className="p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-secondary-500">{formatDateTime(h.createdAt)}</span>
                      <span className={clsx('text-sm font-medium', h.quantityChange > 0 ? 'text-success-dark' : 'text-danger-dark')}>
                        {h.quantityChange > 0 ? '+' : ''}{h.quantityChange}
                      </span>
                    </div>
                    <div className="font-medium text-sm mt-1">{h.product?.name}</div>
                    <div className="text-xs text-secondary-500">{h.changeType} · {h.reason || '—'}</div>
                  </div>
                ))}
              </div>

              <div className="p-4 border-t border-secondary-200">
                <Pagination page={historyPagination.page} totalPages={historyPagination.totalPages} total={historyPagination.total} limit={historyPagination.limit} onPageChange={loadHistory} />
              </div>
            </>
          )}
        </div>
      )}

      <BulkStockUpdateModal open={bulkOpen} onClose={() => setBulkOpen(false)} onSaved={() => { setBulkOpen(false); loadSummary(); }} />
      <SingleStockUpdateModal product={singleStockProduct} onClose={() => setSingleStockProduct(null)} onSaved={() => { setSingleStockProduct(null); loadSummary(); }} />
    </div>
  );
}

function StockList({ products, loading, onUpdate, showAlert, emptyMsg }: { products: any[]; loading: boolean; onUpdate: (p: any) => void; showAlert: boolean; emptyMsg: string }) {
  if (loading) return <FullPageLoader />;
  if (products.length === 0) return <EmptyState title={emptyMsg} icon={Package} />;
  return (
    <div className="card overflow-hidden">
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-secondary-50 border-b border-secondary-200">
            <tr>
              <th className="text-left text-xs font-semibold text-secondary-600 px-4 py-3">Product</th>
              <th className="text-left text-xs font-semibold text-secondary-600 px-4 py-3">Category</th>
              <th className="text-left text-xs font-semibold text-secondary-600 px-4 py-3">Price</th>
              <th className="text-left text-xs font-semibold text-secondary-600 px-4 py-3">Stock</th>
              <th className="text-right text-xs font-semibold text-secondary-600 px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-secondary-200">
            {products.map((p) => (
              <tr key={p.id} className="table-row">
                <td className="px-4 py-3 font-medium">{p.name}</td>
                <td className="px-4 py-3 text-sm text-secondary-600">{p.category?.name || '—'}</td>
                <td className="px-4 py-3 text-sm">₹{p.sellingPrice}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className={clsx('font-bold', showAlert ? 'text-warning-dark' : 'text-danger-dark')}>{p.stock}</span>
                    <span className="text-xs text-secondary-500">{p.unit}</span>
                    {showAlert && <AlertTriangle className="w-4 h-4 text-warning" />}
                  </div>
                </td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => onUpdate(p)} className="btn btn-secondary btn-sm"><Edit2 className="w-3 h-3" /> Update Stock</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="md:hidden divide-y divide-secondary-200">
        {products.map((p) => (
          <div key={p.id} className="p-3">
            <div className="flex items-center justify-between">
              <div className="font-medium">{p.name}</div>
              <div className={clsx('font-bold', showAlert ? 'text-warning-dark' : 'text-danger-dark')}>{p.stock} {p.unit}</div>
            </div>
            <div className="text-xs text-secondary-500 mt-1">₹{p.sellingPrice} · {p.category?.name}</div>
            <button onClick={() => onUpdate(p)} className="btn btn-secondary btn-sm mt-2 w-full"><Edit2 className="w-3 h-3" /> Update Stock</button>
          </div>
        ))}
      </div>
    </div>
  );
}

function BulkStockUpdateModal({ open, onClose, onSaved }: { open: boolean; onClose: () => void; onSaved: () => void }) {
  const [items, setItems] = useState<Array<{ productId: string; productName: string; stock: number; reason: string }>>([]);
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) { setItems([]); setSearch(''); setSearchResults([]); }
  }, [open]);

  const handleSearch = async () => {
    if (!search) return;
    try {
      const r = await productService.list({ search, limit: 10 });
      setSearchResults(r.data);
    } catch {}
  };

  const addItem = (p: any) => {
    if (items.find((i) => i.productId === p.id)) return;
    setItems([...items, { productId: p.id, productName: p.name, stock: p.stock, reason: '' }]);
    setSearchResults([]);
    setSearch('');
  };

  const handleSubmit = async () => {
    const valid = items.filter((i) => i.reason.length >= 3);
    if (valid.length === 0) { toast.error('Add at least one item with reason (min 3 chars)'); return; }
    setSaving(true);
    try {
      await inventoryService.bulkUpdate(valid);
      toast.success(`${valid.length} products updated`);
      onSaved();
    } catch (err: any) { toast.error(err.response?.data?.error?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  return (
    <Modal open={open} onClose={onClose} title="Bulk Update Stock" size="lg"
      footer={
        <>
          <button onClick={onClose} className="btn-secondary">Cancel</button>
          <button onClick={handleSubmit} disabled={saving || items.length === 0} className="btn-primary"><Save className="w-4 h-4" /> {saving ? 'Saving...' : `Update ${items.length} item(s)`}</button>
        </>
      }
    >
      <div className="space-y-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleSearch())} className="input pl-10" placeholder="Search product by name or SKU..." />
          </div>
          <button onClick={handleSearch} className="btn-secondary">Search</button>
        </div>

        {searchResults.length > 0 && (
          <div className="border border-secondary-200 rounded-lg max-h-48 overflow-y-auto">
            {searchResults.map((p) => (
              <button key={p.id} onClick={() => addItem(p)} className="w-full text-left p-2 hover:bg-secondary-50 flex items-center justify-between">
                <div>
                  <div className="font-medium text-sm">{p.name}</div>
                  <div className="text-xs text-secondary-500">{p.sku || p.slug} · Current stock: {p.stock}</div>
                </div>
                <Plus className="w-4 h-4 text-primary" />
              </button>
            ))}
          </div>
        )}

        {items.length === 0 ? (
          <p className="text-sm text-secondary-500 text-center py-4 border border-dashed border-secondary-200 rounded-lg">Search and add products above to update stock</p>
        ) : (
          <div className="space-y-2">
            {items.map((item, idx) => (
              <div key={item.productId} className="grid grid-cols-12 gap-2 p-2 bg-secondary-50 rounded-lg items-center">
                <div className="col-span-12 sm:col-span-4 font-medium text-sm truncate">{item.productName}</div>
                <div className="col-span-6 sm:col-span-3">
                  <label className="text-xs text-secondary-500">New Stock</label>
                  <input type="number" min="0" value={item.stock} onChange={(e) => setItems(items.map((it, i) => i === idx ? { ...it, stock: parseInt(e.target.value, 10) || 0 } : it))} className="input" />
                </div>
                <div className="col-span-6 sm:col-span-4">
                  <label className="text-xs text-secondary-500">Reason *</label>
                  <input value={item.reason} onChange={(e) => setItems(items.map((it, i) => i === idx ? { ...it, reason: e.target.value } : it))} className="input" placeholder="Restocked / adjusted..." />
                </div>
                <div className="col-span-12 sm:col-span-1 text-right">
                  <button onClick={() => setItems(items.filter((_, i) => i !== idx))} className="p-1.5 text-danger hover:bg-danger-light rounded"><X className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
}

function SingleStockUpdateModal({ product, onClose, onSaved }: { product: any; onClose: () => void; onSaved: () => void }) {
  const [stock, setStock] = useState(0);
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (product) { setStock(product.stock); setReason(''); }
  }, [product]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (reason.length < 3) { toast.error('Reason is required (min 3 chars)'); return; }
    setSaving(true);
    try {
      await productService.updateStock(product.id, stock, reason);
      toast.success('Stock updated');
      onSaved();
    } catch (err: any) { toast.error(err.response?.data?.error?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  if (!product) return null;

  return (
    <Modal open={!!product} onClose={onClose} title={`Update Stock — ${product.name}`} footer={
      <>
        <button onClick={onClose} className="btn-secondary">Cancel</button>
        <button form="stock-form" type="submit" disabled={saving} className="btn-primary">{saving ? 'Saving...' : 'Update'}</button>
      </>
    }>
      <form id="stock-form" onSubmit={handleSubmit} className="space-y-3">
        <div className="p-3 bg-secondary-50 rounded-lg text-sm">
          Current stock: <span className="font-bold">{product.stock} {product.unit}</span>
        </div>
        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-1.5">New Stock *</label>
          <input type="number" min="0" required value={stock} onChange={(e) => setStock(parseInt(e.target.value, 10) || 0)} className="input" />
        </div>
        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-1.5">Reason *</label>
          <textarea required minLength={3} value={reason} onChange={(e) => setReason(e.target.value)} className="input" rows={2} placeholder="Why are you updating stock?" />
        </div>
      </form>
    </Modal>
  );
}
