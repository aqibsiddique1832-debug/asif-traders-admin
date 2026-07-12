// ────────────────────────────────────────────────────────────
// Products — List + Search + Filter + Add + Edit + Delete
// ────────────────────────────────────────────────────────────

import { useEffect, useState } from 'react';
import { productService, categoryService } from '../lib/services';
import { Modal, FullPageLoader, EmptyState, Pagination } from '../components/ui/StatCard';
import {
  Plus, Edit2, Trash2, Search, Package, Image as ImageIcon, Filter,
  Eye, ChevronDown, AlertTriangle
} from 'lucide-react';
import { formatCurrency, formatDate } from '../lib/auth';
import { Link } from 'react-router-dom';
import type { Product, Category } from '../types';
import toast from 'react-hot-toast';
import clsx from 'clsx';

export default function Products() {
  const [data, setData] = useState<Product[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const load = async (page = 1) => {
    setLoading(true);
    try {
      const params: any = { page, limit: 20 };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      if (categoryFilter) params.categoryId = categoryFilter;
      const res = await productService.list(params);
      setData(res.data);
      setPagination(res.pagination);
    } catch {
      // handled
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    categoryService.list({ limit: 100 }).then((r) => setCategories(r.data)).catch(() => {});
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    load(1);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await productService.remove(deleteId);
      toast.success('Product deleted');
      setDeleteId(null);
      load(pagination.page);
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || 'Failed to delete');
    }
  };

  const clearFilters = () => {
    setSearch('');
    setStatusFilter('');
    setCategoryFilter('');
    setTimeout(() => load(1), 0);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Products</h1>
          <p className="text-sm text-secondary-500 mt-1">{pagination.total} products</p>
        </div>
        <button onClick={() => { setEditing(null); setModalOpen(true); }} className="btn-primary">
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </div>

      <div className="card p-4">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-10"
              placeholder="Search by name, SKU, description..."
            />
          </div>
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className={clsx('btn-secondary', showFilters && 'bg-primary-50 text-primary border-primary')}
          >
            <Filter className="w-4 h-4" /> Filters
            <ChevronDown className={clsx('w-4 h-4 transition-transform', showFilters && 'rotate-180')} />
          </button>
          <button type="submit" className="btn-primary">Search</button>
        </form>
        {showFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 pt-3 border-t border-secondary-200">
            <div>
              <label className="block text-xs font-medium text-secondary-600 mb-1">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="input"
              >
                <option value="">All</option>
                <option value="ACTIVE">Active</option>
                <option value="DRAFT">Draft</option>
                <option value="OUT_OF_STOCK">Out of Stock</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-secondary-600 mb-1">Category</label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="input"
              >
                <option value="">All</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            {(search || statusFilter || categoryFilter) && (
              <button type="button" onClick={clearFilters} className="btn-ghost text-sm">Clear filters</button>
            )}
          </div>
        )}
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <FullPageLoader />
        ) : data.length === 0 ? (
          <EmptyState
            title="No products found"
            description={search || statusFilter || categoryFilter ? 'Try adjusting your filters' : 'Add your first product to get started'}
            icon={Package}
            action={!search && !statusFilter && !categoryFilter && (
              <button onClick={() => setModalOpen(true)} className="btn-primary">
                <Plus className="w-4 h-4" /> Add Product
              </button>
            )}
          />
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-secondary-50 border-b border-secondary-200">
                  <tr>
                    <th className="text-left text-xs font-semibold text-secondary-600 px-4 py-3">Product</th>
                    <th className="text-left text-xs font-semibold text-secondary-600 px-4 py-3">Category</th>
                    <th className="text-left text-xs font-semibold text-secondary-600 px-4 py-3">Price</th>
                    <th className="text-left text-xs font-semibold text-secondary-600 px-4 py-3">Stock</th>
                    <th className="text-left text-xs font-semibold text-secondary-600 px-4 py-3">Status</th>
                    <th className="text-right text-xs font-semibold text-secondary-600 px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-secondary-200">
                  {data.map((p) => (
                    <tr key={p.id} className="table-row">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {p.images?.[0]?.url ? (
                            <img src={p.images[0].url} alt={p.name} className="w-10 h-10 rounded object-cover flex-shrink-0" />
                          ) : (
                            <div className="w-10 h-10 rounded bg-secondary-100 flex items-center justify-center flex-shrink-0">
                              <ImageIcon className="w-5 h-5 text-secondary-400" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <div className="font-medium text-secondary-900 truncate max-w-xs">{p.name}</div>
                            <div className="text-xs text-secondary-500 font-mono">{p.sku || p.slug}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-secondary-600">{p.category?.name || '—'}</td>
                      <td className="px-4 py-3 text-sm">
                        <div className="font-medium text-secondary-900">{formatCurrency(p.sellingPrice)}</div>
                        {parseFloat(p.mrp) > parseFloat(p.sellingPrice) && (
                          <div className="text-xs text-secondary-400 line-through">{formatCurrency(p.mrp)}</div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className={clsx(
                          'font-medium',
                          p.stock === 0 ? 'text-danger' : p.stock <= 10 ? 'text-warning-dark' : 'text-secondary-700',
                        )}>
                          {p.stock} {p.unit}
                        </div>
                        {p.stock <= 10 && p.stock > 0 && (
                          <div className="text-xs text-warning-dark flex items-center gap-1 mt-0.5">
                            <AlertTriangle className="w-3 h-3" /> Low
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={p.status === 'ACTIVE' ? 'badge badge-success' : p.status === 'OUT_OF_STOCK' ? 'badge badge-danger' : 'badge badge-secondary'}>
                          {p.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Link to={`/products/${p.id}`} className="p-1.5 text-secondary-500 hover:text-primary hover:bg-primary-50 rounded" title="View">
                            <Eye className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => { setEditing(p); setModalOpen(true); }}
                            className="p-1.5 text-secondary-500 hover:text-primary hover:bg-primary-50 rounded"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteId(p.id)}
                            className="p-1.5 text-secondary-500 hover:text-danger hover:bg-danger-light rounded"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="lg:hidden divide-y divide-secondary-200">
              {data.map((p) => (
                <div key={p.id} className="p-4">
                  <div className="flex items-start gap-3">
                    {p.images?.[0]?.url ? (
                      <img src={p.images[0].url} alt={p.name} className="w-16 h-16 rounded object-cover flex-shrink-0" />
                    ) : (
                      <div className="w-16 h-16 rounded bg-secondary-100 flex items-center justify-center flex-shrink-0">
                        <ImageIcon className="w-6 h-6 text-secondary-400" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="font-medium text-secondary-900 truncate">{p.name}</div>
                          <div className="text-xs text-secondary-500">{p.category?.name}</div>
                        </div>
                        <span className={p.status === 'ACTIVE' ? 'badge badge-success' : p.status === 'OUT_OF_STOCK' ? 'badge badge-danger' : 'badge badge-secondary'}>
                          {p.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-2 text-sm">
                        <span className="font-semibold text-secondary-900">{formatCurrency(p.sellingPrice)}</span>
                        <span className={clsx(
                          'text-xs',
                          p.stock === 0 ? 'text-danger' : p.stock <= 10 ? 'text-warning-dark' : 'text-secondary-500',
                        )}>
                          Stock: {p.stock} {p.unit}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 mt-2">
                        <Link to={`/products/${p.id}`} className="btn btn-secondary btn-sm">
                          <Eye className="w-3 h-3" /> View
                        </Link>
                        <button onClick={() => { setEditing(p); setModalOpen(true); }} className="btn btn-secondary btn-sm">
                          <Edit2 className="w-3 h-3" /> Edit
                        </button>
                        <button onClick={() => setDeleteId(p.id)} className="btn btn-sm text-danger hover:bg-danger-light">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
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

      <ProductFormModal
        open={modalOpen}
        product={editing}
        categories={categories}
        onClose={() => { setModalOpen(false); setEditing(null); }}
        onSaved={() => load(pagination.page)}
      />

      <Modal
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        title="Delete Product"
        footer={
          <>
            <button onClick={() => setDeleteId(null)} className="btn-secondary">Cancel</button>
            <button onClick={handleDelete} className="btn-danger">Delete</button>
          </>
        }
      >
        <p className="text-sm text-secondary-600">
          Are you sure? This will soft-delete the product (preserves order history).
        </p>
      </Modal>
    </div>
  );
}

function ProductFormModal({
  open, onClose, onSaved, product, categories,
}: {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  product: Product | null;
  categories: Category[];
}) {
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [description, setDescription] = useState('');
  const [shortDesc, setShortDesc] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [mrp, setMrp] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');
  const [gstPercent, setGstPercent] = useState(18);
  const [stock, setStock] = useState(0);
  const [unit, setUnit] = useState('piece');
  const [minOrderQty, setMinOrderQty] = useState(1);
  const [status, setStatus] = useState('ACTIVE');
  const [isFeatured, setIsFeatured] = useState(false);
  const [images, setImages] = useState<Array<{ url: string; alt?: string; isPrimary?: boolean }>>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (product) {
      setName(product.name);
      setSku(product.sku || '');
      setDescription(product.description || '');
      setShortDesc(product.shortDesc || '');
      setCategoryId(product.categoryId);
      setMrp(product.mrp);
      setSellingPrice(product.sellingPrice);
      setGstPercent(product.gstPercent);
      setStock(product.stock);
      setUnit(product.unit);
      setMinOrderQty(product.minOrderQty);
      setStatus(product.status);
      setIsFeatured(product.isFeatured);
      setImages(product.images?.map(i => ({ url: i.url, alt: i.alt, isPrimary: i.isPrimary })) || []);
    } else {
      setName(''); setSku(''); setDescription(''); setShortDesc(''); setCategoryId(categories[0]?.id || '');
      setMrp(''); setSellingPrice(''); setGstPercent(18); setStock(0); setUnit('piece');
      setMinOrderQty(1); setStatus('ACTIVE'); setIsFeatured(false); setImages([]);
    }
  }, [product, open, categories]);

  const addImage = () => setImages([...images, { url: '', alt: '' }]);
  const removeImage = (idx: number) => setImages(images.filter((_, i) => i !== idx));
  const updateImage = (idx: number, field: string, value: any) => {
    setImages(images.map((img, i) => i === idx ? { ...img, [field]: value } : img));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data = {
        name, sku, description, shortDesc,
        categoryId, mrp: parseFloat(mrp), sellingPrice: parseFloat(sellingPrice),
        gstPercent, stock, unit, minOrderQty, status, isFeatured,
        images: images.filter(i => i.url).map((img, idx) => ({ ...img, isPrimary: img.isPrimary ?? idx === 0 })),
      };
      if (product) {
        await productService.update(product.id, data);
        toast.success('Product updated');
      } else {
        await productService.create(data);
        toast.success('Product created');
      }
      onSaved();
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={product ? 'Edit Product' : 'Add Product'}
      size="2xl"
      footer={
        <>
          <button onClick={onClose} className="btn-secondary" type="button">Cancel</button>
          <button form="product-form" type="submit" className="btn-primary" disabled={saving}>
            {saving ? 'Saving...' : product ? 'Update Product' : 'Create Product'}
          </button>
        </>
      }
    >
      <form id="product-form" onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-secondary-700 mb-1.5">Name *</label>
            <input required value={name} onChange={(e) => setName(e.target.value)} className="input" />
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1.5">SKU</label>
            <input value={sku} onChange={(e) => setSku(e.target.value)} className="input" />
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1.5">Category *</label>
            <select required value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="input">
              <option value="">Select category</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-secondary-700 mb-1.5">Short Description</label>
            <input value={shortDesc} onChange={(e) => setShortDesc(e.target.value)} className="input" maxLength={500} />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-secondary-700 mb-1.5">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="input min-h-[80px]" />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1.5">MRP (₹) *</label>
            <input required type="number" step="0.01" min="0" value={mrp} onChange={(e) => setMrp(e.target.value)} className="input" />
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1.5">Selling Price (₹) *</label>
            <input required type="number" step="0.01" min="0" value={sellingPrice} onChange={(e) => setSellingPrice(e.target.value)} className="input" />
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1.5">GST %</label>
            <input type="number" min="0" max="100" value={gstPercent} onChange={(e) => setGstPercent(parseFloat(e.target.value) || 0)} className="input" />
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1.5">Stock *</label>
            <input required type="number" min="0" value={stock} onChange={(e) => setStock(parseInt(e.target.value, 10) || 0)} className="input" />
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1.5">Unit *</label>
            <select value={unit} onChange={(e) => setUnit(e.target.value)} className="input">
              <option value="piece">piece</option>
              <option value="bag">bag</option>
              <option value="kg">kg</option>
              <option value="litre">litre</option>
              <option value="meter">meter</option>
              <option value="box">box</option>
              <option value="bundle">bundle</option>
              <option value="ton">ton</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1.5">Min Order Qty</label>
            <input type="number" min="1" value={minOrderQty} onChange={(e) => setMinOrderQty(parseInt(e.target.value, 10) || 1)} className="input" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1.5">Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="input">
              <option value="ACTIVE">Active</option>
              <option value="DRAFT">Draft</option>
              <option value="OUT_OF_STOCK">Out of Stock</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>
          <div className="flex items-end">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} className="w-4 h-4 text-primary border-secondary-300 rounded" />
              <span className="text-sm text-secondary-700">Featured product</span>
            </label>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-secondary-700">Product Images</label>
            <button type="button" onClick={addImage} className="btn btn-secondary btn-sm">
              <Plus className="w-3 h-3" /> Add Image
            </button>
          </div>
          {images.length === 0 ? (
            <p className="text-sm text-secondary-500 text-center py-3 border border-dashed border-secondary-200 rounded-lg">
              No images. Click "Add Image" to upload via URL.
            </p>
          ) : (
            <div className="space-y-2">
              {images.map((img, idx) => (
                <div key={idx} className="flex items-start gap-2 p-2 border border-secondary-200 rounded-lg">
                  <div className="flex-1 space-y-2">
                    <input
                      placeholder="Image URL (https://...)"
                      value={img.url}
                      onChange={(e) => updateImage(idx, 'url', e.target.value)}
                      className="input"
                    />
                    <input
                      placeholder="Alt text (for SEO/accessibility)"
                      value={img.alt || ''}
                      onChange={(e) => updateImage(idx, 'alt', e.target.value)}
                      className="input"
                    />
                    <label className="flex items-center gap-2 text-xs text-secondary-600">
                      <input
                        type="checkbox"
                        checked={img.isPrimary ?? idx === 0}
                        onChange={(e) => updateImage(idx, 'isPrimary', e.target.checked)}
                        className="w-3.5 h-3.5 text-primary border-secondary-300 rounded"
                      />
                      Primary image
                    </label>
                  </div>
                  {img.url && (
                    <img src={img.url} alt="preview" className="w-16 h-16 object-cover rounded flex-shrink-0" />
                  )}
                  <button type="button" onClick={() => removeImage(idx)} className="p-1.5 text-danger hover:bg-danger-light rounded">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </form>
    </Modal>
  );
}
