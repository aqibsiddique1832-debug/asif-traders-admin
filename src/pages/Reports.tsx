// ────────────────────────────────────────────────────────────
// Premium Reports — Part 3A
// 13 report types · filters · generate/preview/print/PDF/Excel
// ────────────────────────────────────────────────────────────

import { useState } from 'react';
import {
  FileText, Download, Printer, Filter, Calendar, FileSpreadsheet,
  BarChart3, ShoppingBag, Package, Users, FileCheck, Layers, Tag,
  Truck, CreditCard, ArrowRightLeft, Box, Eye, ChevronRight,
  Clock, Star, Boxes,
} from 'lucide-react';
import clsx from 'clsx';
import toast from 'react-hot-toast';
import {
  Card, CardHeader, CardBody, Button, Badge, PageHeader, EmptyState,
  Modal, Tabs,
} from '../components/ui/StatCard';
import { formatCurrency, formatDate } from '../lib/auth';

type Report = {
  id: string;
  name: string;
  description: string;
  icon: any;
  color: string;
  category: 'sales' | 'catalog' | 'customer' | 'finance' | 'logistics';
  filters: string[];
  schedule?: string;
};

const REPORTS: Report[] = [
  // Sales
  { id: 'sales',      name: 'Sales Report',         description: 'Comprehensive sales breakdown by date, channel, region', icon: BarChart3, color: 'accent',  category: 'sales',    filters: ['Date', 'Channel', 'Region', 'Category'], schedule: 'Weekly' },
  { id: 'orders',     name: 'Orders Report',        description: 'All orders with status, payment, and customer details', icon: ShoppingBag, color: 'info',  category: 'sales',    filters: ['Date', 'Status', 'Payment', 'Customer'] },
  // Catalog
  { id: 'products',   name: 'Products Report',      description: 'Product performance, stock, and pricing analysis',     icon: Package,    color: 'info',    category: 'catalog',  filters: ['Category', 'Brand', 'Status', 'Stock'] },
  { id: 'inventory',  name: 'Inventory Report',     description: 'Stock levels, movements, and reorder needs',           icon: Boxes,      color: 'warning', category: 'catalog',  filters: ['Warehouse', 'Category', 'Stock Status'] },
  { id: 'stock',      name: 'Stock Movement',       description: 'Detailed log of all stock in/out movements',           icon: ArrowRightLeft, color: 'info', category: 'catalog',  filters: ['Date', 'Product', 'Type'] },
  { id: 'brand',      name: 'Brand Report',         description: 'Performance metrics by brand',                        icon: Tag,        color: 'accent',  category: 'catalog',  filters: ['Brand', 'Date'] },
  { id: 'category',   name: 'Category Report',      description: 'Sales and growth by product category',                icon: Layers,     color: 'info',    category: 'catalog',  filters: ['Category', 'Date'] },
  // Customer
  { id: 'customer',   name: 'Customer Report',      description: 'Customer acquisition, retention, and LTV',            icon: Users,      color: 'success', category: 'customer', filters: ['Date', 'Segment', 'Status'] },
  // Finance
  { id: 'gst',        name: 'GST Report',           description: 'GST collected, input credit, and net liability',       icon: FileCheck,  color: 'accent',  category: 'finance',  filters: ['Date', 'GSTIN', 'Rate'] },
  { id: 'tax',        name: 'Tax Report',           description: 'All taxes collected by jurisdiction',                  icon: FileCheck,  color: 'accent',  category: 'finance',  filters: ['Date', 'Tax Type'] },
  { id: 'payment',    name: 'Payment Report',       description: 'Payment methods, success rates, and pending',         icon: CreditCard, color: 'success', category: 'finance',  filters: ['Date', 'Method', 'Status'] },
  // Logistics
  { id: 'quote',      name: 'Quotes Report',        description: 'Quote pipeline and conversion analysis',               icon: FileText,   color: 'info',    category: 'sales',    filters: ['Date', 'Status', 'Customer'] },
  { id: 'delivery',   name: 'Delivery Report',      description: 'Shipping performance and on-time delivery',          icon: Truck,      color: 'warning', category: 'logistics', filters: ['Date', 'Carrier', 'Region', 'Status'] },
];

const CATEGORIES = [
  { value: 'all',       label: 'All Reports' },
  { value: 'sales',     label: 'Sales' },
  { value: 'catalog',   label: 'Catalog' },
  { value: 'customer',  label: 'Customer' },
  { value: 'finance',   label: 'Finance' },
  { value: 'logistics', label: 'Logistics' },
];

export default function Reports() {
  const [category, setCategory] = useState('all');
  const [preview, setPreview] = useState<Report | null>(null);
  const [generating, setGenerating] = useState<string | null>(null);
  const [filterModal, setFilterModal] = useState<Report | null>(null);
  const [dateRange, setDateRange] = useState({ from: '', to: '' });

  const filtered = REPORTS.filter((r) => category === 'all' || r.category === category);

  const handleGenerate = (report: Report, format: 'preview' | 'print' | 'pdf' | 'excel' | 'csv' = 'preview') => {
    setGenerating(report.id);
    setTimeout(() => {
      setGenerating(null);
      if (format === 'preview') setPreview(report);
      else if (format === 'print') window.print();
      else if (format === 'pdf') {
        // Simulate PDF generation via print
        toast.success(`Generating ${report.name} as PDF...`);
        setTimeout(() => window.print(), 500);
      } else {
        toast.success(`Downloaded ${report.name}.${format}`);
      }
    }, 800);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-24">
      <PageHeader
        title="Reports"
        description="13 report types · Generate, preview, print, export"
        breadcrumbs={[{ label: 'System' }, { label: 'Reports' }]}
        actions={
          <>
            <Button variant="secondary" leftIcon={Calendar}>Schedule</Button>
            <Button variant="secondary" leftIcon={Download}>Download All</Button>
          </>
        }
      />

      {/* ─── Category tabs ──────────────────────────────── */}
      <Tabs
        active={category}
        onChange={setCategory}
        tabs={CATEGORIES.map((c) => ({
          value: c.value,
          label: c.label,
          count: c.value === 'all' ? REPORTS.length : REPORTS.filter((r) => r.category === c.value).length,
        }))}
      />

      {/* ─── Date range filter ──────────────────────────── */}
      <Card>
        <CardBody className="p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center gap-3">
          <Filter className="w-4 h-4 text-ink-400" />
          <div className="flex items-center gap-2 flex-wrap">
            <input
              type="date"
              value={dateRange.from}
              onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
              className="input h-9 w-auto"
              placeholder="From"
            />
            <span className="text-ink-400">→</span>
            <input
              type="date"
              value={dateRange.to}
              onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
              className="input h-9 w-auto"
              placeholder="To"
            />
          </div>
          <Button variant="ghost" size="sm" onClick={() => setDateRange({ from: '', to: '' })}>Clear</Button>
          <div className="flex-1" />
          <Badge variant="info" dot>Showing {filtered.length} reports</Badge>
        </CardBody>
      </Card>

      {/* ─── Report cards grid ─────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((r) => (
          <ReportCard
            key={r.id}
            report={r}
            generating={generating === r.id}
            onPreview={() => setPreview(r)}
            onGenerate={(fmt) => handleGenerate(r, fmt)}
            onFilter={() => setFilterModal(r)}
          />
        ))}
      </div>

      {/* ─── Preview modal ─────────────────────────────── */}
      <Modal
        open={!!preview}
        onClose={() => setPreview(null)}
        title={preview?.name}
        size="xl"
        footer={
          <>
            <Button variant="ghost" onClick={() => setPreview(null)}>Close</Button>
            <Button variant="secondary" leftIcon={Printer} onClick={() => preview && handleGenerate(preview, 'print')}>Print</Button>
            <Button variant="secondary" leftIcon={FileSpreadsheet} onClick={() => preview && handleGenerate(preview, 'excel')}>Export Excel</Button>
            <Button variant="primary" leftIcon={Download} onClick={() => preview && handleGenerate(preview, 'pdf')}>Download PDF</Button>
          </>
        }
      >
        {preview && <ReportPreview report={preview} />}
      </Modal>

      {/* ─── Filter modal ───────────────────────────────── */}
      <Modal
        open={!!filterModal}
        onClose={() => setFilterModal(null)}
        title={`Filter: ${filterModal?.name}`}
        size="md"
        footer={
          <>
            <Button variant="ghost" onClick={() => setFilterModal(null)}>Cancel</Button>
            <Button variant="primary" onClick={() => { toast.success('Filters applied'); setFilterModal(null); }}>Apply</Button>
          </>
        }
      >
        {filterModal && (
          <div className="space-y-3">
            {filterModal.filters.map((f) => (
              <div key={f}>
                <label className="label">{f}</label>
                <select className="input">
                  <option>All {f}s</option>
                  <option>Specific value</option>
                </select>
              </div>
            ))}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="label">From</label>
                <input type="date" className="input" />
              </div>
              <div>
                <label className="label">To</label>
                <input type="date" className="input" />
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

// ─── Report card ────────────────────────────────────────────
function ReportCard({ report, generating, onPreview, onGenerate, onFilter }: {
  report: Report;
  generating: boolean;
  onPreview: () => void;
  onGenerate: (fmt: 'preview' | 'print' | 'pdf' | 'excel' | 'csv') => void;
  onFilter: () => void;
}) {
  const colorMap: any = {
    accent:  { bg: 'bg-accent-50', text: 'text-accent-600' },
    info:    { bg: 'bg-info-subtle', text: 'text-info-600' },
    success: { bg: 'bg-success-subtle', text: 'text-success-600' },
    warning: { bg: 'bg-warning-subtle', text: 'text-warning-600' },
    danger:  { bg: 'bg-danger-subtle', text: 'text-danger-600' },
  };
  const Icon = report.icon;
  return (
    <Card className="p-5 hover:border-accent-300 transition-all group/rpt">
      <div className="flex items-start gap-3 mb-3">
        <div className={clsx('w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0', colorMap[report.color]?.bg, colorMap[report.color]?.text)}>
          <Icon className="w-5 h-5" strokeWidth={2.25} />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-ink-900">{report.name}</h3>
          <p className="text-xs text-ink-500 mt-0.5 line-clamp-2">{report.description}</p>
        </div>
      </div>

      <div className="flex items-center gap-1.5 mb-3 flex-wrap">
        {report.filters.map((f) => (
          <span key={f} className="text-2xs font-medium bg-ink-100 text-ink-600 px-1.5 h-5 rounded inline-flex items-center">
            {f}
          </span>
        ))}
      </div>

      {report.schedule && (
        <div className="flex items-center gap-1.5 text-2xs text-ink-500 mb-3">
          <Clock className="w-3 h-3" />
          <span>Auto-generate: {report.schedule}</span>
        </div>
      )}

      <div className="flex items-center gap-1.5 pt-3 border-t border-ink-100">
        <Button variant="secondary" size="sm" onClick={onFilter} leftIcon={Filter}>Filter</Button>
        <Button variant="secondary" size="sm" onClick={onPreview} leftIcon={Eye}>Preview</Button>
        <Button
          variant="primary"
          size="sm"
          onClick={() => onGenerate('pdf')}
          loading={generating}
          leftIcon={Download}
          className="flex-1"
        >
          Generate
        </Button>
      </div>
    </Card>
  );
}

// ─── Report preview ────────────────────────────────────────
function ReportPreview({ report }: { report: Report }) {
  // Generate sample data
  const rows = Array.from({ length: 8 }).map((_, i) => ({
    id: i + 1,
    name: `Sample ${report.name} ${i + 1}`,
    value: Math.floor(Math.random() * 100000) + 1000,
    qty: Math.floor(Math.random() * 50) + 1,
    status: ['Active', 'Pending', 'Completed', 'Cancelled'][i % 4],
    date: new Date(Date.now() - i * 86400000).toISOString().slice(0, 10),
  }));

  return (
    <div className="space-y-3">
      <div className="rounded-xl bg-ink-50 border border-ink-200 p-3 text-xs text-ink-600">
        <p className="font-semibold text-ink-900 mb-1">Report Summary</p>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <p className="text-2xs text-ink-500">Total Records</p>
            <p className="font-bold text-ink-900 tabular-nums">{rows.length}</p>
          </div>
          <div>
            <p className="text-2xs text-ink-500">Total Value</p>
            <p className="font-bold text-ink-900 tabular-nums">{formatCurrency(rows.reduce((s, r) => s + r.value, 0))}</p>
          </div>
          <div>
            <p className="text-2xs text-ink-500">Generated</p>
            <p className="font-bold text-ink-900">{formatDate(new Date().toISOString())}</p>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-ink-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-ink-50">
            <tr>
              <th className="px-3 py-2 text-left text-2xs font-bold text-ink-500 uppercase">#</th>
              <th className="px-3 py-2 text-left text-2xs font-bold text-ink-500 uppercase">Name</th>
              <th className="px-3 py-2 text-right text-2xs font-bold text-ink-500 uppercase">Value</th>
              <th className="px-3 py-2 text-right text-2xs font-bold text-ink-500 uppercase">Qty</th>
              <th className="px-3 py-2 text-left text-2xs font-bold text-ink-500 uppercase">Status</th>
              <th className="px-3 py-2 text-left text-2xs font-bold text-ink-500 uppercase">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-100">
            {rows.map((r) => (
              <tr key={r.id}>
                <td className="px-3 py-2 text-ink-500">{r.id}</td>
                <td className="px-3 py-2 font-medium text-ink-900">{r.name}</td>
                <td className="px-3 py-2 text-right font-semibold tabular-nums">{formatCurrency(r.value)}</td>
                <td className="px-3 py-2 text-right tabular-nums">{r.qty}</td>
                <td className="px-3 py-2">
                  <Badge variant={['success', 'warning', 'info', 'danger'][r.id % 4] as any}>{r.status}</Badge>
                </td>
                <td className="px-3 py-2 text-2xs text-ink-500">{r.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-2xs text-ink-500 flex items-center gap-1.5">
        <Star className="w-3 h-3" />
        Preview data is auto-generated for demo. Real data will appear when filters are applied.
      </p>
    </div>
  );
}

// Avoid unused
void ChevronRight;
