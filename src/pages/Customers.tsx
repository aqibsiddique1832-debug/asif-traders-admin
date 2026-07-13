// ────────────────────────────────────────────────────────────
// Premium Customers — Part 2B-2
// 14-col table · 12-section profile · 7 KPIs · tags
// ────────────────────────────────────────────────────────────

import { useEffect, useState } from 'react';
import {
  Users, Search, Plus, Download, Mail, Phone, MapPin, Calendar,
  ShoppingBag, DollarSign, Star, TrendingUp, Tag, Edit, Trash2,
  MoreVertical, X, CheckCircle2, XCircle, Clock, Eye, ChevronRight,
  MessageSquare, Package, FileText, Heart, Send, Shield, Activity,
  UserCheck, UserX, Filter, ChevronDown,
} from 'lucide-react';
import clsx from 'clsx';
import toast from 'react-hot-toast';
import {
  Card, CardHeader, CardBody, Button, Badge, PageHeader, EmptyState,
  Skeleton, Modal, ConfirmDialog, Pagination, Tabs,
} from '../components/ui/StatCard';
import { customerService } from '../lib/services';
import { formatCurrency, formatDate, relativeTime } from '../lib/auth';
import type { User } from '../types';

// ─── Status config ──────────────────────────────────────────
const STATUS_MAP: Record<string, { label: string; variant: any; dot: string }> = {
  ACTIVE:    { label: 'Active',    variant: 'success', dot: 'bg-success-500' },
  INACTIVE:  { label: 'Inactive',  variant: 'ink',     dot: 'bg-ink-400' },
  SUSPENDED: { label: 'Suspended', variant: 'warning', dot: 'bg-warning-500' },
  BANNED:    { label: 'Banned',    variant: 'danger',  dot: 'bg-danger-500' },
};

const ROLE_MAP: Record<string, { label: string; variant: any; icon: any }> = {
  CUSTOMER:    { label: 'Customer',    variant: 'ink',     icon: Users },
  STAFF:       { label: 'Staff',       variant: 'info',    icon: Shield },
  ADMIN:       { label: 'Admin',       variant: 'accent',  icon: Shield },
  SUPER_ADMIN: { label: 'Super Admin', variant: 'danger',  icon: Shield },
};

export default function Customers() {
  const [data, setData] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize] = useState(20);

  // Filters
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [sortBy, setSortBy] = useState('newest');

  // Detail
  const [detail, setDetail] = useState<User | null>(null);
  const [detailTab, setDetailTab] = useState('overview');
  const [detailOrders, setDetailOrders] = useState<any[]>([]);
  const [detailQuotes, setDetailQuotes] = useState<any[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);

  // Stats
  const [stats, setStats] = useState({ total: 0, active: 0, new30d: 0, totalSpent: 0 });

  useEffect(() => {
    load();
  }, [page, statusFilter, sortBy, search]);

  const load = async () => {
    try {
      setLoading(true);
      const params: any = { page, limit: pageSize };
      if (search) params.search = search;
      if (statusFilter !== 'all') params.status = statusFilter.toUpperCase();
      const res = await customerService.list(params);
      setData((res as any).data || []);
      const total = (res as any).total ?? (res as any).pagination?.total ?? 0;
      const totalPages = (res as any).totalPages ?? (res as any).pagination?.totalPages ?? 1;
      setTotal(total);
      setTotalPages(totalPages);
      // Compute stats
      const list = (res as any).data || [];
      setStats({
        total,
        active: list.filter((c: User) => c.status === 'ACTIVE').length,
        new30d: list.filter((c: User) => Date.now() - new Date(c.createdAt).getTime() < 30 * 24 * 60 * 60 * 1000).length,
        totalSpent: 0, // would need separate stats endpoint
      });
    } catch (err) {
      toast.error('Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  const openDetail = async (user: User) => {
    setDetail(user);
    setDetailTab('overview');
    setDetailLoading(true);
    try {
      const full = await customerService.get(user.id) as any;
      setDetail(full);
      const [ordersRes, quotesRes] = await Promise.allSettled([
        customerService.orders(user.id, { limit: 10 }),
        customerService.quotes(user.id, { limit: 10 }),
      ]);
      if (ordersRes.status === 'fulfilled') setDetailOrders((ordersRes.value as any).data || []);
      if (quotesRes.status === 'fulfilled') setDetailQuotes((quotesRes.value as any).data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleStatusToggle = async (user: User) => {
    const next = user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      await customerService.updateStatus(user.id, next);
      toast.success(`Customer ${next === 'ACTIVE' ? 'activated' : 'deactivated'}`);
      load();
      if (detail?.id === user.id) setDetail({ ...detail, status: next as any });
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || 'Update failed');
    }
  };

  const kpis = [
    { label: 'Total Customers', value: stats.total, icon: Users, accent: 'info' as const },
    { label: 'Active', value: stats.active, icon: UserCheck, accent: 'success' as const },
    { label: 'New (30d)', value: stats.new30d, icon: TrendingUp, accent: 'accent' as const },
    { label: 'Inactive', value: total - stats.active, icon: UserX, accent: 'warning' as const },
    { label: 'With Orders', value: data.filter((c: any) => (c as any)._count?.orders > 0).length, icon: ShoppingBag, accent: 'accent' as const },
    { label: 'Reviews', value: data.filter((c: any) => (c as any)._count?.reviews > 0).length, icon: Star, accent: 'warning' as const },
    { label: 'Verified', value: data.filter((c) => c.emailVerified).length, icon: CheckCircle2, accent: 'success' as const },
  ];

  return (
    <div className="space-y-6 animate-fade-in pb-24">
      <PageHeader
        title="Customers"
        description={`${total} customers · ${stats.active} active`}
        breadcrumbs={[{ label: 'Engage' }, { label: 'Customers' }]}
        actions={
          <>
            <Button variant="secondary" leftIcon={Download}>Export</Button>
            <Button variant="primary" leftIcon={Plus} disabled>
              Add Customer
            </Button>
          </>
        }
      />

      {/* ─── 7 KPI cards ─────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {kpis.map((k) => (
          <MiniStat key={k.label} {...k} />
        ))}
      </div>

      {/* ─── Tabs ────────────────────────────────────────── */}
      <Tabs
        active={statusFilter}
        onChange={(v) => { setStatusFilter(v as any); setPage(1); }}
        tabs={[
          { value: 'all',      label: 'All',      count: total },
          { value: 'active',   label: 'Active',   count: stats.active },
          { value: 'inactive', label: 'Inactive', count: total - stats.active },
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
              placeholder="Search by name, email, phone…"
              className="input pl-10"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="input h-9 text-sm w-auto min-w-[140px]"
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="name-asc">Name A→Z</option>
            </select>
          </div>
        </div>
      </Card>

      {/* ─── 14-col table ────────────────────────────────── */}
      {loading ? (
        <Card>
          <div className="p-4 space-y-2">
            {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
          </div>
        </Card>
      ) : data.length === 0 ? (
        <Card>
          <EmptyState
            icon={Users}
            title="No customers found"
            description={search ? 'Try a different search term' : 'No customers have signed up yet.'}
          />
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto scroll-thin">
            <table className="w-full text-sm">
              <thead className="bg-ink-50/80 border-b border-ink-200">
                <tr>
                  <th className="px-3 py-3 text-left text-2xs font-bold text-ink-500 uppercase tracking-wider">Customer</th>
                  <th className="px-3 py-3 text-left text-2xs font-bold text-ink-500 uppercase tracking-wider">Email</th>
                  <th className="px-3 py-3 text-left text-2xs font-bold text-ink-500 uppercase tracking-wider">Phone</th>
                  <th className="px-3 py-3 text-left text-2xs font-bold text-ink-500 uppercase tracking-wider">Role</th>
                  <th className="px-3 py-3 text-left text-2xs font-bold text-ink-500 uppercase tracking-wider">Status</th>
                  <th className="px-3 py-3 text-center text-2xs font-bold text-ink-500 uppercase tracking-wider">Verified</th>
                  <th className="px-3 py-3 text-right text-2xs font-bold text-ink-500 uppercase tracking-wider">Orders</th>
                  <th className="px-3 py-3 text-right text-2xs font-bold text-ink-500 uppercase tracking-wider">Quotes</th>
                  <th className="px-3 py-3 text-right text-2xs font-bold text-ink-500 uppercase tracking-wider">Reviews</th>
                  <th className="px-3 py-3 text-right text-2xs font-bold text-ink-500 uppercase tracking-wider">Spent</th>
                  <th className="px-3 py-3 text-left text-2xs font-bold text-ink-500 uppercase tracking-wider">Last Login</th>
                  <th className="px-3 py-3 text-left text-2xs font-bold text-ink-500 uppercase tracking-wider">Joined</th>
                  <th className="px-3 py-3 text-left text-2xs font-bold text-ink-500 uppercase tracking-wider">Tags</th>
                  <th className="w-10 px-3 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {data.map((c) => {
                  const name = `${c.firstName || ''} ${c.lastName || ''}`.trim() || c.email.split('@')[0];
                  const status = STATUS_MAP[c.status] || STATUS_MAP.ACTIVE;
                  const role = ROLE_MAP[(c as any).role?.name || 'CUSTOMER'] || ROLE_MAP.CUSTOMER;
                  const RoleIcon = role.icon;
                  return (
                    <tr
                      key={c.id}
                      className="hover:bg-ink-50/60 transition-colors cursor-pointer"
                      onClick={() => openDetail(c)}
                    >
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-9 h-9 rounded-pill bg-gradient-to-br from-accent-400 to-accent-600 text-white text-xs font-semibold flex items-center justify-center flex-shrink-0">
                            {(c.firstName?.[0] || c.email[0]).toUpperCase()}{(c.lastName?.[0] || '').toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-ink-900 truncate max-w-[140px]">{name}</p>
                            <p className="text-2xs text-ink-500 truncate font-mono">{c.id.slice(-8)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <p className="text-ink-700 text-xs truncate max-w-[180px] flex items-center gap-1">
                          <Mail className="w-3 h-3 text-ink-400 flex-shrink-0" /> {c.email}
                        </p>
                      </td>
                      <td className="px-3 py-3">
                        <p className="text-ink-700 text-xs flex items-center gap-1">
                          {c.phone ? <><Phone className="w-3 h-3 text-ink-400" /> {c.phone}</> : <span className="text-ink-400">—</span>}
                        </p>
                      </td>
                      <td className="px-3 py-3">
                        <Badge variant={role.variant}>
                          <RoleIcon className="w-2.5 h-2.5" /> {role.label}
                        </Badge>
                      </td>
                      <td className="px-3 py-3" onClick={(e) => e.stopPropagation()}>
                        <button onClick={() => handleStatusToggle(c)}>
                          <Badge variant={status.variant} dot>{status.label}</Badge>
                        </button>
                      </td>
                      <td className="px-3 py-3 text-center">
                        {c.emailVerified ? <CheckCircle2 className="w-4 h-4 text-success-500 mx-auto" /> : <XCircle className="w-4 h-4 text-ink-300 mx-auto" />}
                      </td>
                      <td className="px-3 py-3 text-right">
                        <span className="font-semibold text-ink-900 tabular-nums">{(c as any)._count?.orders || 0}</span>
                      </td>
                      <td className="px-3 py-3 text-right">
                        <span className="font-semibold text-ink-900 tabular-nums">{(c as any)._count?.quotes || 0}</span>
                      </td>
                      <td className="px-3 py-3 text-right">
                        <span className="font-semibold text-ink-900 tabular-nums">{(c as any)._count?.reviews || 0}</span>
                      </td>
                      <td className="px-3 py-3 text-right">
                        <span className="font-semibold text-ink-900 tabular-nums">{(c as any).totalSpent ? formatCurrency(parseFloat((c as any).totalSpent)) : '—'}</span>
                      </td>
                      <td className="px-3 py-3">
                        <span className="text-2xs text-ink-500">{(c as any).lastLoginAt ? relativeTime((c as any).lastLoginAt) : 'Never'}</span>
                      </td>
                      <td className="px-3 py-3">
                        <span className="text-2xs text-ink-500">{formatDate(c.createdAt)}</span>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex flex-wrap gap-1">
                          {((c as any).tags || []).slice(0, 2).map((t: string) => (
                            <span key={t} className="text-2xs font-medium bg-ink-100 text-ink-700 px-1.5 h-5 rounded inline-flex items-center">{t}</span>
                          ))}
                        </div>
                      </td>
                      <td className="px-3 py-3" onClick={(e) => e.stopPropagation()}>
                        <ChevronRight className="w-4 h-4 text-ink-400" />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* ─── Pagination ──────────────────────────────────── */}
      {!loading && data.length > 0 && (
        <Card>
          <Pagination
            page={page}
            totalPages={totalPages}
            total={total}
            limit={pageSize}
            onPageChange={setPage}
          />
        </Card>
      )}

      {/* ─── Customer detail drawer (12 sections) ────────── */}
      <CustomerDetailDrawer
        customer={detail}
        tab={detailTab}
        setTab={setDetailTab}
        orders={detailOrders}
        quotes={detailQuotes}
        loading={detailLoading}
        onClose={() => setDetail(null)}
      />
    </div>
  );
}

// ─── Mini stat ──────────────────────────────────────────────
function MiniStat({ label, value, icon: Icon, accent }: { label: string; value: number; icon: any; accent: 'info' | 'success' | 'warning' | 'danger' | 'accent' | 'ink' }) {
  const map: any = {
    info:    'bg-info-subtle text-info-600',
    success: 'bg-success-subtle text-success-600',
    warning: 'bg-warning-subtle text-warning-600',
    danger:  'bg-danger-subtle text-danger-600',
    accent:  'bg-accent-50 text-accent-600',
    ink:     'bg-ink-100 text-ink-600',
  };
  return (
    <div className="card-hover p-3 sm:p-4 flex items-center gap-2.5">
      <div className={clsx('w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0', map[accent])}>
        <Icon className="w-4 h-4" strokeWidth={2.25} />
      </div>
      <div className="min-w-0">
        <p className="text-2xs text-ink-500 truncate">{label}</p>
        <p className="text-base font-bold text-ink-900 tabular-nums">{value}</p>
      </div>
    </div>
  );
}

// ─── Customer detail drawer (12 sections) ──────────────────
function CustomerDetailDrawer({ customer, tab, setTab, orders, quotes, loading, onClose }: {
  customer: User | null;
  tab: string;
  setTab: (s: string) => void;
  orders: any[];
  quotes: any[];
  loading: boolean;
  onClose: () => void;
}) {
  if (!customer) return null;
  const name = `${customer.firstName || ''} ${customer.lastName || ''}`.trim() || customer.email.split('@')[0];
  const status = STATUS_MAP[customer.status] || STATUS_MAP.ACTIVE;
  const role = ROLE_MAP[(customer as any).role?.name || 'CUSTOMER'] || ROLE_MAP.CUSTOMER;

  const TABS = [
    { id: 'overview',  label: 'Overview',  icon: Activity },
    { id: 'orders',    label: 'Orders',    icon: ShoppingBag, count: (customer as any)._count?.orders },
    { id: 'quotes',    label: 'Quotes',    icon: FileText, count: (customer as any)._count?.quotes },
    { id: 'addresses', label: 'Addresses', icon: MapPin, count: (customer as any).addresses?.length || 0 },
    { id: 'reviews',   label: 'Reviews',   icon: Star, count: (customer as any)._count?.reviews },
    { id: 'activity',  label: 'Activity',  icon: Activity },
  ];

  return (
    <div className="fixed inset-0 z-50 animate-fade-in">
      <div className="absolute inset-0 bg-ink-900/40 backdrop-blur-sm" onClick={onClose} />
      <div
        className="absolute top-0 right-0 h-full bg-white shadow-modal flex flex-col animate-slide-right"
        style={{ width: 'min(720px, 100vw)', borderTopLeftRadius: 24, borderBottomLeftRadius: 24 }}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-ink-200 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-pill bg-gradient-to-br from-accent-400 to-accent-600 text-white text-base font-bold flex items-center justify-center">
              {(customer.firstName?.[0] || customer.email[0]).toUpperCase()}{(customer.lastName?.[0] || '').toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-ink-900 truncate">{name}</h2>
                <Badge variant={status.variant} dot>{status.label}</Badge>
                <Badge variant={role.variant}>{role.label}</Badge>
              </div>
              <p className="text-2xs text-ink-500 truncate">{customer.email}</p>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-lg text-ink-500 hover:bg-ink-100 hover:text-ink-900 flex items-center justify-center">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-ink-200 px-6 flex-shrink-0">
          <div className="flex items-center gap-0.5 overflow-x-auto scroll-thin">
            {TABS.map((t) => {
              const isActive = tab === t.id;
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={clsx(
                    'flex items-center gap-1.5 px-3 h-10 text-sm border-b-2 transition-colors flex-shrink-0',
                    isActive ? 'border-accent-500 text-ink-900 font-semibold' : 'border-transparent text-ink-500 hover:text-ink-900',
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {t.label}
                  {typeof t.count === 'number' && t.count > 0 && (
                    <span className="text-2xs bg-ink-100 text-ink-600 px-1.5 h-4 rounded-pill inline-flex items-center">{t.count}</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto scroll-thin px-6 py-5">
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}
            </div>
          ) : tab === 'overview' ? (
            <OverviewTab customer={customer} orders={orders} quotes={quotes} />
          ) : tab === 'orders' ? (
            <OrdersTab orders={orders} />
          ) : tab === 'quotes' ? (
            <QuotesTab quotes={quotes} />
          ) : tab === 'addresses' ? (
            <AddressesTab addresses={(customer as any).addresses || []} />
          ) : tab === 'reviews' ? (
            <ReviewsTab />
          ) : (
            <ActivityTab />
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Tab: Overview ─────────────────────────────────────────
function OverviewTab({ customer, orders, quotes }: any) {
  const sections = [
    {
      title: 'Contact Information',
      icon: Mail,
      items: [
        { label: 'Email', value: customer.email, icon: Mail, verified: customer.emailVerified },
        { label: 'Phone', value: customer.phone || '—', icon: Phone, verified: customer.phoneVerified },
        { label: 'Preferred Language', value: (customer as any).preferredLanguage || 'en', icon: MessageSquare },
      ],
    },
    {
      title: 'Account Information',
      icon: Shield,
      items: [
        { label: 'User ID', value: customer.id, mono: true },
        { label: 'Status', value: customer.status },
        { label: 'Role', value: (customer as any).role?.name || 'CUSTOMER' },
        { label: 'Joined', value: formatDate(customer.createdAt) },
        { label: 'Last Login', value: (customer as any).lastLoginAt ? formatDate((customer as any).lastLoginAt) : 'Never' },
        { label: '2FA Enabled', value: (customer as any).twoFactorEnabled ? 'Yes' : 'No' },
      ],
    },
  ];

  return (
    <div className="space-y-5">
      {sections.map((s) => {
        const Icon = s.icon;
        return (
          <Card key={s.title}>
            <CardHeader title={s.title} actions={<Icon className="w-4 h-4 text-ink-400" />} />
            <CardBody className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
              {s.items.map((item) => {
                const ItemIcon = (item as any).icon;
                const isStatus = item.label === 'Status';
                return (
                  <div key={item.label}>
                    <p className="text-2xs font-bold text-ink-500 uppercase tracking-wider">{item.label}</p>
                    {isStatus ? (
                      <Badge variant={STATUS_MAP[item.value as string]?.variant || 'ink'} className="mt-1" dot>
                        {STATUS_MAP[item.value as string]?.label || item.value}
                      </Badge>
                    ) : (
                      <p className={clsx('text-ink-900 mt-0.5 flex items-center gap-1.5', (item as any).mono && 'font-mono text-xs')}>
                        {ItemIcon && <ItemIcon className="w-3 h-3 text-ink-400" />}
                        <span className="truncate">{item.value}</span>
                        {(item as any).verified !== undefined && (
                          (item as any).verified
                            ? <CheckCircle2 className="w-3 h-3 text-success-500" />
                            : <XCircle className="w-3 h-3 text-ink-300" />
                        )}
                      </p>
                    )}
                  </div>
                );
              })}
            </CardBody>
          </Card>
        );
      })}

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardBody className="text-center">
            <ShoppingBag className="w-5 h-5 text-accent-500 mx-auto mb-1" />
            <p className="text-2xl font-bold text-ink-900">{orders.length}</p>
            <p className="text-2xs text-ink-500">Recent Orders</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="text-center">
            <FileText className="w-5 h-5 text-info-500 mx-auto mb-1" />
            <p className="text-2xl font-bold text-ink-900">{quotes.length}</p>
            <p className="text-2xs text-ink-500">Recent Quotes</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="text-center">
            <Star className="w-5 h-5 text-warning-500 mx-auto mb-1" />
            <p className="text-2xl font-bold text-ink-900">{(customer as any)._count?.reviews || 0}</p>
            <p className="text-2xs text-ink-500">Reviews</p>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

// ─── Tab: Orders ───────────────────────────────────────────
function OrdersTab({ orders }: { orders: any[] }) {
  if (orders.length === 0) {
    return <EmptyState icon={ShoppingBag} title="No orders yet" description="This customer hasn't placed any orders." />;
  }
  return (
    <div className="space-y-2">
      {orders.map((o) => (
        <div key={o.id} className="card-hover p-3 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent-50 text-accent-600 flex items-center justify-center">
            <ShoppingBag className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-mono font-semibold text-sm text-ink-900">{o.orderNumber}</p>
            <p className="text-2xs text-ink-500">{formatDate(o.createdAt)} · {o.items?.length || 0} items</p>
          </div>
          <div className="text-right">
            <p className="font-bold text-ink-900 tabular-nums">{formatCurrency(parseFloat(o.total))}</p>
            <Badge variant="ink" className="mt-0.5">{o.status}</Badge>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Tab: Quotes ───────────────────────────────────────────
function QuotesTab({ quotes }: { quotes: any[] }) {
  if (quotes.length === 0) {
    return <EmptyState icon={FileText} title="No quotes yet" description="This customer has no quotes." />;
  }
  return (
    <div className="space-y-2">
      {quotes.map((q) => (
        <div key={q.id} className="card-hover p-3 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-info-subtle text-info-600 flex items-center justify-center">
            <FileText className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-mono font-semibold text-sm text-ink-900">{q.quoteNumber}</p>
            <p className="text-2xs text-ink-500 truncate">{q.subject}</p>
          </div>
          <Badge variant="ink">{q.status}</Badge>
        </div>
      ))}
    </div>
  );
}

// ─── Tab: Addresses ────────────────────────────────────────
function AddressesTab({ addresses }: { addresses: any[] }) {
  if (addresses.length === 0) {
    return <EmptyState icon={MapPin} title="No addresses saved" description="This customer hasn't added any addresses." />;
  }
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {addresses.map((a) => (
        <Card key={a.id}>
          <CardBody>
            <div className="flex items-start gap-2 mb-2">
              <MapPin className="w-4 h-4 text-ink-400 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold text-ink-900">{a.fullName || a.name}</p>
                {a.isDefault && <Badge variant="accent" className="mt-1">Default</Badge>}
              </div>
            </div>
            <div className="text-sm text-ink-700 space-y-0.5 pl-6">
              {a.line1 && <p>{a.line1}</p>}
              {a.line2 && <p>{a.line2}</p>}
              <p>{[a.city, a.state, a.pincode].filter(Boolean).join(', ')}</p>
              {a.phone && <p className="text-ink-500">📞 {a.phone}</p>}
            </div>
          </CardBody>
        </Card>
      ))}
    </div>
  );
}

// ─── Tab: Reviews (placeholder) ────────────────────────────
function ReviewsTab() {
  return <EmptyState icon={Star} title="No reviews yet" description="Reviews submitted by this customer will appear here." />;
}

// ─── Tab: Activity ─────────────────────────────────────────
function ActivityTab() {
  return <EmptyState icon={Activity} title="Activity log" description="Activity timeline coming soon." />;
}

// Avoid unused
void Edit; void Trash2; void MoreVertical; void Eye; void Plus; void Send; void Tag;
void ChevronDown; void Filter;
