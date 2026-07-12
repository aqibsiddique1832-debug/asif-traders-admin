// ────────────────────────────────────────────────────────────
// Delivery Pincode Management
// ────────────────────────────────────────────────────────────

import { useEffect, useState } from 'react';
import { pincodeService } from '../lib/services';
import { Modal, EmptyState, Pagination } from '../components/ui/StatCard';
import { Plus, Edit2, Trash2, Search, MapPin, CheckCircle, XCircle, Truck } from 'lucide-react';
import { formatCurrency, formatDate } from '../lib/auth';
import type { Pincode } from '../types';
import toast from 'react-hot-toast';
import clsx from 'clsx';

export default function Pincodes() {
  const [data, setData] = useState<Pincode[]>([]);
  const [search, setSearch] = useState('');
  const [filtered, setFiltered] = useState<Pincode[]>([]);
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Pincode | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const perPage = 20;

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      const list = await pincodeService.list();
      setData(list);
    } catch { /* */ }
  };

  useEffect(() => {
    const term = search.toLowerCase();
    setFiltered(data.filter(p => !term || p.pincode.includes(term) || p.city.toLowerCase().includes(term) || p.area?.toLowerCase().includes(term)));
    setPage(1);
  }, [search, data]);

  const handleSave = async (form: Partial<Pincode>) => {
    try {
      if (editing) {
        await pincodeService.update(editing.id, form);
        toast.success('Pincode updated');
      } else {
        await pincodeService.create(form);
        toast.success('Pincode added');
      }
      setModalOpen(false);
      setEditing(null);
      load();
    } catch (err: any) {
      toast.error(err.message || 'Failed');
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await pincodeService.remove(deleteId);
      toast.success('Pincode removed');
      setDeleteId(null);
      load();
    } catch (err: any) { toast.error(err.message || 'Failed'); }
  };

  const toggleActive = async (p: Pincode) => {
    try {
      await pincodeService.update(p.id, { isActive: !p.isActive });
      toast.success(p.isActive ? 'Disabled' : 'Enabled');
      load();
    } catch (err: any) { toast.error(err.message || 'Failed'); }
  };

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const paged = filtered.slice((page - 1) * perPage, page * perPage);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Delivery Pincodes</h1>
          <p className="text-sm text-secondary-500 mt-1">{filtered.length} pincodes · {filtered.filter(p => p.isActive).length} active</p>
        </div>
        <button onClick={() => { setEditing(null); setModalOpen(true); }} className="btn-primary"><Plus className="w-4 h-4" /> Add Pincode</button>
      </div>

      <div className="card p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} className="input pl-10" placeholder="Search by pincode, city, or area..." />
        </div>
      </div>

      <div className="card overflow-hidden">
        {paged.length === 0 ? (
          <EmptyState title="No pincodes" description="Add delivery pincodes to enable checkout validation" icon={MapPin}
            action={<button onClick={() => setModalOpen(true)} className="btn-primary"><Plus className="w-4 h-4" /> Add Pincode</button>}
          />
        ) : (
          <>
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-secondary-50 border-b border-secondary-200">
                  <tr>
                    <th className="text-left text-xs font-semibold text-secondary-600 px-4 py-3">Pincode</th>
                    <th className="text-left text-xs font-semibold text-secondary-600 px-4 py-3">City / Area</th>
                    <th className="text-left text-xs font-semibold text-secondary-600 px-4 py-3">Delivery</th>
                    <th className="text-left text-xs font-semibold text-secondary-600 px-4 py-3">Charge</th>
                    <th className="text-left text-xs font-semibold text-secondary-600 px-4 py-3">Free Above</th>
                    <th className="text-left text-xs font-semibold text-secondary-600 px-4 py-3">Status</th>
                    <th className="text-right text-xs font-semibold text-secondary-600 px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-secondary-200">
                  {paged.map((p) => (
                    <tr key={p.id} className="table-row">
                      <td className="px-4 py-3 font-mono font-medium">{p.pincode}</td>
                      <td className="px-4 py-3 text-sm">
                        <div className="font-medium text-secondary-900">{p.city}</div>
                        {p.area && <div className="text-xs text-secondary-500">{p.area}</div>}
                      </td>
                      <td className="px-4 py-3 text-sm flex items-center gap-1">
                        <Truck className="w-3.5 h-3.5 text-secondary-400" />
                        {p.deliveryDays} {p.deliveryDays === 1 ? 'day' : 'days'}
                      </td>
                      <td className="px-4 py-3 text-sm">{p.deliveryCharge === 0 ? <span className="text-success-dark font-medium">FREE</span> : formatCurrency(p.deliveryCharge)}</td>
                      <td className="px-4 py-3 text-sm text-secondary-600">{p.freeDeliveryAbove ? formatCurrency(p.freeDeliveryAbove) : '—'}</td>
                      <td className="px-4 py-3">
                        <button onClick={() => toggleActive(p)} className={clsx('badge', p.isActive ? 'badge-success' : 'badge-secondary')}>
                          {p.isActive ? <><CheckCircle className="w-3 h-3" /> Active</> : <><XCircle className="w-3 h-3" /> Disabled</>}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => { setEditing(p); setModalOpen(true); }} className="p-1.5 text-secondary-500 hover:text-primary hover:bg-primary-50 rounded"><Edit2 className="w-4 h-4" /></button>
                          <button onClick={() => setDeleteId(p.id)} className="p-1.5 text-secondary-500 hover:text-danger hover:bg-danger-light rounded"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="md:hidden divide-y divide-secondary-200">
              {paged.map((p) => (
                <div key={p.id} className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="font-mono font-medium text-lg">{p.pincode}</div>
                    <button onClick={() => toggleActive(p)} className={clsx('badge', p.isActive ? 'badge-success' : 'badge-secondary')}>
                      {p.isActive ? 'Active' : 'Off'}
                    </button>
                  </div>
                  <div className="text-sm font-medium mt-1">{p.city}{p.area ? ` · ${p.area}` : ''}</div>
                  <div className="text-xs text-secondary-500 mt-1">
                    {p.deliveryDays}d · {p.deliveryCharge === 0 ? 'FREE delivery' : `${formatCurrency(p.deliveryCharge)} charge`}
                  </div>
                  <div className="flex gap-1 mt-2">
                    <button onClick={() => { setEditing(p); setModalOpen(true); }} className="btn btn-secondary btn-sm"><Edit2 className="w-3 h-3" /> Edit</button>
                    <button onClick={() => setDeleteId(p.id)} className="btn btn-sm text-danger hover:bg-danger-light"><Trash2 className="w-3 h-3" /></button>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-secondary-200">
              <Pagination page={page} totalPages={totalPages} total={filtered.length} limit={perPage} onPageChange={setPage} />
            </div>
          </>
        )}
      </div>

      <PincodeFormModal open={modalOpen} pincode={editing} onClose={() => { setModalOpen(false); setEditing(null); }} onSave={handleSave} />
      <Modal open={!!deleteId} onClose={() => setDeleteId(null)} title="Remove Pincode" footer={
        <>
          <button onClick={() => setDeleteId(null)} className="btn-secondary">Cancel</button>
          <button onClick={handleDelete} className="btn-danger">Remove</button>
        </>
      }>
        <p className="text-sm text-secondary-600">Are you sure you want to remove this pincode? Customers in this area will not be able to place orders.</p>
      </Modal>
    </div>
  );
}

function PincodeFormModal({ open, onClose, onSave, pincode }: { open: boolean; onClose: () => void; onSave: (d: Partial<Pincode>) => void; pincode: Pincode | null }) {
  const [pin, setPin] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('Maharashtra');
  const [area, setArea] = useState('');
  const [deliveryDays, setDeliveryDays] = useState(2);
  const [deliveryCharge, setDeliveryCharge] = useState(50);
  const [freeDeliveryAbove, setFreeDeliveryAbove] = useState(1000);
  const [codAvailable, setCodAvailable] = useState(true);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (pincode) {
      setPin(pincode.pincode); setCity(pincode.city); setState(pincode.state); setArea(pincode.area || '');
      setDeliveryDays(pincode.deliveryDays); setDeliveryCharge(pincode.deliveryCharge);
      setFreeDeliveryAbove(pincode.freeDeliveryAbove || 0); setCodAvailable(pincode.codAvailable); setIsActive(pincode.isActive);
    } else {
      setPin(''); setCity(''); setState('Maharashtra'); setArea(''); setDeliveryDays(2); setDeliveryCharge(50); setFreeDeliveryAbove(1000); setCodAvailable(true); setIsActive(true);
    }
  }, [pincode, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{6}$/.test(pin)) { toast.error('Pincode must be 6 digits'); return; }
    onSave({ pincode: pin, city, state, area, deliveryDays, deliveryCharge, freeDeliveryAbove: freeDeliveryAbove || undefined, codAvailable, isActive });
  };

  return (
    <Modal open={open} onClose={onClose} title={pincode ? 'Edit Pincode' : 'Add Pincode'} size="lg"
      footer={
        <>
          <button onClick={onClose} className="btn-secondary">Cancel</button>
          <button form="pincode-form" type="submit" className="btn-primary">{pincode ? 'Update' : 'Add'}</button>
        </>
      }
    >
      <form id="pincode-form" onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1.5">Pincode *</label>
            <input required pattern="[0-9]{6}" maxLength={6} value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))} className="input" placeholder="6 digits" />
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1.5">City *</label>
            <input required value={city} onChange={(e) => setCity(e.target.value)} className="input" placeholder="e.g. Mumbai" />
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1.5">State *</label>
            <input required value={state} onChange={(e) => setState(e.target.value)} className="input" />
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1.5">Area / Locality</label>
            <input value={area} onChange={(e) => setArea(e.target.value)} className="input" placeholder="e.g. Andheri West" />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1.5">Delivery Days</label>
            <input type="number" min="1" value={deliveryDays} onChange={(e) => setDeliveryDays(parseInt(e.target.value, 10) || 1)} className="input" />
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1.5">Charge (₹)</label>
            <input type="number" min="0" value={deliveryCharge} onChange={(e) => setDeliveryCharge(parseInt(e.target.value, 10) || 0)} className="input" />
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1.5">Free Above (₹)</label>
            <input type="number" min="0" value={freeDeliveryAbove} onChange={(e) => setFreeDeliveryAbove(parseInt(e.target.value, 10) || 0)} className="input" />
          </div>
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={codAvailable} onChange={(e) => setCodAvailable(e.target.checked)} className="w-4 h-4 text-primary border-secondary-300 rounded" />
            <span className="text-sm text-secondary-700">Cash on Delivery available</span>
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="w-4 h-4 text-primary border-secondary-300 rounded" />
            <span className="text-sm text-secondary-700">Active (accepts orders)</span>
          </label>
        </div>
      </form>
    </Modal>
  );
}
