// ────────────────────────────────────────────────────────────
// Premium Topbar — Part 1B + Responsive Notification Dropdown
// Search · Notifications · Profile · Command palette
// ────────────────────────────────────────────────────────────

import { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { NavLink, useNavigate, useLocation, Link } from 'react-router-dom';
import {
  Menu, Bell, Search, ChevronRight, Settings, LogOut, User as UserIcon,
  HelpCircle, Command, Sun, Moon, CheckCheck, X, Package, FileText,
  ShoppingBag, Users, LayoutDashboard,
} from 'lucide-react';
import clsx from 'clsx';
import { useAuth } from '../../contexts/AuthContext';
import { getInitials } from '../../lib/auth';

// ─── Notification types ─────────────────────────────────────
type Notif = {
  id: string;
  type: 'order' | 'quote' | 'inventory' | 'system' | 'customer';
  title: string;
  description: string;
  time: string;
  read?: boolean;
};

const sampleNotifs: Notif[] = [
  { id: '1', type: 'order', title: 'New order #ORD-10042', description: 'Ahmed Khan placed an order for ₹12,400', time: '2m ago' },
  { id: '2', type: 'inventory', title: 'Low stock alert', description: 'Portland Cement 50kg — only 8 bags left in stock', time: '14m ago' },
  { id: '3', type: 'quote', title: 'Quote approved', description: 'QT-7841 marked as APPROVED by customer — 50 TMT bars', time: '32m ago' },
  { id: '4', type: 'customer', title: 'New customer signup', description: 'Hassan Raza just created a customer account on Asif Traders', time: '1h ago' },
  { id: '5', type: 'system', title: 'System update', description: 'Database backup completed successfully — 2.4 GB written', time: '3h ago' },
  { id: '6', type: 'order', title: 'Order shipped', description: 'ORD-10041 handed to Delhivery — tracking DEL1234567890', time: '5h ago' },
];

// ─── Topbar ────────────────────────────────────────────────
export default function Topbar({
  onMenuClick,
  breadcrumbs,
  sidebarCollapsed,
}: {
  onMenuClick: () => void;
  breadcrumbs: { label: string; to?: string }[];
  sidebarCollapsed: boolean;
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [notifs, setNotifs] = useState(sampleNotifs);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // ⌘K to open search
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === 'Escape') {
        setSearchOpen(false);
        setNotifOpen(false);
        setProfileOpen(false);
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  // Lock body scroll when mobile notif panel open
  useEffect(() => {
    if (notifOpen && typeof window !== 'undefined' && window.innerWidth < 768) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = prev; };
    }
  }, [notifOpen]);

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  const unreadCount = notifs.filter((n) => !n.read).length;
  const markAllRead = () => {
    setNotifs((prev) => prev.map((n) => ({ ...n, read: true })));
  };
  const role = typeof user?.role === 'string' ? user.role : (user?.role as any)?.name || 'ADMIN';

  return (
    <>
      <header
        className={clsx(
          'sticky top-0 z-30 bg-white/80 backdrop-blur-xl',
          'border-b border-ink-200/80',
          'h-18 flex items-center px-3 sm:px-5',
        )}
        style={{ height: 72 }}
      >
        {/* Mobile menu */}
        <button
          onClick={onMenuClick}
          className="lg:hidden mr-1 w-10 h-10 rounded-lg text-ink-500 hover:bg-ink-100 hover:text-ink-900 flex items-center justify-center"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Breadcrumbs */}
        <nav className="hidden md:flex items-center gap-1 text-sm flex-1 min-w-0" aria-label="Breadcrumb">
          {breadcrumbs.map((crumb, idx) => (
            <div key={idx} className="flex items-center gap-1 min-w-0">
              {idx > 0 && <ChevronRight className="w-3.5 h-3.5 text-ink-300 flex-shrink-0" />}
              {idx === breadcrumbs.length - 1 || !crumb.to ? (
                <span className={clsx(
                  'truncate',
                  idx === breadcrumbs.length - 1
                    ? 'font-semibold text-ink-900'
                    : 'text-ink-500',
                )}>
                  {crumb.label}
                </span>
              ) : (
                <Link to={crumb.to} className="text-ink-500 hover:text-accent-600 truncate">
                  {crumb.label}
                </Link>
              )}
            </div>
          ))}
        </nav>

        <div className="flex-1 md:hidden" />

        <div className="flex items-center gap-1 sm:gap-2">
          {/* Search button */}
          <button
            onClick={() => setSearchOpen(true)}
            className="hidden sm:flex items-center gap-2 h-9 px-3 bg-ink-50 hover:bg-ink-100 border border-ink-200 rounded-lg text-sm text-ink-500 transition-colors w-64"
          >
            <Search className="w-4 h-4" />
            <span className="flex-1 text-left">Search anything…</span>
            <kbd className="hidden lg:inline-flex items-center gap-0.5 text-2xs font-mono bg-white border border-ink-200 px-1.5 h-5 rounded">
              <Command className="w-2.5 h-2.5" />K
            </kbd>
          </button>
          <button
            onClick={() => setSearchOpen(true)}
            className="sm:hidden w-10 h-10 rounded-lg text-ink-500 hover:bg-ink-100 hover:text-ink-900 flex items-center justify-center"
            aria-label="Search"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Notifications */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setNotifOpen(!notifOpen)}
              className="relative w-10 h-10 rounded-lg text-ink-500 hover:bg-ink-100 hover:text-ink-900 flex items-center justify-center transition-colors"
              aria-label="Notifications"
              aria-expanded={notifOpen}
              aria-haspopup="dialog"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-2 right-2 min-w-[16px] h-4 px-1 bg-danger-500 text-white text-2xs font-bold rounded-pill flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>
            <NotificationPanel
              open={notifOpen}
              onClose={() => setNotifOpen(false)}
              notifs={notifs}
              unreadCount={unreadCount}
              onMarkAllRead={markAllRead}
            />
          </div>

          {/* Profile */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2.5 h-10 pr-2.5 pl-1.5 hover:bg-ink-50 rounded-lg transition-colors"
            >
              <div className="w-8 h-8 rounded-pill bg-gradient-to-br from-accent-400 to-accent-600 text-white text-xs font-semibold flex items-center justify-center flex-shrink-0">
                {getInitials(user?.firstName + ' ' + user?.lastName || user?.email)}
              </div>
              <div className="hidden lg:block text-left min-w-0">
                <div className="text-sm font-semibold text-ink-900 leading-tight truncate max-w-[120px]">
                  {user?.firstName || user?.email?.split('@')[0] || 'Admin'}
                </div>
                <div className="text-2xs text-ink-500 leading-tight truncate">{role}</div>
              </div>
            </button>
            {profileOpen && (
              <div className="absolute right-0 mt-2 w-72 max-w-[calc(100vw-24px)] bg-white rounded-2xl shadow-popover border border-ink-200 z-40 animate-fade-in overflow-hidden">
                <div className="p-4 border-b border-ink-200/80">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-pill bg-gradient-to-br from-accent-400 to-accent-600 text-white font-semibold flex items-center justify-center">
                      {getInitials(user?.firstName + ' ' + user?.lastName || user?.email)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-sm text-ink-900 truncate">
                        {user?.firstName} {user?.lastName}
                      </div>
                      <div className="text-xs text-ink-500 truncate">{user?.email}</div>
                      <div className="mt-1.5">
                        <span className="inline-flex items-center gap-1 text-2xs font-semibold bg-accent-50 text-accent-700 px-1.5 h-4 rounded">
                          {role}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-1.5">
                  <ProfileMenuItem
                    icon={UserIcon}
                    label="My Profile"
                    onClick={() => { setProfileOpen(false); navigate('/settings'); }}
                  />
                  <ProfileMenuItem
                    icon={Settings}
                    label="Settings"
                    onClick={() => { setProfileOpen(false); navigate('/settings'); }}
                  />
                  <ProfileMenuItem
                    icon={HelpCircle}
                    label="Help & Support"
                    onClick={() => setProfileOpen(false)}
                  />
                </div>
                <div className="p-1.5 border-t border-ink-200/80 bg-ink-50/50">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-3 h-9 text-sm text-danger-600 hover:bg-danger-50 rounded-md transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ─── Command palette / search modal ──────────────── */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] px-4 animate-fade-in">
          <div
            className="absolute inset-0 bg-ink-900/40 backdrop-blur-sm"
            onClick={() => setSearchOpen(false)}
          />
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-modal overflow-hidden animate-scale-in">
            <div className="flex items-center gap-3 h-14 px-5 border-b border-ink-200">
              <Search className="w-5 h-5 text-ink-400" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                autoFocus
                placeholder="Search products, orders, customers…"
                className="flex-1 bg-transparent border-0 outline-none text-base text-ink-900 placeholder:text-ink-400"
              />
              <kbd className="text-2xs font-mono bg-ink-100 border border-ink-200 px-1.5 h-5 rounded">Esc</kbd>
            </div>
            <div className="max-h-[60vh] overflow-y-auto scroll-thin p-2">
              <div className="px-3 pt-2 pb-1.5 text-2xs font-bold text-ink-500 uppercase tracking-wider">Quick actions</div>
              {[
                { icon: ShoppingBag, label: 'View all orders', to: '/orders' },
                { icon: FileText, label: 'View all quotes', to: '/quotes' },
                { icon: Package, label: 'Manage products', to: '/products' },
                { icon: Users, label: 'Customer list', to: '/customers' },
                { icon: LayoutDashboard, label: 'Go to dashboard', to: '/' },
              ].map((q) => (
                <button
                  key={q.to}
                  onClick={() => { navigate(q.to); setSearchOpen(false); }}
                  className="w-full flex items-center gap-3 px-3 h-11 rounded-xl text-sm text-ink-700 hover:bg-ink-100 transition-colors"
                >
                  <q.icon className="w-4 h-4 text-ink-500" />
                  <span className="flex-1 text-left">{q.label}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-ink-400" />
                </button>
              ))}
            </div>
            <div className="px-4 py-2.5 border-t border-ink-200/80 bg-ink-50/50 flex items-center justify-between text-2xs text-ink-500">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <kbd className="font-mono bg-white border border-ink-200 px-1 h-4 rounded">↑↓</kbd> Navigate
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="font-mono bg-white border border-ink-200 px-1 h-4 rounded">↵</kbd> Select
                </span>
              </div>
              <span>ASIF TRADERS v1.0</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ─── Notification Panel — fully responsive ─────────────────
function NotificationPanel({
  open,
  onClose,
  notifs,
  unreadCount,
  onMarkAllRead,
}: {
  open: boolean;
  onClose: () => void;
  notifs: Notif[];
  unreadCount: number;
  onMarkAllRead: () => void;
}) {
  if (!open) return null;

  return (
    <>
      {/* Mobile backdrop */}
      <div
        className="md:hidden fixed inset-0 z-40 bg-ink-900/40 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Desktop / tablet: floating dropdown */}
      <div
        role="dialog"
        aria-label="Notifications"
        className={clsx(
          // Positioning & base
          'fixed z-50 bg-white border border-ink-200 overflow-hidden flex flex-col',
          'shadow-popover rounded-2xl',
          'animate-fade-in',
          // Mobile (bottom sheet) — full width, anchored to bottom, capped height
          'inset-x-0 bottom-0 max-h-[85vh] rounded-t-2xl rounded-b-none',
          // Tablet+ (floating dropdown)
          'md:absolute md:right-0 md:left-auto md:top-full md:bottom-auto',
          'md:w-[360px] md:max-w-[calc(100vw-24px)] md:mt-2',
          'md:rounded-2xl md:max-h-[min(640px,calc(100vh-100px))]',
          // Desktop: slightly wider
          'xl:w-[400px]',
        )}
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        {/* Mobile drag handle */}
        <div className="md:hidden pt-2 pb-1 flex justify-center" aria-hidden="true">
          <div className="w-10 h-1 rounded-pill bg-ink-300" />
        </div>

        {/* Sticky header */}
        <div className="sticky top-0 z-10 px-4 sm:px-5 py-3 sm:py-3.5 border-b border-ink-200/80 bg-white/95 backdrop-blur flex items-center justify-between gap-2 flex-shrink-0">
          <div className="min-w-0">
            <h3 className="font-semibold text-sm sm:text-base text-ink-900 leading-tight">Notifications</h3>
            <p className="text-2xs text-ink-500 mt-0.5">
              {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
            </p>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            {unreadCount > 0 && (
              <button
                onClick={onMarkAllRead}
                className="text-2xs font-semibold text-accent-600 hover:text-accent-700 flex items-center gap-1 h-8 px-2 rounded-md hover:bg-accent-50 transition-colors"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span className="hidden xs:inline sm:inline">Mark all read</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="md:hidden w-8 h-8 rounded-md text-ink-500 hover:bg-ink-100 hover:text-ink-900 flex items-center justify-center"
              aria-label="Close notifications"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable list */}
        <div
          className="flex-1 overflow-y-auto scroll-thin"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          {notifs.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <div className="w-12 h-12 mx-auto rounded-full bg-ink-100 flex items-center justify-center mb-3">
                <Bell className="w-5 h-5 text-ink-400" />
              </div>
              <p className="text-sm font-semibold text-ink-900">No notifications</p>
              <p className="text-2xs text-ink-500 mt-1">You're all caught up!</p>
            </div>
          ) : (
            <ul className="divide-y divide-ink-100">
              {notifs.map((n) => (
                <NotifItem key={n.id} notif={n} />
              ))}
            </ul>
          )}
        </div>

        {/* Sticky footer */}
        <div className="sticky bottom-0 px-4 py-2.5 sm:py-3 border-t border-ink-200/80 bg-ink-50/70 backdrop-blur text-center flex-shrink-0">
          <button
            onClick={() => { onClose(); window.location.hash = '#/notifications'; }}
            className="text-xs sm:text-sm font-semibold text-accent-600 hover:text-accent-700 inline-flex items-center gap-1 h-9 px-3 rounded-md hover:bg-accent-50 transition-colors"
          >
            View all notifications
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </>
  );
}

function NotifItem({ notif }: { notif: Notif }) {
  const Icon = {
    order: ShoppingBag,
    quote: FileText,
    inventory: Package,
    system: Settings,
    customer: Users,
  }[notif.type];
  const color = {
    order: 'bg-accent-50 text-accent-600',
    quote: 'bg-info-subtle text-info-600',
    inventory: 'bg-warning-subtle text-warning-600',
    system: 'bg-ink-100 text-ink-600',
    customer: 'bg-success-subtle text-success-600',
  }[notif.type];
  return (
    <li
      className={clsx(
        'flex items-start gap-2.5 sm:gap-3 px-4 sm:px-5 py-3 hover:bg-ink-50/80 active:bg-ink-100 transition-colors cursor-pointer',
        !notif.read && 'bg-accent-50/30',
      )}
    >
      <div className={clsx('w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0', color)}>
        <Icon className="w-4 h-4" strokeWidth={2.25} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-ink-900 break-words leading-snug">{notif.title}</p>
        <p className="text-xs text-ink-500 mt-0.5 break-words leading-relaxed">{notif.description}</p>
        <p className="text-2xs text-ink-400 mt-1">{notif.time}</p>
      </div>
      {!notif.read && <span className="w-2 h-2 rounded-pill bg-accent-500 mt-2 flex-shrink-0" aria-label="Unread" />}
    </li>
  );
}

function ProfileMenuItem({
  icon: Icon, label, onClick,
}: {
  icon: any; label: string; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-2.5 px-3 h-9 text-sm text-ink-700 hover:bg-ink-100 rounded-md transition-colors"
    >
      <Icon className="w-4 h-4 text-ink-500" />
      <span>{label}</span>
    </button>
  );
}

// Avoid unused import warnings
void NavLink;
void useLocation;
void useLayoutEffect;
void Sun;
void Moon;
