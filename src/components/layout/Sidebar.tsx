// ────────────────────────────────────────────────────────────
// Premium Sidebar — Part 1B
// Collapsible 280/72px · 16 menu items + 14 submenus
// Linear/Stripe/Notion/Vercel-quality
// ────────────────────────────────────────────────────────────

import { useState as useReactState, useEffect as useReactEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import clsx from 'clsx';
import {
  LayoutDashboard, Package, FolderTree, Tags, FileText, ShoppingBag,
  Users, Warehouse, MapPin, Star, Megaphone, BarChart3, Bell, Image as ImageIcon,
  Settings, ShieldCheck, Receipt, Truck, Percent, Boxes, ChevronRight,
  LogOut, HelpCircle, Sparkles,
} from 'lucide-react';

// ─── Menu data per Part 1B spec ─────────────────────────────
type MenuChild = { to: string; label: string; badge?: string; soon?: boolean };
type MenuItem = {
  to: string;
  label: string;
  icon: any;
  end?: boolean;
  badge?: string | number;
  soon?: boolean;
  children?: MenuChild[];
  group?: 'core' | 'sales' | 'catalog' | 'engage' | 'system';
};

const menuItems: MenuItem[] = [
  // ─── Core ───────────────────────────────────────────
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true, group: 'core' },

  // ─── Sales ──────────────────────────────────────────
  {
    to: '/orders', label: 'Orders', icon: ShoppingBag, group: 'sales', children: [
      { to: '/orders', label: 'All Orders' },
      { to: '/orders?status=PENDING', label: 'Pending' },
      { to: '/orders?status=CONFIRMED', label: 'Confirmed' },
      { to: '/orders?status=DISPATCHED', label: 'Dispatched' },
      { to: '/orders?status=DELIVERED', label: 'Delivered' },
      { to: '/orders?status=CANCELLED', label: 'Cancelled' },
    ],
  },
  {
    to: '/quotes', label: 'Quotes', icon: FileText, group: 'sales', children: [
      { to: '/quotes', label: 'All Quotes' },
      { to: '/quotes?status=DRAFT', label: 'Drafts' },
      { to: '/quotes?status=SENT', label: 'Sent' },
      { to: '/quotes?status=APPROVED', label: 'Approved' },
      { to: '/quotes?status=REJECTED', label: 'Rejected' },
    ],
  },
  { to: '/invoices', label: 'Invoices', icon: Receipt, group: 'sales' },
  { to: '/shipping', label: 'Shipping', icon: Truck, group: 'sales' },

  // ─── Catalog ────────────────────────────────────────
  {
    to: '/products', label: 'Products', icon: Package, group: 'catalog', children: [
      { to: '/products', label: 'All Products' },
      { to: '/products?status=ACTIVE', label: 'Active' },
      { to: '/products?status=DRAFT', label: 'Draft' },
      { to: '/products?lowStock=true', label: 'Low Stock' },
    ],
  },
  { to: '/categories', label: 'Categories', icon: FolderTree, group: 'catalog' },
  { to: '/brands', label: 'Brands', icon: Tags, group: 'catalog' },
  { to: '/inventory', label: 'Inventory', icon: Warehouse, group: 'catalog' },
  { to: '/pincodes', label: 'Delivery Pincodes', icon: MapPin, group: 'catalog' },

  // ─── Engage ─────────────────────────────────────────
  { to: '/customers', label: 'Customers', icon: Users, group: 'engage' },
  { to: '/reviews', label: 'Reviews', icon: Star, group: 'engage' },
  { to: '/marketing', label: 'Marketing', icon: Megaphone, group: 'engage' },
  { to: '/coupons', label: 'Coupons', icon: Percent, group: 'engage' },
  { to: '/media', label: 'Media Library', icon: ImageIcon, group: 'engage' },

  // ─── System ─────────────────────────────────────────
  { to: '/analytics', label: 'Analytics', icon: BarChart3, group: 'system' },
  { to: '/notifications', label: 'Notifications', icon: Bell, group: 'system' },
  { to: '/settings', label: 'Settings', icon: Settings, group: 'system' },
];

const groupLabels: Record<string, string> = {
  core: 'CORE',
  sales: 'SALES',
  catalog: 'CATALOG',
  engage: 'ENGAGE',
  system: 'SYSTEM',
};

export default function Sidebar({
  collapsed,
  onCloseMobile,
  onToggleCollapse,
}: {
  collapsed: boolean;
  onCloseMobile?: () => void;
  onToggleCollapse?: () => void;
}) {
  const location = useLocation();
  const groups = ['core', 'sales', 'catalog', 'engage', 'system'] as const;

  return (
    <aside
      className={clsx(
        'fixed top-0 left-0 h-screen bg-ink-900 text-white z-40',
        'flex flex-col',
        'transition-[width] duration-300 ease-out-expo',
        collapsed ? 'w-20' : 'w-72',
        // Mobile: full overlay
        'lg:translate-x-0',
      )}
      aria-label="Main navigation"
    >
      {/* ─── Logo header ──────────────────────────────── */}
      <div className="h-18 flex items-center px-4 border-b border-white/5 flex-shrink-0" style={{ height: 72 }}>
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-400 to-accent-600 flex items-center justify-center shadow-lg shadow-accent-500/30 flex-shrink-0">
            <ShieldCheck className="w-5 h-5 text-white" strokeWidth={2.5} />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <div className="font-bold text-sm leading-tight text-white">ASIF TRADERS</div>
              <div className="text-[10px] text-ink-400 leading-tight uppercase tracking-wider">Admin Panel</div>
            </div>
          )}
        </div>
        {!collapsed && onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex w-7 h-7 rounded-md text-ink-400 hover:bg-white/5 hover:text-white items-center justify-center transition-colors"
            aria-label="Collapse sidebar"
          >
            <ChevronRight className="w-4 h-4 rotate-180" />
          </button>
        )}
      </div>

      {/* Collapsed expand button */}
      {collapsed && onToggleCollapse && (
        <button
          onClick={onToggleCollapse}
          className="hidden lg:flex w-12 h-8 mx-auto mt-2 rounded-md text-ink-400 hover:bg-white/5 hover:text-white items-center justify-center transition-colors"
          aria-label="Expand sidebar"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      )}

      {/* ─── Nav scrollable area ──────────────────────── */}
      <nav className="flex-1 overflow-y-auto scroll-thin py-3 px-2">
        {groups.map((groupKey) => {
          const items = menuItems.filter((m) => m.group === groupKey);
          if (items.length === 0) return null;
          return (
            <div key={groupKey} className="mb-4">
              {!collapsed && (
                <div className="px-3 mb-1.5 text-[10px] font-semibold text-ink-500 uppercase tracking-wider">
                  {groupLabels[groupKey]}
                </div>
              )}
              <div className="space-y-0.5">
                {items.map((item) => (
                  <SidebarItem
                    key={item.to}
                    item={item}
                    collapsed={collapsed}
                    pathname={location.pathname + location.search}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </nav>

      {/* ─── Bottom: Help + User badge ────────────────── */}
      <div className="p-3 border-t border-white/5 flex-shrink-0 space-y-2">
        {!collapsed && (
          <div className="rounded-xl bg-gradient-to-br from-accent-500/10 to-accent-600/5 border border-accent-500/20 p-3">
            <div className="flex items-center gap-2 mb-1.5">
              <Sparkles className="w-3.5 h-3.5 text-accent-400" />
              <div className="text-[10px] font-bold text-accent-300 uppercase tracking-wider">Premium</div>
            </div>
            <p className="text-xs text-ink-300 leading-snug mb-2">Get priority support and analytics insights.</p>
            <button className="w-full text-2xs font-semibold bg-accent-500 hover:bg-accent-600 text-white py-1.5 rounded-md transition-colors">
              Upgrade Plan
            </button>
          </div>
        )}
        <button
          className={clsx(
            'w-full flex items-center gap-3 rounded-lg text-ink-300 hover:bg-white/5 hover:text-white transition-colors',
            collapsed ? 'justify-center h-10' : 'px-3 h-10 text-sm',
          )}
        >
          <HelpCircle className="w-4 h-4 flex-shrink-0" />
          {!collapsed && <span>Help & Docs</span>}
        </button>
      </div>
    </aside>
  );
}

// ─── Single nav item (handles children/expand) ──────────────
function SidebarItem({
  item,
  collapsed,
  pathname,
}: {
  item: MenuItem;
  collapsed: boolean;
  pathname: string;
}) {
  const Icon = item.icon;
  const hasChildren = !!(item.children && item.children.length > 0);
  const isDirectlyActive =
    pathname === item.to ||
    (item.to !== '/' && pathname.startsWith(item.to + '/'));
  const isChildActive = hasChildren && item.children!.some((c) => pathname === c.to.split('?')[0] || pathname.startsWith(c.to.split('?')[0] + '/'));
  const isActive = isDirectlyActive || isChildActive;

  // ─── No children: flat link ──────────────────────────
  if (!hasChildren) {
    return (
      <NavLink
        to={item.to}
        end={item.end}
        title={collapsed ? item.label : undefined}
        className={clsx(
          'group flex items-center gap-3 rounded-lg text-sm font-medium',
          'transition-all duration-200 relative',
          collapsed ? 'h-11 justify-center px-0' : 'h-9 px-3',
          isActive
            ? 'bg-accent-500 text-white shadow-md shadow-accent-500/30'
            : 'text-ink-300 hover:bg-white/5 hover:text-white',
        )}
        onClick={item.to === '/' ? undefined : undefined}
      >
        <Icon className="w-[18px] h-[18px] flex-shrink-0" strokeWidth={isActive ? 2.25 : 2} />
        {!collapsed && (
          <>
            <span className="flex-1 truncate">{item.label}</span>
            {item.badge && (
              <span className="text-2xs font-bold bg-accent-500 text-white px-1.5 h-4 rounded inline-flex items-center">
                {item.badge}
              </span>
            )}
            {item.soon && (
              <span className="text-2xs font-medium text-ink-500 bg-white/5 px-1.5 h-4 rounded inline-flex items-center uppercase">
                Soon
              </span>
            )}
          </>
        )}
        {isActive && !collapsed && (
          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-white rounded-r" />
        )}
      </NavLink>
    );
  }

  // ─── With children: collapsible submenu ─────────────
  return (
    <SidebarGroup
      item={item}
      collapsed={collapsed}
      pathname={pathname}
      isActive={isActive}
    />
  );
}

function SidebarGroup({
  item,
  collapsed,
  pathname,
  isActive,
}: {
  item: MenuItem;
  collapsed: boolean;
  pathname: string;
  isActive: boolean;
}) {
  const Icon = item.icon;
  const hasChildren = item.children!;
  const isAnyChildActive = hasChildren.some(
    (c) => pathname.split('?')[0] === c.to.split('?')[0] || pathname.startsWith(c.to.split('?')[0] + '/'),
  );
  // Default expanded if a child is active
  const [open, setOpen] = useStateOpen(isAnyChildActive);

  if (collapsed) {
    // When collapsed, show single link to main path
    return (
      <NavLink
        to={item.to}
        title={item.label}
        className={clsx(
          'flex items-center justify-center h-11 rounded-lg text-sm font-medium transition-all duration-200 relative',
          isActive
            ? 'bg-accent-500 text-white shadow-md shadow-accent-500/30'
            : 'text-ink-300 hover:bg-white/5 hover:text-white',
        )}
      >
        <Icon className="w-[18px] h-[18px]" strokeWidth={isActive ? 2.25 : 2} />
        {isActive && (
          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-white rounded-r" />
        )}
      </NavLink>
    );
  }

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className={clsx(
          'w-full group flex items-center gap-3 rounded-lg text-sm font-medium',
          'transition-all duration-200 relative h-9 px-3',
          isActive
            ? 'bg-white/5 text-white'
            : 'text-ink-300 hover:bg-white/5 hover:text-white',
        )}
      >
        <Icon className="w-[18px] h-[18px] flex-shrink-0" strokeWidth={isActive ? 2.25 : 2} />
        <span className="flex-1 text-left truncate">{item.label}</span>
        {item.badge && (
          <span className="text-2xs font-bold bg-accent-500 text-white px-1.5 h-4 rounded inline-flex items-center">
            {item.badge}
          </span>
        )}
        <ChevronRight
          className={clsx(
            'w-3.5 h-3.5 text-ink-500 transition-transform duration-200',
            open && 'rotate-90 text-white',
          )}
        />
      </button>
      {open && (
        <div className="mt-0.5 ml-3 pl-3 border-l border-white/5 space-y-0.5 animate-fade-in">
          {hasChildren.map((c) => {
            const cPath = c.to.split('?')[0];
            const childActive = pathname === c.to || pathname.split('?')[0] === cPath;
            return (
              <NavLink
                key={c.to}
                to={c.to}
                className={clsx(
                  'block px-3 h-8 rounded-md text-xs font-medium transition-colors flex items-center',
                  childActive
                    ? 'text-white bg-accent-500/15'
                    : 'text-ink-400 hover:text-white hover:bg-white/5',
                )}
              >
                <span className="truncate">{c.label}</span>
                {c.soon && (
                  <span className="ml-auto text-2xs text-ink-500 uppercase">Soon</span>
                )}
              </NavLink>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── useStateOpen — local state with auto-expand on active ──
function useStateOpen(initial: boolean) {
  const [open, setOpen] = useReactState(initial);
  useReactEffect(() => {
    if (initial && !open) setOpen(true);
  }, [initial]);
  return [open, setOpen] as const;
}
