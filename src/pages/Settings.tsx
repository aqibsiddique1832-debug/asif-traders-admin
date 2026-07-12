// ────────────────────────────────────────────────────────────
// Settings — Business Info, GST, WhatsApp, Hours, Delivery, Quote, Social, Logo, Banners
// ────────────────────────────────────────────────────────────

import { useEffect, useState } from 'react';
import { settingsService, type AdminSettings } from '../lib/services';
import {
  Building2, FileText, MessageCircle, Clock, Truck, FileSpreadsheet,
  Share2, Image as ImageIcon, Save, Plus, Trash2, RotateCcw
} from 'lucide-react';
import toast from 'react-hot-toast';
import clsx from 'clsx';

const TABS = [
  { id: 'business', label: 'Business Info', icon: Building2 },
  { id: 'hours', label: 'Business Hours', icon: Clock },
  { id: 'delivery', label: 'Delivery', icon: Truck },
  { id: 'quote', label: 'Quote Settings', icon: FileSpreadsheet },
  { id: 'social', label: 'Social Links', icon: Share2 },
  { id: 'logo', label: 'Logo & Banners', icon: ImageIcon },
] as const;

export default function Settings() {
  const [activeTab, setActiveTab] = useState<typeof TABS[number]['id']>('business');
  const [settings, setSettings] = useState<AdminSettings | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => { load(); }, []);

  const load = async () => {
    const s = await settingsService.get();
    setSettings(s);
  };

  const update = (section: keyof AdminSettings, data: any) => {
    if (!settings) return;
    setSettings({ ...settings, [section]: { ...settings[section], ...data } });
  };

  const save = async () => {
    if (!settings) return;
    setSaving(true);
    try {
      await settingsService.update(settings);
      toast.success('Settings saved');
    } catch { toast.error('Failed to save'); }
    finally { setSaving(false); }
  };

  const reset = async () => {
    if (!confirm('Reset all settings to defaults?')) return;
    const s = await settingsService.reset();
    setSettings(s);
    toast.success('Settings reset');
  };

  if (!settings) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Settings</h1>
          <p className="text-sm text-secondary-500 mt-1">Configure your business profile and preferences</p>
        </div>
        <div className="flex gap-2">
          <button onClick={reset} className="btn-secondary"><RotateCcw className="w-4 h-4" /> Reset</button>
          <button onClick={save} disabled={saving} className="btn-primary"><Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Changes'}</button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar tabs */}
        <div className="lg:w-56 flex-shrink-0">
          <div className="card p-2 lg:sticky lg:top-20">
            {TABS.map((tab) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={clsx('w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  activeTab === tab.id ? 'bg-primary text-white' : 'text-secondary-700 hover:bg-secondary-100')}>
                <tab.icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 space-y-6">
          {activeTab === 'business' && <BusinessTab settings={settings} update={(d) => update('business', d)} />}
          {activeTab === 'hours' && <HoursTab settings={settings} update={(d) => update('hours', d)} />}
          {activeTab === 'delivery' && <DeliveryTab settings={settings} update={(d) => update('delivery', d)} />}
          {activeTab === 'quote' && <QuoteTab settings={settings} update={(d) => update('quote', d)} />}
          {activeTab === 'social' && <SocialTab settings={settings} update={(d) => update('social', d)} />}
          {activeTab === 'logo' && <LogoBannerTab settings={settings} update={(d) => update('banners', d)} />}
        </div>
      </div>
    </div>
  );
}

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <div>
      <label className="block text-sm font-medium text-secondary-700 mb-1.5">{label}</label>
      {children}
      {hint && <p className="text-xs text-secondary-500 mt-1">{hint}</p>}
    </div>
  );
}

function BusinessTab({ settings, update }: { settings: AdminSettings; update: (d: Partial<AdminSettings['business']>) => void }) {
  const b = settings.business;
  return (
    <div className="card p-5 space-y-4">
      <h2 className="font-semibold text-lg text-secondary-900">Business Information</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Field label="Business Name *"><input className="input" value={b.name} onChange={(e) => update({ name: e.target.value })} /></Field>
        <Field label="Email *"><input className="input" type="email" value={b.email} onChange={(e) => update({ email: e.target.value })} /></Field>
        <Field label="Phone *"><input className="input" value={b.phone} onChange={(e) => update({ phone: e.target.value })} /></Field>
        <Field label="WhatsApp Number"><input className="input" value={b.whatsapp} onChange={(e) => update({ whatsapp: e.target.value })} placeholder="+91 9876543210" /></Field>
        <Field label="GSTIN" hint="15-character GST Identification Number"><input className="input font-mono" value={b.gstin} onChange={(e) => update({ gstin: e.target.value })} maxLength={15} /></Field>
        <Field label="PAN"><input className="input font-mono" value={b.pan} onChange={(e) => update({ pan: e.target.value })} maxLength={10} /></Field>
      </div>
      <Field label="Business Address *">
        <textarea className="input min-h-[80px]" value={b.address} onChange={(e) => update({ address: e.target.value })} />
      </Field>
    </div>
  );
}

function HoursTab({ settings, update }: { settings: AdminSettings; update: (d: Partial<AdminSettings['hours']>) => void }) {
  const h = settings.hours;
  return (
    <div className="card p-5 space-y-4">
      <h2 className="font-semibold text-lg text-secondary-900 flex items-center gap-2"><Clock className="w-5 h-5 text-primary" /> Business Hours</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Field label="Opening Time"><input type="time" className="input" value={h.open} onChange={(e) => update({ open: e.target.value })} /></Field>
        <Field label="Closing Time"><input type="time" className="input" value={h.close} onChange={(e) => update({ close: e.target.value })} /></Field>
        <div className="sm:col-span-2">
          <Field label="Working Days">
            <input className="input" value={h.days} onChange={(e) => update({ days: e.target.value })} placeholder="e.g. Monday - Sunday" />
          </Field>
        </div>
      </div>
      <p className="text-sm text-secondary-500">These hours are displayed on the customer website footer and contact page.</p>
    </div>
  );
}

function DeliveryTab({ settings, update }: { settings: AdminSettings; update: (d: Partial<AdminSettings['delivery']>) => void }) {
  const d = settings.delivery;
  return (
    <div className="card p-5 space-y-4">
      <h2 className="font-semibold text-lg text-secondary-900 flex items-center gap-2"><Truck className="w-5 h-5 text-primary" /> Delivery Configuration</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Field label="Base Delivery Charge (₹)"><input type="number" min="0" className="input" value={d.baseCharge} onChange={(e) => update({ baseCharge: parseFloat(e.target.value) || 0 })} /></Field>
        <Field label="Free Delivery Above (₹)"><input type="number" min="0" className="input" value={d.freeAbove} onChange={(e) => update({ freeAbove: parseFloat(e.target.value) || 0 })} /></Field>
        <Field label="Standard Delivery (days)"><input type="number" min="1" className="input" value={d.standardDays} onChange={(e) => update({ standardDays: parseInt(e.target.value, 10) || 1 })} /></Field>
        <Field label="Express Delivery (days)"><input type="number" min="1" className="input" value={d.expressDays} onChange={(e) => update({ expressDays: parseInt(e.target.value, 10) || 1 })} /></Field>
      </div>
      <p className="text-sm text-secondary-500">For pincode-level delivery customization, use the <strong>Delivery Pincodes</strong> module.</p>
    </div>
  );
}

function QuoteTab({ settings, update }: { settings: AdminSettings; update: (d: Partial<AdminSettings['quote']>) => void }) {
  const q = settings.quote;
  return (
    <div className="card p-5 space-y-4">
      <h2 className="font-semibold text-lg text-secondary-900 flex items-center gap-2"><FileSpreadsheet className="w-5 h-5 text-primary" /> Quote Settings</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Field label="Default Validity (days)"><input type="number" min="1" className="input" value={q.expiryDays} onChange={(e) => update({ expiryDays: parseInt(e.target.value, 10) || 30 })} /></Field>
        <Field label="Default Tax Rate (%)"><input type="number" min="0" max="100" className="input" value={q.taxRate} onChange={(e) => update({ taxRate: parseFloat(e.target.value) || 0 })} /></Field>
      </div>
      <div className="space-y-2">
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={q.requireApproval} onChange={(e) => update({ requireApproval: e.target.checked })} className="w-4 h-4 text-primary border-secondary-300 rounded" />
          <span className="text-sm text-secondary-700">Require admin approval before showing price</span>
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={q.autoApprove} onChange={(e) => update({ autoApprove: e.target.checked })} className="w-4 h-4 text-primary border-secondary-300 rounded" />
          <span className="text-sm text-secondary-700">Auto-approve quotes (skip review step)</span>
        </label>
      </div>
    </div>
  );
}

function SocialTab({ settings, update }: { settings: AdminSettings; update: (d: Partial<AdminSettings['social']>) => void }) {
  const s = settings.social;
  return (
    <div className="card p-5 space-y-4">
      <h2 className="font-semibold text-lg text-secondary-900 flex items-center gap-2"><Share2 className="w-5 h-5 text-primary" /> Social Links</h2>
      <p className="text-sm text-secondary-500">These appear in the footer of your customer website. Leave empty to hide.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Field label="Facebook"><input className="input" value={s.facebook} onChange={(e) => update({ facebook: e.target.value })} placeholder="https://facebook.com/..." /></Field>
        <Field label="Instagram"><input className="input" value={s.instagram} onChange={(e) => update({ instagram: e.target.value })} placeholder="https://instagram.com/..." /></Field>
        <Field label="X (Twitter)"><input className="input" value={s.twitter} onChange={(e) => update({ twitter: e.target.value })} placeholder="https://x.com/..." /></Field>
        <Field label="LinkedIn"><input className="input" value={s.linkedin} onChange={(e) => update({ linkedin: e.target.value })} placeholder="https://linkedin.com/..." /></Field>
        <Field label="YouTube"><input className="input" value={s.youtube} onChange={(e) => update({ youtube: e.target.value })} placeholder="https://youtube.com/..." /></Field>
      </div>
    </div>
  );
}

function LogoBannerTab({ settings, update }: { settings: AdminSettings; update: (banners: AdminSettings['banners']) => void }) {
  const [logoUrl, setLogoUrl] = useState(settings.business.logoUrl);
  const addBanner = () => {
    const newBanner = { id: `bn_${Date.now()}`, url: '', title: '', active: true, sortOrder: settings.banners.length };
    update([...settings.banners, newBanner]);
  };
  const updateBanner = (id: string, data: any) => {
    update(settings.banners.map((b) => b.id === id ? { ...b, ...data } : b));
  };
  const removeBanner = (id: string) => update(settings.banners.filter((b) => b.id !== id));

  return (
    <div className="space-y-6">
      <div className="card p-5 space-y-4">
        <h2 className="font-semibold text-lg text-secondary-900 flex items-center gap-2"><ImageIcon className="w-5 h-5 text-primary" /> Logo</h2>
        <Field label="Logo URL" hint="Recommended: PNG/SVG with transparent background, 200×60px">
          <div className="flex gap-2">
            <input className="input flex-1" value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} placeholder="https://..." />
            {logoUrl && <img src={logoUrl} alt="logo preview" className="w-16 h-12 object-contain border border-secondary-200 rounded" />}
          </div>
        </Field>
        <button onClick={() => settings.business.logoUrl !== logoUrl && (() => { settings.business.logoUrl = logoUrl; })()} className="btn-secondary btn-sm">Apply Logo</button>
      </div>

      <div className="card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-lg text-secondary-900">Banner Images</h2>
          <button onClick={addBanner} className="btn-primary btn-sm"><Plus className="w-3 h-3" /> Add Banner</button>
        </div>
        {settings.banners.length === 0 ? (
          <p className="text-sm text-secondary-500 text-center py-4 border border-dashed border-secondary-200 rounded-lg">No banner images. Add one to display in homepage carousel.</p>
        ) : (
          <div className="space-y-3">
            {settings.banners.map((b) => (
              <div key={b.id} className="grid grid-cols-12 gap-2 p-3 bg-secondary-50 rounded-lg items-end">
                <div className="col-span-12 sm:col-span-5">
                  <label className="text-xs text-secondary-500">Image URL</label>
                  <input className="input" value={b.url} onChange={(e) => updateBanner(b.id, { url: e.target.value })} placeholder="https://..." />
                </div>
                <div className="col-span-12 sm:col-span-4">
                  <label className="text-xs text-secondary-500">Title</label>
                  <input className="input" value={b.title} onChange={(e) => updateBanner(b.id, { title: e.target.value })} />
                </div>
                <div className="col-span-6 sm:col-span-1">
                  <label className="text-xs text-secondary-500">Order</label>
                  <input type="number" min="0" className="input" value={b.sortOrder} onChange={(e) => updateBanner(b.id, { sortOrder: parseInt(e.target.value, 10) || 0 })} />
                </div>
                <div className="col-span-6 sm:col-span-1 text-center">
                  <label className="text-xs text-secondary-500">Active</label>
                  <input type="checkbox" checked={b.active} onChange={(e) => updateBanner(b.id, { active: e.target.checked })} className="w-4 h-4 text-primary border-secondary-300 rounded block mx-auto mt-2" />
                </div>
                <div className="col-span-12 sm:col-span-1 text-right">
                  <button onClick={() => removeBanner(b.id)} className="p-1.5 text-danger hover:bg-danger-light rounded"><Trash2 className="w-4 h-4" /></button>
                </div>
                {b.url && <div className="col-span-12"><img src={b.url} alt={b.title} className="w-full h-32 object-cover rounded" /></div>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
