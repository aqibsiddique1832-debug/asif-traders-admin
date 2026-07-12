// ────────────────────────────────────────────────────────────
// Premium Admin Layout — Part 1B
// Sidebar (collapsible) + Topbar + Content
// ────────────────────────────────────────────────────────────

import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import clsx from 'clsx';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

const menuItems = [
  { to: '/', label: 'Dashboard' },
  { to: '/products', label: 'Products' },
  { to: '/categories', label: 'Categories' },
  { to: '/quotes', label: 'Quotes' },
  { to: '/orders', label: 'Orders' },
  { to: '/customers', label: 'Customers' },
  { to: '/inventory', label: 'Inventory' },
  { to: '/pincodes', label: 'Pincodes' },
  { to: '/settings', label: 'Settings' },
];

function getBreadcrumbs(pathname: string) {
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length === 0) return [{ label: 'Dashboard', to: '/' }];
  const crumbs = [{ label: 'Home', to: '/' }];
  let path = '';
  for (const seg of segments) {
    path += `/${seg}`;
    const item = menuItems.find((n) => n.to === path);
    const label = item?.label || seg.charAt(0).toUpperCase() + seg.slice(1);
    crumbs.push({ label, to: path });
  }
  return crumbs;
}

export default function AdminLayout() {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Persist collapsed state
  useEffect(() => {
    const saved = localStorage.getItem('sidebar-collapsed');
    if (saved === '1') setSidebarCollapsed(true);
  }, []);

  const toggleCollapse = () => {
    setSidebarCollapsed((c) => {
      const next = !c;
      localStorage.setItem('sidebar-collapsed', next ? '1' : '0');
      return next;
    });
  };

  // Close mobile drawer on route change
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const breadcrumbs = getBreadcrumbs(location.pathname);

  return (
    <div className="min-h-screen bg-surface-muted">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-ink-900/40 backdrop-blur-sm z-30 animate-fade-in"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar (mobile slide-in / desktop fixed) */}
      <div
        className={clsx(
          'lg:block',
          sidebarOpen ? 'block' : 'hidden lg:block',
          'fixed inset-0 lg:inset-auto lg:left-0 lg:top-0 lg:h-screen z-40',
        )}
      >
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggleCollapse={toggleCollapse}
          onCloseMobile={() => setSidebarOpen(false)}
        />
      </div>

      {/* Main wrapper */}
      <div
        className={clsx(
          'min-h-screen flex flex-col transition-[padding] duration-300',
          // Adjust padding to match sidebar width
          sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-72',
        )}
      >
        <Topbar
          onMenuClick={() => setSidebarOpen(true)}
          breadcrumbs={breadcrumbs}
          sidebarCollapsed={sidebarCollapsed}
        />

        <main className="flex-1 px-3 sm:px-5 lg:px-8 py-5 lg:py-8 max-w-[1600px] w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
