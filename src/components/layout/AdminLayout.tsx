// ────────────────────────────────────────────────────────────
// Admin Layout — Sidebar + Top Nav + Content Area
// ────────────────────────────────────────────────────────────

import { Outlet, NavLink, useNavigate, useLocation, Link } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import {
  LayoutDashboard, Package, FolderTree, FileText, ShoppingBag,
  Users, Warehouse, MapPin, Settings, LogOut, Menu, X,
  Bell, ChevronDown, Search, ChevronRight, Shield
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { getInitials } from '../../lib/auth';
import clsx from 'clsx';

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/products', label: 'Products', icon: Package },
  { to: '/categories', label: 'Categories', icon: FolderTree },
  { to: '/quotes', label: 'Quotes', icon: FileText, badge: true },
  { to: '/orders', label: 'Orders', icon: ShoppingBag },
  { to: '/customers', label: 'Customers', icon: Users },
  { to: '/inventory', label: 'Inventory', icon: Warehouse },
  { to: '/pincodes', label: 'Delivery Pincodes', icon: MapPin },
  { to: '/settings', label: 'Settings', icon: Settings },
];

function getBreadcrumbs(pathname: string) {
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length === 0) return [{ label: 'Dashboard', to: '/' }];
  const crumbs = [{ label: 'Home', to: '/' }];
  let path = '';
  for (const seg of segments) {
    path += `/${seg}`;
    const item = navItems.find((n) => n.to === path || (!n.end && path.startsWith(n.to + '/')));
    crumbs.push({ label: item?.label || seg.charAt(0).toUpperCase() + seg.slice(1), to: path });
  }
  return crumbs;
}

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const breadcrumbs = getBreadcrumbs(location.pathname);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-secondary-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={clsx(
          'fixed top-0 left-0 z-40 h-screen w-64 bg-secondary-900 text-white transition-transform duration-300 flex flex-col',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        )}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-secondary-800 flex-shrink-0">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center shadow-md shadow-primary/30 group-hover:scale-105 transition-transform">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-bold text-sm leading-tight">ASIF TRADERS</div>
              <div className="text-[10px] text-secondary-400 leading-tight">Admin Panel</div>
            </div>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-secondary-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          <div className="space-y-0.5">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  clsx(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-primary text-white shadow-md shadow-primary/20'
                      : 'text-secondary-300 hover:bg-secondary-800 hover:text-white',
                  )
                }
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                <span className="flex-1">{item.label}</span>
                {item.badge && (
                  <span className="text-[10px] font-semibold bg-primary-light text-primary-900 px-1.5 py-0.5 rounded">
                    Live
                  </span>
                )}
              </NavLink>
            ))}
          </div>
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-secondary-800 flex-shrink-0">
          <div className="px-3 py-2 text-xs text-secondary-500">
            <div>v1.0.0 • Production</div>
            <div className="mt-1">© {new Date().getFullYear()} ASIF TRADERS</div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="lg:pl-64 min-h-screen flex flex-col">
        {/* Top nav */}
        <header className="sticky top-0 z-20 bg-white border-b border-secondary-200 h-16 flex items-center px-4 sm:px-6">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden mr-2 text-secondary-600 hover:text-secondary-900"
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* Breadcrumbs */}
          <nav className="hidden sm:flex items-center gap-1.5 text-sm flex-1 min-w-0">
            {breadcrumbs.map((crumb, idx) => (
              <div key={crumb.to} className="flex items-center gap-1.5 min-w-0">
                {idx > 0 && <ChevronRight className="w-3.5 h-3.5 text-secondary-400 flex-shrink-0" />}
                {idx === breadcrumbs.length - 1 ? (
                  <span className="font-medium text-secondary-900 truncate">{crumb.label}</span>
                ) : (
                  <Link to={crumb.to} className="text-secondary-500 hover:text-primary truncate">
                    {crumb.label}
                  </Link>
                )}
              </div>
            ))}
          </nav>

          <div className="flex-1 sm:hidden" />

          <div className="flex items-center gap-1 sm:gap-2">
            {/* Notifications */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                className="relative p-2 text-secondary-600 hover:text-secondary-900 hover:bg-secondary-100 rounded-lg"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger rounded-full" />
              </button>
              {notifOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-secondary-200 z-30 animate-fade-in">
                  <div className="p-3 border-b border-secondary-200 flex items-center justify-between">
                    <h3 className="font-semibold text-sm">Notifications</h3>
                    <button className="text-xs text-primary hover:underline">Mark all read</button>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    <div className="p-8 text-center text-sm text-secondary-500">
                      <Bell className="w-8 h-8 mx-auto mb-2 text-secondary-300" />
                      No new notifications
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Profile */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 p-1.5 pr-2 hover:bg-secondary-100 rounded-lg"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white text-xs font-semibold">
                  {getInitials(user?.firstName + ' ' + user?.lastName || user?.email)}
                </div>
                <div className="hidden md:block text-left">
                  <div className="text-sm font-medium text-secondary-900 leading-tight">
                    {user?.firstName || user?.email?.split('@')[0]}
                  </div>
                  <div className="text-[10px] text-secondary-500 leading-tight">{user?.role}</div>
                </div>
                <ChevronDown className="w-4 h-4 text-secondary-400 hidden md:block" />
              </button>
              {profileOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-secondary-200 z-30 animate-fade-in">
                  <div className="p-3 border-b border-secondary-200">
                    <div className="text-sm font-semibold text-secondary-900">
                      {user?.firstName} {user?.lastName}
                    </div>
                    <div className="text-xs text-secondary-500 truncate">{user?.email}</div>
                    <div className="mt-1.5">
                      <span className="text-[10px] font-semibold bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                        {user?.role}
                      </span>
                    </div>
                  </div>
                  <div className="p-1">
                    <button
                      onClick={() => { setProfileOpen(false); navigate('/settings'); }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-secondary-700 hover:bg-secondary-100 rounded-lg"
                    >
                      <Settings className="w-4 h-4" />
                      Settings
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-danger hover:bg-danger-light rounded-lg"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
