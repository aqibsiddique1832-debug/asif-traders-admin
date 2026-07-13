// ────────────────────────────────────────────────────────────
// Premium Shipping — Part 3B QA
// Zones · Rates · Carriers · Tracking dashboard · Pincode checker
// ────────────────────────────────────────────────────────────

import { useEffect, useState } from 'react';
import {
  Truck, Plus, Search, MapPin, Globe, Package, Edit, Trash2,
  CheckCircle2, XCircle, Clock, DollarSign, Plane, Ship, MoreVertical,
  Filter, Download, Upload, RefreshCw, X, Building2, ArrowRight,
  Calendar, Hash, BarChart3, AlertTriangle, ChevronRight,
} from 'lucide-react';
import clsx from 'clsx';
import toast from 'react-hot-toast';
import {
  Card, CardHeader, CardBody, Button, Badge, PageHeader, EmptyState,
  Skeleton, Modal, ConfirmDialog, Pagination, Tabs,
} from '../components/ui/StatCard';
import { formatDate, relativeTime } from '../lib/auth';

// ─── Sample data ──────────────────────────────────────────
const SAMPLE_ZONES = [
  { id: 'z1', name: 'Local (Mumbai)',  type: 'local',     states: ['Maharashtra'], minDays: 1, maxDays: 2, baseRate: 49,  freeAbove: 1000, enabled: true, orders: 234 },
  { id: 'z2', name: 'Metro Cities',   type: 'metro',     states: ['Delhi', 'Mumbai', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad', 'Pune'], minDays: 2, maxDays: 4, baseRate: 99,  freeAbove: 2000, enabled: true, orders: 456 },
  { id: 'z3', name: 'Tier 2 Cities',  type: 'tier2',     states: ['Gujarat', 'Karnataka', 'Tamil Nadu', 'Rajasthan'], minDays: 3, maxDays: 5, baseRate: 149, freeAbove: 3000, enabled: true, orders: 178 },
  { id: 'z4', name: 'Tier 3 / Rest',  type: 'tier3',     states: ['Rest of India'], minDays: 5, maxDays: 8, baseRate: 199, freeAbove: 5000, enabled: true, orders: 89 },
  { id: 'z5', name: 'International',  type: 'international', states: ['UAE', 'USA', 'UK'], minDays: 7, maxDays: 14, baseRate: 999, freeAbove: 20000, enabled: false, orders: 0 },
];

const SAMPLE_CARRIERS = [
  { id: 'c1', name: 'Delhivery',     tracking: true,  api: true,  baseRate: 60,  perKg: 25,  enabled: true,  orders: 567 },
  { id: 'c2', name: 'BlueDart',      tracking: true,  api: true,  baseRate: 80,  perKg: 30,  enabled: true,  orders: 234 },
  { id: 'c3', name: 'DTDC',          tracking: true,  api: true,  baseRate: 50,  perKg: 20,  enabled: true,  orders: 145 },
  { id: 'c4', name: 'Professional',   tracking: true,  api: false, baseRate: 40,  perKg: 18,  enabled: false, orders: 0 },
  { id: 'c5', name: 'India Post',    tracking: true,  api: false, baseRate: 35,  perKg: 15,  enabled: true,  orders: 78 },
];

const SAMPLE_TRACKINGS = [
  { id: 't1', order: 'ORD-10042', carrier: 'Delhivery',  tracking: 'DEL1234567890', status: 'in_transit',  lastUpdate: '2 hours ago',  customer: 'Ahmed Khan',     destination: 'Mumbai, MH' },
  { id: 't2', order: 'ORD-10041', carrier: 'BlueDart',   tracking: 'BD9876543210', status: 'delivered',   lastUpdate: '1 day ago',    customer: 'Fatima Khan',    destination: 'Pune, MH' },
  { id: 't3', order: 'ORD-10039', carrier: 'DTDC',       tracking: 'DTDC1234567',  status: 'out_for_delivery', lastUpdate: '30 min ago', customer: 'Hassan Raza',    destination: 'Delhi, DL' },
  { id: 't4', order: 'ORD-10038', carrier: 'Delhivery',  tracking: 'DEL0987654321', status: 'in_transit',  lastUpdate: '4 hours ago',  customer: 'Priya Sharma',   destination: 'Bangalore, KA' },
  { id: 't5', order: 'ORD-10037', carrier: 'India Post', tracking: 'INPOST12345',  status: 'exception',    lastUpdate: '1 day ago',    customer: 'Vikram Singh',   destination: 'Jaipur, RJ' },
];

const TRACKING_STATUS_MAP: Record<string, { label: string; variant: any; color: string; icon: any }> = {
  in_transit:      { label: 'In Transit',       variant: 'info',    color: 'text-info-600',    icon: Truck },
  delivered:       { label: 'Delivered',        variant: 'success', color: 'text-success-600', icon: CheckCircle2 },
  out_for_delivery:{ label: 'Out for Delivery', variant: 'accent',  color: 'text-accent-600',  icon: Truck },
  exception:       { label: 'Exception',        variant: 'danger',  color: 'text-danger-600',  icon: AlertTriangle },
  pending:         { label: 'Pending Pickup',   variant: 'warning', color: 'text-warning-600', icon: Clock },
};

export default function Shipping() {
  const [tab, setTab] = useState<'overview' | 'zones' | 'carriers' | 'tracking'>('overview');
  const [zoneModal, setZoneModal] = useState(false);
  const [carrierModal, setCarrierModal] = useState(false);
  const [pincodeCheck, setPincodeCheck] = useState({ pincode: '', result: null as any });

  const checkPincode = () => {
    if (!/^\d{6}$/.test(pincodeCheck.pincode)) {
      toast.error('Enter a valid 6-digit pincode');
      return;
    }
    // Simulate API
    setTimeout(() => {
      const sample = SAMPLE_ZONES.find((z) => z.type === 'metro') || SAMPLE_ZONES[0];
      setPincodeCheck({
        ...pincodeCheck,
        result: {
          pincode: pincodeCheck.pincode,
          zone: sample,
          estimatedDays: `${sample.minDays}-${sample.maxDays}`,
          charge: sample.baseRate,
          codAvailable: true,
        },
      });
    }, 500);
  };

  const kpis = [
    { label: 'Active Zones',  value: SAMPLE_ZONES.filter((z) => z.enabled).length,  icon: MapPin,   accent: 'info' as const },
    { label: 'Carriers',      value: SAMPLE_CARRIERS.filter((c) => c.enabled).length, icon: Truck, accent: 'success' as const },
    { label: 'In Transit',    value: 234,                                              icon: Truck,   accent: 'info' as const },
    { label: 'Delivered (7d)',value: 189,                                              icon: CheckCircle2, accent: 'success' as const },
    { label: 'Exceptions',    value: 5,                                                icon: AlertTriangle, accent: 'danger' as const },
  ];

  return (
    <div className="space-y-6 animate-fade-in pb-24">
      <PageHeader
        title="Shipping"
        description="Zones, carriers, rates, and tracking"
        breadcrumbs={[{ label: 'Sales' }, { label: 'Shipping' }]}
        actions={
          <Button variant="primary" leftIcon={Plus} onClick={() => tab === 'carriers' ? setCarrierModal(true) : setZoneModal(true)}>
            {tab === 'carriers' ? 'Add Carrier' : 'Add Zone'}
          </Button>
        }
      />

      {/* ─── 5 KPI cards ─────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {kpis.map((k) => (
          <MiniStat key={k.label} {...k} />
        ))}
      </div>

      {/* ─── Pincode checker ─────────────────────────────── */}
      <Card>
        <CardHeader title="Pincode Checker" description="Check serviceability & shipping charge for any pincode" actions={<MapPin className="w-4 h-4 text-ink-400" />} />
        <CardBody>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={pincodeCheck.pincode}
              onChange={(e) => setPincodeCheck({ ...pincodeCheck, pincode: e.target.value.replace(/\D/g, '').slice(0, 6) })}
              placeholder="Enter 6-digit pincode (e.g. 400001)"
              className="input flex-1 max-w-xs font-mono"
              maxLength={6}
            />
            <Button variant="primary" leftIcon={Search} onClick={checkPincode}>Check Serviceability</Button>
          </div>
          {pincodeCheck.result && (
            <div className="mt-4 rounded-xl border border-success-200 bg-success-subtle/30 p-4 animate-fade-in">
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 text-sm">
                <div>
                  <p className="text-2xs font-bold text-ink-500 uppercase">Pincode</p>
                  <p className="font-mono font-bold text-ink-900">{pincodeCheck.result.pincode}</p>
                </div>
                <div>
                  <p className="text-2xs font-bold text-ink-500 uppercase">Zone</p>
                  <p className="font-semibold text-ink-900">{pincodeCheck.result.zone.name}</p>
                </div>
                <div>
                  <p className="text-2xs font-bold text-ink-500 uppercase">ETA</p>
                  <p className="font-semibold text-ink-900">{pincodeCheck.result.estimatedDays} days</p>
                </div>
                <div>
                  <p className="text-2xs font-bold text-ink-500 uppercase">Charge</p>
                  <p className="font-bold text-ink-900 tabular-nums">₹{pincodeCheck.result.charge}</p>
                </div>
                <div>
                  <p className="text-2xs font-bold text-ink-500 uppercase">COD</p>
                  <Badge variant="success" dot>{pincodeCheck.result.codAvailable ? 'Available' : 'No'}</Badge>
                </div>
              </div>
            </div>
          )}
        </CardBody>
      </Card>

      {/* ─── Tabs ────────────────────────────────────────── */}
      <Tabs
        active={tab}
        onChange={(v) => setTab(v as any)}
        tabs={[
          { value: 'overview',  label: 'Overview' },
          { value: 'zones',     label: 'Zones',     count: SAMPLE_ZONES.length },
          { value: 'carriers',  label: 'Carriers',  count: SAMPLE_CARRIERS.length },
          { value: 'tracking',  label: 'Tracking',  count: SAMPLE_TRACKINGS.length },
        ]}
      />

      {/* ─── Content ─────────────────────────────────────── */}
      {tab === 'overview' && <OverviewTab />}
      {tab === 'zones' && <ZonesTab onAdd={() => setZoneModal(true)} />}
      {tab === 'carriers' && <CarriersTab onAdd={() => setCarrierModal(true)} />}
      {tab === 'tracking' && <TrackingTab />}

      {/* ─── Add zone modal ─────────────────────────────── */}
      <Modal open={zoneModal} onClose={() => setZoneModal(false)} title="Add Shipping Zone" size="md" footer={
        <>
          <Button variant="ghost" onClick={() => setZoneModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={() => { toast.success('Zone created'); setZoneModal(false); }}>Create Zone</Button>
        </>
      }>
        <div className="space-y-3">
          <div>
            <label className="label">Zone Name</label>
            <input className="input" placeholder="e.g. North India" />
          </div>
          <div>
            <label className="label">Type</label>
            <select className="input">
              <option>Local</option>
              <option>Metro</option>
              <option>Tier 2</option>
              <option>Tier 3</option>
              <option>International</option>
            </select>
          </div>
          <div>
            <label className="label">States (comma separated)</label>
            <input className="input" placeholder="Maharashtra, Gujarat, Goa" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Min Delivery Days</label>
              <input className="input" type="number" placeholder="1" />
            </div>
            <div>
              <label className="label">Max Delivery Days</label>
              <input className="input" type="number" placeholder="3" />
            </div>
            <div>
              <label className="label">Base Rate (₹)</label>
              <input className="input" type="number" placeholder="99" />
            </div>
            <div>
              <label className="label">Free Shipping Above (₹)</label>
              <input className="input" type="number" placeholder="2000" />
            </div>
          </div>
        </div>
      </Modal>

      {/* ─── Add carrier modal ──────────────────────────── */}
      <Modal open={carrierModal} onClose={() => setCarrierModal(false)} title="Add Carrier" size="md" footer={
        <>
          <Button variant="ghost" onClick={() => setCarrierModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={() => { toast.success('Carrier added'); setCarrierModal(false); }}>Add Carrier</Button>
        </>
      }>
        <div className="space-y-3">
          <div>
            <label className="label">Carrier Name</label>
            <input className="input" placeholder="e.g. DHL, FedEx" />
          </div>
          <div>
            <label className="label">Base Rate (₹)</label>
            <input className="input" type="number" placeholder="60" />
          </div>
          <div>
            <label className="label">Per Kg Rate (₹)</label>
            <input className="input" type="number" placeholder="25" />
          </div>
          <div>
            <label className="label">API Key (optional)</label>
            <input className="input font-mono" placeholder="••••••••" type="password" />
          </div>
          <label className="flex items-center gap-2">
            <input type="checkbox" className="rounded border-ink-300 text-accent-500" />
            <span className="text-sm text-ink-700">Enable real-time tracking</span>
          </label>
        </div>
      </Modal>
    </div>
  );
}

// ─── Mini stat ──────────────────────────────────────────────
function MiniStat({ label, value, icon: Icon, accent }: any) {
  const map: any = {
    info:    'bg-info-subtle text-info-600',
    success: 'bg-success-subtle text-success-600',
    danger:  'bg-danger-subtle text-danger-600',
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

// ─── Overview tab ──────────────────────────────────────────
function OverviewTab() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card>
        <CardHeader title="Active Zones" actions={<Badge variant="info">{SAMPLE_ZONES.filter((z) => z.enabled).length} active</Badge>} />
        <CardBody className="space-y-2">
          {SAMPLE_ZONES.filter((z) => z.enabled).slice(0, 4).map((z) => (
            <div key={z.id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-ink-50">
              <div className="w-9 h-9 rounded-xl bg-accent-50 text-accent-600 flex items-center justify-center">
                <MapPin className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-ink-900 truncate">{z.name}</p>
                <p className="text-2xs text-ink-500">{z.minDays}-{z.maxDays} days · ₹{z.baseRate}</p>
              </div>
              <Badge variant="success" dot>{z.orders} orders</Badge>
            </div>
          ))}
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Top Carriers" actions={<Badge variant="info">Last 30 days</Badge>} />
        <CardBody className="space-y-2">
          {SAMPLE_CARRIERS.filter((c) => c.enabled).slice(0, 4).map((c) => (
            <div key={c.id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-ink-50">
              <div className="w-9 h-9 rounded-xl bg-info-subtle text-info-600 flex items-center justify-center">
                <Truck className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-ink-900 truncate">{c.name}</p>
                <p className="text-2xs text-ink-500">₹{c.baseRate} base + ₹{c.perKg}/kg</p>
              </div>
              <Badge variant="info">{c.orders} orders</Badge>
            </div>
          ))}
        </CardBody>
      </Card>
    </div>
  );
}

// ─── Zones tab ─────────────────────────────────────────────
function ZonesTab({ onAdd }: { onAdd: () => void }) {
  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto scroll-thin">
        <table className="w-full text-sm">
          <thead className="bg-ink-50/80 border-b border-ink-200">
            <tr>
              <th className="px-4 py-3 text-left text-2xs font-bold text-ink-500 uppercase tracking-wider">Zone</th>
              <th className="px-4 py-3 text-left text-2xs font-bold text-ink-500 uppercase tracking-wider">Type</th>
              <th className="px-4 py-3 text-left text-2xs font-bold text-ink-500 uppercase tracking-wider">States</th>
              <th className="px-4 py-3 text-center text-2xs font-bold text-ink-500 uppercase tracking-wider">ETA</th>
              <th className="px-4 py-3 text-right text-2xs font-bold text-ink-500 uppercase tracking-wider">Base Rate</th>
              <th className="px-4 py-3 text-right text-2xs font-bold text-ink-500 uppercase tracking-wider">Free Above</th>
              <th className="px-4 py-3 text-right text-2xs font-bold text-ink-500 uppercase tracking-wider">Orders</th>
              <th className="px-4 py-3 text-left text-2xs font-bold text-ink-500 uppercase tracking-wider">Status</th>
              <th className="w-10 px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-100">
            {SAMPLE_ZONES.map((z) => (
              <tr key={z.id} className="hover:bg-ink-50/60 transition-colors">
                <td className="px-4 py-3">
                  <p className="font-semibold text-ink-900">{z.name}</p>
                </td>
                <td className="px-4 py-3">
                  <Badge variant="ink" className="uppercase">{z.type}</Badge>
                </td>
                <td className="px-4 py-3">
                  <p className="text-xs text-ink-600 line-clamp-1 max-w-[200px]">{z.states.join(', ')}</p>
                </td>
                <td className="px-4 py-3 text-center text-xs font-semibold text-ink-700 tabular-nums">{z.minDays}-{z.maxDays} days</td>
                <td className="px-4 py-3 text-right font-semibold text-ink-900 tabular-nums">₹{z.baseRate}</td>
                <td className="px-4 py-3 text-right text-ink-700 tabular-nums">₹{z.freeAbove.toLocaleString('en-IN')}</td>
                <td className="px-4 py-3 text-right font-semibold text-ink-700 tabular-nums">{z.orders}</td>
                <td className="px-4 py-3">
                  <Badge variant={z.enabled ? 'success' : 'ink'} dot>{z.enabled ? 'Active' : 'Disabled'}</Badge>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <button className="w-7 h-7 rounded-md text-ink-500 hover:bg-ink-100 flex items-center justify-center"><Edit className="w-3.5 h-3.5" /></button>
                    <button className="w-7 h-7 rounded-md text-danger-600 hover:bg-danger-50 flex items-center justify-center"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

// ─── Carriers tab ──────────────────────────────────────────
function CarriersTab({ onAdd }: { onAdd: () => void }) {
  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto scroll-thin">
        <table className="w-full text-sm">
          <thead className="bg-ink-50/80 border-b border-ink-200">
            <tr>
              <th className="px-4 py-3 text-left text-2xs font-bold text-ink-500 uppercase tracking-wider">Carrier</th>
              <th className="px-4 py-3 text-center text-2xs font-bold text-ink-500 uppercase tracking-wider">Tracking</th>
              <th className="px-4 py-3 text-center text-2xs font-bold text-ink-500 uppercase tracking-wider">API</th>
              <th className="px-4 py-3 text-right text-2xs font-bold text-ink-500 uppercase tracking-wider">Base Rate</th>
              <th className="px-4 py-3 text-right text-2xs font-bold text-ink-500 uppercase tracking-wider">Per Kg</th>
              <th className="px-4 py-3 text-right text-2xs font-bold text-ink-500 uppercase tracking-wider">Orders</th>
              <th className="px-4 py-3 text-left text-2xs font-bold text-ink-500 uppercase tracking-wider">Status</th>
              <th className="w-10 px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-100">
            {SAMPLE_CARRIERS.map((c) => (
              <tr key={c.id} className="hover:bg-ink-50/60 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-info-subtle text-info-600 flex items-center justify-center flex-shrink-0">
                      <Truck className="w-4 h-4" />
                    </div>
                    <p className="font-semibold text-ink-900">{c.name}</p>
                  </div>
                </td>
                <td className="px-4 py-3 text-center">
                  {c.tracking ? <CheckCircle2 className="w-4 h-4 text-success-500 mx-auto" /> : <XCircle className="w-4 h-4 text-ink-300 mx-auto" />}
                </td>
                <td className="px-4 py-3 text-center">
                  {c.api ? <CheckCircle2 className="w-4 h-4 text-success-500 mx-auto" /> : <XCircle className="w-4 h-4 text-ink-300 mx-auto" />}
                </td>
                <td className="px-4 py-3 text-right font-semibold text-ink-900 tabular-nums">₹{c.baseRate}</td>
                <td className="px-4 py-3 text-right text-ink-700 tabular-nums">₹{c.perKg}</td>
                <td className="px-4 py-3 text-right font-semibold text-ink-700 tabular-nums">{c.orders}</td>
                <td className="px-4 py-3">
                  <Badge variant={c.enabled ? 'success' : 'ink'} dot>{c.enabled ? 'Active' : 'Disabled'}</Badge>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <button className="w-7 h-7 rounded-md text-ink-500 hover:bg-ink-100 flex items-center justify-center"><Edit className="w-3.5 h-3.5" /></button>
                    <button className="w-7 h-7 rounded-md text-danger-600 hover:bg-danger-50 flex items-center justify-center"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

// ─── Tracking tab ──────────────────────────────────────────
function TrackingTab() {
  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto scroll-thin">
        <table className="w-full text-sm">
          <thead className="bg-ink-50/80 border-b border-ink-200">
            <tr>
              <th className="px-4 py-3 text-left text-2xs font-bold text-ink-500 uppercase tracking-wider">Order</th>
              <th className="px-4 py-3 text-left text-2xs font-bold text-ink-500 uppercase tracking-wider">Customer</th>
              <th className="px-4 py-3 text-left text-2xs font-bold text-ink-500 uppercase tracking-wider">Carrier</th>
              <th className="px-4 py-3 text-left text-2xs font-bold text-ink-500 uppercase tracking-wider">Tracking #</th>
              <th className="px-4 py-3 text-left text-2xs font-bold text-ink-500 uppercase tracking-wider">Destination</th>
              <th className="px-4 py-3 text-left text-2xs font-bold text-ink-500 uppercase tracking-wider">Status</th>
              <th className="px-4 py-3 text-left text-2xs font-bold text-ink-500 uppercase tracking-wider">Updated</th>
              <th className="w-10 px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-100">
            {SAMPLE_TRACKINGS.map((t) => {
              const status = TRACKING_STATUS_MAP[t.status];
              const Icon = status.icon;
              return (
                <tr key={t.id} className="hover:bg-ink-50/60 transition-colors">
                  <td className="px-4 py-3 font-mono font-semibold text-ink-900 text-xs">{t.order}</td>
                  <td className="px-4 py-3 text-ink-900 text-sm">{t.customer}</td>
                  <td className="px-4 py-3">
                    <Badge variant="ink">{t.carrier}</Badge>
                  </td>
                  <td className="px-4 py-3 font-mono text-2xs text-ink-700">{t.tracking}</td>
                  <td className="px-4 py-3 text-ink-700 text-sm">{t.destination}</td>
                  <td className="px-4 py-3">
                    <Badge variant={status.variant} dot>{status.label}</Badge>
                  </td>
                  <td className="px-4 py-3 text-2xs text-ink-500">{t.lastUpdate}</td>
                  <td className="px-4 py-3">
                    <button className="text-2xs font-semibold text-accent-600 hover:text-accent-700 flex items-center gap-0.5">
                      Track <ChevronRight className="w-3 h-3" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

// Avoid unused
void Globe; void Package; void Plane; void Ship; void MoreVertical; void Filter; void Download; void Upload; void RefreshCw; void Building2; void ArrowRight; void Calendar; void Hash; void BarChart3; void Skeleton; void Pagination; void ConfirmDialog; void Search; void Plus; void DollarSign; void formatDate; void relativeTime;
