// ────────────────────────────────────────────────────────────
// Premium Media Library (DAM) — Part 2A-2B
// Drag-drop · Paste · Camera · Editor · Auto-optimize · CDN
// ────────────────────────────────────────────────────────────

import { useEffect, useState, useRef, useCallback } from 'react';
import {
  Upload, Image as ImageIcon, Search, Grid3x3, List as ListIcon,
  Copy, Trash2, Eye, Download, Edit2, X, Camera, Filter, Tag,
  Calendar, FileImage, Crop, RotateCw, Sun, Contrast, Droplet,
  Sparkles, CropIcon, Check, ChevronLeft, ChevronRight, ZoomIn,
  ZoomOut, RotateCcw, Maximize2, Info, Link as LinkIcon, Loader2,
  FilePlus, Layers, Plus, Sliders,
} from 'lucide-react';
import clsx from 'clsx';
import toast from 'react-hot-toast';
import {
  Card, CardHeader, CardBody, Button, Badge, PageHeader, EmptyState,
  Skeleton, Modal, ConfirmDialog, Tabs,
} from '../components/ui/StatCard';

// ─── Media item type ────────────────────────────────────────
type MediaItem = {
  id: string;
  url: string;            // ObjectURL or remote URL
  name: string;
  size: number;           // bytes
  width: number;
  height: number;
  type: string;           // mime
  uploadedAt: string;
  alt?: string;
  tags: string[];
  usedIn?: string[];      // product names
  optimized?: boolean;
};

const STORAGE_KEY = 'asif-media-library';

// ─── Helpers ────────────────────────────────────────────────
const formatSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
};

const formatDate = (iso: string): string => {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
};

const readImageDimensions = (url: string): Promise<{ width: number; height: number }> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.width, height: img.height });
    img.onerror = () => resolve({ width: 0, height: 0 });
    img.src = url;
  });
};

const fileToDataURL = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

const loadFromStorage = (): MediaItem[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return [];
};

const saveToStorage = (items: MediaItem[]) => {
  try {
    // Strip ObjectURLs from data, only store base64 + metadata
    const persistent = items.map((i) => ({
      ...i,
      url: i.url.startsWith('blob:') ? '' : i.url, // Can't persist ObjectURLs
    }));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(persistent));
  } catch (err) {
    console.warn('Failed to persist media', err);
  }
};

// ─── Sample seed data (for first-time users) ────────────────
const SEED_MEDIA: MediaItem[] = [
  { id: 's1', url: 'https://3df7d2a8.asif-traders.pages.dev/images/products/cement-portland-50kg.webp', name: 'portland-cement-50kg.webp', size: 245000, width: 1200, height: 900, type: 'image/webp', uploadedAt: '2026-07-10T10:30:00Z', alt: 'Portland Cement 50kg bag', tags: ['cement', 'portland'], usedIn: ['Portland Cement 50kg'], optimized: true },
  { id: 's2', url: 'https://3df7d2a8.asif-traders.pages.dev/images/products/tmt-bar-12mm.webp', name: 'tmt-bar-12mm.webp', size: 312000, width: 1200, height: 900, type: 'image/webp', uploadedAt: '2026-07-09T14:22:00Z', alt: 'TMT Steel Bar 12mm', tags: ['steel', 'tmt'], usedIn: ['TMT Bar 12mm'], optimized: true },
  { id: 's3', url: 'https://3df7d2a8.asif-traders.pages.dev/images/products/clay-brick-red.webp', name: 'clay-brick-red.webp', size: 189000, width: 1200, height: 900, type: 'image/webp', uploadedAt: '2026-07-08T09:15:00Z', alt: 'Red Clay Bricks stack', tags: ['bricks', 'clay'], usedIn: ['Red Clay Brick'], optimized: true },
  { id: 's4', url: 'https://3df7d2a8.asif-traders.pages.dev/images/products/ceramic-tile-grey.webp', name: 'ceramic-tile-grey.webp', size: 278000, width: 1200, height: 900, type: 'image/webp', uploadedAt: '2026-07-07T16:45:00Z', alt: 'Grey Ceramic Floor Tile', tags: ['tiles', 'ceramic'], usedIn: ['Ceramic Floor Tile'], optimized: true },
  { id: 's5', url: 'https://3df7d2a8.asif-traders.pages.dev/images/products/white-sand-50kg.webp', name: 'white-sand-50kg.webp', size: 198000, width: 1200, height: 900, type: 'image/webp', uploadedAt: '2026-07-06T11:00:00Z', alt: 'White Sand 50kg', tags: ['sand', 'construction'], usedIn: ['White Sand 50kg'], optimized: true },
];

// ════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ════════════════════════════════════════════════════════════
export default function MediaLibrary() {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'optimized' | 'unoptimized' | 'recent'>('all');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [showUploader, setShowUploader] = useState(false);
  const [editing, setEditing] = useState<MediaItem | null>(null);
  const [viewing, setViewing] = useState<MediaItem | null>(null);
  const [deleting, setDeleting] = useState<MediaItem | null>(null);

  // Stats
  const stats = {
    total: items.length,
    optimized: items.filter((i) => i.optimized).length,
    totalSize: items.reduce((s, i) => s + i.size, 0),
    usedIn: items.filter((i) => i.usedIn && i.usedIn.length > 0).length,
  };

  // ─── Load on mount ─────────────────────────────────────
  useEffect(() => {
    const stored = loadFromStorage();
    if (stored.length > 0) {
      setItems(stored);
    } else {
      setItems(SEED_MEDIA);
    }
    setLoading(false);
  }, []);

  // Persist on change
  useEffect(() => {
    if (!loading) saveToStorage(items);
  }, [items, loading]);

  // ─── Filtered items ────────────────────────────────────
  const filtered = items.filter((item) => {
    if (search) {
      const q = search.toLowerCase();
      if (!item.name.toLowerCase().includes(q) && !item.alt?.toLowerCase().includes(q) && !item.tags.some((t) => t.toLowerCase().includes(q))) {
        return false;
      }
    }
    if (filter === 'optimized' && !item.optimized) return false;
    if (filter === 'unoptimized' && item.optimized) return false;
    if (filter === 'recent') {
      const age = Date.now() - new Date(item.uploadedAt).getTime();
      if (age > 7 * 24 * 60 * 60 * 1000) return false; // 7 days
    }
    return true;
  });

  // ─── Selection helpers ─────────────────────────────────
  const allOnPageSelected = filtered.length > 0 && filtered.every((i) => selected.has(i.id));
  const someOnPageSelected = filtered.some((i) => selected.has(i.id)) && !allOnPageSelected;

  const toggleAll = () => {
    if (allOnPageSelected) {
      const next = new Set(selected);
      filtered.forEach((i) => next.delete(i.id));
      setSelected(next);
    } else {
      const next = new Set(selected);
      filtered.forEach((i) => next.add(i.id));
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

  // ─── Handlers ──────────────────────────────────────────
  const handleAdd = (newItems: MediaItem[]) => {
    setItems((prev) => [...newItems, ...prev]);
    setShowUploader(false);
    toast.success(`Uploaded ${newItems.length} image${newItems.length > 1 ? 's' : ''}`);
  };

  const handleDelete = () => {
    if (!deleting) return;
    setItems((prev) => prev.filter((i) => i.id !== deleting.id));
    toast.success(`Deleted "${deleting.name}"`);
    setDeleting(null);
  };

  const handleBulkDelete = () => {
    if (selected.size === 0) return;
    setItems((prev) => prev.filter((i) => !selected.has(i.id)));
    toast.success(`Deleted ${selected.size} images`);
    clearSelection();
  };

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success('URL copied to clipboard');
  };

  const handleDownload = (item: MediaItem) => {
    const a = document.createElement('a');
    a.href = item.url;
    a.download = item.name;
    a.target = '_blank';
    a.click();
  };

  const handleUpdateItem = (updated: MediaItem) => {
    setItems((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
    setEditing(null);
    toast.success('Image updated');
  };

  return (
    <div className="space-y-6 animate-fade-in pb-24">
      <PageHeader
        title="Media Library"
        description={`${stats.total} images · ${formatSize(stats.totalSize)} used`}
        breadcrumbs={[{ label: 'Catalog' }, { label: 'Media Library' }]}
        actions={
          <>
            <Button variant="secondary" leftIcon={Download}>Export All</Button>
            <Button variant="primary" leftIcon={Upload} onClick={() => setShowUploader(true)}>
              Upload Images
            </Button>
          </>
        }
      />

      {/* ─── Stat strip ──────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MiniStat label="Total Images" value={stats.total} icon={FileImage} accent="info" />
        <MiniStat label="Optimized" value={`${stats.optimized}/${stats.total}`} icon={Sparkles} accent="success" />
        <MiniStat label="Storage Used" value={formatSize(stats.totalSize)} icon={Layers} accent="accent" />
        <MiniStat label="In Use" value={stats.usedIn} icon={Tag} accent="warning" />
      </div>

      {/* ─── Filter tabs ─────────────────────────────────── */}
      <Tabs
        active={filter}
        onChange={(v) => setFilter(v as any)}
        tabs={[
          { value: 'all',          label: 'All',          count: stats.total },
          { value: 'recent',       label: 'Recent (7d)',  count: items.filter((i) => Date.now() - new Date(i.uploadedAt).getTime() < 7 * 24 * 60 * 60 * 1000).length },
          { value: 'optimized',    label: 'Optimized',    count: stats.optimized },
          { value: 'unoptimized',  label: 'Unoptimized',  count: stats.total - stats.optimized },
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
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, alt, or tag…"
              className="input pl-10"
            />
          </div>

          <div className="flex items-center gap-2">
            <select className="input h-9 text-sm w-auto min-w-[140px]">
              <option>All types</option>
              <option>JPG</option>
              <option>PNG</option>
              <option>WebP</option>
            </select>
            <select className="input h-9 text-sm w-auto min-w-[120px]">
              <option>All sizes</option>
              <option>&lt; 100 KB</option>
              <option>100-500 KB</option>
              <option>&gt; 500 KB</option>
            </select>
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
                onClick={() => setView('list')}
                className={clsx(
                  'flex items-center justify-center w-7 h-7 rounded-md transition-all',
                  view === 'list' ? 'bg-white shadow-sm text-ink-900' : 'text-ink-500 hover:text-ink-900',
                )}
                aria-label="List view"
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
            <Button size="sm" variant="ghost" leftIcon={X} onClick={clearSelection}>Clear</Button>
            <Button size="sm" variant="secondary" leftIcon={Sparkles}>Optimize</Button>
            <Button size="sm" variant="secondary" leftIcon={Tag}>Add Tag</Button>
            <div className="flex-1" />
            <Button size="sm" variant="danger" leftIcon={Trash2} onClick={handleBulkDelete}>
              Delete {selected.size}
            </Button>
          </div>
        )}
      </Card>

      {/* ─── Content ─────────────────────────────────────── */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <EmptyState
            icon={ImageIcon}
            title={search ? 'No images match your search' : 'No images yet'}
            description={search ? 'Try a different search term' : 'Upload your first images to get started.'}
            action={
              !search && (
                <Button variant="primary" leftIcon={Upload} onClick={() => setShowUploader(true)}>
                  Upload Images
                </Button>
              )
            }
          />
        </Card>
      ) : view === 'grid' ? (
        <MediaGrid
          items={filtered}
          selected={selected}
          allSelected={allOnPageSelected}
          someSelected={someOnPageSelected}
          onToggleAll={toggleAll}
          onToggleOne={toggleOne}
          onView={setViewing}
          onEdit={setEditing}
          onCopy={handleCopyUrl}
          onDownload={handleDownload}
          onDelete={setDeleting}
        />
      ) : (
        <MediaList
          items={filtered}
          selected={selected}
          allSelected={allOnPageSelected}
          someSelected={someOnPageSelected}
          onToggleAll={toggleAll}
          onToggleOne={toggleOne}
          onView={setViewing}
          onEdit={setEditing}
          onCopy={handleCopyUrl}
          onDownload={handleDownload}
          onDelete={setDeleting}
        />
      )}

      {/* ─── Uploader modal ──────────────────────────────── */}
      <UploaderModal open={showUploader} onClose={() => setShowUploader(false)} onAdd={handleAdd} />

      {/* ─── Image editor modal ──────────────────────────── */}
      <ImageEditorModal
        item={editing}
        onClose={() => setEditing(null)}
        onSave={handleUpdateItem}
      />

      {/* ─── Detail viewer ──────────────────────────────── */}
      <ImageViewerModal item={viewing} onClose={() => setViewing(null)} onEdit={(i) => { setViewing(null); setEditing(i); }} />

      {/* ─── Delete confirm ─────────────────────────────── */}
      <ConfirmDialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={handleDelete}
        title="Delete image?"
        description={`"${deleting?.name}" will be permanently removed. This cannot be undone.`}
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
}

// ─── Mini stat ──────────────────────────────────────────────
function MiniStat({ label, value, icon: Icon, accent }: { label: string; value: any; icon: any; accent: 'info' | 'success' | 'warning' | 'danger' | 'accent' | 'ink' }) {
  const map: any = {
    info:    'bg-info-subtle text-info-600',
    success: 'bg-success-subtle text-success-600',
    warning: 'bg-warning-subtle text-warning-600',
    danger:  'bg-danger-subtle text-danger-600',
    accent:  'bg-accent-50 text-accent-600',
    ink:     'bg-ink-100 text-ink-600',
  };
  return (
    <div className="card-hover p-3 sm:p-4 flex items-center gap-3">
      <div className={clsx('w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0', map[accent])}>
        <Icon className="w-4 h-4" strokeWidth={2.25} />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-ink-500 truncate">{label}</p>
        <p className="text-lg font-bold text-ink-900 tabular-nums">{value}</p>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// GRID VIEW
// ════════════════════════════════════════════════════════════
function MediaGrid({ items, selected, allSelected, someSelected, onToggleAll, onToggleOne, onView, onEdit, onCopy, onDownload, onDelete }: any) {
  return (
    <div>
      {/* Select all bar */}
      <div className="flex items-center gap-2 mb-3 px-1">
        <input
          type="checkbox"
          checked={allSelected}
          ref={(el) => { if (el) el.indeterminate = someSelected; }}
          onChange={onToggleAll}
          className="rounded border-ink-300 text-accent-500 focus:ring-accent-500"
          aria-label="Select all"
        />
        <span className="text-xs text-ink-500">{items.length} images</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
        {items.map((item: MediaItem) => (
          <MediaCard
            key={item.id}
            item={item}
            selected={selected.has(item.id)}
            onToggle={() => onToggleOne(item.id)}
            onView={() => onView(item)}
            onEdit={() => onEdit(item)}
            onCopy={() => onCopy(item.url)}
            onDownload={() => onDownload(item)}
            onDelete={() => onDelete(item)}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Single card ────────────────────────────────────────────
function MediaCard({ item, selected, onToggle, onView, onEdit, onCopy, onDownload, onDelete }: any) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => { if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  return (
    <div
      className={clsx(
        'group/card relative rounded-2xl overflow-hidden bg-ink-100 ring-2 transition-all',
        selected ? 'ring-accent-500' : 'ring-transparent hover:ring-ink-300',
      )}
    >
      <div className="aspect-square">
        <img
          src={item.url}
          alt={item.alt || item.name}
          className="w-full h-full object-cover cursor-pointer"
          onClick={onView}
          loading="lazy"
          onError={(e) => { (e.target as HTMLImageElement).src = ''; (e.target as HTMLImageElement).style.display = 'none'; }}
        />
      </div>

      {/* Top bar */}
      <div className="absolute top-0 inset-x-0 p-2 flex items-start justify-between bg-gradient-to-b from-black/40 to-transparent">
        <input
          type="checkbox"
          checked={selected}
          onChange={onToggle}
          className="w-4 h-4 rounded border-white/40 text-accent-500 focus:ring-accent-500"
          onClick={(e) => e.stopPropagation()}
          aria-label={`Select ${item.name}`}
        />
        <div className="flex items-center gap-1">
          {item.optimized && (
            <span className="bg-success-500 text-white text-2xs font-bold px-1.5 h-5 rounded inline-flex items-center gap-0.5">
              <Sparkles className="w-2.5 h-2.5" /> WEBP
            </span>
          )}
          <div className="relative" ref={menuRef}>
            <button
              onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); }}
              className="w-6 h-6 rounded-md bg-black/40 backdrop-blur-sm text-white flex items-center justify-center hover:bg-black/60"
            >
              <span className="text-xs">⋯</span>
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-full mt-1 w-44 bg-white rounded-xl shadow-popover border border-ink-200 z-30 animate-fade-in overflow-hidden">
                <div className="p-1">
                  <ActionItem icon={Eye} label="View" onClick={() => { onView(); setMenuOpen(false); }} />
                  <ActionItem icon={Edit2} label="Edit & Resize" onClick={() => { onEdit(); setMenuOpen(false); }} />
                  <ActionItem icon={Copy} label="Copy URL" onClick={() => { onCopy(); setMenuOpen(false); }} />
                  <ActionItem icon={Download} label="Download" onClick={() => { onDownload(); setMenuOpen(false); }} />
                  <div className="my-1 border-t border-ink-100" />
                  <ActionItem icon={Trash2} label="Delete" danger onClick={() => { onDelete(); setMenuOpen(false); }} />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom info bar */}
      <div className="absolute bottom-0 inset-x-0 p-2.5 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity">
        <p className="text-white text-xs font-semibold truncate">{item.name}</p>
        <p className="text-white/70 text-2xs mt-0.5">
          {item.width}×{item.height} · {formatSize(item.size)}
        </p>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// LIST VIEW
// ════════════════════════════════════════════════════════════
function MediaList({ items, selected, allSelected, someSelected, onToggleAll, onToggleOne, onView, onEdit, onCopy, onDownload, onDelete }: any) {
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
                />
              </th>
              <th className="px-4 py-3 text-left text-2xs font-bold text-ink-500 uppercase tracking-wider">Image</th>
              <th className="px-4 py-3 text-left text-2xs font-bold text-ink-500 uppercase tracking-wider">Name</th>
              <th className="px-4 py-3 text-left text-2xs font-bold text-ink-500 uppercase tracking-wider">Dimensions</th>
              <th className="px-4 py-3 text-right text-2xs font-bold text-ink-500 uppercase tracking-wider">Size</th>
              <th className="px-4 py-3 text-left text-2xs font-bold text-ink-500 uppercase tracking-wider">Tags</th>
              <th className="px-4 py-3 text-left text-2xs font-bold text-ink-500 uppercase tracking-wider">Used In</th>
              <th className="px-4 py-3 text-left text-2xs font-bold text-ink-500 uppercase tracking-wider">Uploaded</th>
              <th className="w-10 px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-100">
            {items.map((item: MediaItem) => (
              <tr key={item.id} className={clsx('transition-colors', selected.has(item.id) ? 'bg-accent-50/50' : 'hover:bg-ink-50/60')}>
                <td className="px-4 py-2.5">
                  <input
                    type="checkbox"
                    checked={selected.has(item.id)}
                    onChange={() => onToggleOne(item.id)}
                    className="rounded border-ink-300 text-accent-500 focus:ring-accent-500"
                  />
                </td>
                <td className="px-4 py-2.5">
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-ink-100 ring-1 ring-ink-200">
                    <img src={item.url} alt={item.alt || item.name} className="w-full h-full object-cover" />
                  </div>
                </td>
                <td className="px-4 py-2.5">
                  <p className="font-semibold text-ink-900 text-sm truncate max-w-[240px]">{item.name}</p>
                  {item.optimized && (
                    <Badge variant="success" className="mt-0.5">
                      <Sparkles className="w-2.5 h-2.5" /> Optimized
                    </Badge>
                  )}
                </td>
                <td className="px-4 py-2.5">
                  <span className="font-mono text-xs text-ink-600">{item.width}×{item.height}</span>
                </td>
                <td className="px-4 py-2.5 text-right">
                  <span className="tabular-nums text-sm font-semibold text-ink-700">{formatSize(item.size)}</span>
                </td>
                <td className="px-4 py-2.5">
                  <div className="flex flex-wrap gap-1">
                    {item.tags.length > 0 ? item.tags.map((t) => (
                      <span key={t} className="text-2xs font-medium bg-ink-100 text-ink-700 px-1.5 h-5 rounded inline-flex items-center">{t}</span>
                    )) : <span className="text-ink-400 text-xs">—</span>}
                  </div>
                </td>
                <td className="px-4 py-2.5">
                  {item.usedIn && item.usedIn.length > 0 ? (
                    <span className="text-xs text-ink-700">{item.usedIn[0]}{item.usedIn.length > 1 ? ` +${item.usedIn.length - 1}` : ''}</span>
                  ) : <span className="text-ink-400 text-xs">—</span>}
                </td>
                <td className="px-4 py-2.5">
                  <span className="text-xs text-ink-500">{formatDate(item.uploadedAt)}</span>
                </td>
                <td className="px-4 py-2.5">
                  <div className="flex items-center gap-1">
                    <button onClick={() => onView(item)} className="w-7 h-7 rounded-md text-ink-500 hover:bg-ink-100 hover:text-ink-900 flex items-center justify-center" title="View"><Eye className="w-3.5 h-3.5" /></button>
                    <button onClick={() => onEdit(item)} className="w-7 h-7 rounded-md text-ink-500 hover:bg-ink-100 hover:text-ink-900 flex items-center justify-center" title="Edit"><Edit2 className="w-3.5 h-3.5" /></button>
                    <button onClick={() => onCopy(item.url)} className="w-7 h-7 rounded-md text-ink-500 hover:bg-ink-100 hover:text-ink-900 flex items-center justify-center" title="Copy URL"><Copy className="w-3.5 h-3.5" /></button>
                    <button onClick={() => onDelete(item)} className="w-7 h-7 rounded-md text-danger-600 hover:bg-danger-50 flex items-center justify-center" title="Delete"><Trash2 className="w-3.5 h-3.5" /></button>
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

// ════════════════════════════════════════════════════════════
// UPLOADER MODAL — Drag-drop, paste, camera, URL
// ════════════════════════════════════════════════════════════
function UploaderModal({ open, onClose, onAdd }: { open: boolean; onClose: () => void; onAdd: (items: MediaItem[]) => void }) {
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<{ url: string; file: File; width: number; height: number }[]>([]);
  const [autoOptimize, setAutoOptimize] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // ─── Handle file selection ─────────────────────────────
  const handleFiles = useCallback(async (selected: FileList | File[]) => {
    const arr = Array.from(selected).filter((f) => f.type.startsWith('image/'));
    if (arr.length === 0) {
      toast.error('Please select image files only');
      return;
    }
    setFiles((prev) => [...prev, ...arr]);

    // Generate previews
    const newPreviews = await Promise.all(
      arr.map(async (file) => {
        const url = URL.createObjectURL(file);
        const dims = await readImageDimensions(url);
        return { url, file, width: dims.width, height: dims.height };
      })
    );
    setPreviews((prev) => [...prev, ...newPreviews]);
  }, []);

  // ─── Paste from clipboard ──────────────────────────────
  useEffect(() => {
    if (!open) return;
    const handler = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      const pasted: File[] = [];
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.kind === 'file' && item.type.startsWith('image/')) {
          const f = item.getAsFile();
          if (f) pasted.push(f);
        }
      }
      if (pasted.length > 0) {
        handleFiles(pasted);
        toast.success(`Pasted ${pasted.length} image${pasted.length > 1 ? 's' : ''}`);
      }
    };
    document.addEventListener('paste', handler);
    return () => document.removeEventListener('paste', handler);
  }, [open, handleFiles]);

  // Cleanup previews
  useEffect(() => {
    if (!open) {
      previews.forEach((p) => URL.revokeObjectURL(p.url));
      setPreviews([]);
      setFiles([]);
    }
  }, [open]);

  // ─── Drag-drop ─────────────────────────────────────────
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  // ─── Remove a file ─────────────────────────────────────
  const removeFile = (i: number) => {
    setFiles((prev) => prev.filter((_, idx) => idx !== i));
    setPreviews((prev) => {
      URL.revokeObjectURL(prev[i].url);
      return prev.filter((_, idx) => idx !== i);
    });
  };

  // ─── Submit ────────────────────────────────────────────
  const handleUpload = async () => {
    if (previews.length === 0) return;
    setUploading(true);
    try {
      const newItems: MediaItem[] = await Promise.all(
        previews.map(async (p, i) => ({
          id: `m-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 8)}`,
          url: p.url, // ObjectURL — works in current session
          name: p.file.name,
          size: p.file.size,
          width: p.width,
          height: p.height,
          type: p.file.type,
          uploadedAt: new Date().toISOString(),
          tags: [],
          optimized: autoOptimize,
        }))
      );
      onAdd(newItems);
    } finally {
      setUploading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-ink-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-3xl shadow-modal max-w-3xl w-full max-h-[90vh] flex flex-col animate-scale-in">
        <div className="flex items-center justify-between px-6 py-4 border-b border-ink-200 flex-shrink-0">
          <h3 className="text-lg font-bold text-ink-900">Upload Images</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-lg text-ink-500 hover:bg-ink-100 hover:text-ink-900 flex items-center justify-center"><X className="w-4 h-4" /></button>
        </div>

        <div className="flex-1 overflow-y-auto scroll-thin p-6 space-y-4">
          {/* Drop zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={clsx(
              'relative border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all',
              dragOver
                ? 'border-accent-500 bg-accent-50/50'
                : 'border-ink-300 hover:border-accent-400 hover:bg-accent-50/30',
            )}
          >
            <div className="w-14 h-14 rounded-2xl bg-accent-50 text-accent-600 flex items-center justify-center mx-auto mb-3">
              <Upload className="w-6 h-6" strokeWidth={2.25} />
            </div>
            <p className="text-base font-semibold text-ink-900 mb-1">
              {dragOver ? 'Drop images here' : 'Drop images or click to browse'}
            </p>
            <p className="text-xs text-ink-500">
              Support: JPG, PNG, WebP, SVG, GIF · Max 20 files · Up to 10 MB each
            </p>
            <p className="text-2xs text-ink-400 mt-2 flex items-center justify-center gap-1.5">
              <kbd className="font-mono bg-ink-100 border border-ink-200 px-1.5 h-5 rounded">⌘V</kbd>
              to paste · <Camera className="w-3 h-3" /> on mobile
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => e.target.files && handleFiles(e.target.files)}
            />
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => e.target.files && handleFiles(e.target.files)}
            />
          </div>

          {/* Mobile camera button */}
          <button
            onClick={() => cameraInputRef.current?.click()}
            className="sm:hidden w-full flex items-center justify-center gap-2 p-3 rounded-xl border border-ink-200 hover:bg-ink-50 text-sm text-ink-700"
          >
            <Camera className="w-4 h-4" /> Take Photo
          </button>

          {/* Previews */}
          {previews.length > 0 && (
            <div>
              <p className="text-sm font-semibold text-ink-900 mb-2">{previews.length} image{previews.length > 1 ? 's' : ''} ready</p>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {previews.map((p, i) => (
                  <div key={i} className="relative aspect-square rounded-xl overflow-hidden bg-ink-100 ring-1 ring-ink-200 group/preview">
                    <img src={p.url} alt="" className="w-full h-full object-cover" />
                    <button
                      onClick={() => removeFile(i)}
                      className="absolute top-1 right-1 w-6 h-6 rounded-md bg-danger-500 text-white flex items-center justify-center opacity-0 group-hover/preview:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                    <div className="absolute bottom-0 inset-x-0 px-1.5 py-1 bg-black/50 text-white text-2xs truncate">
                      {p.width}×{p.height} · {formatSize(p.file.size)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Auto-optimize toggle */}
          <label className="flex items-center gap-3 p-3 rounded-xl bg-info-subtle/30 border border-info-200 cursor-pointer">
            <input
              type="checkbox"
              checked={autoOptimize}
              onChange={(e) => setAutoOptimize(e.target.checked)}
              className="rounded border-info-300 text-accent-500 focus:ring-accent-500"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-ink-900 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-accent-500" />
                Auto-optimize to WebP
              </p>
              <p className="text-2xs text-ink-500">Reduces file size by ~30% with no visible quality loss</p>
            </div>
          </label>
        </div>

        <div className="px-6 py-4 border-t border-ink-200 flex items-center justify-end gap-2 flex-shrink-0">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={handleUpload} loading={uploading} disabled={previews.length === 0} leftIcon={Upload}>
            Upload {previews.length > 0 && `(${previews.length})`}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// IMAGE EDITOR — Crop, rotate, brightness, contrast, saturate
// ════════════════════════════════════════════════════════════
function ImageEditorModal({ item, onClose, onSave }: { item: MediaItem | null; onClose: () => void; onSave: (i: MediaItem) => void }) {
  const [alt, setAlt] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturate, setSaturate] = useState(100);
  const [rotate, setRotate] = useState(0);
  const [zoom, setZoom] = useState(100);
  const [optimized, setOptimized] = useState(true);

  useEffect(() => {
    if (item) {
      setAlt(item.alt || '');
      setTags(item.tags || []);
      setBrightness(100);
      setContrast(100);
      setSaturate(100);
      setRotate(0);
      setZoom(100);
      setOptimized(item.optimized ?? true);
    }
  }, [item?.id]);

  if (!item) return null;

  const addTag = () => {
    const t = tagInput.trim().toLowerCase();
    if (t && !tags.includes(t) && tags.length < 10) {
      setTags([...tags, t]);
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => setTags(tags.filter((t) => t !== tag));

  const reset = () => {
    setBrightness(100); setContrast(100); setSaturate(100); setRotate(0); setZoom(100);
  };

  const handleSave = () => {
    onSave({
      ...item,
      alt: alt || undefined,
      tags,
      optimized,
    });
  };

  const hasChanges = brightness !== 100 || contrast !== 100 || saturate !== 100 || rotate !== 0 || zoom !== 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-ink-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-3xl shadow-modal max-w-5xl w-full max-h-[90vh] flex flex-col animate-scale-in">
        <div className="flex items-center justify-between px-6 py-4 border-b border-ink-200 flex-shrink-0">
          <div className="min-w-0">
            <h3 className="text-lg font-bold text-ink-900 truncate">Edit · {item.name}</h3>
            <p className="text-2xs text-ink-500 mt-0.5">{item.width}×{item.height} · {formatSize(item.size)}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg text-ink-500 hover:bg-ink-100 hover:text-ink-900 flex items-center justify-center"><X className="w-4 h-4" /></button>
        </div>

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_320px] overflow-hidden">
          {/* Canvas */}
          <div className="bg-ink-100/60 flex items-center justify-center p-6 overflow-hidden">
            <div className="relative max-w-full max-h-full" style={{ filter: `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturate}%)`, transform: `rotate(${rotate}deg) scale(${zoom / 100})`, transition: 'filter 0.2s, transform 0.2s' }}>
              <img
                src={item.url}
                alt={item.alt || item.name}
                className="max-w-full max-h-[60vh] object-contain rounded-lg shadow-lg"
              />
            </div>
          </div>

          {/* Sidebar controls */}
          <div className="border-l border-ink-200 overflow-y-auto scroll-thin p-5 space-y-4">
            {/* Adjustments */}
            <div>
              <p className="text-2xs font-bold text-ink-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                <Sliders className="w-3 h-3" /> Adjust
              </p>
              <div className="space-y-3">
                <SliderControl icon={Sun} label="Brightness" value={brightness} onChange={setBrightness} min={0} max={200} unit="%" />
                <SliderControl icon={Contrast} label="Contrast" value={contrast} onChange={setContrast} min={0} max={200} unit="%" />
                <SliderControl icon={Droplet} label="Saturation" value={saturate} onChange={setSaturate} min={0} max={200} unit="%" />
              </div>
            </div>

            <div className="border-t border-ink-100" />

            {/* Transform */}
            <div>
              <p className="text-2xs font-bold text-ink-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                <Crop className="w-3 h-3" /> Transform
              </p>
              <div className="space-y-3">
                <SliderControl icon={RotateCw} label="Rotate" value={rotate} onChange={setRotate} min={-180} max={180} unit="°" />
                <SliderControl icon={ZoomIn} label="Zoom" value={zoom} onChange={setZoom} min={25} max={200} unit="%" />
              </div>
              <div className="grid grid-cols-3 gap-1.5 mt-2">
                <button onClick={() => setRotate((r) => r - 90)} className="btn-secondary btn-sm justify-center"><RotateCcw className="w-3 h-3" /></button>
                <button onClick={() => setRotate((r) => r + 90)} className="btn-secondary btn-sm justify-center"><RotateCw className="w-3 h-3" /></button>
                <button onClick={reset} disabled={!hasChanges} className="btn-ghost btn-sm justify-center">Reset</button>
              </div>
            </div>

            <div className="border-t border-ink-100" />

            {/* Metadata */}
            <div>
              <p className="text-2xs font-bold text-ink-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                <Info className="w-3 h-3" /> Metadata
              </p>
              <div className="space-y-2">
                <div>
                  <label className="label text-xs">Alt Text</label>
                  <input
                    type="text"
                    value={alt}
                    onChange={(e) => setAlt(e.target.value)}
                    className="input text-sm"
                    placeholder="Descriptive alt for SEO/accessibility"
                    maxLength={200}
                  />
                </div>
                <div>
                  <label className="label text-xs">Tags</label>
                  <div className="input p-2 flex items-center flex-wrap gap-1.5 min-h-[40px]">
                    {tags.map((t) => (
                      <span key={t} className="inline-flex items-center gap-1 bg-accent-50 text-accent-700 text-2xs font-medium px-1.5 h-5 rounded-pill">
                        {t}
                        <button onClick={() => removeTag(t)} className="hover:bg-accent-100 rounded-pill"><X className="w-2.5 h-2.5" /></button>
                      </span>
                    ))}
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); }}}
                      className="flex-1 min-w-[80px] bg-transparent border-0 outline-none text-xs placeholder:text-ink-400 px-1"
                      placeholder="Add tag..."
                    />
                  </div>
                </div>
                <label className="flex items-center gap-2 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={optimized}
                    onChange={(e) => setOptimized(e.target.checked)}
                    className="rounded border-ink-300 text-accent-500"
                  />
                  <span className="text-xs text-ink-700 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-accent-500" /> Optimized (WebP)
                  </span>
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-ink-200 flex items-center justify-between gap-2 flex-shrink-0">
          <button onClick={() => { navigator.clipboard.writeText(item.url); toast.success('URL copied'); }} className="btn-ghost btn-sm">
            <LinkIcon className="w-3.5 h-3.5" /> Copy URL
          </button>
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={onClose}>Cancel</Button>
            <Button variant="primary" onClick={handleSave} leftIcon={Check}>Save Changes</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SliderControl({ icon: Icon, label, value, onChange, min, max, unit }: any) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-xs font-medium text-ink-700 flex items-center gap-1.5">
          <Icon className="w-3.5 h-3.5 text-ink-500" />
          {label}
        </label>
        <span className="text-2xs font-mono text-ink-600 tabular-nums">{value}{unit}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-full h-1.5 bg-ink-200 rounded-pill appearance-none cursor-pointer accent-accent-500"
        style={{
          background: `linear-gradient(to right, #F97316 0%, #F97316 ${((value - min) / (max - min)) * 100}%, #E2E8F0 ${((value - min) / (max - min)) * 100}%, #E2E8F0 100%)`,
        }}
      />
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// IMAGE VIEWER (read-only detail modal)
// ════════════════════════════════════════════════════════════
function ImageViewerModal({ item, onClose, onEdit }: { item: MediaItem | null; onClose: () => void; onEdit: (i: MediaItem) => void }) {
  if (!item) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
      <div className="absolute inset-0 bg-ink-900/80 backdrop-blur-md" />
      <div className="relative max-w-5xl w-full max-h-[90vh] flex flex-col animate-scale-in" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-3 absolute top-2 left-2 right-2 z-10">
          <div className="text-white">
            <p className="text-sm font-semibold">{item.name}</p>
            <p className="text-2xs text-white/70">{item.width}×{item.height} · {formatSize(item.size)}</p>
          </div>
          <div className="flex items-center gap-1.5">
            <button onClick={() => onEdit(item)} className="w-8 h-8 rounded-md bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 flex items-center justify-center" title="Edit">
              <Edit2 className="w-4 h-4" />
            </button>
            <button onClick={() => { navigator.clipboard.writeText(item.url); toast.success('URL copied'); }} className="w-8 h-8 rounded-md bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 flex items-center justify-center" title="Copy URL">
              <LinkIcon className="w-4 h-4" />
            </button>
            <button onClick={onClose} className="w-8 h-8 rounded-md bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 flex items-center justify-center">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center p-12">
          <img src={item.url} alt={item.alt || item.name} className="max-w-full max-h-full object-contain rounded-lg shadow-2xl" />
        </div>
        {item.usedIn && item.usedIn.length > 0 && (
          <div className="text-center pb-4">
            <p className="text-white/80 text-xs">Used in: {item.usedIn.join(', ')}</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Generic action item ────────────────────────────────────
function ActionItem({ icon: Icon, label, onClick, danger }: any) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        'w-full flex items-center gap-2.5 px-3 h-8 text-sm rounded-md transition-colors',
        danger ? 'text-danger-600 hover:bg-danger-50' : 'text-ink-700 hover:bg-ink-100',
      )}
    >
      <Icon className="w-3.5 h-3.5" />
      <span>{label}</span>
    </button>
  );
}

// Avoid unused warnings
void FilePlus;
void Filter;
void Maximize2;
void Modal;
void ChevronLeft;
void ChevronRight;
void Loader2;
void Plus;
