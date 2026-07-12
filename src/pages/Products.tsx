// ────────────────────────────────────────────────────────────
// Premium Products Page — Part 2A-1
// 12-col table · advanced filters · bulk actions · tags · image mgmt
// ────────────────────────────────────────────────────────────

import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Package, Search, Plus, Filter, X, Download, Upload, MoreVertical,
  Edit, Trash2, Eye, Copy, Star, TrendingUp, Sparkles, Tag,
  Grid3x3, List, ChevronDown, ChevronUp, Image as ImageIcon, AlertTriangle,
  CheckCircle2, Archive, Box, Truck, Layers, BarChart3, ChevronRight,
} from 'lucide-react';
import clsx from 'clsx';
import {
  Card, CardHeader, CardBody, Button, Badge, PageHeader, EmptyState,
  Skeleton, TableLoader, Modal, ConfirmDialog, Pagination, Toolbar, Tabs,
} from '../components/ui/StatCard';
import { productService, categoryService } from '../lib/services';
import { formatCurrency, relativeTime } from '../lib/auth';
import type { Product, Category } from '../types';
import toast from 'react-hot-toast';

// ─── Status config ──────────────────────────────────────────
const STATUS_MAP: Record<string, { label: string; variant: any; icon: any; dot: string }> = {
  ACTIVE:       { label: 'Active',       variant: 'success', icon: CheckCircle2, dot: 'bg-success-500' },
  DRAFT:        { label: 'Draft',        variant: 'ink',     icon: Edit,         dot: 'bg-ink-400' },
  OUT_OF_STOCK: { label: 'Out of Stock', variant: 'danger',  icon: AlertTriangle,dot: 'bg-danger-500' },
  ARCHIVED:     { label: 'Archived',     variant: 'warning', icon: Archive,      dot: 'bg-warning-500' },
};

// ─── View mode ──────────────────────────────────────────────
type ViewMode = 'table' | 'grid';

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize] = useState(20);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [stockFilter, setStockFilter] = useState<string>('all');
  const [featuredFilter, setFeaturedFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');

  // Selection
  const [selected, setSelected] = useState<Set<string>>(new Set());

  // View
  const [view, setView] = useState<ViewMode>('table');
  const [showFilters, setShowFilters] = useState(false);

  // Delete
  const [deleting, setDeleting] = useState<Product | null>(null);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, [page, statusFilter, categoryFilter, stockFilter, featuredFilter, sortBy, search]);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const res = await categoryService.list({ limit: 100 });
      const items = (res as any).items || (res as any).data || [];
      setCategories(items);
    } catch (err) {
      console.error('Failed to load categories', err);
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const params: any = { page, limit: pageSize };
      if (search) params.search = search;
      if (statusFilter !== 'all') params.status = statusFilter;
      if (categoryFilter !== 'all') params.categoryId = categoryFilter;
      if (stockFilter === 'low') params.lowStock = 'true';
      if (featuredFilter !== 'all') params.isFeatured = featuredFilter;
      const res = await productService.list(params);
      const items = (res as any).items || (res as any).data || [];
      setProducts(items);
      const total = (res as any).total ?? (res as any).pagination?.total ?? items.length;
      const totalPages = (res as any).totalPages ?? (res as any).pagination?.totalPages ?? Math.ceil(total / pageSize);
      setTotal(total);
      setTotalPages(totalPages);
    } catch (err) {
      console.error('Failed to load products', err);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  // ─── Selection helpers ─────────────────────────────────
  const allOnPageSelected = products.length > 0 && products.every((p) => selected.has(p.id));
  const someOnPageSelected = products.some((p) => selected.has(p.id)) && !allOnPageSelected;

  const toggleAll = () => {
    if (allOnPageSelected) {
      const next = new Set(selected);
      products.forEach((p) => next.delete(p.id));
      setSelected(next);
    } else {
      const next = new Set(selected);
      products.forEach((p) => next.add(p.id));
      setSelected(next);
    }
  };

  const toggleOne = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  };

  const clearSelection = () => setSelected(new Set());

  // ─── Stats ────────────────────────────────────────────
  const stats = useMemo(() => {
    const list = products;
    return {
      total: list.length,
      active: list.filter((p) => p.status === 'ACTIVE').length,
      draft: list.filter((p) => p.status === 'DRAFT').length,
      outOfStock: list.filter((p) => p.status === 'OUT_OF_STOCK' || p.stock === 0).length,
      lowStock: list.filter((p) => p.stock > 0 && p.stock <= 10).length,
      featured: list.filter((p) => p.isFeatured).length,
    };
  }, [products]);

  // ─── Handlers ─────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleting) return;
    try {
      await productService.remove(deleting.id);
      toast.success(`Deleted "${deleting.name}"`);
      setDeleting(null);
      loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || 'Failed to delete');
    }
  };

  const handleBulkDelete = async () => {
    try {
      await Promise.all(Array.from(selected).map((id) => productService.remove(id)));
      toast.success(`Deleted ${selected.size} products`);
      setBulkDeleteOpen(false);
      clearSelection();
      loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || 'Bulk delete failed');
    }
  };

  const handleDuplicate = async (p: Product) => {
    try {
      await productService.create({
        name: `${p.name} (Copy)`,
        slug: `${p.slug}-copy-${Date.now()}`,
        sku: p.sku,
        description: p.description,
        shortDesc: p.shortDesc,
        categoryId: p.categoryId,
        brandId: p.brandId,
        mrp: p.mrp,
        sellingPrice: p.sellingPrice,
        gstPercent: p.gstPercent,
        stock: 0,
        unit: p.unit,
        minOrderQty: p.minOrderQty,
        status: 'DRAFT',
      });
      toast.success('Duplicated as draft');
      loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || 'Duplicate failed');
    }
  };

  const handleToggleStatus = async (p: Product) => {
    const next = p.status === 'ACTIVE' ? 'DRAFT' : 'ACTIVE';
    try {
      await productService.update(p.id, { status: next });
      toast.success(`Status changed to ${STATUS_MAP[next]?.label || next}`);
      loadData();
    } catch (err: any) {
      toast.error('Status update failed');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Products"
        description={`${total} products · Manage your complete catalog`}
        breadcrumbs={[{ label: 'Catalog' }, { label: 'Products' }]}
        actions={
          <>
            <Button variant="secondary" leftIcon={Download}>Export</Button>
            <Button variant="secondary" leftIcon={Upload}>Import</Button>
            <Button variant="primary" leftIcon={Plus} className="hidden sm:inline-flex">
              <Link to="/products" state={{ openCreate: true }}>Add Product</Link>
            </Button>
            <button className="btn-primary sm:hidden">
              <Plus className="w-4 h-4" />
            </button>
          </>
        }
      />

      {/* ─── Stat strip ──────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <MiniStat label="Total" value={total} icon={Package} accent="ink" />
        <MiniStat label="Active" value={stats.active} icon={CheckCircle2} accent="success" />
        <MiniStat label="Draft" value={stats.draft} icon={Edit} accent="ink" />
        <MiniStat label="Out of Stock" value={stats.outOfStock} icon={AlertTriangle} accent="danger" />
        <MiniStat label="Low Stock" value={stats.lowStock} icon={Box} accent="warning" />
        <MiniStat label="Featured" value={stats.featured} icon={Star} accent="accent" />
      </div>

      {/* ─── Tabs (quick status filter) ──────────────────── */}
      <Tabs
        active={statusFilter}
        onChange={(v) => { setStatusFilter(v); setPage(1); clearSelection(); }}
        tabs={[
          { value: 'all',           label: 'All Products',  count: total },
          { value: 'ACTIVE',        label: 'Active',        count: stats.active },
          { value: 'DRAFT',         label: 'Draft',         count: stats.draft },
          { value: 'OUT_OF_STOCK',  label: 'Out of Stock',  count: stats.outOfStock },
          { value: 'ARCHIVED',      label: 'Archived',      count: undefined },
        ]}
      />

      {/* ─── Toolbar: search + filters + view toggle ──────── */}
      <Card>
        <div className="p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400 pointer-events-none" />
            <input
              type="search"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search by name, SKU, or category…"
              className="input pl-10"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={categoryFilter}
              onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
              className="input h-9 text-sm w-auto min-w-[140px]"
            >
              <option value="all">All categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>

            <select
              value={stockFilter}
              onChange={(e) => { setStockFilter(e.target.value); setPage(1); }}
              className="input h-9 text-sm w-auto min-w-[120px]"
            >
              <option value="all">All stock</option>
              <option value="low">Low stock</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="input h-9 text-sm w-auto min-w-[140px]"
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="name-asc">Name A→Z</option>
              <option value="name-desc">Name Z→A</option>
              <option value="price-asc">Price low→high</option>
              <option value="price-desc">Price high→low</option>
              <option value="stock-asc">Stock low→high</option>
            </select>

            <div className="flex items-center bg-ink-100 rounded-lg p-0.5">
              <button
                onClick={() => setView('table')}
                className={clsx(
                  'flex items-center justify-center w-7 h-7 rounded-md transition-all',
                  view === 'table' ? 'bg-white shadow-sm text-ink-900' : 'text-ink-500 hover:text-ink-900',
                )}
                aria-label="Table view"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setView('grid')}
                className={clsx(
                  'flex items-center justify-center w-7 h-7 rounded-md transition-all',
                  view === 'grid' ? 'bg-white shadow-sm text-ink-900' : 'text-ink-500 hover:text-ink-900',
                )}
                aria-label="Grid view"
              >
                <Grid3x3 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* ─── Bulk action bar (when items selected) ─────── */}
        {selected.size > 0 && (
          <div className="border-t border-ink-200 bg-accent-50/50 px-4 py-2.5 flex items-center gap-3 animate-slide-in">
            <div className="flex items-center gap-2 text-sm">
              <span className="font-semibold text-ink-900">{selected.size}</span>
              <span className="text-ink-600">selected</span>
            </div>
            <div className="h-4 w-px bg-ink-300" />
            <Button size="sm" variant="ghost" leftIcon={X} onClick={clearSelection}>Clear</Button>
            <Button size="sm" variant="secondary" leftIcon={Edit}>Bulk Edit</Button>
            <Button size="sm" variant="secondary" leftIcon={Tag}>Add Tag</Button>
            <Button size="sm" variant="secondary" leftIcon={Archive}>Archive</Button>
            <div className="flex-1" />
            <Button size="sm" variant="danger" leftIcon={Trash2} onClick={() => setBulkDeleteOpen(true)}>
              Delete
            </Button>
          </div>
        )}
      </Card>

      {/* ─── Table or grid view ──────────────────────────── */}
      {loading ? (
        <Card><TableLoader rows={6} /></Card>
      ) : products.length === 0 ? (
        <Card>
          <EmptyState
            icon={Package}
            title="No products found"
            description={search || statusFilter !== 'all' || categoryFilter !== 'all'
              ? 'Try adjusting your filters or search query'
              : 'Get started by adding your first product to the catalog.'}
            action={
              <Button variant="primary" leftIcon={Plus}>
                <Link to="/products" state={{ openCreate: true }}>Add Product</Link>
              </Button>
            }
          />
        </Card>
      ) : view === 'table' ? (
        <ProductsTable
          products={products}
          selected={selected}
          allSelected={allOnPageSelected}
          someSelected={someOnPageSelected}
          onToggleAll={toggleAll}
          onToggleOne={toggleOne}
          onDelete={setDeleting}
          onDuplicate={handleDuplicate}
          onToggleStatus={handleToggleStatus}
        />
      ) : (
        <ProductsGrid
          products={products}
          selected={selected}
          onToggleOne={toggleOne}
          onDelete={setDeleting}
          onDuplicate={handleDuplicate}
        />
      )}

      {/* ─── Pagination ──────────────────────────────────── */}
      {!loading && products.length > 0 && (
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

      {/* ─── Delete single ───────────────────────────────── */}
      <ConfirmDialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={handleDelete}
        title="Delete product?"
        description={`"${deleting?.name}" will be permanently removed. This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
      />

      {/* ─── Bulk delete ─────────────────────────────────── */}
      <ConfirmDialog
        open={bulkDeleteOpen}
        onClose={() => setBulkDeleteOpen(false)}
        onConfirm={handleBulkDelete}
        title={`Delete ${selected.size} products?`}
        description="These products will be permanently removed. This action cannot be undone."
        confirmText="Delete all"
        variant="danger"
      />
    </div>
  );
}

// ─── Mini stat card ─────────────────────────────────────────
function MiniStat({
  label, value, icon: Icon, accent,
}: {
  label: string; value: number; icon: any; accent: 'ink' | 'success' | 'warning' | 'danger' | 'accent';
}) {
  const accentMap = {
    ink:     'bg-ink-100 text-ink-600',
    success: 'bg-success-subtle text-success-600',
    warning: 'bg-warning-subtle text-warning-600',
    danger:  'bg-danger-subtle text-danger-600',
    accent:  'bg-accent-50 text-accent-600',
  };
  return (
    <div className="card-hover p-3 sm:p-4 flex items-center gap-3">
      <div className={clsx('w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0', accentMap[accent])}>
        <Icon className="w-4 h-4" strokeWidth={2.25} />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-ink-500 truncate">{label}</p>
        <p className="text-lg font-bold text-ink-900 tabular-nums">{value}</p>
      </div>
    </div>
  );
}

// ─── Table view ─────────────────────────────────────────────
function ProductsTable({
  products, selected, allSelected, someSelected,
  onToggleAll, onToggleOne, onDelete, onDuplicate, onToggleStatus,
}: {
  products: Product[];
  selected: Set<string>;
  allSelected: boolean;
  someSelected: boolean;
  onToggleAll: () => void;
  onToggleOne: (id: string) => void;
  onDelete: (p: Product) => void;
  onDuplicate: (p: Product) => void;
  onToggleStatus: (p: Product) => void;
}) {
  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto scroll-thin">
        <table className="w-full text-sm">
          <thead className="bg-ink-50/80 border-b border-ink-200">
            <tr>
              <th className="w-10 px-4 py-3 text-left">
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={(el) => { if (el) el.indeterminate = someSelected; }}
                  onChange={onToggleAll}
                  className="rounded border-ink-300 text-accent-500 focus:ring-accent-500"
                  aria-label="Select all"
                />
              </th>
              <th className="px-4 py-3 text-left text-2xs font-bold text-ink-500 uppercase tracking-wider">Product</th>
              <th className="px-4 py-3 text-left text-2xs font-bold text-ink-500 uppercase tracking-wider">SKU</th>
              <th className="px-4 py-3 text-left text-2xs font-bold text-ink-500 uppercase tracking-wider">Category</th>
              <th className="px-4 py-3 text-right text-2xs font-bold text-ink-500 uppercase tracking-wider">Price</th>
              <th className="px-4 py-3 text-right text-2xs font-bold text-ink-500 uppercase tracking-wider">Stock</th>
              <th className="px-4 py-3 text-left text-2xs font-bold text-ink-500 uppercase tracking-wider">Status</th>
              <th className="px-4 py-3 text-left text-2xs font-bold text-ink-500 uppercase tracking-wider">Flags</th>
              <th className="px-4 py-3 text-left text-2xs font-bold text-ink-500 uppercase tracking-wider">Updated</th>
              <th className="w-10 px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-100">
            {products.map((p) => {
              const status = STATUS_MAP[p.status] || STATUS_MAP.DRAFT;
              const isSelected = selected.has(p.id);
              const primaryImage = p.images?.[0]?.url;
              return (
                <tr
                  key={p.id}
                  className={clsx(
                    'transition-colors group',
                    isSelected ? 'bg-accent-50/50' : 'hover:bg-ink-50/60',
                  )}
                >
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => onToggleOne(p.id)}
                      className="rounded border-ink-300 text-accent-500 focus:ring-accent-500"
                      aria-label={`Select ${p.name}`}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      to={`/products/${p.id}`}
                      className="flex items-center gap-3 group/product min-w-0"
                    >
                      <div className="w-11 h-11 rounded-xl bg-ink-100 overflow-hidden flex-shrink-0 ring-1 ring-ink-200/60">
                        {primaryImage ? (
                          <img
                            src={primaryImage}
                            alt={p.name}
                            className="w-full h-full object-cover"
                            loading="lazy"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ImageIcon className="w-4 h-4 text-ink-400" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-ink-900 truncate group-hover/product:text-accent-600 transition-colors max-w-[240px]">
                          {p.name}
                        </p>
                        <p className="text-2xs text-ink-500 truncate mt-0.5">
                          {p._count?.variants ? `${p._count.variants} variants` : 'No variants'}
                          {p._count?.reviews ? ` · ${p._count.reviews} reviews` : ''}
                        </p>
                      </div>
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-mono text-xs text-ink-600">
                      {p.sku || <span className="text-ink-400">—</span>}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-ink-700 text-sm">{p.category?.name || '—'}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <p className="font-semibold text-ink-900 tabular-nums">
                      {formatCurrency(parseFloat(p.sellingPrice))}
                    </p>
                    {parseFloat(p.mrp) > parseFloat(p.sellingPrice) && (
                      <p className="text-2xs text-ink-400 line-through tabular-nums">
                        {formatCurrency(parseFloat(p.mrp))}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className={clsx(
                      'font-semibold tabular-nums',
                      p.stock === 0 ? 'text-danger-600' : p.stock <= 10 ? 'text-warning-600' : 'text-ink-900',
                    )}>
                      {p.stock}
                    </span>
                    <span className="text-2xs text-ink-500 ml-1">{p.unit}</span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => onToggleStatus(p)}
                      title="Toggle status"
                      className="cursor-pointer"
                    >
                      <Badge variant={status.variant} dot>
                        {status.label}
                      </Badge>
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      {p.isFeatured && (
                        <span className="w-5 h-5 rounded-md bg-accent-50 text-accent-600 flex items-center justify-center" title="Featured">
                          <Star className="w-3 h-3" fill="currentColor" />
                        </span>
                      )}
                      {p.isBestseller && (
                        <span className="w-5 h-5 rounded-md bg-warning-subtle text-warning-600 flex items-center justify-center" title="Bestseller">
                          <TrendingUp className="w-3 h-3" />
                        </span>
                      )}
                      {p.isNew && (
                        <span className="w-5 h-5 rounded-md bg-info-subtle text-info-600 flex items-center justify-center" title="New">
                          <Sparkles className="w-3 h-3" />
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-2xs text-ink-500">{relativeTime(p.updatedAt)}</span>
                  </td>
                  <td className="px-4 py-3">
                    <RowActions product={p} onDelete={onDelete} onDuplicate={onDuplicate} />
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

// ─── Grid view ──────────────────────────────────────────────
function ProductsGrid({
  products, selected, onToggleOne, onDelete, onDuplicate,
}: {
  products: Product[];
  selected: Set<string>;
  onToggleOne: (id: string) => void;
  onDelete: (p: Product) => void;
  onDuplicate: (p: Product) => void;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {products.map((p) => {
        const status = STATUS_MAP[p.status] || STATUS_MAP.DRAFT;
        const isSelected = selected.has(p.id);
        const primaryImage = p.images?.[0]?.url;
        return (
          <Card
            key={p.id}
            className={clsx(
              'group/card overflow-hidden transition-all',
              isSelected && 'ring-2 ring-accent-500',
            )}
          >
            {/* Image */}
            <div className="relative aspect-[4/3] bg-gradient-to-br from-ink-100 to-ink-50 overflow-hidden">
              {primaryImage ? (
                <img
                  src={primaryImage}
                  alt={p.name}
                  className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ImageIcon className="w-10 h-10 text-ink-300" />
                </div>
              )}

              {/* Top-left status badge */}
              <div className="absolute top-2 left-2">
                <Badge variant={status.variant} dot>{status.label}</Badge>
              </div>

              {/* Top-right select + flags */}
              <div className="absolute top-2 right-2 flex items-start gap-1.5">
                {p.isFeatured && (
                  <span className="w-6 h-6 rounded-md bg-white/90 backdrop-blur-sm text-accent-600 flex items-center justify-center shadow-sm" title="Featured">
                    <Star className="w-3 h-3" fill="currentColor" />
                  </span>
                )}
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => onToggleOne(p.id)}
                  className="w-4 h-4 rounded border-white/40 text-accent-500 focus:ring-accent-500"
                  aria-label={`Select ${p.name}`}
                />
              </div>
            </div>

            {/* Body */}
            <div className="p-4">
              <div className="mb-2">
                <p className="text-2xs font-semibold text-ink-500 uppercase tracking-wider">
                  {p.category?.name || '—'}
                </p>
                <Link to={`/products/${p.id}`}>
                  <h3 className="font-semibold text-ink-900 line-clamp-2 mt-0.5 hover:text-accent-600 transition-colors min-h-[2.75rem]">
                    {p.name}
                  </h3>
                </Link>
              </div>

              <div className="flex items-end justify-between mb-3">
                <div>
                  <p className="text-lg font-bold text-ink-900 tabular-nums">
                    {formatCurrency(parseFloat(p.sellingPrice))}
                  </p>
                  {parseFloat(p.mrp) > parseFloat(p.sellingPrice) && (
                    <p className="text-2xs text-ink-400 line-through tabular-nums">
                      {formatCurrency(parseFloat(p.mrp))}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className={clsx(
                    'text-sm font-semibold tabular-nums',
                    p.stock === 0 ? 'text-danger-600' : p.stock <= 10 ? 'text-warning-600' : 'text-ink-700',
                  )}>
                    {p.stock} {p.unit}
                  </p>
                  <p className="text-2xs text-ink-500">in stock</p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <Link to={`/products/${p.id}`} className="flex-1">
                  <Button variant="secondary" size="sm" className="w-full">View</Button>
                </Link>
                <button
                  className="btn-icon btn-sm"
                  onClick={() => onDuplicate(p)}
                  title="Duplicate"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
                <button
                  className="btn-icon btn-sm text-danger-600 hover:text-danger-700"
                  onClick={() => onDelete(p)}
                  title="Delete"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

// ─── Row actions dropdown ───────────────────────────────────
function RowActions({
  product, onDelete, onDuplicate,
}: {
  product: Product;
  onDelete: (p: Product) => void;
  onDuplicate: (p: Product) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = React.useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);
  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="w-8 h-8 rounded-lg text-ink-500 hover:bg-ink-100 hover:text-ink-900 flex items-center justify-center"
        aria-label="Actions"
      >
        <MoreVertical className="w-4 h-4" />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 w-44 bg-white rounded-xl shadow-popover border border-ink-200 z-30 animate-fade-in overflow-hidden">
          <div className="p-1">
            <ActionItem icon={Eye} label="View" onClick={() => setOpen(false)} />
            <ActionItem icon={Edit} label="Edit" onClick={() => setOpen(false)} />
            <ActionItem icon={Copy} label="Duplicate" onClick={() => { onDuplicate(product); setOpen(false); }} />
            <ActionItem icon={Archive} label="Archive" onClick={() => setOpen(false)} />
            <div className="my-1 border-t border-ink-100" />
            <ActionItem icon={Trash2} label="Delete" danger onClick={() => { onDelete(product); setOpen(false); }} />
          </div>
        </div>
      )}
    </div>
  );
}

function ActionItem({
  icon: Icon, label, onClick, danger,
}: {
  icon: any; label: string; onClick: () => void; danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        'w-full flex items-center gap-2.5 px-3 h-8 text-sm rounded-md transition-colors',
        danger
          ? 'text-danger-600 hover:bg-danger-50'
          : 'text-ink-700 hover:bg-ink-100',
      )}
    >
      <Icon className="w-3.5 h-3.5" />
      <span>{label}</span>
    </button>
  );
}

// Local imports
import React from 'react';