// ────────────────────────────────────────────────────────────
// Premium Settings Hub — Part 3B (FINAL)
// 7 sections: Business / Ecommerce / Payment / Profile /
// Security / Backup / Logs
// ────────────────────────────────────────────────────────────

import { useState, useEffect } from 'react';
import {
  Settings as SettingsIcon, Building2, ShoppingCart, CreditCard, User as UserIcon,
  Shield, Database, Activity, Save, RotateCcw, Upload, Download, Trash2,
  Mail, Phone, MapPin, Globe, Clock, FileText, Image as ImageIcon,
  Check, X, Plus, Edit, Eye, EyeOff, Copy, RefreshCw, AlertTriangle,
  CheckCircle2, Smartphone, Monitor, Key, Lock, Bell, Languages,
  Sun, Moon, Search, ChevronRight, MoreVertical, Filter,
  Calendar, Hash, Layers, Zap, ShieldCheck, Users, FileSpreadsheet,
  TrendingUp, Box, Truck,
} from 'lucide-react';
import clsx from 'clsx';
import toast from 'react-hot-toast';
import {
  Card, CardHeader, CardBody, Button, Badge, PageHeader, EmptyState,
  Tabs, Modal, ConfirmDialog,
} from '../components/ui/StatCard';
import { useAuth } from '../contexts/AuthContext';
import { formatDate, relativeTime } from '../lib/auth';

// ─── Sections ──────────────────────────────────────────────
const SECTIONS = [
  { id: 'business',   label: 'Business',     icon: Building2,    desc: 'Name, logo, contact, GST, social' },
  { id: 'ecommerce',  label: 'Ecommerce',    icon: ShoppingCart, desc: 'Orders, inventory, tax, shipping' },
  { id: 'payment',    label: 'Payment',      icon: CreditCard,   desc: 'Methods, gateways, fees' },
  { id: 'profile',    label: 'Profile',      icon: UserIcon,     desc: 'Your account, password, prefs' },
  { id: 'security',   label: 'Security',     icon: Shield,       desc: 'Sessions, devices, login activity' },
  { id: 'backup',     label: 'Backup',       icon: Database,     desc: 'Manual backup, restore, history' },
  { id: 'logs',       label: 'System Logs',  icon: Activity,     desc: 'Activity feed, security events' },
];

// ─── Default state ────────────────────────────────────────
const defaultBusiness = {
  name: 'ASIF TRADERS',
  tagline: 'Building Materials & Construction Supplies',
  logo: '',
  favicon: '',
  address: '123 Main Market Road, Industrial Area, Mumbai, Maharashtra 400001',
  city: 'Mumbai',
  state: 'Maharashtra',
  pincode: '400001',
  country: 'India',
  gstin: '27ABCDE1234F1Z5',
  pan: 'ABCDE1234F',
  email: 'sales@asiftraders.com',
  phone: '+91 98765 43210',
  whatsapp: '+91 98765 43210',
  website: 'https://asiftraders.com',
  hours: 'Mon-Sat: 9:00 AM - 8:00 PM',
  description: 'Leading supplier of premium building materials including cement, steel, bricks, tiles, and more.',
  social: { facebook: 'https://facebook.com/asiftraders', instagram: 'https://instagram.com/asiftraders', twitter: 'https://twitter.com/asiftraders', youtube: '', linkedin: '' },
  mapsUrl: '',
};

const defaultEcommerce = {
  order: { minOrderValue: '500', maxOrderValue: '500000', autoConfirm: true, allowGuestCheckout: true, allowBackorders: false },
  inventory: { lowStockThreshold: 10, enableStockAlerts: true, trackInventory: true, allowNegativeStock: false },
  tax: { defaultGst: 18, pricesInclusiveOfTax: false, showGstOnInvoice: true, enableHsn: true },
  shipping: { freeShippingAbove: '5000', defaultCharge: '99', enableLocalDelivery: true, enablePickup: true },
  return: { enabled: true, windowDays: 7, restockingFee: 0, requiresApproval: true },
  cancellation: { enabled: true, windowHours: 24, fullRefund: true, partialRefund: false },
  invoiceFormat: 'INV-{number}',
  deliveryNoteFormat: 'DN-{number}',
};

const defaultPayment = {
  cod: { enabled: true, minOrder: 0, maxOrder: '50000' },
  bankTransfer: { enabled: true, accountName: 'ASIF TRADERS', accountNumber: '50100123456789', ifsc: 'HDFC0001234', bankName: 'HDFC Bank' },
  upi: { enabled: true, upiId: 'asiftraders@hdfcbank' },
  cards: { enabled: true, gateway: 'razorpay' },
  gateway: { provider: 'razorpay', testMode: true, publicKey: 'rzp_test_***', secretKey: '••••••••' },
};

export default function SettingsPage() {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState('business');
  const [business, setBusiness] = useState(defaultBusiness);
  const [ecommerce, setEcommerce] = useState(defaultEcommerce);
  const [payment, setPayment] = useState(defaultPayment);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    // Load from localStorage
    const stored = localStorage.getItem('asif-settings');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.business) setBusiness(parsed.business);
        if (parsed.ecommerce) setEcommerce(parsed.ecommerce);
        if (parsed.payment) setPayment(parsed.payment);
      } catch {}
    }
  }, []);

  const updateBusiness = (k: string, v: any) => { setBusiness((p) => ({ ...p, [k]: v })); setDirty(true); };
  const updateEcommerce = (k: string, v: any) => { setEcommerce((p) => ({ ...p, [k]: v })); setDirty(true); };
  const updatePayment = (k: string, v: any) => { setPayment((p) => ({ ...p, [k]: v })); setDirty(true); };

  const handleSave = () => {
    localStorage.setItem('asif-settings', JSON.stringify({ business, ecommerce, payment }));
    setDirty(false);
    toast.success('Settings saved successfully');
  };

  const handleReset = () => {
    setBusiness(defaultBusiness);
    setEcommerce(defaultEcommerce);
    setPayment(defaultPayment);
    setDirty(true);
    toast.success('Reset to defaults');
  };

  return (
    <div className="space-y-6 animate-fade-in pb-24">
      <PageHeader
        title="Settings"
        description="Manage your platform, profile, and security"
        breadcrumbs={[{ label: 'System' }, { label: 'Settings' }]}
        actions={
          <>
            <Button variant="ghost" leftIcon={RotateCcw} onClick={handleReset} disabled={!dirty}>Reset</Button>
            <Button variant="primary" leftIcon={Save} onClick={handleSave} disabled={!dirty}>Save Changes</Button>
          </>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
        {/* ─── Side nav ──────────────────────────────── */}
        <Card className="self-start lg:sticky lg:top-24">
          <div className="p-3">
            {SECTIONS.map((s) => {
              const Icon = s.icon;
              const isActive = activeSection === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => setActiveSection(s.id)}
                  className={clsx(
                    'w-full flex items-start gap-3 px-3 py-2.5 rounded-lg text-left transition-all',
                    isActive ? 'bg-accent-50 text-accent-700' : 'text-ink-700 hover:bg-ink-50',
                  )}
                >
                  <div className={clsx(
                    'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
                    isActive ? 'bg-accent-500 text-white' : 'bg-ink-100 text-ink-500',
                  )}>
                    <Icon className="w-4 h-4" strokeWidth={2.25} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold leading-tight">{s.label}</p>
                    <p className="text-2xs text-ink-500 leading-tight mt-0.5">{s.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </Card>

        {/* ─── Content ──────────────────────────────── */}
        <div className="space-y-6">
          {activeSection === 'business' && <BusinessSection business={business} update={updateBusiness} />}
          {activeSection === 'ecommerce' && <EcommerceSection ecommerce={ecommerce} update={updateEcommerce} />}
          {activeSection === 'payment' && <PaymentSection payment={payment} update={updatePayment} />}
          {activeSection === 'profile' && <ProfileSection user={user} />}
          {activeSection === 'security' && <SecuritySection />}
          {activeSection === 'backup' && <BackupSection />}
          {activeSection === 'logs' && <LogsSection />}

          {/* Sticky save bar */}
          {dirty && (
            <div className="sticky bottom-4 z-10">
              <Card className="p-3 bg-accent-50 border-accent-300 ring-2 ring-accent-200 flex items-center gap-3 animate-slide-up">
                <div className="w-9 h-9 rounded-xl bg-accent-500 text-white flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <p className="text-sm font-semibold text-ink-900 flex-1">You have unsaved changes</p>
                <Button variant="ghost" size="sm" onClick={handleReset}>Discard</Button>
                <Button variant="primary" size="sm" leftIcon={Save} onClick={handleSave}>Save Now</Button>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// SECTION 1: Business
// ════════════════════════════════════════════════════════════
function BusinessSection({ business, update }: any) {
  return (
    <>
      <Card>
        <CardHeader title="Business Identity" description="Your brand name, logo, and tagline" />
        <CardBody className="space-y-4">
          <Field label="Business Name" required>
            <input className="input" value={business.name} onChange={(e) => update('name', e.target.value)} />
          </Field>
          <Field label="Tagline">
            <input className="input" value={business.tagline} onChange={(e) => update('tagline', e.target.value)} />
          </Field>
          <Field label="Description">
            <textarea className="input min-h-[80px] py-2" value={business.description} onChange={(e) => update('description', e.target.value)} />
          </Field>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Field label="Logo URL">
                <div className="flex gap-2">
                  <input className="input flex-1" value={business.logo} onChange={(e) => update('logo', e.target.value)} placeholder="https://..." />
                  {business.logo && <img src={business.logo} alt="Logo" className="w-10 h-10 rounded-lg object-cover ring-1 ring-ink-200" />}
                </div>
              </Field>
              <Field label="Favicon URL">
                <input className="input" value={business.favicon} onChange={(e) => update('favicon', e.target.value)} placeholder="https://..." />
              </Field>
            </div>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Contact Information" description="How customers can reach you" />
        <CardBody className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Email" required>
            <input className="input" type="email" value={business.email} onChange={(e) => update('email', e.target.value)} />
          </Field>
          <Field label="Phone" required>
            <input className="input" value={business.phone} onChange={(e) => update('phone', e.target.value)} />
          </Field>
          <Field label="WhatsApp Number">
            <input className="input" value={business.whatsapp} onChange={(e) => update('whatsapp', e.target.value)} />
          </Field>
          <Field label="Website">
            <input className="input" value={business.website} onChange={(e) => update('website', e.target.value)} />
          </Field>
          <Field label="Business Hours">
            <input className="input" value={business.hours} onChange={(e) => update('hours', e.target.value)} />
          </Field>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Address" description="Registered business address" />
        <CardBody className="space-y-4">
          <Field label="Street Address">
            <input className="input" value={business.address} onChange={(e) => update('address', e.target.value)} />
          </Field>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Field label="City"><input className="input" value={business.city} onChange={(e) => update('city', e.target.value)} /></Field>
            <Field label="State"><input className="input" value={business.state} onChange={(e) => update('state', e.target.value)} /></Field>
            <Field label="Pincode"><input className="input" value={business.pincode} onChange={(e) => update('pincode', e.target.value)} /></Field>
            <Field label="Country"><input className="input" value={business.country} onChange={(e) => update('country', e.target.value)} /></Field>
          </div>
          <Field label="Google Maps URL">
            <input className="input" value={business.mapsUrl} onChange={(e) => update('mapsUrl', e.target.value)} placeholder="https://maps.google.com/..." />
          </Field>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Tax & Legal" description="GST and PAN registration details" />
        <CardBody className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="GST Number" required>
            <input className="input font-mono uppercase" value={business.gstin} onChange={(e) => update('gstin', e.target.value.toUpperCase())} maxLength={15} />
          </Field>
          <Field label="PAN Number" required>
            <input className="input font-mono uppercase" value={business.pan} onChange={(e) => update('pan', e.target.value.toUpperCase())} maxLength={10} />
          </Field>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Social Media" description="Connect your social profiles" />
        <CardBody className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <SocialField label="Facebook" value={business.social.facebook} onChange={(v) => update('social', { ...business.social, facebook: v })} />
          <SocialField label="Instagram" value={business.social.instagram} onChange={(v) => update('social', { ...business.social, instagram: v })} />
          <SocialField label="Twitter / X" value={business.social.twitter} onChange={(v) => update('social', { ...business.social, twitter: v })} />
          <SocialField label="YouTube" value={business.social.youtube} onChange={(v) => update('social', { ...business.social, youtube: v })} />
          <SocialField label="LinkedIn" value={business.social.linkedin} onChange={(v) => update('social', { ...business.social, linkedin: v })} />
        </CardBody>
      </Card>
    </>
  );
}

function SocialField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <Field label={label}>
      <input className="input" value={value} onChange={(e) => onChange(e.target.value)} placeholder="https://..." />
    </Field>
  );
}

// ════════════════════════════════════════════════════════════
// SECTION 2: Ecommerce
// ════════════════════════════════════════════════════════════
function EcommerceSection({ ecommerce, update }: any) {
  return (
    <>
      <Card>
        <CardHeader title="Order Settings" description="Order limits, auto-confirm, checkout options" />
        <CardBody className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Minimum Order Value (₹)">
              <input className="input" type="number" value={ecommerce.order.minOrderValue} onChange={(e) => update('order', { ...ecommerce.order, minOrderValue: e.target.value })} />
            </Field>
            <Field label="Maximum Order Value (₹)">
              <input className="input" type="number" value={ecommerce.order.maxOrderValue} onChange={(e) => update('order', { ...ecommerce.order, maxOrderValue: e.target.value })} />
            </Field>
          </div>
          <Toggle label="Auto-confirm orders" desc="Mark orders as CONFIRMED on payment success" value={ecommerce.order.autoConfirm} onChange={(v) => update('order', { ...ecommerce.order, autoConfirm: v })} />
          <Toggle label="Allow guest checkout" desc="Customers can checkout without creating an account" value={ecommerce.order.allowGuestCheckout} onChange={(v) => update('order', { ...ecommerce.order, allowGuestCheckout: v })} />
          <Toggle label="Allow backorders" desc="Customers can order out-of-stock products" value={ecommerce.order.allowBackorders} onChange={(v) => update('order', { ...ecommerce.order, allowBackorders: v })} />
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Inventory Settings" description="Stock tracking and alerts" />
        <CardBody className="space-y-4">
          <Field label="Low Stock Threshold">
            <input className="input" type="number" value={ecommerce.inventory.lowStockThreshold} onChange={(e) => update('inventory', { ...ecommerce.inventory, lowStockThreshold: parseInt(e.target.value) || 0 })} />
          </Field>
          <Toggle label="Track inventory" value={ecommerce.inventory.trackInventory} onChange={(v) => update('inventory', { ...ecommerce.inventory, trackInventory: v })} />
          <Toggle label="Enable low stock alerts" value={ecommerce.inventory.enableStockAlerts} onChange={(v) => update('inventory', { ...ecommerce.inventory, enableStockAlerts: v })} />
          <Toggle label="Allow negative stock" desc="Sales can exceed available stock" value={ecommerce.inventory.allowNegativeStock} onChange={(v) => update('inventory', { ...ecommerce.inventory, allowNegativeStock: v })} />
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Tax Settings" description="GST configuration" />
        <CardBody className="space-y-4">
          <Field label="Default GST %">
            <select className="input" value={ecommerce.tax.defaultGst} onChange={(e) => update('tax', { ...ecommerce.tax, defaultGst: parseInt(e.target.value) })}>
              <option value={0}>0%</option>
              <option value={5}>5%</option>
              <option value={12}>12%</option>
              <option value={18}>18%</option>
              <option value={28}>28%</option>
            </select>
          </Field>
          <Toggle label="Prices inclusive of tax" value={ecommerce.tax.pricesInclusiveOfTax} onChange={(v) => update('tax', { ...ecommerce.tax, pricesInclusiveOfTax: v })} />
          <Toggle label="Show GST on invoice" value={ecommerce.tax.showGstOnInvoice} onChange={(v) => update('tax', { ...ecommerce.tax, showGstOnInvoice: v })} />
          <Toggle label="Enable HSN codes" value={ecommerce.tax.enableHsn} onChange={(v) => update('tax', { ...ecommerce.tax, enableHsn: v })} />
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Shipping" description="Delivery charges and options" />
        <CardBody className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Free Shipping Above (₹)">
              <input className="input" type="number" value={ecommerce.shipping.freeShippingAbove} onChange={(e) => update('shipping', { ...ecommerce.shipping, freeShippingAbove: e.target.value })} />
            </Field>
            <Field label="Default Shipping Charge (₹)">
              <input className="input" type="number" value={ecommerce.shipping.defaultCharge} onChange={(e) => update('shipping', { ...ecommerce.shipping, defaultCharge: e.target.value })} />
            </Field>
          </div>
          <Toggle label="Local delivery" value={ecommerce.shipping.enableLocalDelivery} onChange={(v) => update('shipping', { ...ecommerce.shipping, enableLocalDelivery: v })} />
          <Toggle label="Store pickup" value={ecommerce.shipping.enablePickup} onChange={(v) => update('shipping', { ...ecommerce.shipping, enablePickup: v })} />
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Returns & Cancellations" />
        <CardBody className="space-y-4">
          <Toggle label="Enable returns" value={ecommerce.return.enabled} onChange={(v) => update('return', { ...ecommerce.return, enabled: v })} />
          <Field label="Return window (days)">
            <input className="input" type="number" value={ecommerce.return.windowDays} onChange={(e) => update('return', { ...ecommerce.return, windowDays: parseInt(e.target.value) })} />
          </Field>
          <Toggle label="Cancellation allowed" value={ecommerce.cancellation.enabled} onChange={(v) => update('cancellation', { ...ecommerce.cancellation, enabled: v })} />
          <Field label="Cancellation window (hours)">
            <input className="input" type="number" value={ecommerce.cancellation.windowHours} onChange={(e) => update('cancellation', { ...ecommerce.cancellation, windowHours: parseInt(e.target.value) })} />
          </Field>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Number Formats" description="Invoice and delivery note prefixes" />
        <CardBody className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Invoice Number Format" help="Available tokens: {number}, {date}, {month}, {year}">
            <input className="input font-mono" value={ecommerce.invoiceFormat} onChange={(e) => update('invoiceFormat', e.target.value)} />
          </Field>
          <Field label="Delivery Note Format">
            <input className="input font-mono" value={ecommerce.deliveryNoteFormat} onChange={(e) => update('deliveryNoteFormat', e.target.value)} />
          </Field>
        </CardBody>
      </Card>
    </>
  );
}

// ════════════════════════════════════════════════════════════
// SECTION 3: Payment
// ════════════════════════════════════════════════════════════
function PaymentSection({ payment, update }: any) {
  return (
    <>
      <Card>
        <CardHeader title="Payment Methods" description="Enable / disable payment options for customers" />
        <CardBody className="space-y-3">
          {/* COD */}
          <PaymentMethodRow
            icon={<span className="text-lg">💵</span>}
            title="Cash on Delivery (COD)"
            desc="Customer pays when order is delivered"
            enabled={payment.cod.enabled}
            onToggle={(v) => update('cod', { ...payment.cod, enabled: v })}
            details={
              <div className="grid grid-cols-2 gap-3">
                <Field label="Min Order (₹)"><input className="input" type="number" value={payment.cod.minOrder} onChange={(e) => update('cod', { ...payment.cod, minOrder: e.target.value })} /></Field>
                <Field label="Max Order (₹)"><input className="input" type="number" value={payment.cod.maxOrder} onChange={(e) => update('cod', { ...payment.cod, maxOrder: e.target.value })} /></Field>
              </div>
            }
          />

          {/* Bank Transfer */}
          <PaymentMethodRow
            icon={<span className="text-lg">🏦</span>}
            title="Bank Transfer (NEFT/RTGS/IMPS)"
            desc="Customer transfers to your bank account"
            enabled={payment.bankTransfer.enabled}
            onToggle={(v) => update('bankTransfer', { ...payment.bankTransfer, enabled: v })}
            details={
              <div className="grid grid-cols-2 gap-3">
                <Field label="Account Name"><input className="input" value={payment.bankTransfer.accountName} onChange={(e) => update('bankTransfer', { ...payment.bankTransfer, accountName: e.target.value })} /></Field>
                <Field label="Bank Name"><input className="input" value={payment.bankTransfer.bankName} onChange={(e) => update('bankTransfer', { ...payment.bankTransfer, bankName: e.target.value })} /></Field>
                <Field label="Account Number"><input className="input font-mono" value={payment.bankTransfer.accountNumber} onChange={(e) => update('bankTransfer', { ...payment.bankTransfer, accountNumber: e.target.value })} /></Field>
                <Field label="IFSC Code"><input className="input font-mono uppercase" value={payment.bankTransfer.ifsc} onChange={(e) => update('bankTransfer', { ...payment.bankTransfer, ifsc: e.target.value.toUpperCase() })} /></Field>
              </div>
            }
          />

          {/* UPI */}
          <PaymentMethodRow
            icon={<span className="text-lg">📱</span>}
            title="UPI"
            desc="BHIM, Google Pay, PhonePe, Paytm"
            enabled={payment.upi.enabled}
            onToggle={(v) => update('upi', { ...payment.upi, enabled: v })}
            details={
              <Field label="UPI ID"><input className="input font-mono" value={payment.upi.upiId} onChange={(e) => update('upi', { ...payment.upi, upiId: e.target.value })} /></Field>
            }
          />

          {/* Cards */}
          <PaymentMethodRow
            icon={<span className="text-lg">💳</span>}
            title="Credit / Debit Cards"
            desc="Visa, Mastercard, Rupay via payment gateway"
            enabled={payment.cards.enabled}
            onToggle={(v) => update('cards', { ...payment.cards, enabled: v })}
            details={
              <div className="space-y-3">
                <Field label="Payment Gateway">
                  <select className="input" value={payment.cards.gateway} onChange={(e) => update('cards', { ...payment.cards, gateway: e.target.value })}>
                    <option value="razorpay">Razorpay</option>
                    <option value="stripe">Stripe</option>
                    <option value="payu">PayU</option>
                    <option value="ccavenue">CCAvenue</option>
                  </select>
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Test Mode">
                    <Toggle label="" value={payment.gateway.testMode} onChange={(v) => update('gateway', { ...payment.gateway, testMode: v })} />
                  </Field>
                </div>
              </div>
            }
          />
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Payment Gateway API" description="Configure your payment provider" />
        <CardBody className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Provider">
              <select className="input" value={payment.gateway.provider} onChange={(e) => update('gateway', { ...payment.gateway, provider: e.target.value })}>
                <option value="razorpay">Razorpay</option>
                <option value="stripe">Stripe</option>
                <option value="payu">PayU</option>
                <option value="ccavenue">CCAvenue</option>
              </select>
            </Field>
            <Field label="Mode">
              <select className="input" value={payment.gateway.testMode ? 'test' : 'live'} onChange={(e) => update('gateway', { ...payment.gateway, testMode: e.target.value === 'test' })}>
                <option value="test">Test Mode</option>
                <option value="live">Live Mode</option>
              </select>
            </Field>
          </div>
          <Field label="Public Key">
            <input className="input font-mono" value={payment.gateway.publicKey} onChange={(e) => update('gateway', { ...payment.gateway, publicKey: e.target.value })} />
          </Field>
          <Field label="Secret Key">
            <input className="input font-mono" type="password" value={payment.gateway.secretKey} onChange={(e) => update('gateway', { ...payment.gateway, secretKey: e.target.value })} />
          </Field>
        </CardBody>
      </Card>
    </>
  );
}

function PaymentMethodRow({ icon, title, desc, enabled, onToggle, details }: { icon: any; title: string; desc: string; enabled: boolean; onToggle: (v: boolean) => void; details?: any }) {
  return (
    <div className="rounded-xl border border-ink-200 overflow-hidden">
      <div className="flex items-center gap-3 p-3.5">
        <div className="w-10 h-10 rounded-xl bg-ink-50 flex items-center justify-center flex-shrink-0">{icon}</div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm text-ink-900">{title}</p>
          <p className="text-2xs text-ink-500">{desc}</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input type="checkbox" checked={enabled} onChange={(e) => onToggle(e.target.checked)} className="sr-only peer" />
          <div className="w-10 h-6 bg-ink-200 rounded-pill peer-checked:bg-accent-500 transition-colors relative">
            <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-pill transition-transform peer-checked:translate-x-4" />
          </div>
        </label>
      </div>
      {enabled && details && <div className="px-3.5 pb-3.5 pt-0 border-t border-ink-100 bg-ink-50/40">{details}</div>}
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// SECTION 4: Profile
// ════════════════════════════════════════════════════════════
function ProfileSection({ user }: any) {
  const [name, setName] = useState(user?.firstName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState('');
  const [theme, setTheme] = useState<'light' | 'dark' | 'auto'>('light');
  const [language, setLanguage] = useState('en');
  const [showPwd, setShowPwd] = useState(false);

  return (
    <>
      <Card>
        <CardHeader title="Profile Picture" />
        <CardBody className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-pill bg-gradient-to-br from-accent-400 to-accent-600 text-white text-2xl font-bold flex items-center justify-center">
            {name?.[0] || 'A'}{user?.lastName?.[0] || ''}
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-ink-900">{name} {user?.lastName}</p>
            <p className="text-2xs text-ink-500">JPG, PNG or GIF · Max 2MB</p>
            <div className="flex items-center gap-2 mt-2">
              <Button variant="secondary" size="sm" leftIcon={Upload}>Upload</Button>
              <Button variant="ghost" size="sm" leftIcon={Trash2}>Remove</Button>
            </div>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Personal Information" />
        <CardBody className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="First Name"><input className="input" value={name} onChange={(e) => setName(e.target.value)} /></Field>
          <Field label="Last Name"><input className="input" value={user?.lastName || ''} readOnly /></Field>
          <Field label="Email"><input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></Field>
          <Field label="Phone"><input className="input" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91" /></Field>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Change Password" />
        <CardBody className="space-y-3">
          <Field label="Current Password">
            <div className="relative">
              <input className="input pr-10" type={showPwd ? 'text' : 'password'} />
              <button onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-700">
                {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </Field>
          <Field label="New Password" help="Min 8 chars, 1 uppercase, 1 number, 1 symbol">
            <input className="input" type="password" />
          </Field>
          <Field label="Confirm New Password"><input className="input" type="password" /></Field>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Preferences" description="Language, theme, and notifications" />
        <CardBody className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Language">
              <select className="input" value={language} onChange={(e) => setLanguage(e.target.value)}>
                <option value="en">English</option>
                <option value="hi">हिन्दी (Hindi)</option>
                <option value="mr">मराठी (Marathi)</option>
                <option value="gu">ગુજરાતી (Gujarati)</option>
                <option value="ta">தமிழ் (Tamil)</option>
              </select>
            </Field>
            <Field label="Theme">
              <div className="grid grid-cols-3 gap-2">
                {(['light', 'dark', 'auto'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTheme(t)}
                    className={clsx(
                      'flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all',
                      theme === t ? 'border-accent-500 bg-accent-50/50' : 'border-ink-200 hover:border-ink-300',
                    )}
                  >
                    {t === 'light' ? <Sun className="w-4 h-4" /> : t === 'dark' ? <Moon className="w-4 h-4" /> : <Monitor className="w-4 h-4" />}
                    <span className="text-2xs font-semibold capitalize">{t}</span>
                  </button>
                ))}
              </div>
            </Field>
          </div>

          <div className="border-t border-ink-200 pt-4 space-y-3">
            <p className="text-2xs font-bold text-ink-500 uppercase tracking-wider">Notification Preferences</p>
            <Toggle label="Email notifications" desc="Receive updates via email" value={true} onChange={() => {}} />
            <Toggle label="Push notifications" desc="Browser push notifications" value={true} onChange={() => {}} />
            <Toggle label="Order updates" desc="Get notified on order status changes" value={true} onChange={() => {}} />
            <Toggle label="Marketing emails" desc="Promotional offers and campaigns" value={false} onChange={() => {}} />
          </div>
        </CardBody>
      </Card>
    </>
  );
}

// ════════════════════════════════════════════════════════════
// SECTION 5: Security
// ════════════════════════════════════════════════════════════
function SecuritySection() {
  const [sessionTimeout, setSessionTimeout] = useState('60');
  const [twoFA, setTwoFA] = useState(false);
  const [pwdComplexity, setPwdComplexity] = useState(true);

  return (
    <>
      <Card>
        <CardHeader title="Password Policy" description="Enforce strong passwords for all users" />
        <CardBody className="space-y-3">
          <Toggle label="Strong password requirement" desc="Min 8 chars, 1 uppercase, 1 number, 1 special char" value={pwdComplexity} onChange={setPwdComplexity} />
          <Toggle label="Password expiration" desc="Force password change every 90 days" value={true} onChange={() => {}} />
          <Toggle label="Prevent password reuse" desc="Last 5 passwords cannot be reused" value={true} onChange={() => {}} />
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Session Security" />
        <CardBody className="space-y-4">
          <Field label="Session Timeout (minutes)">
            <select className="input" value={sessionTimeout} onChange={(e) => setSessionTimeout(e.target.value)}>
              <option value="15">15 min</option>
              <option value="30">30 min</option>
              <option value="60">1 hour</option>
              <option value="120">2 hours</option>
              <option value="240">4 hours</option>
            </select>
          </Field>
          <Toggle label="Automatic logout" desc="Logout on browser close" value={true} onChange={() => {}} />
          <Toggle label="Two-Factor Authentication (2FA)" desc="Require 2FA for all admin logins" value={twoFA} onChange={setTwoFA} />
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Active Devices" description="Devices currently logged in to your account" actions={<Button variant="ghost" size="sm">Sign out all</Button>} />
        <CardBody className="space-y-2">
          {[
            { device: 'MacBook Pro · Chrome', location: 'Mumbai, India', ip: '152.233.30.101', current: true, lastActive: '2 min ago' },
            { device: 'iPhone 15 · Safari', location: 'Mumbai, India', ip: '152.233.30.102', current: false, lastActive: '3 hours ago' },
            { device: 'Windows · Firefox', location: 'Pune, India', ip: '152.233.30.103', current: false, lastActive: '2 days ago' },
          ].map((d, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-xl border border-ink-200/80">
              <div className="w-10 h-10 rounded-xl bg-ink-50 flex items-center justify-center flex-shrink-0">
                {d.device.includes('iPhone') ? <Smartphone className="w-4 h-4 text-ink-500" /> : <Monitor className="w-4 h-4 text-ink-500" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-ink-900">{d.device}</p>
                  {d.current && <Badge variant="success" dot>Current</Badge>}
                </div>
                <p className="text-2xs text-ink-500">{d.location} · {d.ip} · {d.lastActive}</p>
              </div>
              {!d.current && <Button variant="ghost" size="sm" leftIcon={X}>Sign out</Button>}
            </div>
          ))}
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Recent Login Activity" description="Last 5 login attempts on your account" />
        <CardBody className="space-y-1.5">
          {[
            { time: '2 min ago', device: 'MacBook Pro · Chrome', location: 'Mumbai, IN', ip: '152.233.30.101', status: 'success' },
            { time: '3 hours ago', device: 'iPhone · Safari', location: 'Mumbai, IN', ip: '152.233.30.102', status: 'success' },
            { time: 'Yesterday', device: 'Windows · Edge', location: 'Delhi, IN', ip: '203.45.67.89', status: 'success' },
            { time: '3 days ago', device: 'Unknown', location: 'Lagos, NG', ip: '197.45.32.11', status: 'failed' },
            { time: '1 week ago', device: 'MacBook · Chrome', location: 'Mumbai, IN', ip: '152.233.30.101', status: 'success' },
          ].map((l, i) => (
            <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-ink-50">
              <div className={clsx(
                'w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0',
                l.status === 'success' ? 'bg-success-subtle text-success-600' : 'bg-danger-subtle text-danger-600',
              )}>
                {l.status === 'success' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-ink-900">{l.device}</p>
                <p className="text-2xs text-ink-500">{l.location} · {l.ip}</p>
              </div>
              <span className="text-2xs text-ink-500">{l.time}</span>
            </div>
          ))}
        </CardBody>
      </Card>
    </>
  );
}

// ════════════════════════════════════════════════════════════
// SECTION 6: Backup & Restore
// ════════════════════════════════════════════════════════════
function BackupSection() {
  const [backing, setBacking] = useState(false);
  const [restoring, setRestoring] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const handleBackup = () => {
    setBacking(true);
    setProgress(0);
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          setBacking(false);
          toast.success('Backup completed · 24.6 MB');
          return 0;
        }
        return p + 5;
      });
    }, 100);
  };

  const backups = [
    { id: 'b1', name: 'auto-backup-2026-07-13-0300', size: '24.6 MB', type: 'auto', date: '2026-07-13T03:00:00Z', status: 'completed' },
    { id: 'b2', name: 'manual-backup-2026-07-12', size: '24.4 MB', type: 'manual', date: '2026-07-12T18:45:00Z', status: 'completed' },
    { id: 'b3', name: 'auto-backup-2026-07-12-0300', size: '24.3 MB', type: 'auto', date: '2026-07-12T03:00:00Z', status: 'completed' },
    { id: 'b4', name: 'auto-backup-2026-07-11-0300', size: '24.1 MB', type: 'auto', date: '2026-07-11T03:00:00Z', status: 'completed' },
  ];

  return (
    <>
      <Card>
        <CardHeader title="Manual Backup" description="Create a snapshot of your entire database" />
        <CardBody className="space-y-4">
          {backing && (
            <div className="rounded-xl bg-info-subtle/30 border border-info-200 p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold text-ink-900">Backing up…</p>
                <p className="text-sm font-mono font-bold text-info-700">{progress}%</p>
              </div>
              <div className="h-2 bg-white rounded-pill overflow-hidden">
                <div className="h-full bg-info-500 transition-all duration-200" style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}
          <div className="flex flex-wrap gap-2">
            <Button variant="primary" leftIcon={Download} onClick={handleBackup} loading={backing}>
              Create Backup Now
            </Button>
            <Button variant="secondary" leftIcon={Calendar}>Schedule Auto-Backup</Button>
            <Button variant="secondary" leftIcon={Upload}>Import Backup</Button>
          </div>
          <p className="text-2xs text-ink-500 flex items-center gap-1.5">
            <ShieldCheck className="w-3 h-3" />
            Backups include products, customers, orders, settings. Encrypted at rest.
          </p>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Backup History" description={`${backups.length} backups available`} />
        <CardBody className="space-y-2">
          {backups.map((b) => (
            <div key={b.id} className="flex items-center gap-3 p-3 rounded-xl border border-ink-200/80">
              <div className="w-10 h-10 rounded-xl bg-accent-50 text-accent-600 flex items-center justify-center flex-shrink-0">
                <Database className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-ink-900 font-mono truncate">{b.name}</p>
                <p className="text-2xs text-ink-500">{b.size} · {formatDate(b.date)} · {b.type}</p>
              </div>
              {restoring === b.id ? (
                <span className="text-xs text-info-600 font-semibold">Restoring…</span>
              ) : (
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm" leftIcon={Download}>Download</Button>
                  <Button variant="secondary" size="sm" leftIcon={RotateCcw} onClick={() => {
                    setRestoring(b.id);
                    setTimeout(() => { setRestoring(null); toast.success('Backup restored'); }, 2000);
                  }}>Restore</Button>
                  <Button variant="ghost" size="sm" leftIcon={Trash2} className="text-danger-600">Delete</Button>
                </div>
              )}
            </div>
          ))}
        </CardBody>
      </Card>
    </>
  );
}

// ════════════════════════════════════════════════════════════
// SECTION 7: System Logs
// ════════════════════════════════════════════════════════════
function LogsSection() {
  const [category, setCategory] = useState('all');
  const logs = [
    { id: 'l1', time: '2 min ago', user: 'admin@asiftraders.com', action: 'Logged in', category: 'auth',     ip: '152.233.30.101', status: 'success' },
    { id: 'l2', time: '15 min ago', user: 'admin@asiftraders.com', action: 'Updated order #ORD-10042 status to SHIPPED', category: 'order', status: 'success' },
    { id: 'l3', time: '1 hour ago', user: 'admin@asiftraders.com', action: 'Created new product: Portland Cement 50kg', category: 'product', status: 'success' },
    { id: 'l4', time: '2 hours ago', user: 'admin@asiftraders.com', action: 'Failed login attempt', category: 'auth', ip: '197.45.32.11', status: 'failed' },
    { id: 'l5', time: '3 hours ago', user: 'admin@asiftraders.com', action: 'Updated customer status: Hassan Raza → ACTIVE', category: 'customer', status: 'success' },
    { id: 'l6', time: '5 hours ago', user: 'admin@asiftraders.com', action: 'Changed user role: staff@asiftraders.com → Manager', category: 'security', status: 'success' },
    { id: 'l7', time: '8 hours ago', user: 'system', action: 'Auto backup completed (24.6 MB)', category: 'system', status: 'success' },
    { id: 'l8', time: 'Yesterday', user: 'admin@asiftraders.com', action: 'Updated settings: Free shipping threshold', category: 'settings', status: 'success' },
    { id: 'l9', time: 'Yesterday', user: 'admin@asiftraders.com', action: 'Logged out', category: 'auth', ip: '152.233.30.101', status: 'success' },
    { id: 'l10', time: '2 days ago', user: 'admin@asiftraders.com', action: 'Created coupon: CEMENT15', category: 'marketing', status: 'success' },
  ];

  const filtered = logs.filter((l) => category === 'all' || l.category === category);

  return (
    <Card>
      <CardHeader title="Activity Log" description="Detailed system event history" actions={
        <div className="flex items-center gap-2">
          <select className="input h-8 text-xs w-auto" value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="all">All Categories</option>
            <option value="auth">Authentication</option>
            <option value="order">Orders</option>
            <option value="product">Products</option>
            <option value="customer">Customers</option>
            <option value="security">Security</option>
            <option value="system">System</option>
            <option value="settings">Settings</option>
            <option value="marketing">Marketing</option>
          </select>
          <Button variant="secondary" size="sm" leftIcon={Download}>Export</Button>
        </div>
      } />
      <div className="max-h-[600px] overflow-y-auto scroll-thin">
        <table className="w-full text-sm">
          <thead className="bg-ink-50/80 border-b border-ink-200 sticky top-0">
            <tr>
              <th className="px-4 py-2.5 text-left text-2xs font-bold text-ink-500 uppercase">Time</th>
              <th className="px-4 py-2.5 text-left text-2xs font-bold text-ink-500 uppercase">User</th>
              <th className="px-4 py-2.5 text-left text-2xs font-bold text-ink-500 uppercase">Action</th>
              <th className="px-4 py-2.5 text-left text-2xs font-bold text-ink-500 uppercase">Category</th>
              <th className="px-4 py-2.5 text-left text-2xs font-bold text-ink-500 uppercase">IP</th>
              <th className="px-4 py-2.5 text-left text-2xs font-bold text-ink-500 uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-100">
            {filtered.map((l) => (
              <tr key={l.id} className="hover:bg-ink-50/60">
                <td className="px-4 py-2.5 text-2xs text-ink-500 whitespace-nowrap">{l.time}</td>
                <td className="px-4 py-2.5 text-xs text-ink-900 font-mono truncate max-w-[180px]">{l.user}</td>
                <td className="px-4 py-2.5 text-sm text-ink-900">{l.action}</td>
                <td className="px-4 py-2.5"><Badge variant="ink">{l.category}</Badge></td>
                <td className="px-4 py-2.5 text-2xs font-mono text-ink-500">{l.ip || '—'}</td>
                <td className="px-4 py-2.5">
                  <Badge variant={l.status === 'success' ? 'success' : 'danger'} dot>{l.status}</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

// ════════════════════════════════════════════════════════════
// Shared components
// ════════════════════════════════════════════════════════════
function Field({ label, required, help, children }: any) {
  return (
    <div>
      <label className="label">
        {label}
        {required && <span className="text-danger-500 ml-0.5">*</span>}
      </label>
      {children}
      {help && <p className="help-text">{help}</p>}
    </div>
  );
}

function Toggle({ label, desc, value, onChange }: { label: string; desc?: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer">
      <div className="relative inline-flex items-center flex-shrink-0">
        <input type="checkbox" checked={value} onChange={(e) => onChange(e.target.checked)} className="sr-only peer" />
        <div className="w-10 h-6 bg-ink-200 rounded-pill peer-checked:bg-accent-500 transition-colors relative">
          <div className={clsx('absolute top-0.5 w-5 h-5 bg-white rounded-pill transition-transform shadow-sm', value ? 'translate-x-[18px]' : 'translate-x-0.5')} />
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-ink-900">{label}</p>
        {desc && <p className="text-2xs text-ink-500">{desc}</p>}
      </div>
    </label>
  );
}

// Avoid unused
void Plus; void Search; void Edit; void MoreVertical; void Filter; void Lock; void Key; void Copy; void RefreshCw; void EyeOff; void Layers; void Hash; void Zap;
void Sun; void Moon; void Languages; void Bell;
void FileText; void FileSpreadsheet; void Users;
