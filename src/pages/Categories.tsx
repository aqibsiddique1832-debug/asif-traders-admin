// ────────────────────────────────────────────────────────────
// Categories — List + Add + Edit + Delete
// ────────────────────────────────────────────────────────────

import { useEffect, useState } from 'react';
import { categoryService } from '../lib/services';
import { Modal, FullPageLoader, EmptyState, Pagination } from '../components/ui/StatCard';
import { Plus, Edit2, Trash2, Search, FolderTree, Image as ImageIcon } from 'lucide-react';
import { formatDate } from '../lib/auth';
import type { Category } from '../types';
import toast from 'react-hot-toast';

export default function Categories() {
  const [data, setData] = useState<Category[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const load = async (page = 1, searchTerm = search) => {
    setLoading(true);
    try {
      const res = await categoryService.list({ page, limit: 20, search: searchTerm });
      setData(res.data);
      setPagination(res.pagination);
    } catch {
      // interceptor handles errors
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    load(1, search);
  };

  const handleSave = async (formData: Partial<Category>) => {
    try {
      if (editing) {
        await categoryService.update(editing.id, formData);
        toast.success('Category updated');
      } else {
        await categoryService.create(formData);
        toast.success('Category created');
      }
      setModalOpen(false);
      setEditing(null);
      load(pagination.page);
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || 'Failed to save category');
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await categoryService.remove(deleteId);
      toast.success('Category deleted');
      setDeleteId(null);
      load(pagination.page);
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || 'Failed to delete');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Categories</h1>
          <p className="text-sm text-secondary-500 mt-1">{pagination.total} categories</p>
        </div>
        <button
          onClick={() => { setEditing(null); setModalOpen(true); }}
          className="btn-primary"
        >
          <Plus className="w-4 h-4" /> Add Category
        </button>
      </div>

      <div className="card p-4">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-10"
              placeholder="Search categories..."
            />
          </div>
          <button type="submit" className="btn-secondary">Search</button>
        </form>
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <FullPageLoader />
        ) : data.length === 0 ? (
          <EmptyState
            title="No categories found"
            description={search ? 'Try a different search term' : 'Add your first category to get started'}
            icon={FolderTree}
            action={
              !search && (
                <button onClick={() => setModalOpen(true)} className="btn-primary">
                  <Plus className="w-4 h-4" /> Add Category
                </button>
              )
            }
          />
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-secondary-50 border-b border-secondary-200">
                  <tr>
                    <th className="text-left text-xs font-semibold text-secondary-600 px-4 py-3">Category</th>
                    <th className="text-left text-xs font-semibold text-secondary-600 px-4 py-3">Slug</th>
                    <th className="text-left text-xs font-semibold text-secondary-600 px-4 py-3">Products</th>
                    <th className="text-left text-xs font-semibold text-secondary-600 px-4 py-3">Status</th>
                    <th className="text-left text-xs font-semibold text-secondary-600 px-4 py-3">Created</th>
                    <th className="text-right text-xs font-semibold text-secondary-600 px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-secondary-200">
                  {data.map((cat) => (
                    <tr key={cat.id} className="table-row">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {cat.imageUrl ? (
                            <img src={cat.imageUrl} alt={cat.name} className="w-10 h-10 rounded-lg object-cover" />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-secondary-100 flex items-center justify-center">
                              <ImageIcon className="w-5 h-5 text-secondary-400" />
                            </div>
                          )}
                          <div>
                            <div className="font-medium text-secondary-900">{cat.name}</div>
                            {cat.description && (
                              <div className="text-xs text-secondary-500 truncate max-w-xs">{cat.description}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-secondary-600 font-mono">{cat.slug}</td>
                      <td className="px-4 py-3 text-sm text-secondary-700">
                        {cat._count?.products ?? 0}
                      </td>
                      <td className="px-4 py-3">
                        <span className={cat.isActive ? 'badge badge-success' : 'badge badge-secondary'}>
                          {cat.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-secondary-500">{formatDate(cat.createdAt)}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => { setEditing(cat); setModalOpen(true); }}
                            className="p-1.5 text-secondary-500 hover:text-primary hover:bg-primary-50 rounded"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteId(cat.id)}
                            className="p-1.5 text-secondary-500 hover:text-danger hover:bg-danger-light rounded"
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
            <div className="md:hidden divide-y divide-secondary-200">
              {data.map((cat) => (
                <div key={cat.id} className="p-4">
                  <div className="flex items-start gap-3">
                    {cat.imageUrl ? (
                      <img src={cat.imageUrl} alt={cat.name} className="w-12 h-12 rounded-lg object-cover" />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-secondary-100 flex items-center justify-center">
                        <ImageIcon className="w-5 h-5 text-secondary-400" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="font-medium text-secondary-900">{cat.name}</div>
                          <div className="text-xs text-secondary-500 font-mono">{cat.slug}</div>
                        </div>
                        <span className={cat.isActive ? 'badge badge-success' : 'badge badge-secondary'}>
                          {cat.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <div className="mt-2 text-xs text-secondary-500">
                        {cat._count?.products ?? 0} products · {formatDate(cat.createdAt)}
                      </div>
                      <div className="mt-2 flex items-center gap-1">
                        <button
                          onClick={() => { setEditing(cat); setModalOpen(true); }}
                          className="btn btn-secondary btn-sm"
                        >
                          <Edit2 className="w-3 h-3" /> Edit
                        </button>
                        <button
                          onClick={() => setDeleteId(cat.id)}
                          className="btn btn-sm text-danger hover:bg-danger-light"
                        >
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

      <CategoryFormModal
        open={modalOpen}
        category={editing}
        onClose={() => { setModalOpen(false); setEditing(null); }}
        onSave={handleSave}
      />

      <Modal
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        title="Delete Category"
        footer={
          <>
            <button onClick={() => setDeleteId(null)} className="btn-secondary">Cancel</button>
            <button onClick={handleDelete} className="btn-danger">Delete</button>
          </>
        }
      >
        <p className="text-sm text-secondary-600">
          Are you sure you want to delete this category? This action cannot be undone.
        </p>
      </Modal>
    </div>
  );
}

function CategoryFormModal({
  open, onClose, onSave, category,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (data: Partial<Category>) => void;
  category: Category | null;
}) {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [sortOrder, setSortOrder] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');

  useEffect(() => {
    if (category) {
      setName(category.name);
      setSlug(category.slug);
      setDescription(category.description || '');
      setImageUrl(category.imageUrl || '');
      setSortOrder(category.sortOrder);
      setIsActive(category.isActive);
      setMetaTitle(category.metaTitle || '');
      setMetaDescription(category.metaDescription || '');
    } else {
      setName(''); setSlug(''); setDescription(''); setImageUrl(''); setSortOrder(0); setIsActive(true); setMetaTitle(''); setMetaDescription('');
    }
  }, [category, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ name, slug: slug || undefined, description, imageUrl: imageUrl || undefined, sortOrder, isActive, metaTitle, metaDescription });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={category ? 'Edit Category' : 'Add Category'}
      size="lg"
      footer={
        <>
          <button onClick={onClose} className="btn-secondary">Cancel</button>
          <button type="submit" form="category-form" className="btn-primary">
            {category ? 'Update' : 'Create'}
          </button>
        </>
      }
    >
      <form id="category-form" onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1.5">Name *</label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input"
              placeholder="e.g. Cement Sheets"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1.5">Slug</label>
            <input
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="input"
              placeholder="auto-generated from name"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-1.5">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="input min-h-[80px]"
            placeholder="Brief description"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1.5">Image URL</label>
            <input
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="input"
              placeholder="https://..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1.5">Sort Order</label>
            <input
              type="number"
              value={sortOrder}
              onChange={(e) => setSortOrder(parseInt(e.target.value, 10) || 0)}
              className="input"
              min={0}
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <input
            id="isActive"
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="w-4 h-4 text-primary border-secondary-300 rounded focus:ring-primary"
          />
          <label htmlFor="isActive" className="text-sm text-secondary-700">Active (visible on site)</label>
        </div>
        <details className="border-t border-secondary-200 pt-3">
          <summary className="text-sm font-medium text-secondary-700 cursor-pointer">SEO (optional)</summary>
          <div className="space-y-3 mt-3">
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1.5">Meta Title</label>
              <input value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} className="input" />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1.5">Meta Description</label>
              <textarea value={metaDescription} onChange={(e) => setMetaDescription(e.target.value)} className="input" />
            </div>
          </div>
        </details>
      </form>
    </Modal>
  );
}
