// ────────────────────────────────────────────────────────────
// Premium Topbar — Part 1B + Responsive Notification Dropdown
// Search · Notifications · Profile · Command palette
// ────────────────────────────────────────────────────────────

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
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

const initialNotifs: Notif[] = [
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
  const [notifs, setNotifs] = useState<Notif[]>(initialNotifs);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close profile dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // ⌘K to open search · Escape closes all overlays
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

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  const unreadCount = notifs.filter((n) => !n.read).length;
  const markAllRead = () => {
    setNotifs((prev) => prev.map((n) => ({ ...n, read: true })));
  };
  const handleNotifClick = (id: string) => {
    setNotifs((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
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
          {/* Search button — responsive: collapsed on mobile, expanded on sm+, full label on lg+ */}
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="flex items-center gap-2 h-9 px-2.5 sm:px-3 bg-ink-50 hover:bg-ink-100 active:bg-ink-200 border border-ink-200 rounded-lg text-sm text-ink-500 transition-colors min-w-0 max-w-[140px] sm:max-w-[180px] md:max-w-[220px] lg:w-64 lg:max-w-none"
            aria-label="Open search"
          >
            <Search className="w-4 h-4 flex-shrink-0" />
            <span className="flex-1 text-left truncate hidden xs:inline sm:inline">Search anything…</span>
            <kbd className="hidden lg:inline-flex items-center gap-0.5 text-2xs font-mono bg-white border border-ink-200 px-1.5 h-5 rounded flex-shrink-0">
              <Command className="w-2.5 h-2.5" />K
            </kbd>
          </button>

          {/* Notifications — bell is its own clickable button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setNotifOpen((prev) => !prev);
              setProfileOpen(false);
            }}
            className="relative w-10 h-10 rounded-lg text-ink-500 hover:bg-ink-100 hover:text-ink-900 flex items-center justify-center transition-colors"
            aria-label="Notifications"
            aria-expanded={notifOpen}
            aria-haspopup="dialog"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2 min-w-[16px] h-4 px-1 bg-danger-500 text-white text-2xs font-bold rounded-pill flex items-center justify-center pointer-events-none">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Profile */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setProfileOpen((prev) => !prev);
                setNotifOpen(false);
              }}
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
              <div className="absolute right-0 mt-2 w-72 max-w-[calc(100vw-24px)] bg-white rounded-2xl shadow-popover border border-ink-200 z-50 animate-fade-in overflow-hidden">
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

      {/* ─── Notification Panel — rendered in a portal, fully isolated ─── */}
      <NotificationPanelPortal
        open={notifOpen}
        onClose={() => setNotifOpen(false)}
        notifs={notifs}
        unreadCount={unreadCount}
        onMarkAllRead={markAllRead}
        onNotifClick={handleNotifClick}
        onViewAll={() => {
          setNotifOpen(false);
          navigate('/notifications');
        }}
      />

      {/* ─── Command palette / search modal (portal) ──────── */}
      <SearchPalettePortal
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        search={search}
        setSearch={setSearch}
        onNavigate={(to) => { setSearchOpen(false); navigate(to); }}
      />
    </>
  );
}

// ─── Search Palette Portal — renders at body level ──────────
function SearchPalettePortal({
  open,
  onClose,
  search,
  setSearch,
  onNavigate,
}: {
  open: boolean;
  onClose: () => void;
  search: string;
  setSearch: (s: string) => void;
  onNavigate: (to: string) => void;
}) {
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < 768 : false
  );

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Body scroll lock when open on mobile
  useEffect(() => {
    if (!open || !isMobile) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [open, isMobile]);

  if (!open || typeof document === 'undefined') return null;

  return createPortal(
    <SearchPalette
      onClose={onClose}
      search={search}
      setSearch={setSearch}
      onNavigate={onNavigate}
      isMobile={isMobile}
    />,
    document.body
  );
}

// ─── Search Palette — full-screen on mobile, modal on desktop ─
function SearchPalette({
  onClose,
  search,
  setSearch,
  onNavigate,
  isMobile,
}: {
  onClose: () => void;
  search: string;
  setSearch: (s: string) => void;
  onNavigate: (to: string) => void;
  isMobile: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [activeIdx, setActiveIdx] = useState(0);

  const quickActions = [
    { icon: ShoppingBag, label: 'View all orders', to: '/orders', keywords: 'order orders sale' },
    { icon: FileText, label: 'View all quotes', to: '/quotes', keywords: 'quote quotes estimate' },
    { icon: Package, label: 'Manage products', to: '/products', keywords: 'product products catalog' },
    { icon: Users, label: 'Customer list', to: '/customers', keywords: 'customer users' },
    { icon: LayoutDashboard, label: 'Go to dashboard', to: '/', keywords: 'dashboard home main' },
  ];

  const filtered = quickActions.filter(
    (q) => !search || `${q.label} ${q.keywords}`.toLowerCase().includes(search.toLowerCase())
  );

  // Reset active index on filter change
  useEffect(() => { setActiveIdx(0); }, [search]);

  // Keyboard nav
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIdx((i) => Math.min(i + 1, filtered.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIdx((i) => Math.max(i - 1, 0));
      } else if (e.key === 'Enter' && filtered[activeIdx]) {
        e.preventDefault();
        onNavigate(filtered[activeIdx].to);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [filtered, activeIdx, onNavigate]);

  // Autofocus
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const content = (
    <div
      className={clsx(
        'flex flex-col bg-white overflow-hidden',
        isMobile
          ? 'fixed inset-0 z-[80] animate-fade-in'
          : 'fixed inset-0 z-[80] flex items-start justify-center pt-[10vh] px-3 sm:px-4 animate-fade-in',
      )}
      style={isMobile ? { paddingTop: 'env(safe-area-inset-top, 0px)', paddingBottom: 'env(safe-area-inset-bottom, 0px)' } : undefined}
    >
      {/* Backdrop (desktop only — mobile is full-screen) */}
      {!isMobile && (
        <div
          className="absolute inset-0 bg-ink-900/40 backdrop-blur-sm"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <div
        className={clsx(
          'relative bg-white flex flex-col overflow-hidden',
          isMobile
            ? 'w-full h-full'
            : 'w-full max-w-2xl rounded-2xl sm:rounded-3xl shadow-modal animate-scale-in',
        )}
        style={isMobile ? undefined : { maxHeight: 'min(640px, calc(100vh - 80px))' }}
      >
        {/* Input row */}
        <div className="flex items-center gap-2 sm:gap-3 h-14 px-3 sm:px-5 border-b border-ink-200 flex-shrink-0">
          <Search className="w-5 h-5 text-ink-400 flex-shrink-0" />
          <input
            ref={inputRef}
            type="search"
            inputMode="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products, orders, customers…"
            className="flex-1 min-w-0 bg-transparent border-0 outline-none text-base text-ink-900 placeholder:text-ink-400"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            enterKeyHint="search"
          />
          {isMobile ? (
            <button
              type="button"
              onClick={onClose}
              className="flex-shrink-0 h-9 px-3 rounded-lg text-sm font-semibold text-accent-600 hover:bg-accent-50 active:bg-accent-100 transition-colors"
            >
              Cancel
            </button>
          ) : (
            <kbd className="hidden sm:inline-flex items-center text-2xs font-mono bg-ink-100 border border-ink-200 px-1.5 h-5 rounded flex-shrink-0">
              Esc
            </kbd>
          )}
        </div>

        {/* Results / quick actions */}
        <div
          className="flex-1 overflow-y-auto scroll-thin"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          {filtered.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <div className="w-12 h-12 mx-auto rounded-full bg-ink-100 flex items-center justify-center mb-3">
                <Search className="w-5 h-5 text-ink-400" />
              </div>
              <p className="text-sm font-semibold text-ink-900">No results for “{search}”</p>
              <p className="text-2xs text-ink-500 mt-1">Try different keywords</p>
            </div>
          ) : (
            <>
              <div className="px-3 sm:px-5 pt-2 pb-1.5 text-2xs font-bold text-ink-500 uppercase tracking-wider">
                {search ? 'Results' : 'Quick actions'}
              </div>
              <ul className="px-1 sm:px-2 pb-2">
                {filtered.map((q, idx) => {
                  const Icon = q.icon;
                  return (
                    <li key={q.to}>
                      <button
                        type="button"
                        onClick={() => onNavigate(q.to)}
                        onMouseEnter={() => setActiveIdx(idx)}
                        className={clsx(
                          'w-full flex items-center gap-3 px-2.5 sm:px-3 h-11 rounded-xl text-sm transition-colors text-left',
                          activeIdx === idx
                            ? 'bg-accent-50 text-accent-900'
                            : 'text-ink-700 hover:bg-ink-100',
                        )}
                      >
                        <Icon className={clsx('w-4 h-4 flex-shrink-0', activeIdx === idx ? 'text-accent-600' : 'text-ink-500')} />
                        <span className="flex-1 truncate">{q.label}</span>
                        <ChevronRight className={clsx('w-3.5 h-3.5 flex-shrink-0', activeIdx === idx ? 'text-accent-600' : 'text-ink-400')} />
                      </button>
                    </li>
                  );
                })}
              </ul>
            </>
          )}
        </div>

        {/* Footer hints */}
        {!isMobile && (
          <div className="px-3 sm:px-4 py-2 border-t border-ink-200/80 bg-ink-50/50 flex items-center justify-between text-2xs text-ink-500 gap-2 flex-shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <span className="flex items-center gap-1 flex-shrink-0">
                <kbd className="font-mono bg-white border border-ink-200 px-1 h-4 rounded">↑↓</kbd> Navigate
              </span>
              <span className="flex items-center gap-1 flex-shrink-0">
                <kbd className="font-mono bg-white border border-ink-200 px-1 h-4 rounded">↵</kbd> Select
              </span>
            </div>
            <span className="flex-shrink-0 truncate">ASIF TRADERS v1.0</span>
          </div>
        )}
      </div>
    </div>
  );

  return content;
}

// ─── Notification Panel Portal (renders at body level) ─────
function NotificationPanelPortal(props: {
  open: boolean;
  onClose: () => void;
  notifs: Notif[];
  unreadCount: number;
  onMarkAllRead: () => void;
  onNotifClick: (id: string) => void;
  onViewAll: () => void;
}) {
  const { open, onClose } = props;

  if (!open || typeof document === 'undefined') return null;

  return createPortal(
    <NotificationPanel {...props} onClose={onClose} />,
    document.body
  );
}

// ─── Notification Panel — bottom sheet on mobile, dropdown on tablet+ ─
function NotificationPanel({
  onClose,
  notifs,
  unreadCount,
  onMarkAllRead,
  onNotifClick,
  onViewAll,
}: {
  open: boolean;
  onClose: () => void;
  notifs: Notif[];
  unreadCount: number;
  onMarkAllRead: () => void;
  onNotifClick: (id: string) => void;
  onViewAll: () => void;
}) {
  // Body scroll lock on mobile
  useEffect(() => {
    const isMobile = window.innerWidth < 768;
    if (!isMobile) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  // Swipe-down to close on mobile
  const sheetRef = useRef<HTMLDivElement>(null);
  const dragStart = useRef<{ y: number; t: number } | null>(null);
  const [dragY, setDragY] = useState(0);

  const onTouchStart = (e: React.TouchEvent) => {
    if (window.innerWidth >= 768) return;
    dragStart.current = { y: e.touches[0].clientY, t: Date.now() };
  };
  const onTouchMove = (e: React.TouchEvent) => {
    if (!dragStart.current || window.innerWidth >= 768) return;
    const dy = e.touches[0].clientY - dragStart.current.y;
    if (dy > 0) setDragY(dy);
  };
  const onTouchEnd = () => {
    if (!dragStart.current) return;
    const dy = dragY;
    const elapsed = Date.now() - dragStart.current.t;
    if (dy > 80 || (dy > 30 && elapsed < 250)) onClose();
    setDragY(0);
    dragStart.current = null;
  };

  return (
    <>
      {/* Backdrop — z-60 above topbar (z-30) */}
      <div
        className="fixed inset-0 z-[60] bg-ink-900/40 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Mobile bottom sheet */}
      <div
        ref={sheetRef}
        role="dialog"
        aria-label="Notifications"
        aria-modal="true"
        className={clsx(
          'md:hidden fixed z-[70] left-0 right-0 bottom-0',
          'max-h-[90vh] flex flex-col bg-white border-t border-ink-200',
          'rounded-t-2xl shadow-modal overflow-hidden',
          'animate-slide-up',
        )}
        style={{
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
          transform: dragY > 0 ? `translateY(${dragY}px)` : undefined,
          transition: dragY === 0 ? 'transform 0.25s ease' : 'none',
        }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {/* Drag handle */}
        <div className="pt-2.5 pb-1.5 flex justify-center" aria-hidden="true">
          <div className="w-10 h-1 rounded-pill bg-ink-300" />
        </div>

        <NotifHeader
          unreadCount={unreadCount}
          onMarkAllRead={onMarkAllRead}
          onClose={onClose}
          showClose
        />

        <NotifList
          notifs={notifs}
          onNotifClick={onNotifClick}
        />

        <NotifFooter onViewAll={onViewAll} />
      </div>

      {/* Tablet + desktop floating dropdown */}
      <div
        role="dialog"
        aria-label="Notifications"
        className={clsx(
          'hidden md:flex fixed z-[70] flex-col bg-white border border-ink-200',
          'rounded-2xl shadow-popover overflow-hidden animate-fade-in',
          'top-[80px] right-3 w-[360px] max-w-[calc(100vw-24px)]',
          'max-h-[min(640px,calc(100vh-100px))]',
          'xl:w-[400px] xl:right-4',
        )}
      >
        <NotifHeader unreadCount={unreadCount} onMarkAllRead={onMarkAllRead} onClose={onClose} showClose={false} />
        <NotifList notifs={notifs} onNotifClick={onNotifClick} />
        <NotifFooter onViewAll={onViewAll} />
      </div>
    </>
  );
}

function NotifHeader({
  unreadCount,
  onMarkAllRead,
  onClose,
  showClose,
}: {
  unreadCount: number;
  onMarkAllRead: () => void;
  onClose: () => void;
  showClose: boolean;
}) {
  return (
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
            type="button"
            onClick={onMarkAllRead}
            className="text-2xs font-semibold text-accent-600 hover:text-accent-700 flex items-center gap-1 h-8 px-2 rounded-md hover:bg-accent-50 transition-colors"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Mark all read</span>
          </button>
        )}
        {showClose && (
          <button
            type="button"
            onClick={onClose}
            className="md:hidden w-8 h-8 rounded-md text-ink-500 hover:bg-ink-100 hover:text-ink-900 flex items-center justify-center"
            aria-label="Close notifications"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}

function NotifList({ notifs, onNotifClick }: { notifs: Notif[]; onNotifClick: (id: string) => void }) {
  if (notifs.length === 0) {
    return (
      <div className="flex-1 overflow-y-auto scroll-thin">
        <div className="px-6 py-12 text-center">
          <div className="w-12 h-12 mx-auto rounded-full bg-ink-100 flex items-center justify-center mb-3">
            <Bell className="w-5 h-5 text-ink-400" />
          </div>
          <p className="text-sm font-semibold text-ink-900">No notifications</p>
          <p className="text-2xs text-ink-500 mt-1">You're all caught up!</p>
        </div>
      </div>
    );
  }
  return (
    <div
      className="flex-1 overflow-y-auto scroll-thin"
      style={{ WebkitOverflowScrolling: 'touch' }}
    >
      <ul className="divide-y divide-ink-100">
        {notifs.map((n) => (
          <NotifItem key={n.id} notif={n} onClick={onNotifClick} />
        ))}
      </ul>
    </div>
  );
}

function NotifFooter({ onViewAll }: { onViewAll: () => void }) {
  return (
    <div className="sticky bottom-0 px-4 py-2.5 sm:py-3 border-t border-ink-200/80 bg-ink-50/70 backdrop-blur text-center flex-shrink-0">
      <button
        type="button"
        onClick={onViewAll}
        className="text-xs sm:text-sm font-semibold text-accent-600 hover:text-accent-700 inline-flex items-center gap-1 h-9 px-3 rounded-md hover:bg-accent-50 transition-colors"
      >
        View all notifications
        <ChevronRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

function NotifItem({ notif, onClick }: { notif: Notif; onClick: (id: string) => void }) {
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
    <li>
      <button
        type="button"
        onClick={() => onClick(notif.id)}
        className={clsx(
          'w-full text-left flex items-start gap-2.5 sm:gap-3 px-4 sm:px-5 py-3 hover:bg-ink-50/80 active:bg-ink-100 transition-colors cursor-pointer',
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
      </button>
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
void Sun;
void Moon;
