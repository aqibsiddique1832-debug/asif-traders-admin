// ────────────────────────────────────────────────────────────
// Print Modal — Part 2B-1B
// A4 print preview with invoice / delivery note / packing slip
// Supports browser print, PDF export
// ────────────────────────────────────────────────────────────

import { useState, useRef } from 'react';
import { X, Printer, Download, FileText, Package, Truck, Loader2, Mail, Send } from 'lucide-react';
import clsx from 'clsx';
import toast from 'react-hot-toast';
import { Button, Badge } from '../ui/StatCard';
import { InvoiceTemplate, DeliveryNoteTemplate } from './InvoiceTemplate';
import type { Order } from '../../types';

type PrintType = 'invoice' | 'delivery' | 'label';

export function PrintModal({
  open,
  onClose,
  order,
}: {
  open: boolean;
  onClose: () => void;
  order: Order | null;
}) {
  const [type, setType] = useState<PrintType>('invoice');
  const [printing, setPrinting] = useState(false);
  const [emailing, setEmailing] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  if (!open || !order) return null;

  const handlePrint = () => {
    setPrinting(true);
    setTimeout(() => {
      window.print();
      setPrinting(false);
    }, 100);
  };

  const handleEmail = async () => {
    setEmailing(true);
    try {
      // Simulate email send
      await new Promise((resolve) => setTimeout(resolve, 1500));
      toast.success(`Sent ${type === 'invoice' ? 'invoice' : 'delivery note'} to customer`);
    } finally {
      setEmailing(false);
    }
  };

  return (
    <>
      {/* Print-only CSS to hide everything except the print area */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #print-area, #print-area * { visibility: visible; }
          #print-area { position: absolute; left: 0; top: 0; width: 100%; }
        }
      `}</style>

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
        <div className="absolute inset-0 bg-ink-900/40 backdrop-blur-sm" onClick={onClose} />
        <div className="relative bg-white rounded-3xl shadow-modal max-w-5xl w-full max-h-[90vh] flex flex-col animate-scale-in">
          {/* Header — hidden in print */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-ink-200 flex-shrink-0 print:hidden">
            <div>
              <p className="text-2xs font-bold text-ink-500 uppercase tracking-wider">Print Preview</p>
              <h2 className="text-lg font-bold text-ink-900">Order {order.orderNumber}</h2>
            </div>
            <div className="flex items-center gap-2">
              {/* Type switcher */}
              <div className="flex items-center bg-ink-100 rounded-lg p-0.5">
                <TypeButton
                  icon={FileText}
                  label="Invoice"
                  active={type === 'invoice'}
                  onClick={() => setType('invoice')}
                />
                <TypeButton
                  icon={Truck}
                  label="Delivery Note"
                  active={type === 'delivery'}
                  onClick={() => setType('delivery')}
                />
                <TypeButton
                  icon={Package}
                  label="Label"
                  active={type === 'label'}
                  onClick={() => setType('label')}
                />
              </div>
              <Button variant="ghost" size="sm" onClick={onClose} leftIcon={X}>Close</Button>
            </div>
          </div>

          {/* Toolbar — hidden in print */}
          <div className="px-6 py-3 border-b border-ink-200 bg-ink-50/40 flex items-center justify-between flex-shrink-0 print:hidden">
            <div className="flex items-center gap-2 text-xs text-ink-600">
              <Badge variant="ink">A4 · 210mm × 297mm</Badge>
              <span>·</span>
              <span>Use the print button to save as PDF or print</span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="secondary" size="sm" onClick={handleEmail} loading={emailing} leftIcon={Mail}>
                Email to Customer
              </Button>
              <Button variant="primary" size="sm" onClick={handlePrint} loading={printing} leftIcon={printing ? Loader2 : Printer}>
                {printing ? 'Opening…' : 'Print / PDF'}
              </Button>
            </div>
          </div>

          {/* Print area — visible in print */}
          <div className="flex-1 overflow-y-auto scroll-thin bg-ink-100 p-6 print:p-0 print:overflow-visible print:bg-white">
            <div id="print-area" className="bg-white shadow-lg rounded-2xl mx-auto print:shadow-none print:rounded-none" style={{ maxWidth: '210mm' }}>
              {type === 'invoice' && <InvoiceTemplate ref={printRef} order={order} />}
              {type === 'delivery' && <DeliveryNoteTemplate ref={printRef} order={order} />}
              {type === 'label' && <ShippingLabel order={order} />}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function TypeButton({ icon: Icon, label, active, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        'flex items-center gap-1.5 px-2.5 h-7 text-xs font-medium rounded-md transition-all',
        active ? 'bg-white shadow-sm text-ink-900' : 'text-ink-600 hover:text-ink-900',
      )}
    >
      <Icon className="w-3.5 h-3.5" />
      {label}
    </button>
  );
}

// ─── Shipping Label ─────────────────────────────────────────
function ShippingLabel({ order }: { order: Order }) {
  const customerName = `${order.user?.firstName || ''} ${order.user?.lastName || ''}`.trim() || order.user?.email || 'Customer';
  return (
    <div className="bg-white p-6 max-w-[100mm] mx-auto print:p-0">
      <div className="border-2 border-ink-900 rounded-lg p-5 space-y-4">
        {/* From */}
        <div className="pb-3 border-b border-dashed border-ink-300">
          <p className="text-2xs font-bold text-ink-500 uppercase tracking-wider">From</p>
          <p className="font-bold text-sm text-ink-900 mt-0.5">ASIF TRADERS</p>
          <p className="text-2xs text-ink-600">123 Main Market, Mumbai 400001</p>
          <p className="text-2xs text-ink-600">📞 +91 98765 43210</p>
        </div>

        {/* To */}
        <div>
          <p className="text-2xs font-bold text-ink-500 uppercase tracking-wider mb-1">Ship To</p>
          <p className="font-bold text-base text-ink-900">{order.address?.fullName || customerName}</p>
          {order.address?.line1 && <p className="text-sm text-ink-700">{order.address.line1}</p>}
          {order.address?.line2 && <p className="text-sm text-ink-700">{order.address.line2}</p>}
          <p className="text-sm text-ink-700 font-semibold">
            {[order.address?.city, order.address?.state, order.address?.pincode].filter(Boolean).join(' · ')}
          </p>
          {order.address?.phone && <p className="text-sm text-ink-700 mt-1">📞 {order.address.phone}</p>}
        </div>

        {/* Order info */}
        <div className="pt-3 border-t border-dashed border-ink-300 grid grid-cols-2 gap-2 text-2xs">
          <div>
            <p className="text-ink-500">Order</p>
            <p className="font-mono font-bold text-ink-900">{order.orderNumber}</p>
          </div>
          <div>
            <p className="text-ink-500">Weight</p>
            <p className="font-bold text-ink-900">{(order as any).totalWeight || '—'} kg</p>
          </div>
        </div>

        {/* Barcode placeholder */}
        <div className="pt-3 border-t border-dashed border-ink-300 text-center">
          <div className="inline-block bg-ink-900 text-white px-3 py-1 font-mono text-xs tracking-widest">
            |||||| ||| | ||| || |||
          </div>
          <p className="font-mono text-2xs mt-1.5 text-ink-700">{order.orderNumber}</p>
        </div>

        {order.trackingNumber && (
          <div className="pt-3 border-t border-dashed border-ink-300 text-center">
            <p className="text-2xs text-ink-500">Tracking</p>
            <p className="font-mono font-bold text-sm text-ink-900">{order.trackingNumber}</p>
            <p className="text-2xs text-ink-600">{order.carrier}</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Status Automation Panel ────────────────────────────────
export function StatusAutomationPanel({ onBulkAdvance, selectedCount, onSchedule, onNotify }: {
  onBulkAdvance: (targetStatus: string) => void;
  selectedCount: number;
  onSchedule: () => void;
  onNotify: () => void;
}) {
  return (
    <div className="card p-4 flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-2">
        <div className="w-9 h-9 rounded-xl bg-accent-50 text-accent-600 flex items-center justify-center">
          <Send className="w-4 h-4" />
        </div>
        <div>
          <p className="text-sm font-semibold text-ink-900">Quick Actions</p>
          <p className="text-2xs text-ink-500">{selectedCount > 0 ? `${selectedCount} selected` : 'Select orders to bulk-advance'}</p>
        </div>
      </div>

      <div className="h-8 w-px bg-ink-200" />

      <div className="flex items-center gap-2 flex-wrap">
        <Button variant="secondary" size="sm" leftIcon={Printer} onClick={() => onBulkAdvance('CONFIRMED')}>
          Mark Confirmed
        </Button>
        <Button variant="secondary" size="sm" leftIcon={Package} onClick={() => onBulkAdvance('PROCESSING')}>
          Mark Processing
        </Button>
        <Button variant="secondary" size="sm" leftIcon={Truck} onClick={() => onBulkAdvance('SHIPPED')}>
          Mark Shipped
        </Button>
        <Button variant="secondary" size="sm" leftIcon={Download} onClick={onSchedule}>
          Schedule Update
        </Button>
        <Button variant="secondary" size="sm" leftIcon={Mail} onClick={onNotify}>
          Send Notification
        </Button>
      </div>
    </div>
  );
}

// Avoid unused
void Send;
void Download;
