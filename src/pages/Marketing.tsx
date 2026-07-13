// ────────────────────────────────────────────────────────────
// Premium Marketing — Part 3A
// Email/WhatsApp campaigns · Banners · Announcements · Coupons
// · Promotions · Featured
// ────────────────────────────────────────────────────────────

import { useState } from 'react';
import {
  Megaphone, Mail, MessageCircle, Plus, Send, Image as ImageIcon,
  Percent, Tag, Sparkles, Star, Calendar, TrendingUp, Edit, Trash2,
  Eye, MousePointerClick, Users, DollarSign, Bell, CheckCircle2,
  X, Target, Zap, Heart,
} from 'lucide-react';
import clsx from 'clsx';
import toast from 'react-hot-toast';
import {
  Card, CardHeader, CardBody, Button, Badge, PageHeader, EmptyState,
  Modal, Tabs,
} from '../components/ui/StatCard';
import { formatCurrency, formatDate, relativeTime } from '../lib/auth';

// ─── Sample campaigns ──────────────────────────────────────
const SAMPLE_CAMPAIGNS = [
  { id: 'c1', name: 'Cement Fest 2026',     channel: 'email',     subject: 'Get 15% off on all cement',          sent: 1234, opened: 542, clicked: 187, status: 'sent',     scheduledAt: '2026-07-10T10:00:00Z' },
  { id: 'c2', name: 'Steel Mega Sale',      channel: 'whatsapp',  subject: 'Mega Steel Sale — Limited Time!',    sent: 856,  opened: 612, clicked: 234, status: 'sent',     scheduledAt: '2026-07-08T14:30:00Z' },
  { id: 'c3', name: 'New Tile Arrivals',    channel: 'email',     subject: 'Introducing our premium tile collection', sent: 0, opened: 0,   clicked: 0,   status: 'draft',    scheduledAt: null },
  { id: 'c4', name: 'Free Delivery Promo',  channel: 'whatsapp',  subject: 'Free delivery on orders above ₹5000', sent: 0, opened: 0,   clicked: 0,   status: 'scheduled',scheduledAt: '2026-07-20T09:00:00Z' },
];

const SAMPLE_COUPONS = [
  { id: 'co1', code: 'CEMENT15',  discount: 15, type: 'percent', minOrder: 5000,  uses: 47,  max: 200, expiresAt: '2026-08-31', status: 'active' },
  { id: 'co2', code: 'WELCOME500', discount: 500, type: 'flat',   minOrder: 2000,  uses: 124, max: 1000, expiresAt: '2026-12-31', status: 'active' },
  { id: 'co3', code: 'STEEL20',   discount: 20, type: 'percent', minOrder: 10000, uses: 18,  max: 100, expiresAt: '2026-07-31', status: 'active' },
  { id: 'co4', code: 'EXPIRED10', discount: 10, type: 'percent', minOrder: 1000,  uses: 89,  max: 100, expiresAt: '2026-06-30', status: 'expired' },
];

const SAMPLE_BANNERS = [
  { id: 'b1', title: 'Summer Sale',         position: 'Homepage Hero',  image: 'https://images.unsplash.com/photo-1565793298595-6a879b1d9492?w=400&h=200&fit=crop', clicks: 1234, status: 'active' },
  { id: 'b2', title: 'New Steel Collection', position: 'Category Page',  image: 'https://images.unsplash.com/photo-1605557202138-cf8a99b4f8b1?w=400&h=200&fit=crop', clicks: 567,  status: 'active' },
  { id: 'b3', title: 'Free Delivery',       position: 'Checkout',        image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=400&h=200&fit=crop', clicks: 234,  status: 'draft' },
];

export default function Marketing() {
  const [tab, setTab] = useState<'overview' | 'campaigns' | 'coupons' | 'banners' | 'announcements' | 'featured'>('overview');
  const [campaignModal, setCampaignModal] = useState(false);
  const [couponModal, setCouponModal] = useState(false);
  const [bannerModal, setBannerModal] = useState(false);

  const kpis = [
    { label: 'Active Campaigns', value: 3, icon: Megaphone, accent: 'accent' as const },
    { label: 'Emails Sent (30d)', value: '12.4K', icon: Mail, accent: 'info' as const },
    { label: 'Open Rate', value: '43.9%', icon: MousePointerClick, accent: 'success' as const },
    { label: 'Click Rate', value: '15.1%', icon: Target, accent: 'warning' as const },
    { label: 'Active Coupons', value: 3, icon: Percent, accent: 'accent' as const },
    { label: 'Revenue from Coupons', value: formatCurrency(245800), icon: DollarSign, accent: 'success' as const },
    { label: 'Active Banners', value: 2, icon: ImageIcon, accent: 'info' as const },
  ];

  return (
    <div className="space-y-6 animate-fade-in pb-24">
      <PageHeader
        title="Marketing"
        description="Email/WhatsApp campaigns, coupons, banners, and promotions"
        breadcrumbs={[{ label: 'Engage' }, { label: 'Marketing' }]}
        actions={
          <Button variant="primary" leftIcon={Plus} onClick={() => setCampaignModal(true)}>
            New Campaign
          </Button>
        }
      />

      {/* ─── 7 KPI cards ─────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {kpis.map((k) => (
          <MiniStat key={k.label} {...k} />
        ))}
      </div>

      {/* ─── Tabs ────────────────────────────────────────── */}
      <Tabs
        active={tab}
        onChange={(v) => setTab(v as any)}
        tabs={[
          { value: 'overview',      label: 'Overview' },
          { value: 'campaigns',     label: 'Campaigns',     count: SAMPLE_CAMPAIGNS.length },
          { value: 'coupons',       label: 'Coupons',       count: SAMPLE_COUPONS.length },
          { value: 'banners',       label: 'Banners',       count: SAMPLE_BANNERS.length },
          { value: 'announcements', label: 'Announcements' },
          { value: 'featured',      label: 'Featured Products' },
        ]}
      />

      {/* ─── Content per tab ─────────────────────────────── */}
      {tab === 'overview' && <OverviewTab />}
      {tab === 'campaigns' && <CampaignsTab onNew={() => setCampaignModal(true)} />}
      {tab === 'coupons' && <CouponsTab onNew={() => setCouponModal(true)} />}
      {tab === 'banners' && <BannersTab onNew={() => setBannerModal(true)} />}
      {tab === 'announcements' && <AnnouncementsTab />}
      {tab === 'featured' && <FeaturedTab />}

      {/* ─── Modals ──────────────────────────────────────── */}
      <Modal open={campaignModal} onClose={() => setCampaignModal(false)} title="New Campaign" size="lg" footer={
        <>
          <Button variant="ghost" onClick={() => setCampaignModal(false)}>Cancel</Button>
          <Button variant="secondary" onClick={() => { toast.success('Campaign saved as draft'); setCampaignModal(false); }}>Save Draft</Button>
          <Button variant="primary" leftIcon={Send} onClick={() => { toast.success('Campaign scheduled!'); setCampaignModal(false); }}>Schedule</Button>
        </>
      }>
        <CampaignForm />
      </Modal>

      <Modal open={couponModal} onClose={() => setCouponModal(false)} title="New Coupon" size="md" footer={
        <>
          <Button variant="ghost" onClick={() => setCouponModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={() => { toast.success('Coupon created!'); setCouponModal(false); }}>Create Coupon</Button>
        </>
      }>
        <CouponForm />
      </Modal>

      <Modal open={bannerModal} onClose={() => setBannerModal(false)} title="New Banner" size="md" footer={
        <>
          <Button variant="ghost" onClick={() => setBannerModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={() => { toast.success('Banner created!'); setBannerModal(false); }}>Create Banner</Button>
        </>
      }>
        <BannerForm />
      </Modal>
    </div>
  );
}

// ─── Mini stat ──────────────────────────────────────────────
function MiniStat({ label, value, icon: Icon, accent }: any) {
  const map: any = {
    info:    'bg-info-subtle text-info-600',
    success: 'bg-success-subtle text-success-600',
    warning: 'bg-warning-subtle text-warning-600',
    danger:  'bg-danger-subtle text-danger-600',
    accent:  'bg-accent-50 text-accent-600',
  };
  return (
    <div className="card-hover p-3 sm:p-4 flex items-center gap-2.5">
      <div className={clsx('w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0', map[accent])}>
        <Icon className="w-4 h-4" strokeWidth={2.25} />
      </div>
      <div className="min-w-0">
        <p className="text-2xs text-ink-500 truncate">{label}</p>
        <p className="text-base font-bold text-ink-900 tabular-nums truncate">{value}</p>
      </div>
    </div>
  );
}

// ─── Overview tab ───────────────────────────────────────────
function OverviewTab() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
      <Card>
        <CardHeader title="Recent Campaigns" description="Latest marketing activity" />
        <CardBody className="space-y-2">
          {SAMPLE_CAMPAIGNS.slice(0, 3).map((c) => (
            <div key={c.id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-ink-50">
              <div className={clsx('w-9 h-9 rounded-xl flex items-center justify-center', c.channel === 'email' ? 'bg-info-subtle text-info-600' : 'bg-success-subtle text-success-600')}>
                {c.channel === 'email' ? <Mail className="w-4 h-4" /> : <MessageCircle className="w-4 h-4" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-ink-900 truncate">{c.name}</p>
                <p className="text-2xs text-ink-500">{c.sent > 0 ? `${c.sent.toLocaleString('en-IN')} sent · ${c.opened} opened` : 'Draft'}</p>
              </div>
              <Badge variant={c.status === 'sent' ? 'success' : c.status === 'scheduled' ? 'info' : 'ink'} dot>{c.status}</Badge>
            </div>
          ))}
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Top Performing Coupons" />
        <CardBody className="space-y-2">
          {SAMPLE_COUPONS.filter((c) => c.status === 'active').slice(0, 3).map((c) => (
            <div key={c.id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-ink-50">
              <div className="w-9 h-9 rounded-xl bg-accent-50 text-accent-600 flex items-center justify-center">
                <Percent className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-mono text-sm font-semibold text-ink-900">{c.code}</p>
                <p className="text-2xs text-ink-500">
                  {c.type === 'percent' ? `${c.discount}% off` : `₹${c.discount} off`} · {c.uses}/{c.max} uses
                </p>
              </div>
              <Badge variant="success" dot>Active</Badge>
            </div>
          ))}
        </CardBody>
      </Card>
    </div>
  );
}

// ─── Campaigns tab ──────────────────────────────────────────
function CampaignsTab({ onNew }: { onNew: () => void }) {
  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto scroll-thin">
        <table className="w-full text-sm">
          <thead className="bg-ink-50/80 border-b border-ink-200">
            <tr>
              <th className="px-4 py-3 text-left text-2xs font-bold text-ink-500 uppercase tracking-wider">Campaign</th>
              <th className="px-4 py-3 text-left text-2xs font-bold text-ink-500 uppercase tracking-wider">Channel</th>
              <th className="px-4 py-3 text-right text-2xs font-bold text-ink-500 uppercase tracking-wider">Sent</th>
              <th className="px-4 py-3 text-right text-2xs font-bold text-ink-500 uppercase tracking-wider">Opened</th>
              <th className="px-4 py-3 text-right text-2xs font-bold text-ink-500 uppercase tracking-wider">Clicked</th>
              <th className="px-4 py-3 text-right text-2xs font-bold text-ink-500 uppercase tracking-wider">CTR</th>
              <th className="px-4 py-3 text-left text-2xs font-bold text-ink-500 uppercase tracking-wider">Status</th>
              <th className="px-4 py-3 text-left text-2xs font-bold text-ink-500 uppercase tracking-wider">Scheduled</th>
              <th className="w-10 px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-100">
            {SAMPLE_CAMPAIGNS.map((c) => {
              const ctr = c.sent > 0 ? ((c.clicked / c.sent) * 100).toFixed(1) : '—';
              return (
                <tr key={c.id} className="hover:bg-ink-50/60 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-semibold text-ink-900">{c.name}</p>
                    <p className="text-2xs text-ink-500 truncate max-w-[200px]">{c.subject}</p>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={c.channel === 'email' ? 'info' : 'success'}>
                      {c.channel === 'email' ? <Mail className="w-2.5 h-2.5" /> : <MessageCircle className="w-2.5 h-2.5" />}
                      {c.channel === 'email' ? 'Email' : 'WhatsApp'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums font-semibold text-ink-900">{c.sent.toLocaleString('en-IN')}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-ink-700">{c.opened.toLocaleString('en-IN')}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-ink-700">{c.clicked.toLocaleString('en-IN')}</td>
                  <td className="px-4 py-3 text-right tabular-nums font-semibold text-accent-600">{ctr}{typeof ctr === 'string' && ctr !== '—' ? '%' : ''}</td>
                  <td className="px-4 py-3">
                    <Badge variant={c.status === 'sent' ? 'success' : c.status === 'scheduled' ? 'info' : 'ink'} dot>{c.status}</Badge>
                  </td>
                  <td className="px-4 py-3 text-2xs text-ink-500">{c.scheduledAt ? formatDate(c.scheduledAt) : '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button className="w-7 h-7 rounded-md text-ink-500 hover:bg-ink-100 flex items-center justify-center"><Edit className="w-3.5 h-3.5" /></button>
                      <button className="w-7 h-7 rounded-md text-danger-600 hover:bg-danger-50 flex items-center justify-center"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
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

// ─── Coupons tab ────────────────────────────────────────────
function CouponsTab({ onNew }: { onNew: () => void }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {SAMPLE_COUPONS.map((c) => (
        <Card key={c.id} className="p-5 relative overflow-hidden">
          {/* Decorative pattern */}
          <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-accent-50 opacity-50" />
          <div className="relative">
            <div className="flex items-center justify-between mb-3">
              <Badge variant={c.status === 'active' ? 'success' : 'ink'} dot>{c.status}</Badge>
              <Percent className="w-5 h-5 text-accent-500" />
            </div>
            <p className="font-mono text-2xl font-black text-ink-900 tracking-wider">{c.code}</p>
            <p className="text-sm text-ink-600 mt-1">
              {c.type === 'percent' ? `${c.discount}% off` : `₹${c.discount} off`} · Min order {formatCurrency(c.minOrder)}
            </p>
            <div className="mt-4 pt-3 border-t border-dashed border-ink-200 grid grid-cols-2 gap-2 text-2xs">
              <div>
                <p className="text-ink-500">Used</p>
                <p className="font-bold text-ink-900">{c.uses} / {c.max}</p>
              </div>
              <div>
                <p className="text-ink-500">Expires</p>
                <p className="font-bold text-ink-900">{formatDate(c.expiresAt)}</p>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-1.5">
              <Button variant="ghost" size="sm" leftIcon={Edit} className="flex-1">Edit</Button>
              <Button variant="ghost" size="sm" leftIcon={Trash2} className="text-danger-600">Delete</Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

// ─── Banners tab ────────────────────────────────────────────
function BannersTab({ onNew }: { onNew: () => void }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {SAMPLE_BANNERS.map((b) => (
        <Card key={b.id} className="overflow-hidden">
          <div className="aspect-[2/1] bg-ink-100 overflow-hidden">
            <img src={b.image} alt={b.title} className="w-full h-full object-cover" />
          </div>
          <CardBody>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-ink-900">{b.title}</h3>
              <Badge variant={b.status === 'active' ? 'success' : 'ink'} dot>{b.status}</Badge>
            </div>
            <p className="text-xs text-ink-500 mb-3">Position: {b.position}</p>
            <div className="flex items-center justify-between pt-3 border-t border-ink-100">
              <div className="flex items-center gap-1.5 text-2xs text-ink-500">
                <MousePointerClick className="w-3 h-3" /> {b.clicks} clicks
              </div>
              <div className="flex items-center gap-1">
                <button className="w-7 h-7 rounded-md text-ink-500 hover:bg-ink-100 flex items-center justify-center"><Edit className="w-3.5 h-3.5" /></button>
                <button className="w-7 h-7 rounded-md text-danger-600 hover:bg-danger-50 flex items-center justify-center"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            </div>
          </CardBody>
        </Card>
      ))}
    </div>
  );
}

// ─── Announcements tab ──────────────────────────────────────
function AnnouncementsTab() {
  return (
    <Card>
      <CardBody>
        <EmptyState
          icon={Bell}
          title="Announcements"
          description="Site-wide announcements (e.g. holiday hours, system updates, special offers). Coming soon — backend announcement endpoints."
        />
      </CardBody>
    </Card>
  );
}

// ─── Featured tab ──────────────────────────────────────────
function FeaturedTab() {
  return (
    <Card>
      <CardBody>
        <EmptyState
          icon={Star}
          title="Featured Products Manager"
          description="Toggle which products appear in homepage Featured / Bestseller / New Arrival sections. Can be done from the Product Wizard Step 10."
          action={<LinkBtn to="/products" label="Go to Products" />}
        />
      </CardBody>
    </Card>
  );
}

function LinkBtn({ to, label }: { to: string; label: string }) {
  return (
    <a href={to} className="btn-primary inline-flex">
      {label}
    </a>
  );
}

// ─── Forms ──────────────────────────────────────────────────
function CampaignForm() {
  return (
    <div className="space-y-3">
      <div>
        <label className="label">Campaign Name <span className="text-danger-500">*</span></label>
        <input className="input" placeholder="e.g. Monsoon Mega Sale" />
      </div>
      <div>
        <label className="label">Channel</label>
        <div className="grid grid-cols-2 gap-2">
          <label className="flex items-center gap-2 p-3 rounded-xl border-2 border-accent-500 bg-accent-50/50 cursor-pointer">
            <input type="radio" name="channel" defaultChecked className="text-accent-500" />
            <Mail className="w-4 h-4 text-accent-600" />
            <span className="font-semibold text-sm">Email</span>
          </label>
          <label className="flex items-center gap-2 p-3 rounded-xl border-2 border-ink-200 hover:border-ink-300 cursor-pointer">
            <input type="radio" name="channel" className="text-accent-500" />
            <MessageCircle className="w-4 h-4 text-success-600" />
            <span className="font-semibold text-sm">WhatsApp</span>
          </label>
        </div>
      </div>
      <div>
        <label className="label">Subject</label>
        <input className="input" placeholder="Email subject line" />
      </div>
      <div>
        <label className="label">Message</label>
        <textarea className="input min-h-[100px] py-2" placeholder="Your campaign message…" />
      </div>
      <div>
        <label className="label">Schedule</label>
        <input type="datetime-local" className="input" />
      </div>
    </div>
  );
}

function CouponForm() {
  return (
    <div className="space-y-3">
      <div>
        <label className="label">Coupon Code <span className="text-danger-500">*</span></label>
        <input className="input font-mono uppercase" placeholder="SUMMER20" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Type</label>
          <select className="input">
            <option>Percentage</option>
            <option>Flat amount</option>
          </select>
        </div>
        <div>
          <label className="label">Discount</label>
          <input className="input" type="number" placeholder="20" />
        </div>
      </div>
      <div>
        <label className="label">Minimum Order</label>
        <input className="input" type="number" placeholder="1000" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Max Uses</label>
          <input className="input" type="number" placeholder="100" />
        </div>
        <div>
          <label className="label">Expires</label>
          <input className="input" type="date" />
        </div>
      </div>
    </div>
  );
}

function BannerForm() {
  return (
    <div className="space-y-3">
      <div>
        <label className="label">Title <span className="text-danger-500">*</span></label>
        <input className="input" placeholder="Summer Sale" />
      </div>
      <div>
        <label className="label">Image URL</label>
        <input className="input" placeholder="https://..." />
      </div>
      <div>
        <label className="label">Position</label>
        <select className="input">
          <option>Homepage Hero</option>
          <option>Homepage Secondary</option>
          <option>Category Page</option>
          <option>Checkout</option>
        </select>
      </div>
      <div>
        <label className="label">Link URL</label>
        <input className="input" placeholder="https://..." />
      </div>
    </div>
  );
}

// Avoid unused
void Zap;
void Heart;
void Calendar;
void TrendingUp;
void CheckCircle2;
void X;
void Plus;
void Eye;
void Sparkles;
void Tag;
void Users;
void DollarSign;
void Send;
void Star;
void Bell;
void MessageCircle;
void Mail;
void Percent;
void Megaphone;
void ImageIcon;
