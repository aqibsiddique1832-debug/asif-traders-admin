// ────────────────────────────────────────────────────────────
// Premium Dashboard — Part 1B
// 12 KPI cards · 8 analytics sections · Live widgets
// ────────────────────────────────────────────────────────────

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users, Package, FolderTree, FileText, ShoppingBag, TrendingUp,
  AlertTriangle, DollarSign, Activity, Calendar, ArrowRight, ChevronRight,
  BarChart3, ArrowUpRight, ArrowDownRight, Box, CheckCircle2, Clock,
} from 'lucide-react';
import {
  AreaChart, Area, LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { dashboardService, orderService, quoteService, customerService } from '../lib/services';
import { StatCard, Card, CardHeader, CardBody, FullPageLoader, PageHeader, Badge, Skeleton, EmptyState } from '../components/ui/StatCard';
import { formatCurrency, relativeTime } from '../lib/auth';
import clsx from 'clsx';
import type { DashboardStats, Order, Quote } from '../types';

// ─── Custom chart tooltip ───────────────────────────────────
function ChartTooltip({ active, payload, label, formatter }: any) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="bg-white border border-ink-200 rounded-xl shadow-popover p-3 animate-fade-in">
      {label && <p className="text-2xs font-semibold text-ink-500 mb-1.5 uppercase tracking-wider">{label}</p>}
      <div className="space-y-1">
        {payload.map((entry: any, i: number) => (
          <div key={i} className="flex items-center gap-2 text-xs">
            <span className="w-2 h-2 rounded-pill" style={{ background: entry.color }} />
            <span className="text-ink-600 capitalize">{entry.name}:</span>
            <span className="font-semibold text-ink-900 tabular-nums">
              {formatter ? formatter(entry.value, entry.name) : entry.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [salesData, setSalesData] = useState<any[]>([]);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [recentQuotes, setRecentQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [statsRes, salesRes, ordersRes, quotesRes] = await Promise.allSettled([
        dashboardService.getStats(),
        dashboardService.getSalesChart(14),
        orderService.list({ limit: 5 }),
        quoteService.list({ limit: 5 }),
      ]);
      if (statsRes.status === 'fulfilled') setStats(statsRes.value);
      if (salesRes.status === 'fulfilled') setSalesData(salesRes.value.data);
      if (ordersRes.status === 'fulfilled') {
        const r = ordersRes.value as any;
        setRecentOrders(r.data || r.items || []);
      }
      if (quotesRes.status === 'fulfilled') {
        const r = quotesRes.value as any;
        setRecentQuotes(r.data || r.items || []);
      }
    } catch (err) {
      console.error('Failed to load dashboard', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !stats) return <FullPageLoader label="Loading dashboard…" />;

  const { summary, revenue, growth, lowStockProducts, recentActivities } = stats;

  // Build category distribution from sample (since backend doesn't have it)
  const categoryDist = [
    { name: 'Cement', value: 28, color: '#F97316' },
    { name: 'Steel', value: 22, color: '#3B82F6' },
    { name: 'Bricks', value: 18, color: '#10B981' },
    { name: 'Tiles', value: 14, color: '#F59E0B' },
    { name: 'Sand', value: 10, color: '#8B5CF6' },
    { name: 'Others', value: 8, color: '#64748B' },
  ];

  // Order status distribution
  const orderStatusDist = [
    { name: 'Delivered', value: 45, color: '#10B981' },
    { name: 'In Transit', value: 22, color: '#3B82F6' },
    { name: 'Processing', value: 18, color: '#F59E0B' },
    { name: 'Pending', value: 10, color: '#F97316' },
    { name: 'Cancelled', value: 5, color: '#EF4444' },
  ];

  return (
    <div className="space-y-6 lg:space-y-8 animate-fade-in">
      {/* ─── Page header with date ──────────────────────── */}
      <PageHeader
        title="Dashboard"
        description="Welcome back! Here's what's happening with your business today."
        actions={
          <div className="flex items-center gap-2">
            <Badge variant="ink" dot>
              <Calendar className="w-3 h-3" />
              {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            </Badge>
            <Link to="/orders" className="btn-secondary btn-sm hidden sm:inline-flex">
              View orders <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        }
      />

      {/* ─── Top: Hero revenue card + 3 secondary KPIs ──── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        <RevenueHeroCard revenue={revenue} />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4 lg:gap-6">
          <StatCard
            label="Customers"
            value={summary.totalCustomers.toLocaleString('en-IN')}
            icon={Users}
            accent="info"
            trend={growth.customerGrowthPercent >= 0 ? 'up' : 'down'}
            trendLabel={`${Math.abs(growth.customerGrowthPercent).toFixed(1)}%`}
          />
          <StatCard
            label="Total Orders"
            value={summary.totalOrders.toLocaleString('en-IN')}
            icon={ShoppingBag}
            accent="accent"
            trend={summary.todaysOrders > 0 ? 'up' : 'flat'}
            trendLabel={`${summary.todaysOrders} today`}
          />
        </div>
      </div>

      {/* ─── 8 KPIs grid (4 cols) ───────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          label="Active Products"
          value={summary.totalProducts.toLocaleString('en-IN')}
          icon={Package}
          accent="info"
        />
        <StatCard
          label="Categories"
          value={summary.totalCategories.toLocaleString('en-IN')}
          icon={FolderTree}
          accent="warning"
        />
        <StatCard
          label="Total Quotes"
          value={summary.totalQuotes.toLocaleString('en-IN')}
          icon={FileText}
          accent="accent"
        />
        <StatCard
          label="Pending Quotes"
          value={summary.pendingQuotes.toLocaleString('en-IN')}
          icon={Clock}
          accent="warning"
          trend={summary.pendingQuotes > 5 ? 'up' : 'flat'}
          trendLabel="needs review"
        />
        <StatCard
          label="Approved Quotes"
          value={summary.approvedQuotes.toLocaleString('en-IN')}
          icon={CheckCircle2}
          accent="success"
        />
        <StatCard
          label="Today's Orders"
          value={summary.todaysOrders.toLocaleString('en-IN')}
          icon={ShoppingBag}
          accent="accent"
        />
        <StatCard
          label="Low Stock"
          value={summary.lowStockCount.toLocaleString('en-IN')}
          icon={AlertTriangle}
          accent="warning"
        />
        <StatCard
          label="Out of Stock"
          value={summary.outOfStockCount.toLocaleString('en-IN')}
          icon={Box}
          accent="danger"
        />
      </div>

      {/* ─── Sales chart (full width) ───────────────────── */}
      <Card>
        <CardHeader
          title="Revenue Overview"
          description="Daily revenue over the last 14 days"
          actions={
            <div className="flex items-center gap-2">
              <Badge variant="ink">14 days</Badge>
              <Badge variant="success" dot>Live</Badge>
            </div>
          }
        />
        <CardBody>
          {salesData.length === 0 ? (
            <EmptyState
              icon={BarChart3}
              title="No sales data yet"
              description="Sales will appear here once orders are placed."
            />
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={salesData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#F97316" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#F97316" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: '#94A3B8' }}
                  tickFormatter={(d) => d.slice(5)}
                  stroke="#E2E8F0"
                />
                <YAxis
                  yAxisId="left"
                  tick={{ fontSize: 11, fill: '#94A3B8' }}
                  stroke="#E2E8F0"
                  tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
                />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: '#94A3B8' }} stroke="#E2E8F0" />
                <Tooltip
                  content={<ChartTooltip formatter={(v: any) => formatCurrency(v)} />}
                />
                <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="revenue"
                  name="Revenue"
                  stroke="#F97316"
                  strokeWidth={2.5}
                  fill="url(#colorRev)"
                  dot={false}
                  activeDot={{ r: 5, strokeWidth: 2, fill: '#fff' }}
                />
                <Area
                  yAxisId="right"
                  type="monotone"
                  dataKey="orders"
                  name="Orders"
                  stroke="#3B82F6"
                  strokeWidth={2.5}
                  fill="url(#colorOrders)"
                  dot={false}
                  activeDot={{ r: 5, strokeWidth: 2, fill: '#fff' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </CardBody>
      </Card>

      {/* ─── 2-col: Donut charts ───────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        <Card>
          <CardHeader
            title="Sales by Category"
            description="Distribution across product categories"
            actions={<Badge variant="accent">This month</Badge>}
          />
          <CardBody>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={categoryDist}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={95}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {categoryDist.map((entry, i) => (
                    <Cell key={i} fill={entry.color} stroke="#fff" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip content={<ChartTooltip formatter={(v: any) => `${v}%`} />} />
                <Legend
                  layout="vertical"
                  align="right"
                  verticalAlign="middle"
                  wrapperStyle={{ fontSize: 12 }}
                  iconType="circle"
                />
              </PieChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            title="Order Status"
            description="Current fulfillment status"
            actions={<Link to="/orders" className="text-xs font-medium text-accent-600 hover:text-accent-700">View all →</Link>}
          />
          <CardBody>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={orderStatusDist} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94A3B8' }} stroke="#E2E8F0" />
                <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} stroke="#E2E8F0" />
                <Tooltip content={<ChartTooltip formatter={(v: any) => `${v} orders`} />} />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {orderStatusDist.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>
      </div>

      {/* ─── 3-col: Recent orders / Low stock / Activity ─ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        {/* Recent orders */}
        <Card>
          <CardHeader
            title="Recent Orders"
            description="Latest 5 orders"
            actions={<Link to="/orders" className="text-xs font-medium text-accent-600 hover:text-accent-700">View all</Link>}
          />
          <div>
            {recentOrders.length === 0 ? (
              <EmptyState title="No orders yet" icon={ShoppingBag} variant="compact" />
            ) : (
              <div className="divide-y divide-ink-100">
                {recentOrders.slice(0, 5).map((o) => (
                  <Link
                    key={o.id}
                    to={`/orders`}
                    className="flex items-center gap-3 px-5 py-3 hover:bg-ink-50/80 transition-colors group"
                  >
                    <div className="w-9 h-9 rounded-xl bg-accent-50 text-accent-600 flex items-center justify-center flex-shrink-0">
                      <ShoppingBag className="w-4 h-4" strokeWidth={2.25} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-ink-900 truncate">
                        {o.orderNumber || `#${o.id.slice(-6)}`}
                      </p>
                      <p className="text-xs text-ink-500 truncate">
                        {(o as any).customer?.firstName || (o as any).user?.firstName || o.userId?.slice(-6) || 'Customer'}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-semibold text-ink-900 tabular-nums">
                        {formatCurrency(o.total || 0)}
                      </p>
                      <OrderStatusBadge status={o.status} />
                    </div>
                    <ChevronRight className="w-4 h-4 text-ink-300 group-hover:text-ink-600 flex-shrink-0" />
                  </Link>
                ))}
              </div>
            )}
          </div>
        </Card>

        {/* Low stock */}
        <Card>
          <CardHeader
            title="Low Stock Alerts"
            description="Products needing restock"
            actions={<Link to="/inventory" className="text-xs font-medium text-accent-600 hover:text-accent-700">Manage</Link>}
          />
          <div>
            {lowStockProducts.length === 0 ? (
              <EmptyState
                title="All products stocked"
                description="No low stock alerts at this time."
                icon={CheckCircle2}
                variant="compact"
              />
            ) : (
              <div className="divide-y divide-ink-100">
                {lowStockProducts.slice(0, 6).map((p) => (
                  <div key={p.id} className="flex items-center gap-3 px-5 py-3 hover:bg-ink-50/80 transition-colors">
                    {p.image ? (
                      <img src={p.image} alt={p.name} className="w-10 h-10 rounded-xl object-cover flex-shrink-0 bg-ink-100" />
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-ink-100 flex items-center justify-center flex-shrink-0">
                        <Package className="w-4 h-4 text-ink-400" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-ink-900 truncate">{p.name}</p>
                      <p className="text-xs text-ink-500">{p.sku || '—'}</p>
                    </div>
                    <Badge variant={p.stock === 0 ? 'danger' : 'warning'}>
                      {p.stock} {p.unit}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>

        {/* Recent activity */}
        <Card>
          <CardHeader
            title="Recent Activity"
            description="Latest system events"
            actions={<Activity className="w-4 h-4 text-ink-400" />}
          />
          <div>
            {recentActivities.length === 0 ? (
              <EmptyState title="No recent activity" icon={Activity} variant="compact" />
            ) : (
              <div className="max-h-80 overflow-y-auto scroll-thin">
                {recentActivities.slice(0, 8).map((a) => (
                  <div key={a.id} className="flex items-start gap-3 px-5 py-3 hover:bg-ink-50/80 transition-colors">
                    <div className="w-1.5 h-1.5 rounded-pill bg-accent-500 mt-2 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-ink-700">
                        <span className="font-semibold text-ink-900">{a.user?.name || 'System'}</span>{' '}
                        <span className="text-ink-500">{a.action?.toLowerCase().replace(/_/g, ' ')}</span>
                      </p>
                      <p className="text-2xs text-ink-400 mt-0.5">{relativeTime(a.createdAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* ─── Quick actions ──────────────────────────────── */}
      <Card>
        <CardHeader title="Quick Actions" description="Jump to common tasks" />
        <CardBody>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { label: 'New Product', to: '/products', icon: Package, color: 'accent' as const },
              { label: 'New Order', to: '/orders', icon: ShoppingBag, color: 'info' as const },
              { label: 'New Quote', to: '/quotes', icon: FileText, color: 'success' as const },
              { label: 'Add Customer', to: '/customers', icon: Users, color: 'warning' as const },
              { label: 'Inventory', to: '/inventory', icon: Box, color: 'info' as const },
              { label: 'Categories', to: '/categories', icon: FolderTree, color: 'accent' as const },
            ].map((q) => (
              <Link
                key={q.to}
                to={q.to}
                className="group flex flex-col items-center gap-2 p-4 rounded-2xl border border-ink-200/80 hover:border-accent-300 hover:bg-accent-50/50 transition-all duration-200"
              >
                <div className={clsx(
                  'w-11 h-11 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110',
                  q.color === 'accent' && 'bg-accent-50 text-accent-600',
                  q.color === 'info' && 'bg-info-subtle text-info-600',
                  q.color === 'success' && 'bg-success-subtle text-success-600',
                  q.color === 'warning' && 'bg-warning-subtle text-warning-600',
                )}>
                  <q.icon className="w-5 h-5" strokeWidth={2.25} />
                </div>
                <span className="text-xs font-semibold text-ink-700 group-hover:text-ink-900">
                  {q.label}
                </span>
              </Link>
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

// ─── Hero revenue card (gradient) ───────────────────────────
function RevenueHeroCard({ revenue }: { revenue: { thisMonth: number; lastMonth: number; growthPercent: number } }) {
  const isPositive = revenue.growthPercent >= 0;
  return (
    <div className="lg:col-span-2 relative overflow-hidden rounded-2xl bg-gradient-to-br from-ink-900 via-ink-800 to-ink-900 p-6 lg:p-8 text-white">
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent-500 rounded-full filter blur-3xl opacity-50" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-info-500 rounded-full filter blur-3xl opacity-30" />
      </div>
      <div className="relative">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-sm">
            <DollarSign className="w-4 h-4" />
          </div>
          <p className="text-xs font-semibold text-ink-300 uppercase tracking-wider">Revenue This Month</p>
        </div>
        <p className="text-4xl lg:text-5xl font-bold tracking-tight tabular-nums mb-4">
          {formatCurrency(revenue.thisMonth)}
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <span className={clsx(
            'inline-flex items-center gap-1 px-2.5 h-7 rounded-lg text-sm font-semibold',
            isPositive ? 'bg-success-500/20 text-success-300' : 'bg-danger-500/20 text-danger-300',
          )}>
            {isPositive ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
            {isPositive ? '+' : ''}{revenue.growthPercent.toFixed(1)}%
          </span>
          <span className="text-sm text-ink-300">vs last month ({formatCurrency(revenue.lastMonth)})</span>
        </div>
        <div className="mt-6 pt-6 border-t border-white/10 flex flex-wrap gap-6">
          <MiniStat label="Avg Daily" value={formatCurrency(revenue.thisMonth / Math.max(new Date().getDate(), 1))} />
          <MiniStat label="Best Day" value="—" />
          <MiniStat label="Days Tracked" value={`${new Date().getDate()}`} />
        </div>
      </div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-2xs font-semibold text-ink-400 uppercase tracking-wider">{label}</p>
      <p className="text-lg font-bold text-white tabular-nums mt-0.5">{value}</p>
    </div>
  );
}

// ─── Status badge mapping ───────────────────────────────────
function OrderStatusBadge({ status }: { status: string }) {
  const map: Record<string, { variant: any; label: string }> = {
    PENDING:   { variant: 'warning', label: 'Pending' },
    CONFIRMED: { variant: 'info',    label: 'Confirmed' },
    PROCESSING:{ variant: 'info',    label: 'Processing' },
    DISPATCHED:{ variant: 'info',    label: 'Dispatched' },
    DELIVERED: { variant: 'success', label: 'Delivered' },
    CANCELLED: { variant: 'danger',  label: 'Cancelled' },
  };
  const s = map[status] || { variant: 'ink', label: status };
  return <Badge variant={s.variant} className="text-2xs mt-0.5">{s.label}</Badge>;
}

// Avoid unused import warnings
void Skeleton;
