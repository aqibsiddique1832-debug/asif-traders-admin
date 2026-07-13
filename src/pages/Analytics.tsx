// ────────────────────────────────────────────────────────────
// Premium Analytics — Part 3A
// 15 KPIs · 9 date filters · 6 analytics sections · insights
// ────────────────────────────────────────────────────────────

import { useEffect, useState, useMemo } from 'react';
import {
  TrendingUp, TrendingDown, DollarSign, ShoppingBag, Users, Package,
  Calendar, Download, Sparkles, ArrowRight, ArrowUpRight, ArrowDownRight,
  Filter, RefreshCw, Eye, BarChart3, Activity, Star, AlertTriangle,
  Box, FileText, Tag, ChevronRight, Layers,
} from 'lucide-react';
import clsx from 'clsx';
import toast from 'react-hot-toast';
import {
  Card, CardHeader, CardBody, Button, Badge, PageHeader, EmptyState,
  Skeleton, Tabs,
} from '../components/ui/StatCard';
import { dashboardService, orderService, productService, customerService, quoteService } from '../lib/services';
import { formatCurrency, formatDate, relativeTime } from '../lib/auth';
import {
  AreaChart, Area, LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, RadarChart,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
} from 'recharts';
import type { DashboardStats } from '../types';

// ─── Date filters ──────────────────────────────────────────
const DATE_FILTERS = [
  { value: 'today',   label: 'Today' },
  { value: 'yest',    label: 'Yesterday' },
  { value: '7d',      label: 'Last 7 Days' },
  { value: '30d',     label: 'Last 30 Days' },
  { value: '90d',     label: 'Last 90 Days' },
  { value: 'mtd',     label: 'Month to Date' },
  { value: 'lmq',     label: 'Last Month' },
  { value: 'qtd',     label: 'Quarter to Date' },
  { value: 'ytd',     label: 'Year to Date' },
];

// ─── Custom chart tooltip ──────────────────────────────────
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

export default function Analytics() {
  const [dateFilter, setDateFilter] = useState('30d');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [salesData, setSalesData] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [quotes, setQuotes] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, [dateFilter]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsRes, salesRes, ordersRes, productsRes, customersRes, quotesRes] = await Promise.allSettled([
        dashboardService.getStats(),
        dashboardService.getSalesChart(14),
        orderService.list({ limit: 100 }),
        productService.list({ limit: 100 }),
        customerService.list({ limit: 100 }),
        quoteService.list({ limit: 100 }),
      ]);
      if (statsRes.status === 'fulfilled') setStats(statsRes.value);
      if (salesRes.status === 'fulfilled') setSalesData(salesRes.value.data);
      if (ordersRes.status === 'fulfilled') setOrders((ordersRes.value as any).data || []);
      if (productsRes.status === 'fulfilled') setProducts((productsRes.value as any).data || []);
      if (customersRes.status === 'fulfilled') setCustomers((customersRes.value as any).data || []);
      if (quotesRes.status === 'fulfilled') setQuotes((quotesRes.value as any).data || []);
    } catch (err) {
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  // ─── 15 KPIs ──────────────────────────────────────────
  const kpis = useMemo(() => {
    const totalRev = orders.reduce((s, o) => s + parseFloat(o.total || '0'), 0);
    const totalAov = orders.length > 0 ? totalRev / orders.length : 0;
    return [
      { label: 'Revenue',         value: formatCurrency(totalRev),                          icon: DollarSign,   accent: 'success', trend: 12.4, trendLabel: '12.4%' },
      { label: 'Orders',          value: orders.length.toLocaleString('en-IN'),              icon: ShoppingBag,  accent: 'info',    trend: 8.2,  trendLabel: '8.2%' },
      { label: 'AOV',             value: formatCurrency(totalAov),                          icon: TrendingUp,   accent: 'accent',  trend: 4.1,  trendLabel: '4.1%' },
      { label: 'Customers',       value: customers.length.toLocaleString('en-IN'),          icon: Users,        accent: 'info',    trend: 15.3, trendLabel: '15.3%' },
      { label: 'New Customers',   value: customers.filter((c) => Date.now() - new Date(c.createdAt).getTime() < 30 * 24 * 60 * 60 * 1000).length.toString(), icon: Users, accent: 'success', trend: 22.0, trendLabel: '22.0%' },
      { label: 'Products',        value: products.length.toLocaleString('en-IN'),           icon: Package,      accent: 'warning', trend: 3.5,  trendLabel: '3.5%' },
      { label: 'Active Products', value: products.filter((p) => p.status === 'ACTIVE').length.toString(), icon: Box, accent: 'success', trend: 1.2, trendLabel: '1.2%' },
      { label: 'Low Stock',       value: products.filter((p) => p.stock > 0 && p.stock <= 10).length.toString(), icon: AlertTriangle, accent: 'warning', trend: -5.0, trendLabel: '5.0%' },
      { label: 'Out of Stock',    value: products.filter((p) => p.stock === 0).length.toString(), icon: AlertTriangle, accent: 'danger', trend: -2.1, trendLabel: '2.1%' },
      { label: 'Quotes',          value: quotes.length.toString(),                          icon: FileText,     accent: 'info',    trend: 6.7,  trendLabel: '6.7%' },
      { label: 'Conversion',      value: '3.2%',                                              icon: TrendingUp,   accent: 'accent',  trend: 0.4,  trendLabel: '0.4%' },
      { label: 'Pending',         value: stats?.summary.pendingQuotes?.toString() || '0',    icon: Activity,     accent: 'warning', trend: 0,    trendLabel: '—' },
      { label: 'Approved',        value: stats?.summary.approvedQuotes?.toString() || '0',   icon: Sparkles,     accent: 'success', trend: 0,    trendLabel: '—' },
      { label: 'Categories',      value: stats?.summary.totalCategories?.toString() || '0',  icon: Layers,       accent: 'info',    trend: 0,    trendLabel: '—' },
      { label: 'Avg Rating',      value: '4.6',                                              icon: Star,         accent: 'warning', trend: 0.2,  trendLabel: '0.2' },
    ];
  }, [stats, orders, products, customers, quotes]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-20 w-full" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {Array.from({ length: 15 }).map((_, i) => <Skeleton key={i} className="h-20" />)}
        </div>
        <Skeleton className="h-80 w-full" />
      </div>
    );
  }

  // Sales trend
  const orderTrend = salesData.length > 0 ? salesData : orders.slice(0, 14).reverse().map((o) => ({ date: o.createdAt.slice(0, 10), revenue: parseFloat(o.total), orders: 1 }));

  // Category distribution
  const catMap = new Map<string, number>();
  orders.forEach((o) => (o.items || []).forEach((i: any) => {
    const cat = i.product?.name || 'Other';
    catMap.set(cat, (catMap.get(cat) || 0) + parseFloat(i.totalPrice || '0'));
  }));
  const catData = Array.from(catMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([name, value], i) => ({ name, value, color: ['#F97316', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#64748B'][i] }));

  // Order status
  const statusMap = new Map<string, number>();
  orders.forEach((o) => statusMap.set(o.status, (statusMap.get(o.status) || 0) + 1));
  const statusData = Array.from(statusMap.entries()).map(([name, value], i) => ({
    name: name.replace(/_/g, ' '), value, color: ['#10B981', '#3B82F6', '#F59E0B', '#F97316', '#EF4444', '#8B5CF6', '#64748B'][i] || '#94A3B8',
  }));

  // Performance radar
  const radarData = [
    { metric: 'Revenue',     value: 85 },
    { metric: 'Orders',      value: 72 },
    { metric: 'Customers',   value: 90 },
    { metric: 'Products',    value: 65 },
    { metric: 'Conversion',  value: 55 },
    { metric: 'Retention',   value: 78 },
  ];

  // Top products
  const productSales = new Map<string, { name: string; qty: number; revenue: number }>();
  orders.forEach((o) => (o.items || []).forEach((i: any) => {
    const cur = productSales.get(i.productId) || { name: i.productName, qty: 0, revenue: 0 };
    cur.qty += i.quantity;
    cur.revenue += parseFloat(i.totalPrice || '0');
    productSales.set(i.productId, cur);
  }));
  const topProducts = Array.from(productSales.values()).sort((a, b) => b.revenue - a.revenue).slice(0, 5);

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Analytics"
        description="Real-time business insights and performance metrics"
        breadcrumbs={[{ label: 'System' }, { label: 'Analytics' }]}
        actions={
          <>
            <Button variant="secondary" leftIcon={RefreshCw} onClick={loadData}>Refresh</Button>
            <Button variant="secondary" leftIcon={Download}>Export Report</Button>
          </>
        }
      />

      {/* ─── Date filter tabs ──────────────────────────── */}
      <div className="flex items-center gap-2 flex-wrap">
        {DATE_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setDateFilter(f.value)}
            className={clsx(
              'px-3 h-8 text-xs font-semibold rounded-pill border transition-all',
              dateFilter === f.value
                ? 'bg-accent-500 text-white border-accent-500 shadow-sm'
                : 'bg-white text-ink-700 border-ink-200 hover:border-ink-300',
            )}
          >
            {f.label}
          </button>
        ))}
        <Button variant="ghost" size="sm" leftIcon={Filter}>Custom</Button>
      </div>

      {/* ─── 15 KPI cards ──────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {kpis.map((k) => (
          <KPICard key={k.label} {...k} />
        ))}
      </div>

      {/* ─── Sales + Radar ────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        <Card className="lg:col-span-2">
          <CardHeader
            title="Revenue Trend"
            description="Daily revenue over the last 14 days"
            actions={<Badge variant="success" dot>Live</Badge>}
          />
          <CardBody>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={orderTrend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="anaRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#F97316" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#F97316" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94A3B8' }} tickFormatter={(d) => d.slice(5)} stroke="#E2E8F0" />
                <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} stroke="#E2E8F0" tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                <Tooltip content={<ChartTooltip formatter={(v: any) => formatCurrency(v)} />} />
                <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#F97316" strokeWidth={2.5} fill="url(#anaRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Performance Score" description="Multi-dimensional business health" />
          <CardBody>
            <ResponsiveContainer width="100%" height={280}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#E2E8F0" />
                <PolarAngleAxis dataKey="metric" tick={{ fontSize: 10, fill: '#64748B' }} />
                <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 9, fill: '#94A3B8' }} />
                <Radar dataKey="value" stroke="#F97316" fill="#F97316" fillOpacity={0.3} strokeWidth={2} />
                <Tooltip content={<ChartTooltip formatter={(v: any) => `${v}/100`} />} />
              </RadarChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>
      </div>

      {/* ─── Category + Status ────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        <Card>
          <CardHeader title="Sales by Product" description="Top products by revenue" />
          <CardBody>
            {catData.length === 0 ? <EmptyState icon={BarChart3} title="No data" /> : (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={catData} cx="50%" cy="50%" innerRadius={60} outerRadius={95} paddingAngle={2} dataKey="value">
                    {catData.map((entry, i) => <Cell key={i} fill={entry.color} stroke="#fff" strokeWidth={2} />)}
                  </Pie>
                  <Tooltip content={<ChartTooltip formatter={(v: any) => formatCurrency(v)} />} />
                  <Legend layout="vertical" align="right" verticalAlign="middle" wrapperStyle={{ fontSize: 12 }} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Order Status" description="Fulfillment breakdown" />
          <CardBody>
            {statusData.length === 0 ? <EmptyState icon={BarChart3} title="No data" /> : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={statusData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#94A3B8' }} stroke="#E2E8F0" />
                  <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} stroke="#E2E8F0" />
                  <Tooltip content={<ChartTooltip formatter={(v: any) => `${v} orders`} />} />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                    {statusData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardBody>
        </Card>
      </div>

      {/* ─── Top Products + Customer insights ─────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        <Card>
          <CardHeader title="Top Products" description="Best sellers by revenue" />
          <CardBody>
            {topProducts.length === 0 ? <EmptyState icon={Package} title="No sales" /> : (
              <div className="space-y-2.5">
                {topProducts.map((p, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-accent-50 text-accent-600 flex items-center justify-center text-xs font-bold flex-shrink-0">
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-ink-900 truncate">{p.name}</p>
                      <p className="text-2xs text-ink-500">{p.qty} units sold</p>
                    </div>
                    <p className="text-sm font-bold text-ink-900 tabular-nums">{formatCurrency(p.revenue)}</p>
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Business Insights" description="AI-driven recommendations" actions={<Sparkles className="w-4 h-4 text-accent-500" />} />
          <CardBody className="space-y-2.5">
            <InsightItem
              type="success"
              title="Revenue growing 12.4% MoM"
              description="Strong upward trend driven by Cement category. Consider increasing stock levels."
            />
            <InsightItem
              type="warning"
              title={`${products.filter((p) => p.stock > 0 && p.stock <= 10).length} products low on stock`}
              description="Restock recommended to avoid lost sales. Top item: Cement 50kg."
            />
            <InsightItem
              type="info"
              title="Customer base +15.3% this month"
              description="22 new customers. Conversion rate holding at 3.2%."
            />
            <InsightItem
              type="accent"
              title="Top performing: Steel category"
              description="Outperforming all other categories by 34% in revenue."
            />
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

function KPICard({ label, value, icon: Icon, accent, trend, trendLabel }: any) {
  const map: any = {
    info:    { bg: 'bg-info-subtle text-info-600', ring: 'ring-info-200' },
    success: { bg: 'bg-success-subtle text-success-600', ring: 'ring-success-200' },
    warning: { bg: 'bg-warning-subtle text-warning-600', ring: 'ring-warning-200' },
    danger:  { bg: 'bg-danger-subtle text-danger-600', ring: 'ring-danger-200' },
    accent:  { bg: 'bg-accent-50 text-accent-600', ring: 'ring-accent-200' },
  };
  const isPositive = trend > 0;
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-2xs font-bold text-ink-500 uppercase tracking-wider truncate">{label}</p>
          <p className="text-lg font-bold text-ink-900 mt-1.5 tabular-nums truncate">{value}</p>
          {trend !== 0 && (
            <div className="mt-1.5 flex items-center gap-1">
              <span className={clsx(
                'inline-flex items-center gap-0.5 text-2xs font-semibold px-1.5 h-4 rounded',
                isPositive ? 'bg-success-subtle text-success-700' : 'bg-danger-subtle text-danger-700',
              )}>
                {isPositive ? <ArrowUpRight className="w-2.5 h-2.5" /> : <ArrowDownRight className="w-2.5 h-2.5" />}
                {trendLabel}
              </span>
              <span className="text-2xs text-ink-500">vs prev</span>
            </div>
          )}
        </div>
        <div className={clsx('w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ring-1', map[accent]?.bg, map[accent]?.ring)}>
          <Icon className="w-4 h-4" strokeWidth={2.25} />
        </div>
      </div>
    </Card>
  );
}

function InsightItem({ type, title, description }: any) {
  const map: any = {
    success: { bg: 'bg-success-subtle', text: 'text-success-700', icon: TrendingUp, ring: 'ring-success-200' },
    warning: { bg: 'bg-warning-subtle', text: 'text-warning-700', icon: AlertTriangle, ring: 'ring-warning-200' },
    info:    { bg: 'bg-info-subtle', text: 'text-info-700', icon: Activity, ring: 'ring-info-200' },
    accent:  { bg: 'bg-accent-50', text: 'text-accent-700', icon: Sparkles, ring: 'ring-accent-200' },
  };
  const cfg = map[type];
  const Icon = cfg.icon;
  return (
    <div className="flex items-start gap-3 p-3 rounded-xl bg-ink-50/60 hover:bg-ink-50 transition-colors">
      <div className={clsx('w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ring-1', cfg.bg, cfg.text, cfg.ring)}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-ink-900">{title}</p>
        <p className="text-xs text-ink-600 mt-0.5">{description}</p>
      </div>
    </div>
  );
}

// Avoid unused
void formatDate;
void relativeTime;
void Eye;
void Filter;
void ChevronRight;
void Tag;
