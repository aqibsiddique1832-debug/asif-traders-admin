// ────────────────────────────────────────────────────────────
// Premium Brands — Part 3B QA
// Full brand CRUD with logos, products count, status
// ────────────────────────────────────────────────────────────

import { useEffect, useState } from 'react';
import {
  Tags, Plus, Search, Edit, Trash2, MoreVertical, Globe, X,
  Package, ExternalLink, Filter, Grid3x3, List as ListIcon, CheckCircle2, XCircle, Image as ImageIcon,
} from 'lucide-react';
import clsx from 'clsx';
import toast from 'react-hot-toast';
import {
  Card, CardHeader, CardBody, Button, Badge, PageHeader, EmptyState,
  Skeleton, Modal, ConfirmDialog, Tabs,
} from '../components/ui/StatCard';

const SAMPLE_BRANDS = [
  { id: 'b1', name: 'UltraTech',     slug: 'ultratech',     country: 'India',     website: 'https://ultratechcement.com',   logo: 'https://logo.clearbit.com/ultratechcement.com', description: 'India\'s largest cement manufacturer', status: 'active', productCount: 12 },
  { id: 'b2', name: 'ACC',           slug: 'acc',           country: 'India',     website: 'https://acclimited.com',          logo: 'https://logo.clearbit.com/acclimited.com',     description: 'Leading cement and concrete company', status: 'active', productCount: 8 },
  { id: 'b3', name: 'Tata Steel',    slug: 'tata-steel',    country: 'India',     website: 'https://tatasteel.com',           logo: 'https://logo.clearbit.com/tatasteel.com',      description: 'Premium TMT bars and structural steel', status: 'active', productCount: 15 },
  { id: 'b4', name: 'JSW',           slug: 'jsw',           country: 'India',     website: 'https://jsw.in',                   logo: 'https://logo.clearbit.com/jsw.in',             description: 'Steel, cement, and infrastructure', status: 'active', productCount: 6 },
  { id: 'b5', name: 'Kajaria',       slug: 'kajaria',       country: 'India',     website: 'https://kajariaceramics.com',     logo: 'https://logo.clearbit.com/kajariaceramics.com', description: 'Premium tiles and sanitaryware',     status: 'active', productCount: 18 },
  { id: 'b6', name: 'Somany',        slug: 'somany',        country: 'India',     website: 'https://somany.com',               logo: 'https://logo.clearbit.com/somany.com',         description: 'Wall and floor tiles',              status: 'active', productCount: 9 },
  { id: 'b7', name: 'Astral',        slug: 'astral',        country: 'India',     website: 'https://astralpipes.com',          logo: 'https://logo.clearbit.com/astralpipes.com',     description: 'PVC pipes and fittings',             status: 'active', productCount: 7 },
  { id: 'b8', name: 'Supreme',       slug: 'supreme',       country: 'India',     website: 'https://supreme.co.in',            logo: 'https://logo.clearbit.com/supreme.co.in',       description: 'PVC pipes and fittings',             status: 'inactive', productCount: 0 },
];

const STATUS_MAP: Record<string, { label: string; variant: any }> = {
  active:   { label: 'Active',   variant: 'success' },
  inactive: { label: 'Inactive', variant: 'ink' },
};

export default function Brands() {
  const [brands, setBrands] = useState(SAMPLE_BRANDS);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [view, setView] = useState<'grid' | 'table'>('grid');
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [deleting, setDeleting] = useState<any>(null);

  const filtered = brands.filter((b) => {
    if (search && !`${b.name} ${b.country} ${b.description}`.toLowerCase().includes(search.toLowerCase())) return false;
    if (filter !== 'all' && b.status !== filter) return false;
    return true;
  });

  const kpis = [
    { label: 'Total Brands',  value: brands.length,                                  icon: Tags,         accent: 'info' as const },
    { label: 'Active',         value: brands.filter((b) => b.status === 'active').length, icon: CheckCircle2, accent: 'success' as const },
    { label: 'Total Products', value: brands.reduce((s, b) => s + b.productCount, 0),     icon: Package,      accent: 'accent' as const },
    { label: 'Countries',      value: new Set(brands.map((b) => b.country)).size,       icon: Globe,        accent: 'warning' as const },
  ];

  const handleSave = (data: any) => {
    if (editing) {
      setBrands((prev) => prev.map((b) => (b.id === editing.id ? { ...b, ...data } : b)));
      toast.success('Brand updated');
    } else {
      setBrands((prev) => [{ id: `b${Date.now()}`, productCount: 0, ...data }, ...prev]);
      toast.success('Brand created');
    }
    setModal(false);
    setEditing(null);
  };

  const handleDelete = () => {
    setBrands((prev) => prev.filter((b) => b.id !== deleting.id));
    toast.success('Brand deleted');
    setDeleting(null);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-24">
      <PageHeader
        title="Brands"
        description={`${brands.length} brands · ${brands.reduce((s, b) => s + b.productCount, 0)} products`}
        breadcrumbs={[{ label: 'Catalog' }, { label: 'Brands' }]}
        actions={
          <Button variant="primary" leftIcon={Plus} onClick={() => { setEditing(null); setModal(true); }}>
            Add Brand
          </Button>
        }
      />

      {/* ─── 4 KPI cards ─────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {kpis.map((k) => (
          <MiniStat key={k.label} {...k} />
        ))}
      </div>

      {/* ─── Tabs ────────────────────────────────────────── */}
      <Tabs
        active={filter}
        onChange={(v) => setFilter(v as any)}
        tabs={[
          { value: 'all',      label: 'All',      count: brands.length },
          { value: 'active',   label: 'Active',   count: brands.filter((b) => b.status === 'active').length },
          { value: 'inactive', label: 'Inactive', count: brands.filter((b) => b.status === 'inactive').length },
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
              placeholder="Search by name, country, description…"
              className="input pl-10"
            />
          </div>
          <div className="flex items-center bg-ink-100 rounded-lg p-0.5">
            <button
              onClick={() => setView('grid')}
              className={clsx('w-7 h-7 rounded-md flex items-center justify-center transition-all', view === 'grid' ? 'bg-white shadow-sm text-ink-900' : 'text-ink-500')}
              aria-label="Grid view"
            >
              <Grid3x3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setView('table')}
              className={clsx('w-7 h-7 rounded-md flex items-center justify-center transition-all', view === 'table' ? 'bg-white shadow-sm text-ink-900' : 'text-ink-500')}
              aria-label="Table view"
            >
              <ListIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </Card>

      {/* ─── Brands list ──────────────────────────────────── */}
      {filtered.length === 0 ? (
        <Card>
          <EmptyState
            icon={Tags}
            title="No brands yet"
            description="Add brands to organize your products by manufacturer."
            action={<Button variant="primary" leftIcon={Plus} onClick={() => { setEditing(null); setModal(true); }}>Add Brand</Button>}
          />
        </Card>
      ) : view === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((b) => {
            const status = STATUS_MAP[b.status];
            return (
              <Card key={b.id} className="overflow-hidden group/brand">
                <div className="aspect-[3/1] bg-gradient-to-br from-ink-100 to-ink-50 flex items-center justify-center overflow-hidden">
                  {b.logo ? (
                    <img src={b.logo} alt={b.name} className="max-h-16 max-w-[60%] object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                  ) : (
                    <Tags className="w-10 h-10 text-ink-300" />
                  )}
                </div>
                <CardBody>
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-ink-900 truncate">{b.name}</h3>
                    <Badge variant={status.variant} dot>{status.label}</Badge>
                  </div>
                  <p className="text-2xs text-ink-500 mb-2 flex items-center gap-1">
                    <Globe className="w-3 h-3" /> {b.country}
                  </p>
                  <p className="text-xs text-ink-600 line-clamp-2 min-h-[2.5rem]">{b.description}</p>
                  <div className="mt-3 pt-3 border-t border-ink-100 flex items-center justify-between">
                    <span className="text-2xs text-ink-500 flex items-center gap-1">
                      <Package className="w-3 h-3" /> {b.productCount} products
                    </span>
                    <div className="flex items-center gap-1">
                      {b.website && (
                        <a href={b.website} target="_blank" rel="noopener noreferrer" className="w-7 h-7 rounded-md text-ink-500 hover:bg-ink-100 flex items-center justify-center">
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                      <button onClick={() => { setEditing(b); setModal(true); }} className="w-7 h-7 rounded-md text-ink-500 hover:bg-ink-100 flex items-center justify-center">
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => setDeleting(b)} className="w-7 h-7 rounded-md text-danger-600 hover:bg-danger-50 flex items-center justify-center">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </CardBody>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto scroll-thin">
            <table className="w-full text-sm">
              <thead className="bg-ink-50/80 border-b border-ink-200">
                <tr>
                  <th className="px-4 py-3 text-left text-2xs font-bold text-ink-500 uppercase tracking-wider">Brand</th>
                  <th className="px-4 py-3 text-left text-2xs font-bold text-ink-500 uppercase tracking-wider">Country</th>
                  <th className="px-4 py-3 text-left text-2xs font-bold text-ink-500 uppercase tracking-wider">Description</th>
                  <th className="px-4 py-3 text-right text-2xs font-bold text-ink-500 uppercase tracking-wider">Products</th>
                  <th className="px-4 py-3 text-left text-2xs font-bold text-ink-500 uppercase tracking-wider">Website</th>
                  <th className="px-4 py-3 text-left text-2xs font-bold text-ink-500 uppercase tracking-wider">Status</th>
                  <th className="w-10 px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {filtered.map((b) => {
                  const status = STATUS_MAP[b.status];
                  return (
                    <tr key={b.id} className="hover:bg-ink-50/60 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-ink-50 flex items-center justify-center flex-shrink-0">
                            {b.logo ? (
                              <img src={b.logo} alt={b.name} className="max-h-6 max-w-[80%] object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                            ) : (
                              <Tags className="w-4 h-4 text-ink-400" />
                            )}
                          </div>
                          <p className="font-semibold text-ink-900">{b.name}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-ink-700 text-sm flex items-center gap-1">
                        <Globe className="w-3 h-3 text-ink-400" /> {b.country}
                      </td>
                      <td className="px-4 py-3 text-ink-600 text-sm max-w-[240px] truncate">{b.description}</td>
                      <td className="px-4 py-3 text-right">
                        <span className="font-semibold text-ink-900 tabular-nums">{b.productCount}</span>
                      </td>
                      <td className="px-4 py-3 text-2xs text-accent-600 truncate max-w-[180px]">
                        {b.website && (
                          <a href={b.website} target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center gap-0.5">
                            <ExternalLink className="w-2.5 h-2.5" /> {b.website.replace('https://', '')}
                          </a>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={status.variant} dot>{status.label}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button onClick={() => { setEditing(b); setModal(true); }} className="w-7 h-7 rounded-md text-ink-500 hover:bg-ink-100 flex items-center justify-center">
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => setDeleting(b)} className="w-7 h-7 rounded-md text-danger-600 hover:bg-danger-50 flex items-center justify-center">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* ─── Form modal ──────────────────────────────────── */}
      <BrandFormModal
        open={modal}
        brand={editing}
        onClose={() => { setModal(false); setEditing(null); }}
        onSave={handleSave}
      />

      {/* ─── Delete confirm ──────────────────────────────── */}
      <ConfirmDialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={handleDelete}
        title="Delete brand?"
        description={`"${deleting?.name}" will be removed. Products in this brand will be unbranded.`}
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
}

// ─── Mini stat ──────────────────────────────────────────────
function MiniStat({ label, value, icon: Icon, accent }: any) {
  const map: any = {
    info:    'bg-info-subtle text-info-600',
    success: 'bg-success-subtle text-success-600',
    accent:  'bg-accent-50 text-accent-600',
    warning: 'bg-warning-subtle text-warning-600',
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

// ─── Form modal ────────────────────────────────────────────
function BrandFormModal({ open, brand, onClose, onSave }: { open: boolean; brand: any; onClose: () => void; onSave: (d: any) => void }) {
  const [name, setName] = useState(brand?.name || '');
  const [slug, setSlug] = useState(brand?.slug || '');
  const [country, setCountry] = useState(brand?.country || 'India');
  const [website, setWebsite] = useState(brand?.website || '');
  const [logo, setLogo] = useState(brand?.logo || '');
  const [description, setDescription] = useState(brand?.description || '');
  const [status, setStatus] = useState(brand?.status || 'active');

  useEffect(() => {
    if (open) {
      setName(brand?.name || '');
      setSlug(brand?.slug || '');
      setCountry(brand?.country || 'India');
      setWebsite(brand?.website || '');
      setLogo(brand?.logo || '');
      setDescription(brand?.description || '');
      setStatus(brand?.status || 'active');
    }
  }, [brand?.id, open]);

  // Auto-generate slug
  useEffect(() => {
    if (!brand && name && !slug) {
      setSlug(name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''));
    }
  }, [name, brand, slug]);

  if (!open) return null;

  const submit = () => {
    if (!name) { toast.error('Name is required'); return; }
    onSave({ name, slug, country, website, logo, description, status });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={brand ? `Edit ${brand.name}` : 'Add New Brand'}
      size="md"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={submit}>{brand ? 'Save Changes' : 'Create Brand'}</Button>
        </>
      }
    >
      <div className="space-y-3">
        <div>
          <label className="label">Brand Name <span className="text-danger-500">*</span></label>
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. UltraTech" />
        </div>
        <div>
          <label className="label">URL Slug</label>
          <input className="input font-mono text-sm" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="ultratech" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Country</label>
            <input className="input" value={country} onChange={(e) => setCountry(e.target.value)} />
          </div>
          <div>
            <label className="label">Status</label>
            <select className="input" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
        <div>
          <label className="label">Website</label>
          <input className="input" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://..." />
        </div>
        <div>
          <label className="label">Logo URL</label>
          <div className="flex gap-2">
            <input className="input flex-1" value={logo} onChange={(e) => setLogo(e.target.value)} placeholder="https://..." />
            {logo && <img src={logo} alt="Logo" className="w-10 h-10 rounded-lg object-contain ring-1 ring-ink-200 bg-white" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />}
          </div>
        </div>
        <div>
          <label className="label">Description</label>
          <textarea className="input min-h-[80px] py-2" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Brief description of this brand…" />
        </div>
      </div>
    </Modal>
  );
}

// Avoid unused
void Skeleton; void Filter; void MoreVertical;
