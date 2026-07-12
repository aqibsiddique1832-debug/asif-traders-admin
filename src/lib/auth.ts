// ────────────────────────────────────────────────────────────
// Auth helpers + formatters
// ────────────────────────────────────────────────────────────

export function formatCurrency(amount: number | string | undefined, currency = '₹'): string {
  if (amount === undefined || amount === null) return `${currency}0.00`;
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return `${currency}0.00`;
  return `${currency}${num.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatNumber(num: number | string | undefined): string {
  if (num === undefined || num === null) return '0';
  const n = typeof num === 'string' ? parseInt(num, 10) : num;
  if (isNaN(n)) return '0';
  return n.toLocaleString('en-IN');
}

export function formatDate(date: string | Date | undefined, options?: Intl.DateTimeFormatOptions): string {
  if (!date) return '—';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options,
  });
}

export function formatDateTime(date: string | Date | undefined): string {
  if (!date) return '—';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function relativeTime(date: string | Date | undefined): string {
  if (!date) return '—';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '—';
  const seconds = Math.floor((Date.now() - d.getTime()) / 1000);
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return formatDate(d);
}

export function getInitials(name: string | undefined | null): string {
  if (!name) return 'A';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function getStatusColor(status: string): string {
  const map: Record<string, string> = {
    // Order
    PENDING: 'badge-warning',
    CONFIRMED: 'badge-info',
    PROCESSING: 'badge-info',
    SHIPPED: 'badge-info',
    OUT_FOR_DELIVERY: 'badge-info',
    DELIVERED: 'badge-success',
    CANCELLED: 'badge-danger',
    REFUNDED: 'badge-secondary',
    RETURNED: 'badge-secondary',
    // Quote
    DRAFT: 'badge-secondary',
    SUBMITTED: 'badge-warning',
    REVIEWED: 'badge-info',
    QUOTED: 'badge-info',
    ACCEPTED: 'badge-success',
    REJECTED: 'badge-danger',
    EXPIRED: 'badge-secondary',
    CONVERTED: 'badge-success',
    // Product
    ACTIVE: 'badge-success',
    OUT_OF_STOCK: 'badge-danger',
    ARCHIVED: 'badge-secondary',
    // User
    ACTIVE_USER: 'badge-success',
    INACTIVE: 'badge-secondary',
    SUSPENDED: 'badge-danger',
    PENDING_VERIFICATION: 'badge-warning',
    // Payment
    PAID: 'badge-success',
    FAILED: 'badge-danger',
  };
  return map[status] || 'badge-secondary';
}

export function downloadCSV(data: any[], filename: string) {
  if (!data || data.length === 0) return;
  const headers = Object.keys(data[0]);
  const rows = data.map((row) =>
    headers.map((h) => `"${String(row[h] ?? '').replace(/"/g, '""')}"`).join(','),
  );
  const csv = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}-${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
