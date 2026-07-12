// ────────────────────────────────────────────────────────────
// Dashboard — KPIs + Sales Chart + Activities
// ────────────────────────────────────────────────────────────

import { useEffect, useState } from 'react';
import { dashboardService } from '../lib/services';
import { StatCard, FullPageLoader, EmptyState } from '../components/ui/StatCard';
import {
  Users, Package, FolderTree, FileText, ShoppingBag,
  TrendingUp, AlertTriangle, DollarSign, Activity, Calendar
} from 'lucide-react';
import { formatCurrency, relativeTime } from '../lib/auth';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { DashboardStats } from '../types';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [salesData, setSalesData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [statsRes, salesRes] = await Promise.all([
        dashboardService.getStats(),
        dashboardService.getSalesChart(14),
      ]);
      setStats(statsRes);
      setSalesData(salesRes.data);
    } catch (err) {
      console.error('Failed to load dashboard', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !stats) return <FullPageLoader />;

  const { summary, revenue, growth, lowStockProducts, recentActivities } = stats;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-secondary-900">Dashboard</h1>
          <p className="text-sm text-secondary-500 mt-1">Welcome back! Here's what's happening today.</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-secondary-500">
          <Calendar className="w-4 h-4" />
          {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard label="Total Customers" value={summary.totalCustomers.toLocaleString('en-IN')} icon={Users} color="info" />
        <StatCard label="Total Products" value={summary.totalProducts.toLocaleString('en-IN')} icon={Package} color="primary" />
        <StatCard label="Total Categories" value={summary.totalCategories.toLocaleString('en-IN')} icon={FolderTree} color="secondary" />
        <StatCard label="Total Quotes" value={summary.totalQuotes.toLocaleString('en-IN')} icon={FileText} color="info" />
        <StatCard
          label="Pending Quotes"
          value={summary.pendingQuotes.toLocaleString('en-IN')}
          icon={FileText}
          color="warning"
        />
        <StatCard
          label="Approved Quotes"
          value={summary.approvedQuotes.toLocaleString('en-IN')}
          icon={FileText}
          color="success"
        />
        <StatCard label="Total Orders" value={summary.totalOrders.toLocaleString('en-IN')} icon={ShoppingBag} color="primary" />
        <StatCard label="Today's Orders" value={summary.todaysOrders.toLocaleString('en-IN')} icon={ShoppingBag} color="success" />
      </div>

      {/* Revenue + Growth */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
        <div className="card p-5 lg:col-span-1">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-10 h-10 rounded-lg bg-primary-50 text-primary flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-secondary-500">Revenue This Month</p>
              <p className="text-2xl font-bold text-secondary-900">{formatCurrency(revenue.thisMonth)}</p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-secondary-100">
            <p className="text-xs text-secondary-500 mb-1">vs Last Month</p>
            <p className="text-lg font-semibold text-secondary-700">{formatCurrency(revenue.lastMonth)}</p>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <TrendingUp className={`w-4 h-4 ${revenue.growthPercent >= 0 ? 'text-success' : 'text-danger'}`} />
            <span className={`text-sm font-medium ${revenue.growthPercent >= 0 ? 'text-success-dark' : 'text-danger-dark'}`}>
              {revenue.growthPercent >= 0 ? '+' : ''}{revenue.growthPercent.toFixed(1)}%
            </span>
            <span className="text-xs text-secondary-500">growth</span>
          </div>
        </div>

        <div className="card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-secondary-900">Sales — Last 14 Days</h3>
            <span className="text-xs text-secondary-500">Daily revenue</span>
          </div>
          {salesData.length === 0 ? (
            <EmptyState title="No sales data" description="Sales will appear here once orders are placed." icon={Activity} />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(d) => d.slice(5)} stroke="#94A3B8" />
                <YAxis tick={{ fontSize: 11 }} stroke="#94A3B8" tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  contentStyle={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 8, fontSize: 12 }}
                  formatter={(v: any) => formatCurrency(v)}
                />
                <Line type="monotone" dataKey="revenue" stroke="#F97316" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Rejected + Low Stock + Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-secondary-900">Quote Pipeline</h3>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between py-2 px-3 bg-warning-light/40 rounded-lg">
              <span className="text-sm text-secondary-700">Pending</span>
              <span className="text-lg font-bold text-warning-dark">{summary.pendingQuotes}</span>
            </div>
            <div className="flex items-center justify-between py-2 px-3 bg-success-light/40 rounded-lg">
              <span className="text-sm text-secondary-700">Approved</span>
              <span className="text-lg font-bold text-success-dark">{summary.approvedQuotes}</span>
            </div>
            <div className="flex items-center justify-between py-2 px-3 bg-danger-light/40 rounded-lg">
              <span className="text-sm text-secondary-700">Rejected</span>
              <span className="text-lg font-bold text-danger-dark">{summary.rejectedQuotes}</span>
            </div>
          </div>
          <Link to="/quotes" className="block mt-3 text-center text-sm text-primary hover:underline">
            View all quotes →
          </Link>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-secondary-900">Stock Alerts</h3>
            <AlertTriangle className="w-4 h-4 text-warning" />
          </div>
          {lowStockProducts.length === 0 ? (
            <p className="text-sm text-secondary-500 text-center py-4">All products well-stocked ✓</p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {lowStockProducts.slice(0, 6).map((p) => (
                <div key={p.id} className="flex items-center gap-3 p-2 hover:bg-secondary-50 rounded-lg">
                  {p.image && (
                    <img src={p.image} alt={p.name} className="w-10 h-10 rounded object-cover flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-secondary-900 truncate">{p.name}</p>
                    <p className="text-xs text-secondary-500">{p.stock} {p.unit} left</p>
                  </div>
                </div>
              ))}
            </div>
          )}
          <Link to="/inventory" className="block mt-3 text-center text-sm text-primary hover:underline">
            Manage inventory →
          </Link>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-secondary-900">Recent Activity</h3>
            <Activity className="w-4 h-4 text-secondary-400" />
          </div>
          {recentActivities.length === 0 ? (
            <p className="text-sm text-secondary-500 text-center py-4">No recent activity</p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {recentActivities.slice(0, 8).map((a) => (
                <div key={a.id} className="flex items-start gap-2 p-2 text-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-secondary-700 truncate">
                      <span className="font-medium">{a.user?.name || 'System'}</span>{' '}
                      <span className="text-secondary-500">{a.action.toLowerCase().replace(/_/g, ' ')}</span>
                    </p>
                    <p className="text-xs text-secondary-400">{relativeTime(a.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
