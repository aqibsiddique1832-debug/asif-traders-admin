// ────────────────────────────────────────────────────────────
// Invoice Template — Part 2B-1B
// Print-ready A4 invoice with company header, GST breakdown,
// payment status, terms & conditions
// ────────────────────────────────────────────────────────────

import { forwardRef } from 'react';
import { ShieldCheck, Phone, Mail, MapPin, Globe } from 'lucide-react';
import { formatCurrency, formatDate } from '../../lib/auth';
import type { Order } from '../../types';
import clsx from 'clsx';

const COMPANY = {
  name: 'ASIF TRADERS',
  tagline: 'Building Materials & Construction Supplies',
  address: '123 Main Market Road, Industrial Area, Mumbai, Maharashtra 400001',
  phone: '+91 98765 43210',
  email: 'sales@asiftraders.com',
  website: 'www.asiftraders.com',
  gstin: '27ABCDE1234F1Z5',
  pan: 'ABCDE1234F',
  bank: {
    name: 'HDFC Bank',
    account: '50100123456789',
    ifsc: 'HDFC0001234',
    branch: 'Mumbai Main',
  },
};

const TERMS = [
  'Goods once sold will not be taken back.',
  'Interest @18% p.a. will be charged on overdue bills.',
  'All disputes subject to Mumbai jurisdiction only.',
  'E. & O.E.',
];

export const InvoiceTemplate = forwardRef<HTMLDivElement, { order: Order }>(
  function InvoiceTemplate({ order }, ref) {
    const customerName = `${order.user?.firstName || ''} ${order.user?.lastName || ''}`.trim() || order.user?.email || 'Customer';
    const subtotal = parseFloat(order.subtotal) || 0;
    const tax = parseFloat(order.taxAmount) || 0;
    const shipping = parseFloat(order.shippingAmount) || 0;
    const discount = parseFloat(order.discountAmount) || 0;
    const total = parseFloat(order.total) || 0;
    const isPaid = order.paymentStatus === 'PAID';

    // Estimate GST split (assume intra-state 50/50 by default)
    const cgst = tax / 2;
    const sgst = tax / 2;

    return (
      <div ref={ref} className="bg-white text-ink-900 p-8 max-w-[210mm] mx-auto print:p-0 print:max-w-none">
        {/* Watermark for unpaid */}
        {!isPaid && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.04] print:opacity-[0.06]">
            <span className="text-[200px] font-black tracking-widest text-danger-500 rotate-[-30deg]">
              {order.paymentStatus}
            </span>
          </div>
        )}

        {/* ─── Header ──────────────────────────────── */}
        <div className="flex items-start justify-between gap-6 pb-6 border-b-2 border-ink-900">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-accent-400 to-accent-600 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-white" strokeWidth={2.5} />
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tight text-ink-900">{COMPANY.name}</h1>
                <p className="text-2xs text-ink-500 uppercase tracking-wider">{COMPANY.tagline}</p>
              </div>
            </div>
            <div className="mt-3 space-y-0.5 text-xs text-ink-600">
              <p className="flex items-start gap-1.5">
                <MapPin className="w-3 h-3 mt-0.5 flex-shrink-0" />
                <span>{COMPANY.address}</span>
              </p>
              <p className="flex items-center gap-1.5"><Phone className="w-3 h-3" /> {COMPANY.phone}</p>
              <p className="flex items-center gap-1.5"><Mail className="w-3 h-3" /> {COMPANY.email}</p>
              <p className="flex items-center gap-1.5"><Globe className="w-3 h-3" /> {COMPANY.website}</p>
            </div>
          </div>
          <div className="text-right">
            <h2 className="text-4xl font-black text-ink-900 tracking-tight">TAX INVOICE</h2>
            <p className="text-2xs text-ink-500 uppercase tracking-wider mt-1">Original · For Recipient</p>
            <div className="mt-3 inline-block text-left bg-ink-50 border border-ink-200 rounded-lg p-2.5 text-xs space-y-0.5">
              <div className="flex justify-between gap-4">
                <span className="text-ink-500">Invoice #</span>
                <span className="font-mono font-semibold text-ink-900">INV-{order.orderNumber}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-ink-500">Order #</span>
                <span className="font-mono font-semibold text-ink-900">{order.orderNumber}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-ink-500">Date</span>
                <span className="font-semibold text-ink-900">{formatDate(order.createdAt)}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-ink-500">Status</span>
                <span className={clsx('font-bold uppercase', isPaid ? 'text-success-700' : 'text-warning-700')}>
                  {isPaid ? '✓ PAID' : order.paymentStatus}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Bill To / Ship To ──────────────────── */}
        <div className="grid grid-cols-2 gap-4 py-5 border-b border-ink-200">
          <div>
            <p className="text-2xs font-bold text-ink-500 uppercase tracking-wider mb-1.5">Bill To</p>
            <p className="font-bold text-ink-900">{customerName}</p>
            {order.user?.email && <p className="text-xs text-ink-600">{order.user.email}</p>}
            {order.user?.phone && <p className="text-xs text-ink-600">{order.user.phone}</p>}
            {order.address && (
              <div className="text-xs text-ink-600 mt-1.5 space-y-0.5">
                {order.address.line1 && <p>{order.address.line1}</p>}
                {order.address.line2 && <p>{order.address.line2}</p>}
                {order.address.city && (
                  <p>
                    {[order.address.city, order.address.state, order.address.pincode].filter(Boolean).join(', ')}
                  </p>
                )}
              </div>
            )}
          </div>
          <div>
            <p className="text-2xs font-bold text-ink-500 uppercase tracking-wider mb-1.5">Ship To</p>
            {order.address ? (
              <>
                <p className="font-bold text-ink-900">{order.address.fullName || customerName}</p>
                {order.address.line1 && <p className="text-xs text-ink-600">{order.address.line1}</p>}
                {order.address.line2 && <p className="text-xs text-ink-600">{order.address.line2}</p>}
                <p className="text-xs text-ink-600">
                  {[order.address.city, order.address.state, order.address.pincode].filter(Boolean).join(', ')}
                </p>
                {order.address.phone && <p className="text-xs text-ink-600">{order.address.phone}</p>}
              </>
            ) : (
              <p className="text-xs text-ink-500">Same as bill to</p>
            )}
          </div>
        </div>

        {/* ─── Items Table ────────────────────────── */}
        <table className="w-full mt-5 text-sm">
          <thead>
            <tr className="bg-ink-900 text-white">
              <th className="text-left py-2.5 px-3 text-2xs font-bold uppercase tracking-wider rounded-tl-lg">#</th>
              <th className="text-left py-2.5 px-3 text-2xs font-bold uppercase tracking-wider">Item Description</th>
              <th className="text-center py-2.5 px-3 text-2xs font-bold uppercase tracking-wider">HSN</th>
              <th className="text-right py-2.5 px-3 text-2xs font-bold uppercase tracking-wider">Qty</th>
              <th className="text-right py-2.5 px-3 text-2xs font-bold uppercase tracking-wider">Rate</th>
              <th className="text-right py-2.5 px-3 text-2xs font-bold uppercase tracking-wider">GST</th>
              <th className="text-right py-2.5 px-3 text-2xs font-bold uppercase tracking-wider rounded-tr-lg">Amount</th>
            </tr>
          </thead>
          <tbody>
            {(order.items || []).map((item, i) => {
              const unitPrice = parseFloat(item.unitPrice || '0');
              const itemTotal = parseFloat(item.totalPrice || (unitPrice * item.quantity).toString());
              const gstAmount = itemTotal * 0.18; // assume 18% — backend should have it
              return (
                <tr key={item.id} className="border-b border-ink-100">
                  <td className="py-3 px-3 text-ink-500 tabular-nums">{i + 1}</td>
                  <td className="py-3 px-3">
                    <p className="font-semibold text-ink-900">{item.productName}</p>
                    {item.variantName && <p className="text-2xs text-ink-500">{item.variantName}</p>}
                  </td>
                  <td className="py-3 px-3 text-center text-2xs font-mono text-ink-500">2523</td>
                  <td className="py-3 px-3 text-right text-ink-700 tabular-nums">{item.quantity} {item.unit}</td>
                  <td className="py-3 px-3 text-right text-ink-700 tabular-nums">{formatCurrency(unitPrice)}</td>
                  <td className="py-3 px-3 text-right text-ink-700 tabular-nums">{formatCurrency(gstAmount)}</td>
                  <td className="py-3 px-3 text-right font-semibold text-ink-900 tabular-nums">{formatCurrency(itemTotal)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* ─── Totals ─────────────────────────────── */}
        <div className="flex justify-end mt-5">
          <div className="w-72 space-y-1.5 text-sm">
            <div className="flex justify-between">
              <span className="text-ink-600">Subtotal</span>
              <span className="text-ink-900 tabular-nums">{formatCurrency(subtotal)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-success-700">
                <span>Discount {order.couponCode && <span className="text-2xs">({order.couponCode})</span>}</span>
                <span className="tabular-nums">− {formatCurrency(discount)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-ink-600">CGST (9%)</span>
              <span className="text-ink-900 tabular-nums">{formatCurrency(cgst)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-ink-600">SGST (9%)</span>
              <span className="text-ink-900 tabular-nums">{formatCurrency(sgst)}</span>
            </div>
            {shipping > 0 && (
              <div className="flex justify-between">
                <span className="text-ink-600">Shipping</span>
                <span className="text-ink-900 tabular-nums">{formatCurrency(shipping)}</span>
              </div>
            )}
            <div className="border-t-2 border-ink-900 pt-2 flex justify-between">
              <span className="font-bold text-ink-900">Grand Total</span>
              <span className="font-black text-ink-900 text-lg tabular-nums">{formatCurrency(total)}</span>
            </div>
            <div className="text-2xs text-ink-500 text-right pt-1">
              (Inclusive of all taxes)
            </div>
          </div>
        </div>

        {/* ─── Payment + Bank ─────────────────────── */}
        <div className="grid grid-cols-2 gap-6 mt-8 pt-5 border-t border-ink-200 text-xs">
          <div>
            <p className="text-2xs font-bold text-ink-500 uppercase tracking-wider mb-1.5">Payment Information</p>
            <div className="space-y-0.5 text-ink-700">
              <p><span className="text-ink-500">Method:</span> <span className="font-semibold uppercase">{order.paymentMethod}</span></p>
              <p><span className="text-ink-500">Status:</span> <span className={clsx('font-bold', isPaid ? 'text-success-700' : 'text-warning-700')}>{order.paymentStatus}</span></p>
              {order.paymentRef && <p><span className="text-ink-500">Ref:</span> <span className="font-mono">{order.paymentRef}</span></p>}
              <p><span className="text-ink-500">Amount:</span> <span className="font-bold tabular-nums">{formatCurrency(total)}</span></p>
            </div>
          </div>
          <div>
            <p className="text-2xs font-bold text-ink-500 uppercase tracking-wider mb-1.5">Bank Details</p>
            <div className="space-y-0.5 text-ink-700">
              <p><span className="text-ink-500">Bank:</span> <span className="font-semibold">{COMPANY.bank.name}</span></p>
              <p><span className="text-ink-500">A/c #:</span> <span className="font-mono">{COMPANY.bank.account}</span></p>
              <p><span className="text-ink-500">IFSC:</span> <span className="font-mono">{COMPANY.bank.ifsc}</span></p>
              <p><span className="text-ink-500">Branch:</span> {COMPANY.bank.branch}</p>
            </div>
          </div>
        </div>

        {/* ─── Tax breakdown ──────────────────────── */}
        <div className="mt-5 pt-5 border-t border-ink-200">
          <p className="text-2xs font-bold text-ink-500 uppercase tracking-wider mb-2">Tax Summary</p>
          <table className="w-full text-2xs">
            <thead>
              <tr className="bg-ink-50">
                <th className="text-left py-1.5 px-2 font-bold uppercase">HSN/SAC</th>
                <th className="text-right py-1.5 px-2 font-bold uppercase">Taxable Amt</th>
                <th className="text-right py-1.5 px-2 font-bold uppercase">CGST 9%</th>
                <th className="text-right py-1.5 px-2 font-bold uppercase">SGST 9%</th>
                <th className="text-right py-1.5 px-2 font-bold uppercase">Total Tax</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-ink-100">
                <td className="py-1.5 px-2 font-mono">2523</td>
                <td className="py-1.5 px-2 text-right tabular-nums">{formatCurrency(subtotal - discount)}</td>
                <td className="py-1.5 px-2 text-right tabular-nums">{formatCurrency(cgst)}</td>
                <td className="py-1.5 px-2 text-right tabular-nums">{formatCurrency(sgst)}</td>
                <td className="py-1.5 px-2 text-right tabular-nums font-semibold">{formatCurrency(tax)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* ─── Terms ──────────────────────────────── */}
        <div className="mt-6 pt-5 border-t border-ink-200">
          <p className="text-2xs font-bold text-ink-500 uppercase tracking-wider mb-2">Terms & Conditions</p>
          <ol className="text-2xs text-ink-600 space-y-0.5 list-decimal list-inside">
            {TERMS.map((t, i) => <li key={i}>{t}</li>)}
          </ol>
        </div>

        {/* ─── Footer ────────────────────────────── */}
        <div className="mt-8 pt-5 border-t-2 border-ink-900 flex items-end justify-between">
          <div className="text-2xs text-ink-500">
            <p>GSTIN: {COMPANY.gstin} · PAN: {COMPANY.pan}</p>
            <p className="mt-1">This is a computer-generated invoice. No signature required.</p>
          </div>
          <div className="text-right">
            <div className="inline-block px-8 pt-3 border-t-2 border-ink-900">
              <p className="text-2xs text-ink-500 uppercase tracking-wider">Authorized Signatory</p>
              <p className="font-bold text-ink-900 mt-1">For {COMPANY.name}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

// ─── Delivery Note / Packing Slip ───────────────────────────
export const DeliveryNoteTemplate = forwardRef<HTMLDivElement, { order: Order }>(
  function DeliveryNoteTemplate({ order }, ref) {
    const customerName = `${order.user?.firstName || ''} ${order.user?.lastName || ''}`.trim() || order.user?.email || 'Customer';
    const totalQty = (order.items || []).reduce((s, i) => s + i.quantity, 0);

    return (
      <div ref={ref} className="bg-white text-ink-900 p-8 max-w-[210mm] mx-auto print:p-0 print:max-w-none">
        {/* Header */}
        <div className="flex items-start justify-between gap-6 pb-5 border-b-2 border-ink-900">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-accent-400 to-accent-600 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-ink-900">{COMPANY.name}</h1>
              <p className="text-2xs text-ink-500 uppercase tracking-wider">{COMPANY.tagline}</p>
            </div>
          </div>
          <div className="text-right">
            <h2 className="text-3xl font-black text-ink-900">DELIVERY NOTE</h2>
            <p className="text-2xs text-ink-500 uppercase tracking-wider mt-1">Packing Slip</p>
          </div>
        </div>

        {/* Order info */}
        <div className="grid grid-cols-3 gap-4 mt-5">
          <div>
            <p className="text-2xs font-bold text-ink-500 uppercase tracking-wider">DN #</p>
            <p className="font-mono font-bold text-ink-900">DN-{order.orderNumber}</p>
          </div>
          <div>
            <p className="text-2xs font-bold text-ink-500 uppercase tracking-wider">Order #</p>
            <p className="font-mono font-bold text-ink-900">{order.orderNumber}</p>
          </div>
          <div>
            <p className="text-2xs font-bold text-ink-500 uppercase tracking-wider">Date</p>
            <p className="font-semibold text-ink-900">{formatDate(order.createdAt)}</p>
          </div>
        </div>

        {/* Ship to */}
        <div className="mt-5 p-4 bg-ink-50 rounded-lg">
          <p className="text-2xs font-bold text-ink-500 uppercase tracking-wider mb-1.5">Ship To</p>
          {order.address ? (
            <>
              <p className="font-bold text-ink-900">{order.address.fullName || customerName}</p>
              {order.address.line1 && <p className="text-sm text-ink-600">{order.address.line1}</p>}
              {order.address.line2 && <p className="text-sm text-ink-600">{order.address.line2}</p>}
              <p className="text-sm text-ink-600">
                {[order.address.city, order.address.state, order.address.pincode].filter(Boolean).join(', ')}
              </p>
              {order.address.phone && <p className="text-sm text-ink-600 mt-1">📞 {order.address.phone}</p>}
            </>
          ) : (
            <p className="text-sm text-ink-500">Same as customer</p>
          )}
        </div>

        {/* Items */}
        <table className="w-full mt-5 text-sm border-collapse">
          <thead>
            <tr className="bg-ink-900 text-white">
              <th className="text-left py-2.5 px-3 text-2xs font-bold uppercase tracking-wider rounded-tl-lg w-12">#</th>
              <th className="text-left py-2.5 px-3 text-2xs font-bold uppercase tracking-wider">Item</th>
              <th className="text-center py-2.5 px-3 text-2xs font-bold uppercase tracking-wider w-24">SKU</th>
              <th className="text-center py-2.5 px-3 text-2xs font-bold uppercase tracking-wider w-20">Qty</th>
              <th className="text-center py-2.5 px-3 text-2xs font-bold uppercase tracking-wider w-20">Packed</th>
              <th className="text-right py-2.5 px-3 text-2xs font-bold uppercase tracking-wider rounded-tr-lg w-20">Check</th>
            </tr>
          </thead>
          <tbody>
            {(order.items || []).map((item, i) => (
              <tr key={item.id} className="border-b border-ink-200">
                <td className="py-3 px-3 text-ink-500 tabular-nums">{i + 1}</td>
                <td className="py-3 px-3">
                  <p className="font-semibold text-ink-900">{item.productName}</p>
                  {item.variantName && <p className="text-2xs text-ink-500">{item.variantName}</p>}
                </td>
                <td className="py-3 px-3 text-center text-2xs font-mono text-ink-500">{item.productSlug?.slice(0, 10).toUpperCase() || '—'}</td>
                <td className="py-3 px-3 text-center text-ink-700 tabular-nums font-semibold">{item.quantity} {item.unit}</td>
                <td className="py-3 px-3 text-center">
                  <div className="inline-block w-12 h-6 border-2 border-ink-300 rounded"></div>
                </td>
                <td className="py-3 px-3 text-center">
                  <div className="inline-block w-5 h-5 border-2 border-ink-300 rounded"></div>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-ink-50 font-bold">
              <td colSpan={3} className="py-2.5 px-3 text-right">Total</td>
              <td className="py-2.5 px-3 text-center tabular-nums">{totalQty} units</td>
              <td colSpan={2}></td>
            </tr>
          </tfoot>
        </table>

        {/* Summary */}
        <div className="mt-6 pt-5 border-t border-ink-200 grid grid-cols-2 gap-6">
          <div>
            <p className="text-2xs font-bold text-ink-500 uppercase tracking-wider mb-1.5">Packed By</p>
            <div className="border-b border-ink-300 h-10"></div>
            <p className="text-2xs text-ink-500 mt-1">Name & Signature</p>
          </div>
          <div>
            <p className="text-2xs font-bold text-ink-500 uppercase tracking-wider mb-1.5">Received By</p>
            <div className="border-b border-ink-300 h-10"></div>
            <p className="text-2xs text-ink-500 mt-1">Customer Signature & Date</p>
          </div>
        </div>

        <div className="mt-6 text-2xs text-ink-500">
          <p>This is a computer-generated delivery note. Please verify all items before signing.</p>
        </div>
      </div>
    );
  }
);
