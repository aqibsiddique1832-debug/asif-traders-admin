// ────────────────────────────────────────────────────────────
// Premium Categories — Part 2A-1
// Card grid + advanced filters + bulk actions
// ────────────────────────────────────────────────────────────

import { useEffect, useState } from 'react';
import {
  Plus, Search, Edit, Trash2, FolderTree, Image as ImageIcon,
  CheckCircle2, XCircle, MoreVertical, Eye, FolderPlus, Upload,
  Grid3x3, List as ListIcon, Tag, Package, Copy,
} from 'lucide-react';
import clsx from 'clsx';
import { categoryService, productService } from '../lib/services';
import {
  Card, CardHeader, CardBody, Button, Badge, PageHeader, EmptyState,
  TableLoader, Modal, ConfirmDialog, Pagination, Tabs, Skeleton,
} from '../components/ui/StatCard';
import { formatDate, relativeTime } from '../lib/auth';
import type { Category } from '../types';
import toast from 'react-hot-toast';

export default function Categories() {
  const [data, setData] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [view, setView] = useState<'grid' | 'table'>('grid');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [deleting, setDeleting] = useState<Category | null>(null);

  // Selection
  const [selected, setSelected] = useState<Set<string>>(new Set());

  // Form state
  const [form, setForm] = useState({ name: '', slug: '', description: '', imageUrl: '', isActive: true });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    load();
  }, [page, filterStatus, search]);

  const load = async () => {
    try {
      setLoading(true);
      const params: any = { page, limit: 20 };
      if (search) params.search = search;
      if (filterStatus !== 'all') params.isActive = filterStatus === 'active';
      const res = await categoryService.list(params);
      setData((res as any).data || []);
      const total = (res as any).total ?? (res as any).pagination?.total ?? 0;
      const totalPages = (res as any).totalPages ?? (res as any).pagination?.totalPages ?? 1;
      setTotal(total);
      setTotalPages(totalPages);
    } catch {
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditing(null);
    setForm({ name: '', slug: '', description: '', imageUrl: '', isActive: true });
    setModalOpen(true);
  };

  const openEdit = (c: Category) => {
    setEditing(c);
    setForm({
      name: c.name || '',
      slug: c.slug || '',
      description: c.description || '',
      imageUrl: c.imageUrl || '',
      isActive: c.isActive !== false,
    });
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error('Name is required'); return; }
    setSaving(true);
    try {
      // Auto-generate slug if not provided
      const slug = form.slug || form.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      const payload = { ...form, slug };
      if (editing) {
        await categoryService.update(editing.id, payload);
        toast.success('Category updated');
      } else {
        await categoryService.create(payload);
        toast.success('Category created');
      }
      setModalOpen(false);
      load();
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    try {
      await categoryService.remove(deleting.id);
      toast.success(`Deleted "${deleting.name}"`);
      setDeleting(null);
      load();
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || 'Delete failed');
    }
  };

  const handleToggleActive = async (c: Category) => {
    try {
      await categoryService.update(c.id, { isActive: !c.isActive });
      toast.success(`Category ${!c.isActive ? 'activated' : 'deactivated'}`);
      load();
    } catch {
      toast.error('Failed to update status');
    }
  };

  const handleDuplicate = async (c: Category) => {
    try {
      await categoryService.create({
        name: `${c.name} (Copy)`,
        slug: `${c.slug}-copy-${Date.now()}`,
        description: c.description,
        imageUrl: c.imageUrl,
        isActive: false,
      });
      toast.success('Duplicated as draft');
      load();
    } catch {
      toast.error('Duplicate failed');
    }
  };

  const toggleSelect = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  };

  const clearSelection = () => setSelected(new Set());

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Categories"
        description={`${total} categories · Organize your product catalog`}
        breadcrumbs={[{ label: 'Catalog' }, { label: 'Categories' }]}
        actions={
          <>
            <Button variant="secondary" leftIcon={Upload}>Bulk Import</Button>
            <Button variant="primary" leftIcon={Plus} onClick={openCreate}>
              Add Category
            </Button>
          </>
        }
      />

      {/* ─── Stat strip ──────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MiniStat label="Total Categories" value={total} icon={FolderTree} accent="info" />
        <MiniStat label="Active" value={data.filter((c) => c.isActive !== false).length} icon={CheckCircle2} accent="success" />
        <MiniStat label="Inactive" value={data.filter((c) => c.isActive === false).length} icon={XCircle} accent="ink" />
        <MiniStat label="With Products" value={data.filter((c) => (c as any)._count?.products > 0).length} icon={Package} accent="accent" />
      </div>

      {/* ─── Tabs ────────────────────────────────────────── */}
      <Tabs
        active={filterStatus}
        onChange={(v) => { setFilterStatus(v as any); setPage(1); clearSelection(); }}
        tabs={[
          { value: 'all',      label: 'All',      count: total },
          { value: 'active',   label: 'Active',   count: data.filter((c) => c.isActive !== false).length },
          { value: 'inactive', label: 'Inactive', count: data.filter((c) => c.isActive === false).length },
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
              placeholder="Search categories…"
              className="input pl-10"
            />
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center bg-ink-100 rounded-lg p-0.5">
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
              <button
                onClick={() => setView('table')}
                className={clsx(
                  'flex items-center justify-center w-7 h-7 rounded-md transition-all',
                  view === 'table' ? 'bg-white shadow-sm text-ink-900' : 'text-ink-500 hover:text-ink-900',
                )}
                aria-label="Table view"
              >
                <ListIcon className="w-4 h-4" />
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
            <Button size="sm" variant="ghost" leftIcon={XCircle} onClick={clearSelection}>Clear</Button>
            <Button size="sm" variant="secondary" leftIcon={CheckCircle2}>Activate</Button>
            <Button size="sm" variant="secondary" leftIcon={XCircle}>Deactivate</Button>
          </div>
        )}
      </Card>

      {/* ─── Content ─────────────────────────────────────── */}
      {loading ? (
        <Card><TableLoader rows={6} /></Card>
      ) : data.length === 0 ? (
        <Card>
          <EmptyState
            icon={FolderTree}
            title="No categories yet"
            description="Create your first category to start organizing products."
            action={<Button variant="primary" leftIcon={Plus} onClick={openCreate}>Add Category</Button>}
          />
        </Card>
      ) : view === 'grid' ? (
        <CategoriesGrid
          categories={data}
          selected={selected}
          onToggle={toggleSelect}
          onEdit={openEdit}
          onDelete={setDeleting}
          onDuplicate={handleDuplicate}
          onToggleActive={handleToggleActive}
        />
      ) : (
        <CategoriesTable
          categories={data}
          selected={selected}
          onToggle={toggleSelect}
          onEdit={openEdit}
          onDelete={setDeleting}
          onDuplicate={handleDuplicate}
          onToggleActive={handleToggleActive}
        />
      )}

      {/* ─── Pagination ──────────────────────────────────── */}
      {!loading && data.length > 0 && (
        <Card>
          <Pagination
            page={page}
            totalPages={totalPages}
            total={total}
            limit={20}
            onPageChange={(p) => { setPage(p); clearSelection(); }}
          />
        </Card>
      )}

      {/* ─── Create/Edit modal ───────────────────────────── */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? `Edit "${editing.name}"` : 'Add New Category'}
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleSave} loading={saving}>
              {editing ? 'Save Changes' : 'Create Category'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="label">Category Name <span className="text-danger-500">*</span></label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="input"
              placeholder="e.g. Portland Cement"
              autoFocus
              required
            />
          </div>
          <div>
            <label className="label">Slug <span className="text-ink-400 font-normal">(auto-generated if empty)</span></label>
            <input
              type="text"
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
              className="input font-mono text-sm"
              placeholder="portland-cement"
            />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="input min-h-[80px] py-2"
              placeholder="Brief description of this category…"
              rows={3}
            />
          </div>
          <div>
            <label className="label">Image URL</label>
            <input
              type="url"
              value={form.imageUrl}
              onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
              className="input"
              placeholder="https://..."
            />
            {form.imageUrl && (
              <div className="mt-2 w-20 h-20 rounded-xl overflow-hidden bg-ink-100 ring-1 ring-ink-200">
                <img src={form.imageUrl} alt="Preview" className="w-full h-full object-cover" />
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="isActive"
              checked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              className="rounded border-ink-300 text-accent-500 focus:ring-accent-500"
            />
            <label htmlFor="isActive" className="text-sm text-ink-700 cursor-pointer">
              Active (visible to customers)
            </label>
          </div>
        </form>
      </Modal>

      {/* ─── Delete confirmation ─────────────────────────── */}
      <ConfirmDialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={handleDelete}
        title="Delete category?"
        description={`"${deleting?.name}" will be permanently removed. Products in this category will be uncategorized.`}
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
}

// ─── Mini stat card ─────────────────────────────────────────
function MiniStat({
  label, value, icon: Icon, accent,
}: {
  label: string; value: number; icon: any; accent: 'ink' | 'success' | 'warning' | 'danger' | 'accent' | 'info';
}) {
  const accentMap: any = {
    ink:     'bg-ink-100 text-ink-600',
    success: 'bg-success-subtle text-success-600',
    warning: 'bg-warning-subtle text-warning-600',
    danger:  'bg-danger-subtle text-danger-600',
    accent:  'bg-accent-50 text-accent-600',
    info:    'bg-info-subtle text-info-600',
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

// ─── Grid view ──────────────────────────────────────────────
function CategoriesGrid({
  categories, selected, onToggle, onEdit, onDelete, onDuplicate, onToggleActive,
}: {
  categories: Category[];
  selected: Set<string>;
  onToggle: (id: string) => void;
  onEdit: (c: Category) => void;
  onDelete: (c: Category) => void;
  onDuplicate: (c: Category) => void;
  onToggleActive: (c: Category) => void;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {categories.map((c) => (
        <Card
          key={c.id}
          className={clsx(
            'group/cat overflow-hidden transition-all',
            selected.has(c.id) && 'ring-2 ring-accent-500',
            c.isActive === false && 'opacity-70',
          )}
        >
          <div className="relative aspect-[16/9] bg-gradient-to-br from-accent-50 to-info-subtle overflow-hidden">
            {c.imageUrl ? (
              <img
                src={c.imageUrl}
                alt={c.name}
                className="w-full h-full object-cover group-hover/cat:scale-105 transition-transform duration-500"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <FolderTree className="w-12 h-12 text-accent-300" />
              </div>
            )}

            {/* Top-left badge */}
            <div className="absolute top-2 left-2">
              {c.isActive === false ? (
                <Badge variant="ink" dot>Inactive</Badge>
              ) : (
                <Badge variant="success" dot>Active</Badge>
              )}
            </div>

            {/* Top-right select */}
            <div className="absolute top-2 right-2">
              <input
                type="checkbox"
                checked={selected.has(c.id)}
                onChange={() => onToggle(c.id)}
                className="w-4 h-4 rounded border-white/40 text-accent-500 focus:ring-accent-500"
                aria-label={`Select ${c.name}`}
              />
            </div>
          </div>

          <div className="p-4">
            <h3 className="font-semibold text-ink-900 truncate">{c.name}</h3>
            <p className="text-2xs text-ink-500 mt-0.5 line-clamp-2 min-h-[2rem]">
              {c.description || 'No description'}
            </p>

            <div className="mt-3 pt-3 border-t border-ink-100 flex items-center justify-between gap-2">
              <div className="text-2xs text-ink-500">
                <span className="font-mono">{c.slug}</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  className="w-7 h-7 rounded-md text-ink-500 hover:bg-ink-100 hover:text-ink-900 flex items-center justify-center"
                  onClick={() => onEdit(c)}
                  title="Edit"
                >
                  <Edit className="w-3.5 h-3.5" />
                </button>
                <button
                  className="w-7 h-7 rounded-md text-ink-500 hover:bg-ink-100 hover:text-ink-900 flex items-center justify-center"
                  onClick={() => onToggleActive(c)}
                  title={c.isActive !== false ? 'Deactivate' : 'Activate'}
                >
                  {c.isActive !== false ? <XCircle className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                </button>
                <button
                  className="w-7 h-7 rounded-md text-danger-600 hover:bg-danger-50 flex items-center justify-center"
                  onClick={() => onDelete(c)}
                  title="Delete"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

// ─── Table view ─────────────────────────────────────────────
function CategoriesTable({
  categories, selected, onToggle, onEdit, onDelete, onDuplicate, onToggleActive,
}: any) {
  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto scroll-thin">
        <table className="w-full text-sm">
          <thead className="bg-ink-50/80 border-b border-ink-200">
            <tr>
              <th className="w-10 px-4 py-3"></th>
              <th className="px-4 py-3 text-left text-2xs font-bold text-ink-500 uppercase tracking-wider">Category</th>
              <th className="px-4 py-3 text-left text-2xs font-bold text-ink-500 uppercase tracking-wider">Slug</th>
              <th className="px-4 py-3 text-left text-2xs font-bold text-ink-500 uppercase tracking-wider">Description</th>
              <th className="px-4 py-3 text-left text-2xs font-bold text-ink-500 uppercase tracking-wider">Status</th>
              <th className="px-4 py-3 text-left text-2xs font-bold text-ink-500 uppercase tracking-wider">Updated</th>
              <th className="w-10 px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-100">
            {categories.map((c: Category) => (
              <tr
                key={c.id}
                className={clsx(
                  'transition-colors',
                  selected.has(c.id) ? 'bg-accent-50/50' : 'hover:bg-ink-50/60',
                )}
              >
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selected.has(c.id)}
                    onChange={() => onToggle(c.id)}
                    className="rounded border-ink-300 text-accent-500 focus:ring-accent-500"
                  />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-ink-100 overflow-hidden flex-shrink-0">
                      {c.imageUrl ? (
                        <img src={c.imageUrl} alt={c.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <FolderTree className="w-4 h-4 text-ink-400" />
                        </div>
                      )}
                    </div>
                    <span className="font-semibold text-ink-900">{c.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="font-mono text-xs text-ink-600">{c.slug}</span>
                </td>
                <td className="px-4 py-3">
                  <p className="text-ink-600 line-clamp-1 max-w-xs">
                    {c.description || <span className="text-ink-400">—</span>}
                  </p>
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => onToggleActive(c)}>
                    {c.isActive === false ? (
                      <Badge variant="ink" dot>Inactive</Badge>
                    ) : (
                      <Badge variant="success" dot>Active</Badge>
                    )}
                  </button>
                </td>
                <td className="px-4 py-3">
                  <span className="text-2xs text-ink-500">{relativeTime((c as any).updatedAt || new Date().toISOString())}</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onEdit(c)}
                      className="w-7 h-7 rounded-md text-ink-500 hover:bg-ink-100 hover:text-ink-900 flex items-center justify-center"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDelete(c)}
                      className="w-7 h-7 rounded-md text-danger-600 hover:bg-danger-50 flex items-center justify-center"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

// Avoid unused imports
void Skeleton;
void Copy;
void productService;
void Tag;
void formatDate;
