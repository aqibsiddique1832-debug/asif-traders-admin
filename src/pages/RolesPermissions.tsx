// ────────────────────────────────────────────────────────────
// Premium Roles & Permissions — Part 3B
// RBAC matrix: 7 default roles × 16 modules × 6 actions
// ────────────────────────────────────────────────────────────

import { useState } from 'react';
import {
  Shield, ShieldCheck, Users as UsersIcon, Plus, Edit, Trash2,
  Check, X, Save, RotateCcw, Lock, Eye, FileText, Box,
  ShoppingBag, FileSpreadsheet, Star, Percent, BarChart3, Megaphone,
  Image as ImageIcon, Settings as SettingsIcon, Mail, Search,
  AlertTriangle, Copy, Database, Activity, ChevronDown, ChevronRight,
  CheckSquare, Square,
} from 'lucide-react';
import clsx from 'clsx';
import toast from 'react-hot-toast';
import {
  Card, CardHeader, CardBody, Button, Badge, PageHeader, EmptyState,
  Modal, ConfirmDialog, Tabs,
} from '../components/ui/StatCard';

type Permission = 'view' | 'create' | 'edit' | 'delete' | 'export' | 'approve';

const PERMISSIONS: Permission[] = ['view', 'create', 'edit', 'delete', 'export', 'approve'];

const PERMISSION_LABELS: Record<Permission, string> = {
  view: 'View',
  create: 'Create',
  edit: 'Edit',
  delete: 'Delete',
  export: 'Export',
  approve: 'Approve',
};

const MODULES = [
  { id: 'dashboard',    label: 'Dashboard',       icon: BarChart3 },
  { id: 'orders',       label: 'Orders',          icon: ShoppingBag },
  { id: 'products',     label: 'Products',        icon: Box },
  { id: 'inventory',    label: 'Inventory',       icon: Database },
  { id: 'customers',    label: 'Customers',       icon: UsersIcon },
  { id: 'quotes',       label: 'Quotes',          icon: FileText },
  { id: 'reviews',      label: 'Reviews',         icon: Star },
  { id: 'coupons',      label: 'Coupons',         icon: Percent },
  { id: 'reports',      label: 'Reports',         icon: FileSpreadsheet },
  { id: 'analytics',    label: 'Analytics',       icon: BarChart3 },
  { id: 'marketing',    label: 'Marketing',       icon: Megaphone },
  { id: 'media',        label: 'Media Library',   icon: ImageIcon },
  { id: 'categories',   label: 'Categories',      icon: FolderTree },
  { id: 'brands',       label: 'Brands',          icon: Tag },
  { id: 'settings',     label: 'Settings',        icon: SettingsIcon },
  { id: 'users',        label: 'Users & Roles',   icon: ShieldCheck },
  { id: 'security',     label: 'Security',        icon: Lock },
  { id: 'logs',         label: 'System Logs',     icon: Activity },
];

import { FolderTree, Tag } from 'lucide-react';

type Role = {
  id: string;
  name: string;
  description: string;
  userCount: number;
  isSystem: boolean;
  perms: Record<string, Permission[]>;
};

const ALL_PERMS = PERMISSIONS;

const DEFAULT_ROLES: Role[] = [
  {
    id: 'r1', name: 'Super Admin', description: 'Full system access', userCount: 1, isSystem: true,
    perms: Object.fromEntries(MODULES.map((m) => [m.id, ALL_PERMS])) as any,
  },
  {
    id: 'r2', name: 'Admin', description: 'Manage everything except user roles', userCount: 1, isSystem: true,
    perms: Object.fromEntries(MODULES.map((m) => [m.id, ['view', 'create', 'edit', 'delete', 'export', 'approve'] as Permission[]])) as any,
  },
  {
    id: 'r3', name: 'Manager', description: 'Manage sales, products, customers', userCount: 1, isSystem: true,
    perms: Object.fromEntries(MODULES.map((m) => [m.id, ['view', 'create', 'edit', 'export'] as Permission[]])) as any,
  },
  {
    id: 'r4', name: 'Sales Executive', description: 'Handle orders, quotes, customers', userCount: 1, isSystem: true,
    perms: {
      dashboard: ['view'], orders: ['view', 'create', 'edit'],
      products: ['view'], customers: ['view', 'create', 'edit'],
      quotes: ['view', 'create', 'edit'], reports: ['view', 'export'],
    } as any,
  },
  {
    id: 'r5', name: 'Inventory Manager', description: 'Manage stock and products', userCount: 1, isSystem: true,
    perms: {
      dashboard: ['view'], products: ['view', 'create', 'edit', 'delete'],
      inventory: ['view', 'create', 'edit'], reports: ['view', 'export'],
    } as any,
  },
  {
    id: 'r6', name: 'Accountant', description: 'View orders, reports, GST', userCount: 1, isSystem: true,
    perms: {
      dashboard: ['view'], orders: ['view', 'export'],
      reports: ['view', 'export'], analytics: ['view'],
    } as any,
  },
  {
    id: 'r7', name: 'Delivery Staff', description: 'View assigned orders only', userCount: 1, isSystem: true,
    perms: { dashboard: ['view'], orders: ['view', 'edit'] } as any,
  },
  {
    id: 'r8', name: 'Custom Role', description: 'Define your own permission set', userCount: 0, isSystem: false,
    perms: {} as any,
  },
];

export default function RolesPermissions() {
  const [roles, setRoles] = useState<Role[]>(DEFAULT_ROLES);
  const [selectedRole, setSelectedRole] = useState<Role>(roles[1]);
  const [editMode, setEditMode] = useState(false);
  const [editedPerms, setEditedPerms] = useState<Record<string, Permission[]>>(roles[1].perms);
  const [showNewRole, setShowNewRole] = useState(false);
  const [deleting, setDeleting] = useState<Role | null>(null);

  const togglePerm = (moduleId: string, perm: Permission) => {
    setEditedPerms((prev) => {
      const current = prev[moduleId] || [];
      const next = current.includes(perm) ? current.filter((p) => p !== perm) : [...current, perm];
      return { ...prev, [moduleId]: next };
    });
  };

  const toggleAllForModule = (moduleId: string) => {
    setEditedPerms((prev) => {
      const current = prev[moduleId] || [];
      const next = current.length === PERMISSIONS.length ? [] : [...PERMISSIONS];
      return { ...prev, [moduleId]: next };
    });
  };

  const toggleColumn = (perm: Permission) => {
    setEditedPerms((prev) => {
      const allHave = MODULES.every((m) => (prev[m.id] || []).includes(perm));
      const next: Record<string, Permission[]> = {};
      MODULES.forEach((m) => {
        next[m.id] = allHave ? (prev[m.id] || []).filter((p) => p !== perm) : [...new Set([...(prev[m.id] || []), perm])];
      });
      return next;
    });
  };

  const handleSave = () => {
    setRoles((prev) => prev.map((r) => (r.id === selectedRole.id ? { ...r, perms: editedPerms } : r)));
    setSelectedRole({ ...selectedRole, perms: editedPerms });
    setEditMode(false);
    toast.success('Permissions saved');
  };

  const handleCancel = () => {
    setEditedPerms(selectedRole.perms);
    setEditMode(false);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-24">
      <PageHeader
        title="Roles & Permissions"
        description="Role-based access control for your team"
        breadcrumbs={[{ label: 'System' }, { label: 'Roles & Permissions' }]}
        actions={
          <Button variant="primary" leftIcon={Plus} onClick={() => setShowNewRole(true)}>Create Role</Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6">
        {/* ─── Roles list ─────────────────────────────────── */}
        <Card>
          <CardHeader title={`${roles.length} Roles`} />
          <div className="p-2 space-y-1 max-h-[600px] overflow-y-auto scroll-thin">
            {roles.map((r) => {
              const isActive = r.id === selectedRole.id;
              return (
                <button
                  key={r.id}
                  onClick={() => { setSelectedRole(r); setEditedPerms(r.perms); setEditMode(false); }}
                  className={clsx(
                    'w-full flex items-start gap-3 p-3 rounded-lg text-left transition-all',
                    isActive ? 'bg-accent-50 ring-1 ring-accent-200' : 'hover:bg-ink-50',
                  )}
                >
                  <div className={clsx(
                    'w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0',
                    isActive ? 'bg-accent-500 text-white' : 'bg-ink-100 text-ink-500',
                  )}>
                    <Shield className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-semibold text-ink-900 truncate">{r.name}</p>
                      {r.isSystem && <Badge variant="ink" className="text-2xs">System</Badge>}
                    </div>
                    <p className="text-2xs text-ink-500 truncate">{r.description}</p>
                    <p className="text-2xs text-accent-600 mt-0.5 font-semibold">{r.userCount} user{r.userCount !== 1 ? 's' : ''}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </Card>

        {/* ─── Permission matrix ─────────────────────────── */}
        <div className="space-y-4">
          <Card>
            <CardHeader
              title={selectedRole.name}
              description={selectedRole.description}
              actions={
                editMode ? (
                  <>
                    <Button variant="ghost" size="sm" leftIcon={X} onClick={handleCancel}>Cancel</Button>
                    <Button variant="primary" size="sm" leftIcon={Save} onClick={handleSave}>Save</Button>
                  </>
                ) : (
                  <>
                    {!selectedRole.isSystem && (
                      <>
                        <Button variant="ghost" size="sm" leftIcon={Edit} onClick={() => setEditMode(true)}>Edit</Button>
                        <Button variant="ghost" size="sm" leftIcon={Trash2} onClick={() => setDeleting(selectedRole)} className="text-danger-600">Delete</Button>
                      </>
                    )}
                    {selectedRole.isSystem && (
                      <Button variant="ghost" size="sm" leftIcon={Lock} disabled className="text-ink-400">System Role</Button>
                    )}
                  </>
                )
              }
            />
            <CardBody>
              {/* Legend */}
              <div className="mb-4 flex items-center gap-2 flex-wrap text-2xs">
                <span className="text-ink-500">Permissions:</span>
                {PERMISSIONS.map((p) => (
                  <span key={p} className="px-2 h-5 rounded bg-ink-100 text-ink-700 font-semibold uppercase tracking-wider inline-flex items-center">
                    {p}
                  </span>
                ))}
              </div>

              {/* Matrix */}
              <div className="overflow-x-auto scroll-thin">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-ink-200">
                      <th className="text-left py-2.5 px-3 text-2xs font-bold text-ink-500 uppercase tracking-wider sticky left-0 bg-white">Module</th>
                      {PERMISSIONS.map((p) => (
                        <th key={p} className="text-center py-2.5 px-2 text-2xs font-bold text-ink-500 uppercase tracking-wider">
                          {editMode ? (
                            <button onClick={() => toggleColumn(p)} className="hover:text-accent-600" title={`Toggle all ${p}`}>
                              {p.slice(0, 3)}
                            </button>
                          ) : p.slice(0, 3)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ink-100">
                    {MODULES.map((m) => {
                      const Icon = m.icon;
                      const perms = editMode ? editedPerms[m.id] || [] : selectedRole.perms[m.id] || [];
                      return (
                        <tr key={m.id} className="hover:bg-ink-50/60">
                          <td className="py-2.5 px-3 sticky left-0 bg-white">
                            <div className="flex items-center gap-2">
                              {editMode && (
                                <button onClick={() => toggleAllForModule(m.id)} className="text-ink-400 hover:text-accent-600">
                                  {perms.length === PERMISSIONS.length ? <CheckSquare className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5" />}
                                </button>
                              )}
                              <Icon className="w-3.5 h-3.5 text-ink-500" />
                              <span className="font-medium text-ink-900">{m.label}</span>
                            </div>
                          </td>
                          {PERMISSIONS.map((p) => {
                            const has = perms.includes(p);
                            return (
                              <td key={p} className="text-center py-2.5 px-2">
                                {editMode ? (
                                  <button
                                    onClick={() => togglePerm(m.id, p)}
                                    className={clsx(
                                      'w-7 h-7 rounded-md flex items-center justify-center mx-auto transition-all',
                                      has ? 'bg-accent-500 text-white shadow-sm' : 'bg-ink-100 text-ink-400 hover:bg-ink-200',
                                    )}
                                  >
                                    {has ? <Check className="w-3.5 h-3.5" strokeWidth={3} /> : <X className="w-3.5 h-3.5" />}
                                  </button>
                                ) : (
                                  <div className={clsx(
                                    'w-6 h-6 rounded-md flex items-center justify-center mx-auto',
                                    has ? 'bg-accent-100 text-accent-600' : 'bg-ink-50 text-ink-300',
                                  )}>
                                    {has ? <Check className="w-3 h-3" strokeWidth={3} /> : <X className="w-3 h-3" />}
                                  </div>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardBody>
          </Card>

          {/* ─── Role users ────────────────────────────────── */}
          <Card>
            <CardHeader title={`Users with "${selectedRole.name}" role`} description={`${selectedRole.userCount} user${selectedRole.userCount !== 1 ? 's' : ''}`} />
            <CardBody>
              {selectedRole.userCount === 0 ? (
                <EmptyState icon={UsersIcon} title="No users with this role yet" />
              ) : (
                <p className="text-sm text-ink-600">User list with this role — managed on the Users page.</p>
              )}
            </CardBody>
          </Card>
        </div>
      </div>

      {/* ─── New role modal ──────────────────────────────── */}
      <Modal
        open={showNewRole}
        onClose={() => setShowNewRole(false)}
        title="Create Custom Role"
        size="md"
        footer={
          <>
            <Button variant="ghost" onClick={() => setShowNewRole(false)}>Cancel</Button>
            <Button variant="primary" onClick={() => { toast.success('Custom role created'); setShowNewRole(false); }}>Create</Button>
          </>
        }
      >
        <div className="space-y-3">
          <div>
            <label className="label">Role Name</label>
            <input className="input" placeholder="e.g. Warehouse Lead" />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea className="input min-h-[60px] py-2" placeholder="What can this role do?" />
          </div>
          <p className="text-2xs text-ink-500">After creating, you can set permissions from the matrix.</p>
        </div>
      </Modal>

      {/* ─── Delete confirm ──────────────────────────────── */}
      <ConfirmDialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={() => { setRoles((prev) => prev.filter((r) => r.id !== deleting!.id)); setSelectedRole(roles[0]); toast.success('Role deleted'); setDeleting(null); }}
        title="Delete role?"
        description={`"${deleting?.name}" will be removed. Users with this role will lose access.`}
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
}
