// ────────────────────────────────────────────────────────────
// UI Primitives — Part 1A Design System Foundation
// Premium quality, fully accessible, 8pt spacing, proper states
// ────────────────────────────────────────────────────────────

import { ReactNode, HTMLAttributes, ButtonHTMLAttributes, forwardRef } from 'react';
import clsx from 'clsx';
import {
  Loader2, X, AlertTriangle, CheckCircle2, Info as InfoIcon,
Search as SearchIcon,
} from 'lucide-react';

// ─── Stat Card ─────────────────────────────────────────────
export function StatCard({
  label,
  value,
  icon: Icon,
  trend,
  trendLabel,
  accent = 'accent',
  color,
  loading,
}: {
  label: string;
  value: ReactNode;
  icon?: any;
  trend?: 'up' | 'down' | 'flat';
  trendLabel?: string;
  accent?: 'accent' | 'info' | 'success' | 'warning' | 'danger';
  color?: string;
  loading?: boolean;
}) {
  const colorMap: Record<string, string> = {
    accent:  'bg-accent-50 text-accent-600 ring-1 ring-accent-100',
    blue:   'bg-info-subtle text-info-600 ring-1 ring-info-100',
    info:   'bg-info-subtle text-info-600 ring-1 ring-info-100',
    green:  'bg-success-subtle text-success-600 ring-1 ring-success-100',
    success:'bg-success-subtle text-success-600 ring-1 ring-success-100',
    yellow: 'bg-warning-subtle text-warning-600 ring-1 ring-warning-100',
    warning:'bg-warning-subtle text-warning-600 ring-1 ring-warning-100',
    red:    'bg-danger-subtle text-danger-600 ring-1 ring-danger-100',
    danger: 'bg-danger-subtle text-danger-600 ring-1 ring-danger-100',
  };
  const accentClass = colorMap[color ?? accent] ?? colorMap.accent;
  return (
    <div className="card-hover p-5 group">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-ink-500 tracking-wide uppercase">{label}</p>
          {loading ? (
            <div className="skeleton h-8 w-24 mt-2" />
          ) : (
            <p className="text-2xl font-bold text-ink-900 mt-2 tabular-nums tracking-tight">{value}</p>
          )}
          {trendLabel && !loading && (
            <div className="mt-2.5 flex items-center gap-1.5">
              <span
                className={clsx(
                  'inline-flex items-center gap-0.5 text-2xs font-semibold px-1.5 h-5 rounded-md',
                  trend === 'up' && 'bg-success-subtle text-success-700',
                  trend === 'down' && 'bg-danger-subtle text-danger-700',
                  trend === 'flat' && 'bg-ink-100 text-ink-500',
                )}
              >
                {trend === 'up' && '↑'}
                {trend === 'down' && '↓'}
                {trend === 'flat' && '→'}
                {trendLabel}
              </span>
              <span className="text-2xs text-ink-500">vs last period</span>
            </div>
          )}
        </div>
        {Icon && (
          <div className={clsx('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0', accentClass)}>
            <Icon className="w-5 h-5" strokeWidth={2.25} />
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Card (16px radius) ─────────────────────────────────────
export function Card({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={clsx('card overflow-hidden', className)} {...props}>
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  description,
  actions,
  className,
}: {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <div className={clsx('flex items-center justify-between gap-3 card-header', className)}>
      <div className="min-w-0">
        <h3 className="text-lg font-semibold text-ink-900 tracking-tight">{title}</h3>
        {description && <p className="text-sm text-ink-500 mt-0.5">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-2 flex-shrink-0">{actions}</div>}
    </div>
  );
}

export function CardBody({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={clsx('card-body', className)}>{children}</div>;
}

// ─── Button (6 variants × 4 sizes) ──────────────────────────
type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'icon';
type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

export const Button = forwardRef<
  HTMLButtonElement,
  ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: ButtonVariant;
    size?: ButtonSize;
    loading?: boolean;
    leftIcon?: any;
    rightIcon?: any;
  }
>(function Button(
  { variant = 'primary', size = 'md', loading, leftIcon: LeftIcon, rightIcon: RightIcon, className, children, disabled, ...props },
  ref,
) {
  const variantClass = {
    primary:   'btn-primary',
    secondary: 'btn-secondary',
    outline:   'btn-outline',
    ghost:     'btn-ghost',
    danger:    'btn-danger',
    icon:      'btn-icon',
  }[variant];
  const sizeClass = {
    sm:   'btn-sm',
    md:   '',
    lg:   'btn-lg',
    icon: '',
  }[size];
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={clsx(variantClass, sizeClass, className)}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : LeftIcon ? (
        <LeftIcon className="w-4 h-4" strokeWidth={2} />
      ) : null}
      {children}
      {RightIcon && !loading && <RightIcon className="w-4 h-4" strokeWidth={2} />}
    </button>
  );
});

// ─── Badge (pill) ───────────────────────────────────────────
export function Badge({
  variant = 'ink',
  children,
  className,
  dot,
}: {
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'ink' | 'accent';
  children: ReactNode;
  className?: string;
  dot?: boolean;
}) {
  const variantClass = {
    success: 'badge-success',
    warning: 'badge-warning',
    danger:  'badge-danger',
    info:    'badge-info',
    ink:     'badge-ink',
    accent:  'badge-accent',
  }[variant];
  const dotColor = {
    success: 'bg-success-500',
    warning: 'bg-warning-500',
    danger:  'bg-danger-500',
    info:    'bg-info-500',
    ink:     'bg-ink-500',
    accent:  'bg-accent-500',
  }[variant];
  return (
    <span className={clsx(variantClass, className)}>
      {dot && <span className={clsx('w-1.5 h-1.5 rounded-pill', dotColor)} />}
      {children}
    </span>
  );
}

// ─── Avatar ─────────────────────────────────────────────────
export function Avatar({
  src,
  name,
  size = 'md',
  className,
}: {
  src?: string | null;
  name: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}) {
  const sizeMap = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-7 h-7 text-xs',
    md: 'w-9 h-9 text-xs',
    lg: 'w-11 h-11 text-sm',
    xl: 'w-16 h-16 text-base',
  }[size];
  const initials = name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={clsx('rounded-pill object-cover', sizeMap, className)}
      />
    );
  }
  return (
    <div
      className={clsx(
        'rounded-pill bg-gradient-to-br from-accent-400 to-accent-600 text-white font-semibold flex items-center justify-center',
        sizeMap,
        className,
      )}
    >
      {initials}
    </div>
  );
}

// ─── Empty State (premium, with icon) ──────────────────────
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  variant = 'default',
}: {
  icon?: any;
  title: string;
  description?: string;
  action?: ReactNode;
  variant?: 'default' | 'compact';
}) {
  return (
    <div
      className={clsx(
        'flex flex-col items-center justify-center text-center',
        variant === 'default' ? 'py-16 px-6' : 'py-8 px-4',
      )}
    >
      {Icon && (
        <div className="relative mb-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-ink-100 to-ink-50 ring-1 ring-ink-200 flex items-center justify-center">
            <Icon className="w-6 h-6 text-ink-400" strokeWidth={1.75} />
          </div>
        </div>
      )}
      <h3 className="text-base font-semibold text-ink-900 mb-1">{title}</h3>
      {description && <p className="text-sm text-ink-500 max-w-sm text-pretty">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

// ─── Skeleton (with shimmer) ───────────────────────────────
export function Skeleton({ className }: { className?: string }) {
  return <div className={clsx('skeleton', className)} />;
}

// ─── Loading States ────────────────────────────────────────
export function FullPageLoader({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center">
      <div className="relative">
        <div className="w-10 h-10 rounded-full border-2 border-ink-200" />
        <div className="absolute inset-0 w-10 h-10 rounded-full border-2 border-transparent border-t-accent-500 animate-spin" />
      </div>
      <p className="mt-3 text-sm text-ink-500">{label}</p>
    </div>
  );
}

export function TableLoader({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2 p-4">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-full" />
      ))}
    </div>
  );
}

// ─── Toast ─────────────────────────────────────────────────
export function Toast({
  variant = 'success',
  title,
  description,
  onClose,
}: {
  variant?: 'success' | 'error' | 'info';
  title: string;
  description?: string;
  onClose?: () => void;
}) {
  const variantClass = variant === 'success' ? 'toast-success' : variant === 'error' ? 'toast-error' : 'toast-info';
  const Icon = variant === 'success' ? CheckCircle2 : variant === 'error' ? AlertTriangle : InfoIcon;
  const iconColor = variant === 'success' ? 'text-success-600' : variant === 'error' ? 'text-danger-600' : 'text-info-600';
  return (
    <div className={variantClass + ' animate-slide-right'}>
      <Icon className={clsx('w-5 h-5 flex-shrink-0 mt-0.5', iconColor)} strokeWidth={2} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-ink-900">{title}</p>
        {description && <p className="text-xs text-ink-500 mt-0.5">{description}</p>}
      </div>
      {onClose && (
        <button onClick={onClose} className="text-ink-400 hover:text-ink-700 -mr-1 -mt-1 touch flex items-center justify-center">
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

// ─── Drawer (right slide-out, 20px radius) ────────────────
export function Drawer({
  open,
  onClose,
  title,
  children,
  footer,
  width = 560,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  width?: number;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 animate-fade-in">
      <div
        className="absolute inset-0 bg-ink-900/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className="absolute top-0 right-0 h-full bg-white shadow-modal flex flex-col animate-slide-right"
        style={{ width, borderTopLeftRadius: 24, borderBottomLeftRadius: 24 }}
      >
        <div className="h-18 flex items-center justify-between px-6 border-b border-ink-200 flex-shrink-0" style={{ height: 72 }}>
          <h2 className="text-lg font-bold text-ink-900 tracking-tight">{title}</h2>
          <button
            onClick={onClose}
            className="touch flex items-center justify-center rounded-lg text-ink-500 hover:bg-ink-100 hover:text-ink-900"
            aria-label="Close drawer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto scroll-thin px-6 py-6">
          {children}
        </div>
        {footer && (
          <div className="h-16 flex items-center justify-end gap-2 px-6 border-t border-ink-200 bg-white flex-shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Confirm Dialog (20px radius modal) ───────────────────
export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'info';
}) {
  if (!open) return null;
  const Icon = variant === 'danger' ? AlertTriangle : InfoIcon;
  const iconColor = variant === 'danger' ? 'text-warning-600' : 'text-info-600';
  const iconBg = variant === 'danger' ? 'bg-warning-subtle' : 'bg-info-subtle';
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div
        className="absolute inset-0 bg-ink-900/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative bg-white rounded-3xl shadow-modal max-w-md w-full p-6 animate-scale-in">
        <div className="flex items-start gap-4">
          <div className={clsx('w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0', iconBg)}>
            <Icon className={clsx('w-5 h-5', iconColor)} strokeWidth={2} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold text-ink-900">{title}</h3>
            <p className="text-sm text-ink-500 mt-1 text-pretty">{description}</p>
          </div>
        </div>
        <div className="mt-6 flex items-center justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>{cancelText}</Button>
          <Button variant={variant === 'danger' ? 'danger' : 'primary'} onClick={onConfirm}>{confirmText}</Button>
        </div>
      </div>
    </div>
  );
}

// ─── Toolbar (search + filters + actions) ─────────────────
export function Toolbar({
  search,
  onSearchChange,
  placeholder = 'Search…',
  children,
  actions,
}: {
  search?: string;
  onSearchChange?: (v: string) => void;
  placeholder?: string;
  children?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
      <div className="relative flex-1 max-w-md">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400 pointer-events-none" />
        <input
          type="search"
          value={search}
          onChange={(e) => onSearchChange?.(e.target.value)}
          placeholder={placeholder}
          className="input-search"
          aria-label="Search"
        />
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        {children}
        {actions}
      </div>
    </div>
  );
}

// ─── Tabs (segmented control) ──────────────────────────────
export function Tabs({
  tabs,
  active,
  onChange,
  className,
}: {
  tabs: { value: string; label: string; count?: number }[];
  active: string;
  onChange: (v: string) => void;
  className?: string;
}) {
  return (
    <div className={clsx('inline-flex items-center gap-1 p-1 bg-ink-100 rounded-lg', className)}>
      {tabs.map((t) => (
        <button
          key={t.value}
          onClick={() => onChange(t.value)}
          className={clsx(
            'inline-flex items-center gap-1.5 px-3 h-7 text-xs font-medium rounded-md transition-all duration-200',
            active === t.value
              ? 'bg-white text-ink-900 shadow-sm'
              : 'text-ink-600 hover:text-ink-900',
          )}
          role="tab"
          aria-selected={active === t.value}
        >
          {t.label}
          {typeof t.count === 'number' && (
            <span
              className={clsx(
                'inline-flex items-center justify-center min-w-[18px] h-4 px-1 rounded text-2xs font-semibold',
                active === t.value ? 'bg-accent-50 text-accent-700' : 'bg-ink-200 text-ink-600',
              )}
            >
              {t.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

// ─── Page Header ──────────────────────────────────────────
export function PageHeader({
  title,
  description,
  actions,
  breadcrumbs,
}: {
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
  breadcrumbs?: { label: string; to?: string }[];
}) {
  return (
    <div className="mb-6 sm:mb-8">
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="flex items-center gap-1.5 text-xs text-ink-500 mb-2" aria-label="Breadcrumb">
          {breadcrumbs.map((c, i) => (
            <span key={i} className="flex items-center gap-1.5">
              {i > 0 && <span className="text-ink-300">/</span>}
              <span className={i === breadcrumbs.length - 1 ? 'text-ink-700 font-medium' : ''}>
                {c.label}
              </span>
            </span>
          ))}
        </nav>
      )}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-3xl font-bold text-ink-900 tracking-tight text-balance">{title}</h1>
          {description && (
            <p className="text-sm text-ink-500 mt-1.5 text-pretty max-w-2xl">{description}</p>
          )}
        </div>
        {actions && <div className="flex items-center gap-2 flex-shrink-0">{actions}</div>}
      </div>
    </div>
  );
}

// ─── Inbox Illustration (for empty states) ─────────────────
import { Inbox } from 'lucide-react';

// ─── Pagination (legacy) ────────────────────────────────────
export function Pagination({
  page,
  totalPages,
  total,
  pageSize,
  limit,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  total: number;
  pageSize?: number;
  limit?: number;
  onPageChange: (p: number) => void;
}) {
  const size = pageSize ?? limit ?? 20;
  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-ink-200/80">
      <div className="text-sm text-ink-500">
        Showing <span className="font-medium text-ink-700">{(page - 1) * size + 1}–{Math.min(page * size, total)}</span> of <span className="font-medium text-ink-700">{total}</span>
      </div>
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          disabled={page === 1}
          onClick={() => onPageChange(page - 1)}
        >
          Previous
        </Button>
        <div className="px-3 text-xs text-ink-600">
          Page <span className="font-semibold text-ink-900">{page}</span> of {totalPages}
        </div>
        <Button
          variant="ghost"
          size="sm"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}

// ─── Modal (legacy alias) ──────────────────────────────────
export function Modal({
  open,
  onClose,
  title,
  children,
  size,
  footer,
  width,
}: {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  children: ReactNode;
  size?: string;
  footer?: ReactNode;
  width?: number;
}) {
  if (!open) return null;
  const maxW = width ?? (size === 'sm' ? 384 : size === 'lg' ? 672 : size === 'xl' ? 896 : 560);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-ink-900/40 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative bg-white rounded-3xl shadow-modal w-full p-6 animate-scale-in flex flex-col max-h-[90vh]"
        style={{ maxWidth: maxW }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-ink-900">{title}</h3>
          <button
            onClick={onClose}
            className="touch w-8 h-8 rounded-lg text-ink-500 hover:bg-ink-100 hover:text-ink-900 flex items-center justify-center"
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <div className="overflow-y-auto scroll-thin flex-1">{children}</div>
        {footer && (
          <div className="mt-4 pt-4 border-t border-ink-200 flex items-center justify-end gap-2">{footer}</div>
        )}
      </div>
    </div>
  );
}
