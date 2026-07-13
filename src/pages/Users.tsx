// ────────────────────────────────────────────────────────────
// Premium User Management — Part 3B
// User list, create, edit, role assignment, status toggle
// ────────────────────────────────────────────────────────────

import { useEffect, useState } from 'react';
import {
  Users as UsersIcon, Search, Plus, MoreVertical, Mail, Phone,
  Shield, ShieldCheck, ShieldX, UserCheck, UserX, Calendar,
  Edit, Trash2, Eye, Key, Filter, ChevronRight, Lock, Unlock,
  Clock, Activity, CheckCircle2, XCircle, UserCog, X,
  TrendingUp, Box, FileText, Truck,
} from 'lucide-react';
import clsx from 'clsx';
import toast from 'react-hot-toast';
import {
  Card, CardHeader, CardBody, Button, Badge, PageHeader, EmptyState,
  Skeleton, Modal, ConfirmDialog, Pagination, Tabs,
} from '../components/ui/StatCard';
import { formatDate, relativeTime } from '../lib/auth';

type Role = 'SUPER_ADMIN' | 'ADMIN' | 'MANAGER' | 'SALES' | 'INVENTORY' | 'ACCOUNTANT' | 'DELIVERY';

type User = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  role: Role;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  lastLoginAt?: string;
  createdAt: string;
  twoFA?: boolean;
};

const SAMPLE_USERS: User[] = [
  { id: 'u1', name: 'Super Admin',         email: 'admin@asiftraders.com',     role: 'SUPER_ADMIN', status: 'ACTIVE',    lastLoginAt: '2 min ago',     createdAt: '2026-01-15T00:00:00Z', twoFA: true,  phone: '+91 98765 43210' },
  { id: 'u2', name: 'Ahmed Khan',          email: 'ahmed@asiftraders.com',     role: 'ADMIN',      status: 'ACTIVE',    lastLoginAt: '3 hours ago',   createdAt: '2026-02-10T00:00:00Z', twoFA: true },
  { id: 'u3', name: 'Fatima Khan',         email: 'fatima@asiftraders.com',    role: 'MANAGER',    status: 'ACTIVE',    lastLoginAt: '1 day ago',     createdAt: '2026-03-05T00:00:00Z' },
  { id: 'u4', name: 'Hassan Raza',         email: 'hassan@asiftraders.com',    role: 'SALES',      status: 'ACTIVE',    lastLoginAt: '4 hours ago',   createdAt: '2026-03-15T00:00:00Z' },
  { id: 'u5', name: 'Priya Sharma',        email: 'priya@asiftraders.com',     role: 'INVENTORY',  status: 'ACTIVE',    lastLoginAt: '30 min ago',    createdAt: '2026-04-01T00:00:00Z', twoFA: true },
  { id: 'u6', name: 'Vikram Singh',        email: 'vikram@asiftraders.com',    role: 'ACCOUNTANT', status: 'ACTIVE',    lastLoginAt: '2 days ago',    createdAt: '2026-04-12T00:00:00Z' },
  { id: 'u7', name: 'Ravi Kumar',          email: 'ravi@asiftraders.com',      role: 'DELIVERY',   status: 'SUSPENDED', lastLoginAt: '1 week ago',    createdAt: '2026-05-01T00:00:00Z' },
  { id: 'u8', name: 'Sara Khan',           email: 'sara@asiftraders.com',      role: 'SALES',      status: 'INACTIVE',  lastLoginAt: '2 weeks ago',   createdAt: '2026-05-10T00:00:00Z' },
];

const ROLE_MAP: Record<Role, { label: string; variant: any; icon: any; color: string }> = {
  SUPER_ADMIN: { label: 'Super Admin',     variant: 'danger',  icon: ShieldCheck, color: 'text-danger-700' },
  ADMIN:       { label: 'Admin',           variant: 'accent',  icon: Shield,      color: 'text-accent-700' },
  MANAGER:     { label: 'Manager',         variant: 'info',    icon: UserCog,     color: 'text-info-700' },
  SALES:       { label: 'Sales Executive', variant: 'success', icon: TrendingUp,  color: 'text-success-700' },
  INVENTORY:   { label: 'Inventory Mgr',   variant: 'warning', icon: Box,         color: 'text-warning-700' },
  ACCOUNTANT:  { label: 'Accountant',      variant: 'info',    icon: FileText,    color: 'text-info-700' },
  DELIVERY:    { label: 'Delivery Staff',  variant: 'ink',     icon: Truck,       color: 'text-ink-700' },
};

const STATUS_MAP: Record<string, { label: string; variant: any; dot: string }> = {
  ACTIVE:    { label: 'Active',    variant: 'success', dot: 'bg-success-500' },
  INACTIVE:  { label: 'Inactive',  variant: 'ink',     dot: 'bg-ink-400' },
  SUSPENDED: { label: 'Suspended', variant: 'warning', dot: 'bg-warning-500' },
};

export default function Users() {
  const [users, setUsers] = useState<User[]>(SAMPLE_USERS);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | Role | 'active' | 'inactive'>('all');
  const [modal, setModal] = useState<{ open: boolean; user: User | null }>({ open: false, user: null });
  const [deleting, setDeleting] = useState<User | null>(null);

  const filtered = users.filter((u) => {
    if (search && !`${u.name} ${u.email} ${u.phone}`.toLowerCase().includes(search.toLowerCase())) return false;
    if (filter === 'active' && u.status !== 'ACTIVE') return false;
    if (filter === 'inactive' && u.status === 'ACTIVE') return false;
    if (filter !== 'all' && filter !== 'active' && filter !== 'inactive' && u.role !== filter) return false;
    return true;
  });

  const kpis = [
    { label: 'Total Users',  value: users.length,                                icon: UsersIcon,   accent: 'info' },
    { label: 'Active',       value: users.filter((u) => u.status === 'ACTIVE').length, icon: UserCheck, accent: 'success' },
    { label: 'Admins',       value: users.filter((u) => u.role === 'ADMIN' || u.role === 'SUPER_ADMIN').length, icon: ShieldCheck, accent: 'accent' },
    { label: '2FA Enabled',  value: users.filter((u) => u.twoFA).length,          icon: Lock,        accent: 'info' },
    { label: 'Suspended',    value: users.filter((u) => u.status === 'SUSPENDED').length, icon: UserX, accent: 'warning' },
  ];

  const openNew = () => setModal({ open: true, user: null });
  const openEdit = (u: User) => setModal({ open: true, user: u });

  const handleSave = (data: Partial<User> & { password?: string }) => {
    if (modal.user) {
      setUsers((prev) => prev.map((u) => (u.id === modal.user!.id ? { ...u, ...data } : u)));
      toast.success('User updated');
    } else {
      const newUser: User = {
        id: `u${Date.now()}`,
        name: data.name || 'New User',
        email: data.email || '',
        phone: data.phone,
        role: data.role || 'SALES',
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
      };
      setUsers((prev) => [newUser, ...prev]);
      toast.success('User created');
    }
    setModal({ open: false, user: null });
  };

  const handleDelete = () => {
    if (!deleting) return;
    setUsers((prev) => prev.filter((u) => u.id !== deleting.id));
    toast.success(`Deleted user ${deleting.name}`);
    setDeleting(null);
  };

  const handleToggleStatus = (u: User) => {
    const next = u.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    setUsers((prev) => prev.map((x) => (x.id === u.id ? { ...x, status: next as any } : x)));
    toast.success(`${u.name} ${next === 'ACTIVE' ? 'activated' : 'suspended'}`);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Users"
        description={`${users.length} team members with role-based access`}
        breadcrumbs={[{ label: 'System' }, { label: 'Users' }]}
        actions={
          <>
            <Button variant="secondary" leftIcon={ShieldCheck}>Roles & Permissions</Button>
            <Button variant="primary" leftIcon={Plus} onClick={openNew}>Add User</Button>
          </>
        }
      />

      {/* ─── 5 KPI cards ─────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {kpis.map((k) => (
          <MiniStat key={k.label} {...k} />
        ))}
      </div>

      {/* ─── Toolbar ─────────────────────────────────────── */}
      <Card>
        <div className="p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400 pointer-events-none" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search users by name, email, phone…"
              className="input pl-10"
            />
          </div>
          <select value={filter} onChange={(e) => setFilter(e.target.value as any)} className="input h-9 text-sm w-auto min-w-[160px]">
            <option value="all">All Users</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <optgroup label="By Role">
              <option value="SUPER_ADMIN">Super Admins</option>
              <option value="ADMIN">Admins</option>
              <option value="MANAGER">Managers</option>
              <option value="SALES">Sales</option>
              <option value="INVENTORY">Inventory</option>
              <option value="ACCOUNTANT">Accountants</option>
              <option value="DELIVERY">Delivery</option>
            </optgroup>
          </select>
        </div>
      </Card>

      {/* ─── User table ──────────────────────────────────── */}
      {filtered.length === 0 ? (
        <Card>
          <EmptyState icon={UsersIcon} title="No users found" description="Try adjusting your filters." />
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto scroll-thin">
            <table className="w-full text-sm">
              <thead className="bg-ink-50/80 border-b border-ink-200">
                <tr>
                  <th className="px-4 py-3 text-left text-2xs font-bold text-ink-500 uppercase tracking-wider">User</th>
                  <th className="px-4 py-3 text-left text-2xs font-bold text-ink-500 uppercase tracking-wider">Email</th>
                  <th className="px-4 py-3 text-left text-2xs font-bold text-ink-500 uppercase tracking-wider">Phone</th>
                  <th className="px-4 py-3 text-left text-2xs font-bold text-ink-500 uppercase tracking-wider">Role</th>
                  <th className="px-4 py-3 text-left text-2xs font-bold text-ink-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-center text-2xs font-bold text-ink-500 uppercase tracking-wider">2FA</th>
                  <th className="px-4 py-3 text-left text-2xs font-bold text-ink-500 uppercase tracking-wider">Last Login</th>
                  <th className="px-4 py-3 text-left text-2xs font-bold text-ink-500 uppercase tracking-wider">Joined</th>
                  <th className="w-10 px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {filtered.map((u) => {
                  const role = ROLE_MAP[u.role];
                  const status = STATUS_MAP[u.status];
                  const RoleIcon = role.icon;
                  return (
                    <tr key={u.id} className="hover:bg-ink-50/60 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-pill bg-gradient-to-br from-accent-400 to-accent-600 text-white text-xs font-semibold flex items-center justify-center flex-shrink-0">
                            {u.name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-ink-900 text-sm">{u.name}</p>
                            <p className="text-2xs text-ink-500 font-mono">{u.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-ink-700 text-xs flex items-center gap-1 truncate max-w-[200px]">
                          <Mail className="w-3 h-3 text-ink-400 flex-shrink-0" /> {u.email}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-ink-700 text-xs flex items-center gap-1">
                          {u.phone ? <><Phone className="w-3 h-3 text-ink-400" /> {u.phone}</> : <span className="text-ink-400">—</span>}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={role.variant}>
                          <RoleIcon className="w-2.5 h-2.5" /> {role.label}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <button onClick={() => handleToggleStatus(u)}>
                          <Badge variant={status.variant} dot>{status.label}</Badge>
                        </button>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {u.twoFA ? <Lock className="w-3.5 h-3.5 text-success-500 mx-auto" /> : <Unlock className="w-3.5 h-3.5 text-ink-300 mx-auto" />}
                      </td>
                      <td className="px-4 py-3 text-2xs text-ink-500">{u.lastLoginAt || 'Never'}</td>
                      <td className="px-4 py-3 text-2xs text-ink-500">{formatDate(u.createdAt)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button onClick={() => openEdit(u)} className="w-7 h-7 rounded-md text-ink-500 hover:bg-ink-100 flex items-center justify-center"><Edit className="w-3.5 h-3.5" /></button>
                          <button onClick={() => setDeleting(u)} className="w-7 h-7 rounded-md text-danger-600 hover:bg-danger-50 flex items-center justify-center"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* ─── User form modal ─────────────────────────────── */}
      <UserFormModal
        open={modal.open}
        user={modal.user}
        onClose={() => setModal({ open: false, user: null })}
        onSave={handleSave}
      />

      {/* ─── Delete confirm ──────────────────────────────── */}
      <ConfirmDialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={handleDelete}
        title="Delete user?"
        description={`"${deleting?.name}" will lose all access. This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
}

function MiniStat({ label, value, icon: Icon, accent }: any) {
  const map: any = {
    info:    'bg-info-subtle text-info-600',
    success: 'bg-success-subtle text-success-600',
    warning: 'bg-warning-subtle text-warning-600',
    accent:  'bg-accent-50 text-accent-600',
  };
  return (
    <div className="card-hover p-3 sm:p-4 flex items-center gap-2.5">
      <div className={clsx('w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0', map[accent])}>
        <Icon className="w-4 h-4" strokeWidth={2.25} />
      </div>
      <div className="min-w-0">
        <p className="text-2xs text-ink-500 truncate">{label}</p>
        <p className="text-base font-bold text-ink-900 tabular-nums">{value}</p>
      </div>
    </div>
  );
}

function UserFormModal({ open, user, onClose, onSave }: { open: boolean; user: User | null; onClose: () => void; onSave: (d: any) => void }) {
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [role, setRole] = useState<Role>(user?.role || 'SALES');
  const [password, setPassword] = useState('');

  useEffect(() => {
    setName(user?.name || '');
    setEmail(user?.email || '');
    setPhone(user?.phone || '');
    setRole(user?.role || 'SALES');
    setPassword('');
  }, [user?.id, open]);

  if (!open) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={user ? 'Edit User' : 'Add New User'}
      size="md"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={() => onSave({ name, email, phone, role, ...(password ? { password } : {}) })}>
            {user ? 'Save Changes' : 'Create User'}
          </Button>
        </>
      }
    >
      <form className="space-y-3">
        <div>
          <label className="label">Full Name <span className="text-danger-500">*</span></label>
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ahmed Khan" />
        </div>
        <div>
          <label className="label">Email <span className="text-danger-500">*</span></label>
          <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ahmed@asiftraders.com" />
        </div>
        <div>
          <label className="label">Phone</label>
          <input className="input" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 98765 43210" />
        </div>
        <div>
          <label className="label">Role <span className="text-danger-500">*</span></label>
          <select className="input" value={role} onChange={(e) => setRole(e.target.value as Role)}>
            {Object.entries(ROLE_MAP).map(([key, r]) => (
              <option key={key} value={key}>{r.label}</option>
            ))}
          </select>
          <p className="help-text">Determines what this user can access in the admin panel.</p>
        </div>
        <div>
          <label className="label">{user ? 'New Password (leave blank to keep current)' : 'Password'} {!user && <span className="text-danger-500">*</span>}</label>
          <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min 8 chars" />
        </div>
      </form>
    </Modal>
  );
}

// Avoid unused
// (TrendingUp, Box, FileText, Truck now imported)
