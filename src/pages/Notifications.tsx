// ────────────────────────────────────────────────────────────
// Premium Notifications — Part 3A
// 7 categories · unread badge · mark all read · preferences
// ────────────────────────────────────────────────────────────

import { useState, useEffect } from 'react';
import {
  Bell, ShoppingBag, Package, FileText, Users, Shield, Megaphone,
  Settings, CheckCheck, Filter, Trash2, MoreVertical, Clock,
  AlertTriangle, CheckCircle2, Info, X, Mail, MessageCircle,
  Calendar, ChevronRight, RefreshCw,
} from 'lucide-react';
import clsx from 'clsx';
import toast from 'react-hot-toast';
import {
  Card, CardHeader, CardBody, Button, Badge, PageHeader, EmptyState,
  Modal, Tabs,
} from '../components/ui/StatCard';
import { formatCurrency, relativeTime } from '../lib/auth';

type NotifCategory = 'orders' | 'inventory' | 'quote' | 'customer' | 'system' | 'security' | 'marketing';

type Notif = {
  id: string;
  category: NotifCategory;
  title: string;
  description: string;
  time: string;
  read: boolean;
  icon?: any;
  actionLabel?: string;
  actionTo?: string;
};

const NOTIFS: Notif[] = [
  { id: 'n1',  category: 'orders',    title: 'New order #ORD-10042', description: 'Ahmed Khan placed an order for ₹12,400', time: new Date(Date.now() - 2 * 60000).toISOString(),  read: false, actionLabel: 'View Order', actionTo: '/orders' },
  { id: 'n2',  category: 'inventory', title: 'Low stock: Portland Cement 50kg', description: 'Only 8 bags left. Restock recommended.', time: new Date(Date.now() - 14 * 60000).toISOString(), read: false, actionLabel: 'Restock', actionTo: '/inventory' },
  { id: 'n3',  category: 'quote',     title: 'Quote accepted: QT-7841', description: 'Customer accepted quote for ₹34,500', time: new Date(Date.now() - 32 * 60000).toISOString(), read: false, actionLabel: 'Convert to Order', actionTo: '/quotes' },
  { id: 'n4',  category: 'customer',  title: 'New customer signup', description: 'Hassan Raza created an account', time: new Date(Date.now() - 3600000).toISOString(),  read: true },
  { id: 'n5',  category: 'system',    title: 'Database backup completed', description: 'Nightly backup successful · 2.3GB', time: new Date(Date.now() - 3 * 3600000).toISOString(),  read: true },
  { id: 'n6',  category: 'security',  title: 'New login from Mumbai', description: 'Admin login from new device (Chrome on macOS)', time: new Date(Date.now() - 5 * 3600000).toISOString(),  read: true },
  { id: 'n7',  category: 'marketing', title: 'Campaign sent: Cement Fest', description: 'Sent to 1,234 customers · 542 opened', time: new Date(Date.now() - 8 * 3600000).toISOString(),  read: true },
  { id: 'n8',  category: 'orders',    title: 'Order #ORD-10041 delivered', description: 'Successfully delivered to Fatima Khan', time: new Date(Date.now() - 12 * 3600000).toISOString(),  read: true },
  { id: 'n9',  category: 'quote',     title: 'New quote request: QT-7843', description: 'Hassan Industries — Steel 50 tons', time: new Date(Date.now() - 18 * 3600000).toISOString(),  read: false, actionLabel: 'View Quote', actionTo: '/quotes' },
  { id: 'n10', category: 'inventory', title: 'Stock updated: TMT Bar 12mm', description: 'Stock increased by 100 units', time: new Date(Date.now() - 24 * 3600000).toISOString(), read: true },
  { id: 'n11', category: 'system',    title: 'New version available', description: 'Admin v2.1.0 is ready to install', time: new Date(Date.now() - 36 * 3600000).toISOString(), read: false },
  { id: 'n12', category: 'customer',  title: 'Customer review submitted', description: '5-star review on Portland Cement 50kg', time: new Date(Date.now() - 48 * 3600000).toISOString(), read: true },
];

const CATEGORY_MAP: Record<NotifCategory, { label: string; icon: any; color: string; bg: string }> = {
  orders:    { label: 'Orders',    icon: ShoppingBag, color: 'text-accent-600',  bg: 'bg-accent-50' },
  inventory: { label: 'Inventory', icon: Package,     color: 'text-warning-600', bg: 'bg-warning-subtle' },
  quote:     { label: 'Quotes',    icon: FileText,    color: 'text-info-600',    bg: 'bg-info-subtle' },
  customer:  { label: 'Customers', icon: Users,       color: 'text-success-600', bg: 'bg-success-subtle' },
  system:    { label: 'System',    icon: Settings,    color: 'text-ink-600',     bg: 'bg-ink-100' },
  security:  { label: 'Security',  icon: Shield,      color: 'text-danger-600',  bg: 'bg-danger-subtle' },
  marketing: { label: 'Marketing', icon: Megaphone,   color: 'text-accent-600',  bg: 'bg-accent-50' },
};

const CATEGORIES: { value: 'all' | NotifCategory; label: string }[] = [
  { value: 'all',       label: 'All' },
  { value: 'orders',    label: 'Orders' },
  { value: 'inventory', label: 'Inventory' },
  { value: 'quote',     label: 'Quotes' },
  { value: 'customer',  label: 'Customers' },
  { value: 'system',    label: 'System' },
  { value: 'security',  label: 'Security' },
  { value: 'marketing', label: 'Marketing' },
];

export default function Notifications() {
  const [filter, setFilter] = useState<'all' | NotifCategory>('all');
  const [readFilter, setReadFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [notifs, setNotifs] = useState<Notif[]>(NOTIFS);
  const [prefsOpen, setPrefsOpen] = useState(false);

  const counts = {
    all: notifs.length,
    unread: notifs.filter((n) => !n.read).length,
    orders: notifs.filter((n) => n.category === 'orders').length,
    inventory: notifs.filter((n) => n.category === 'inventory').length,
    quote: notifs.filter((n) => n.category === 'quote').length,
    customer: notifs.filter((n) => n.category === 'customer').length,
    system: notifs.filter((n) => n.category === 'system').length,
    security: notifs.filter((n) => n.category === 'security').length,
    marketing: notifs.filter((n) => n.category === 'marketing').length,
  };

  const filtered = notifs.filter((n) => {
    if (filter !== 'all' && n.category !== filter) return false;
    if (readFilter === 'unread' && n.read) return false;
    if (readFilter === 'read' && !n.read) return false;
    return true;
  });

  const handleMarkRead = (id: string) => {
    setNotifs((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const handleMarkAllRead = () => {
    setNotifs((prev) => prev.map((n) => ({ ...n, read: true })));
    toast.success('All notifications marked as read');
  };

  const handleDelete = (id: string) => {
    setNotifs((prev) => prev.filter((n) => n.id !== id));
    toast.success('Notification deleted');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Notifications"
        description={`${counts.unread} unread · ${notifs.length} total`}
        breadcrumbs={[{ label: 'System' }, { label: 'Notifications' }]}
        actions={
          <>
            <Button variant="secondary" leftIcon={Settings} onClick={() => setPrefsOpen(true)}>Preferences</Button>
            <Button variant="primary" leftIcon={CheckCheck} onClick={handleMarkAllRead} disabled={counts.unread === 0}>
              Mark all read
            </Button>
          </>
        }
      />

      {/* ─── Filter row ─────────────────────────────────── */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center bg-ink-100 rounded-lg p-0.5">
          {(['all', 'unread', 'read'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setReadFilter(r)}
              className={clsx(
                'px-3 h-8 text-xs font-semibold rounded-md transition-all',
                readFilter === r ? 'bg-white shadow-sm text-ink-900' : 'text-ink-600 hover:text-ink-900',
              )}
            >
              {r === 'all' ? 'All' : r === 'unread' ? `Unread (${counts.unread})` : 'Read'}
            </button>
          ))}
        </div>
        <div className="flex-1" />
        <Badge variant="info" dot>Showing {filtered.length} of {notifs.length}</Badge>
      </div>

      {/* ─── Category tabs ──────────────────────────────── */}
      <Tabs
        active={filter}
        onChange={(v) => setFilter(v as any)}
        tabs={CATEGORIES.map((c) => ({
          value: c.value,
          label: c.label,
          count: c.value === 'all' ? counts.all : (counts as any)[c.value],
        }))}
      />

      {/* ─── Notification list ─────────────────────────── */}
      {filtered.length === 0 ? (
        <Card>
          <EmptyState
            icon={Bell}
            title="No notifications"
            description="You're all caught up!"
          />
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="divide-y divide-ink-100">
            {filtered.map((n) => {
              const cat = CATEGORY_MAP[n.category];
              const Icon = n.icon || cat.icon;
              return (
                <div
                  key={n.id}
                  className={clsx(
                    'group/notif flex items-start gap-3 p-4 transition-colors',
                    !n.read && 'bg-accent-50/30',
                    'hover:bg-ink-50/60',
                  )}
                >
                  <div className={clsx('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0', cat.bg, cat.color)}>
                    <Icon className="w-4 h-4" strokeWidth={2.25} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-ink-900">{n.title}</p>
                      <Badge variant="ink" className="text-2xs">{cat.label}</Badge>
                      {!n.read && <span className="w-2 h-2 rounded-pill bg-accent-500" />}
                    </div>
                    <p className="text-sm text-ink-600 mt-0.5">{n.description}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-2xs text-ink-500 flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5" /> {relativeTime(n.time)}
                      </span>
                      {n.actionLabel && (
                        <button
                          onClick={() => toast.success(`Navigate to ${n.actionTo}`)}
                          className="text-2xs font-semibold text-accent-600 hover:text-accent-700 flex items-center gap-0.5"
                        >
                          {n.actionLabel}
                          <ChevronRight className="w-2.5 h-2.5" />
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover/notif:opacity-100 transition-opacity">
                    {!n.read && (
                      <button
                        onClick={() => handleMarkRead(n.id)}
                        className="w-7 h-7 rounded-md text-ink-500 hover:bg-ink-100 hover:text-ink-900 flex items-center justify-center"
                        title="Mark as read"
                      >
                        <CheckCheck className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(n.id)}
                      className="w-7 h-7 rounded-md text-danger-600 hover:bg-danger-50 flex items-center justify-center"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* ─── Preferences modal ─────────────────────────── */}
      <Modal
        open={prefsOpen}
        onClose={() => setPrefsOpen(false)}
        title="Notification Preferences"
        size="md"
        footer={
          <>
            <Button variant="ghost" onClick={() => setPrefsOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={() => { toast.success('Preferences saved'); setPrefsOpen(false); }}>Save</Button>
          </>
        }
      >
        <div className="space-y-3">
          {CATEGORIES.filter((c) => c.value !== 'all').map((c) => {
            const cat = CATEGORY_MAP[c.value as NotifCategory];
            const Icon = cat.icon;
            return (
              <div key={c.value} className="flex items-center gap-3 p-3 rounded-xl bg-ink-50/60">
                <div className={clsx('w-9 h-9 rounded-xl flex items-center justify-center', cat.bg, cat.color)}>
                  <Icon className="w-4 h-4" strokeWidth={2.25} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-ink-900">{cat.label}</p>
                  <p className="text-2xs text-ink-500">Email + In-app</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="w-10 h-6 bg-ink-200 rounded-pill peer peer-checked:bg-accent-500 transition-colors relative">
                    <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-pill transition-transform peer-checked:translate-x-4" />
                  </div>
                </label>
              </div>
            );
          })}
        </div>
      </Modal>
    </div>
  );
}

// Avoid unused
void Mail;
void MessageCircle;
void Calendar;
void AlertTriangle;
void CheckCircle2;
void Info;
void X;
void MoreVertical;
void RefreshCw;
void Filter;
void formatCurrency;
