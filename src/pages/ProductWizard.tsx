// ────────────────────────────────────────────────────────────
// Premium Add/Edit Product Wizard — Part 2A-2A
// 10 steps · stepper · validation · save draft / publish
// ────────────────────────────────────────────────────────────

import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import {
  Package, ChevronLeft, ChevronRight, Save, Send, Check, AlertCircle,
  X, FileText, Tag, DollarSign, Boxes, Image as ImageIcon, Layers,
  Ruler, Truck, Search, Sparkles, Star, TrendingUp, Plus, Trash2,
  GripVertical, Edit2, Eye, CheckCircle2, Info, Upload, Hash,
  ArrowUp, ArrowDown, Globe, Archive, Zap, Heart, RotateCcw,
} from 'lucide-react';
import clsx from 'clsx';
import toast from 'react-hot-toast';
import {
  Card, CardHeader, CardBody, Button, Badge, PageHeader, EmptyState,
  Skeleton, Modal, ConfirmDialog,
} from '../components/ui/StatCard';
import { productService, categoryService } from '../lib/services';
import { formatCurrency } from '../lib/auth';
import type { Product, Category } from '../types';

// ─── Step definitions ───────────────────────────────────────
const STEPS = [
  { id: 1,  label: 'Basic Info',        short: 'Info',     icon: FileText,     group: 'content' },
  { id: 2,  label: 'Category & Brand',  short: 'Category', icon: Tag,          group: 'content' },
  { id: 3,  label: 'Pricing',           short: 'Pricing',  icon: DollarSign,   group: 'content' },
  { id: 4,  label: 'Inventory',         short: 'Stock',    icon: Boxes,        group: 'content' },
  { id: 5,  label: 'Images',            short: 'Images',   icon: ImageIcon,    group: 'content' },
  { id: 6,  label: 'Variants',          short: 'Variants', icon: Layers,       group: 'content' },
  { id: 7,  label: 'Specifications',    short: 'Specs',    icon: Ruler,        group: 'content' },
  { id: 8,  label: 'Shipping',          short: 'Shipping', icon: Truck,        group: 'content' },
  { id: 9,  label: 'SEO',               short: 'SEO',      icon: Globe,        group: 'content' },
  { id: 10, label: 'Visibility',        short: 'Status',   icon: Sparkles,     group: 'content' },
] as const;

// ─── Initial form state ─────────────────────────────────────
const initialState = {
  // Step 1
  name: '',
  slug: '',
  sku: '',
  description: '',
  shortDesc: '',
  // Step 2
  categoryId: '',
  brandId: '',
  tags: [] as string[],
  // Step 3
  mrp: '',
  sellingPrice: '',
  costPrice: '',
  gstPercent: 18,
  // Step 4
  stock: 0,
  unit: 'piece',
  minOrderQty: 1,
  maxOrderQty: undefined as number | undefined,
  // Step 5
  images: [] as Array<{ url: string; alt?: string; isPrimary: boolean; sortOrder: number }>,
  // Step 6
  variants: [] as Array<{
    id?: string;
    name: string;
    sku?: string;
    mrp: string;
    sellingPrice: string;
    stock: number;
    unit: string;
  }>,
  // Step 7
  specs: [] as Array<{ key: string; value: string; sortOrder: number }>,
  // Step 8
  weight: undefined as number | undefined,
  length: undefined as number | undefined,
  width: undefined as number | undefined,
  height: undefined as number | undefined,
  // Step 9
  metaTitle: '',
  metaDescription: '',
  metaKeywords: '',
  // Step 10
  status: 'DRAFT' as 'DRAFT' | 'ACTIVE' | 'OUT_OF_STOCK' | 'ARCHIVED',
  isFeatured: false,
  isBestseller: false,
  isNew: false,
};

type FormState = typeof initialState;

export default function ProductWizard() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const isEdit = !!id;

  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormState>(initialState);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [showCancel, setShowCancel] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // ─── Load data ──────────────────────────────────────────
  useEffect(() => {
    if (isEdit) {
      loadProduct();
    } else if ((location.state as any)?.openCreate) {
      // Creating new
    }
  }, [id]);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const res = await categoryService.list({ limit: 100 });
      setCategories((res as any).data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const loadProduct = async () => {
    try {
      setLoading(true);
      const p = await productService.get(id!) as any;
      setForm({
        name: p.name || '',
        slug: p.slug || '',
        sku: p.sku || '',
        description: p.description || '',
        shortDesc: p.shortDesc || '',
        categoryId: p.categoryId || '',
        brandId: p.brandId || '',
        tags: p.tags || [],
        mrp: p.mrp || '',
        sellingPrice: p.sellingPrice || '',
        costPrice: p.costPrice || '',
        gstPercent: p.gstPercent ?? 18,
        stock: p.stock ?? 0,
        unit: p.unit || 'piece',
        minOrderQty: p.minOrderQty ?? 1,
        maxOrderQty: p.maxOrderQty,
        images: p.images || [],
        variants: p.variants || [],
        specs: p.specs || [],
        weight: p.weight,
        length: p.length,
        width: p.width,
        height: p.height,
        metaTitle: p.metaTitle || '',
        metaDescription: p.metaDescription || '',
        metaKeywords: p.metaKeywords || '',
        status: p.status || 'DRAFT',
        isFeatured: p.isFeatured || false,
        isBestseller: p.isBestseller || false,
        isNew: p.isNew || false,
      });
      // Mark first 10 steps as completed for edits
      setCompletedSteps(new Set([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]));
    } catch (err) {
      toast.error('Failed to load product');
      navigate('/products');
    } finally {
      setLoading(false);
    }
  };

  // ─── Auto-generate slug from name ──────────────────────
  useEffect(() => {
    if (!isEdit && form.name && !form.slug) {
      const slug = form.name.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
        .slice(0, 100);
      setForm((f) => ({ ...f, slug }));
    }
  }, [form.name, isEdit]);

  // ─── Validation per step ───────────────────────────────
  const validateStep = (s: number): string | null => {
    switch (s) {
      case 1:
        if (!form.name || form.name.length < 2) return 'Product name must be at least 2 characters';
        if (!form.description) return 'Description is required';
        break;
      case 2:
        if (!form.categoryId) return 'Please select a category';
        break;
      case 3:
        if (!form.mrp || parseFloat(form.mrp) <= 0) return 'MRP must be greater than 0';
        if (!form.sellingPrice || parseFloat(form.sellingPrice) <= 0) return 'Selling price must be greater than 0';
        if (parseFloat(form.sellingPrice) > parseFloat(form.mrp)) return 'Selling price cannot exceed MRP';
        break;
      case 4:
        if (form.stock < 0) return 'Stock cannot be negative';
        if (!form.unit) return 'Unit is required';
        break;
    }
    return null;
  };

  const goNext = () => {
    const err = validateStep(step);
    if (err) {
      toast.error(err);
      return;
    }
    setCompletedSteps((prev) => new Set(prev).add(step));
    if (step < STEPS.length) setStep(step + 1);
  };

  const goBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const goToStep = (s: number) => {
    if (s < step || completedSteps.has(s) || isEdit) {
      setStep(s);
    } else {
      toast.error('Complete previous steps first');
    }
  };

  // ─── Save (draft / publish) ────────────────────────────
  const buildPayload = (status: string) => {
    return {
      name: form.name,
      slug: form.slug || undefined,
      sku: form.sku || undefined,
      description: form.description || undefined,
      shortDesc: form.shortDesc || undefined,
      categoryId: form.categoryId,
      brandId: form.brandId || undefined,
      mrp: form.mrp,
      sellingPrice: form.sellingPrice,
      costPrice: form.costPrice || undefined,
      gstPercent: form.gstPercent,
      stock: form.stock,
      unit: form.unit,
      minOrderQty: form.minOrderQty,
      maxOrderQty: form.maxOrderQty,
      images: form.images.length > 0 ? form.images : undefined,
      variants: form.variants.length > 0 ? form.variants : undefined,
      specs: form.specs.length > 0 ? form.specs : undefined,
      weight: form.weight,
      length: form.length,
      width: form.width,
      height: form.height,
      metaTitle: form.metaTitle || undefined,
      metaDescription: form.metaDescription || undefined,
      metaKeywords: form.metaKeywords || undefined,
      status,
      isFeatured: form.isFeatured,
      isBestseller: form.isBestseller,
      isNew: form.isNew,
    };
  };

  const save = async (publish: boolean = false) => {
    // Validate all critical steps
    for (let s = 1; s <= 4; s++) {
      const err = validateStep(s);
      if (err) {
        toast.error(err);
        setStep(s);
        return;
      }
    }
    setSaving(true);
    try {
      const status = publish ? 'ACTIVE' : 'DRAFT';
      const payload = buildPayload(status);
      if (isEdit) {
        await productService.update(id!, payload);
        toast.success(publish ? 'Product published!' : 'Draft saved');
      } else {
        await productService.create(payload);
        toast.success(publish ? 'Product created and published!' : 'Draft created');
      }
      navigate('/products');
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  // ─── Loading state ─────────────────────────────────────
  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in pb-24">
      <PageHeader
        title={isEdit ? `Edit: ${form.name || 'Product'}` : 'Add New Product'}
        description={isEdit ? `Product ID: ${id}` : 'Fill out the form to create a new product. All required fields are marked with *'}
        breadcrumbs={[
          { label: 'Catalog' },
          { label: 'Products', to: '/products' },
          { label: isEdit ? 'Edit' : 'New' },
        ]}
        actions={
          <>
            <Button variant="ghost" onClick={() => setShowCancel(true)}>Cancel</Button>
            <Button variant="secondary" leftIcon={Save} onClick={() => save(false)} loading={saving}>
              Save Draft
            </Button>
            <Button variant="primary" leftIcon={Send} onClick={() => save(true)} loading={saving}>
              {isEdit ? 'Update' : 'Publish'}
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
        {/* ─── Stepper sidebar ──────────────────────────── */}
        <Card className="self-start lg:sticky lg:top-24">
          <div className="p-4">
            <p className="text-2xs font-bold text-ink-500 uppercase tracking-wider mb-3">
              Wizard Steps
            </p>
            <ol className="space-y-0.5">
              {STEPS.map((s, i) => {
                const isCurrent = step === s.id;
                const isDone = completedSteps.has(s.id) && s.id !== step;
                const isAccessible = s.id < step || isDone || isCurrent;
                return (
                  <li key={s.id}>
                    <button
                      onClick={() => goToStep(s.id)}
                      disabled={!isAccessible && !isEdit}
                      className={clsx(
                        'w-full flex items-center gap-2.5 px-2.5 h-10 rounded-lg text-sm transition-all',
                        isCurrent
                          ? 'bg-accent-50 text-accent-700 font-semibold'
                          : isDone
                            ? 'text-ink-700 hover:bg-ink-50'
                            : 'text-ink-500 cursor-not-allowed',
                      )}
                    >
                      <span className={clsx(
                        'w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 text-2xs font-bold',
                        isCurrent
                          ? 'bg-accent-500 text-white'
                          : isDone
                            ? 'bg-success-500 text-white'
                            : 'bg-ink-200 text-ink-500',
                      )}>
                        {isDone ? <Check className="w-3 h-3" strokeWidth={3} /> : s.id}
                      </span>
                      <span className="truncate flex-1 text-left">{s.label}</span>
                      {isCurrent && <span className="w-1.5 h-1.5 rounded-pill bg-accent-500" />}
                    </button>
                  </li>
                );
              })}
            </ol>

            {/* Live status */}
            <div className="mt-4 pt-4 border-t border-ink-200 space-y-2">
              <p className="text-2xs font-bold text-ink-500 uppercase tracking-wider">
                Live Status
              </p>
              <div className="space-y-1.5">
                <StatusRow label="Status" value={form.status} variant={form.status === 'ACTIVE' ? 'success' : form.status === 'DRAFT' ? 'ink' : 'warning'} />
                <StatusRow label="Featured" value={form.isFeatured ? 'Yes' : 'No'} variant={form.isFeatured ? 'accent' : 'ink'} />
                <StatusRow label="Bestseller" value={form.isBestseller ? 'Yes' : 'No'} variant={form.isBestseller ? 'warning' : 'ink'} />
                <StatusRow label="New" value={form.isNew ? 'Yes' : 'No'} variant={form.isNew ? 'info' : 'ink'} />
                <StatusRow label="Images" value={`${form.images.length}/20`} variant={form.images.length > 0 ? 'success' : 'ink'} />
                <StatusRow label="Variants" value={`${form.variants.length}`} variant={form.variants.length > 0 ? 'success' : 'ink'} />
                <StatusRow label="Specs" value={`${form.specs.length}`} variant={form.specs.length > 0 ? 'success' : 'ink'} />
              </div>
            </div>
          </div>
        </Card>

        {/* ─── Step content ─────────────────────────────── */}
        <Card className="overflow-hidden">
          {/* Step header */}
          <div className="px-6 py-4 border-b border-ink-200 bg-gradient-to-r from-ink-50/60 to-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent-50 text-accent-600 flex items-center justify-center">
                {(() => {
                  const StepIcon = STEPS[step - 1].icon;
                  return <StepIcon className="w-5 h-5" strokeWidth={2.25} />;
                })()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-2xs font-bold text-ink-500 uppercase tracking-wider">
                  Step {step} of {STEPS.length}
                </p>
                <h2 className="text-lg font-bold text-ink-900">{STEPS[step - 1].label}</h2>
              </div>
              <Badge variant="ink">{Math.round((step / STEPS.length) * 100)}% complete</Badge>
            </div>
            {/* Progress bar */}
            <div className="mt-3 h-1.5 bg-ink-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-accent-400 to-accent-600 rounded-full transition-all duration-500"
                style={{ width: `${(step / STEPS.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Step body */}
          <div className="p-6 lg:p-8 min-h-[400px]">
            {step === 1 && <Step1 form={form} setForm={setForm} touched={touched} setTouched={setTouched} />}
            {step === 2 && <Step2 form={form} setForm={setForm} categories={categories} />}
            {step === 3 && <Step3 form={form} setForm={setForm} />}
            {step === 4 && <Step4 form={form} setForm={setForm} />}
            {step === 5 && <Step5 form={form} setForm={setForm} />}
            {step === 6 && <Step6 form={form} setForm={setForm} />}
            {step === 7 && <Step7 form={form} setForm={setForm} />}
            {step === 8 && <Step8 form={form} setForm={setForm} />}
            {step === 9 && <Step9 form={form} setForm={setForm} />}
            {step === 10 && <Step10 form={form} setForm={setForm} categories={categories} />}
          </div>

          {/* Footer nav */}
          <div className="px-6 py-4 border-t border-ink-200 bg-ink-50/40 flex items-center justify-between">
            <Button variant="ghost" onClick={goBack} disabled={step === 1} leftIcon={ChevronLeft}>
              Previous
            </Button>
            <div className="flex items-center gap-2">
              <Button variant="secondary" onClick={() => save(false)} loading={saving} leftIcon={Save}>
                Save Draft
              </Button>
              {step < STEPS.length ? (
                <Button variant="primary" onClick={goNext} rightIcon={ChevronRight}>
                  Next Step
                </Button>
              ) : (
                <Button variant="primary" onClick={() => save(true)} loading={saving} leftIcon={Send}>
                  {isEdit ? 'Update Product' : 'Publish Product'}
                </Button>
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* Cancel confirmation */}
      <ConfirmDialog
        open={showCancel}
        onClose={() => setShowCancel(false)}
        onConfirm={() => navigate('/products')}
        title="Discard changes?"
        description="Your unsaved changes will be lost."
        confirmText="Discard"
        cancelText="Keep editing"
        variant="danger"
      />
    </div>
  );
}

function StatusRow({ label, value, variant }: { label: string; value: string; variant: any }) {
  return (
    <div className="flex items-center justify-between text-xs">
      <span className="text-ink-500">{label}</span>
      <Badge variant={variant}>{value}</Badge>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// STEP 1 — Basic Info
// ════════════════════════════════════════════════════════════
function Step1({ form, setForm, touched, setTouched }: any) {
  return (
    <div className="space-y-5 max-w-2xl">
      <Field label="Product Name" required help="What customers see on the product page">
        <input
          type="text"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          onBlur={() => setTouched({ ...touched, name: true })}
          className="input input-lg"
          placeholder="e.g. Portland Pozzolana Cement 50kg"
          maxLength={200}
        />
        <div className="text-2xs text-ink-400 mt-1 text-right">{form.name.length}/200</div>
      </Field>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="URL Slug" help="Auto-generated from name. Used in product URL.">
          <div className="flex">
            <span className="inline-flex items-center px-3 h-10 text-xs text-ink-500 bg-ink-50 border border-r-0 border-ink-200 rounded-l-xl font-mono">
              /products/
            </span>
            <input
              type="text"
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
              className="input rounded-l-none font-mono text-sm"
              placeholder="portland-pozzolana-cement-50kg"
              maxLength={200}
            />
          </div>
        </Field>

        <Field label="SKU" help="Stock Keeping Unit (optional)">
          <input
            type="text"
            value={form.sku}
            onChange={(e) => setForm({ ...form, sku: e.target.value })}
            className="input font-mono"
            placeholder="CEM-PPC-50-001"
            maxLength={80}
          />
        </Field>
      </div>

      <Field label="Short Description" help="Shown in product cards and search results (max 500)">
        <textarea
          value={form.shortDesc}
          onChange={(e) => setForm({ ...form, shortDesc: e.target.value })}
          className="input min-h-[80px] py-2"
          placeholder="Premium quality Portland Pozzolana Cement, 50kg bag, ISI certified…"
          rows={3}
          maxLength={500}
        />
        <div className="text-2xs text-ink-400 mt-1 text-right">{form.shortDesc.length}/500</div>
      </Field>

      <Field label="Full Description" required help="Detailed product information (supports plain text)">
        <textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="input min-h-[200px] py-3 font-mono text-sm"
          placeholder="Detailed product description with specifications, applications, features…"
          rows={10}
          maxLength={5000}
        />
        <div className="text-2xs text-ink-400 mt-1 text-right">{form.description.length}/5000</div>
      </Field>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// STEP 2 — Category & Brand
// ════════════════════════════════════════════════════════════
function Step2({ form, setForm, categories }: any) {
  const [tagInput, setTagInput] = useState('');

  const addTag = (tag: string) => {
    const t = tag.trim().toLowerCase();
    if (t && !form.tags.includes(t) && form.tags.length < 10) {
      setForm({ ...form, tags: [...form.tags, t] });
    }
    setTagInput('');
  };

  const removeTag = (tag: string) => {
    setForm({ ...form, tags: form.tags.filter((t: string) => t !== tag) });
  };

  const selectedCategory = ((categories as Category[]) || []).find((c: Category) => c.id === form.categoryId);

  return (
    <div className="space-y-5 max-w-2xl">
      <Field label="Category" required>
        <div className="space-y-2">
          {categories.length === 0 ? (
            <Skeleton className="h-10 w-full" />
          ) : (
            <>
              <select
                value={form.categoryId}
                onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                className="input"
              >
                <option value="">Select a category…</option>
                {categories.map((c: Category) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              {selectedCategory && (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-ink-50/60 border border-ink-200/60">
                  <div className="w-12 h-12 rounded-xl bg-white ring-1 ring-ink-200 overflow-hidden flex-shrink-0">
                    {selectedCategory.imageUrl ? (
                      <img src={selectedCategory.imageUrl} alt={selectedCategory.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Tag className="w-4 h-4 text-ink-400" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-sm text-ink-900">{selectedCategory.name}</p>
                    <p className="text-xs text-ink-500 truncate">{selectedCategory.description || 'No description'}</p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </Field>

      <Field label="Brand" help="Optional — leave empty if not branded">
        <input
          type="text"
          value={form.brandId}
          onChange={(e) => setForm({ ...form, brandId: e.target.value })}
          className="input"
          placeholder="Brand name or ID (backend doesn't have brands yet)"
          disabled
        />
        <p className="text-2xs text-ink-500 mt-1.5 flex items-center gap-1">
          <Info className="w-3 h-3" />
          Brand management coming soon
        </p>
      </Field>

      <Field label="Tags" help="Up to 10 tags. Used for search and filtering.">
        <div className="input p-2 flex items-center flex-wrap gap-1.5 min-h-[42px]">
          {form.tags.map((tag: string) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 bg-accent-50 text-accent-700 text-xs font-medium px-2 h-6 rounded-pill"
            >
              {tag}
              <button
                onClick={() => removeTag(tag)}
                className="hover:bg-accent-100 rounded-pill p-0.5"
                aria-label={`Remove ${tag}`}
              >
                <X className="w-2.5 h-2.5" />
              </button>
            </span>
          ))}
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ',') {
                e.preventDefault();
                addTag(tagInput);
              } else if (e.key === 'Backspace' && !tagInput && form.tags.length > 0) {
                removeTag(form.tags[form.tags.length - 1]);
              }
            }}
            className="flex-1 min-w-[120px] bg-transparent border-0 outline-none text-sm placeholder:text-ink-400 px-1"
            placeholder={form.tags.length === 0 ? 'Add tags (press Enter to add)' : ''}
          />
        </div>
        <p className="text-2xs text-ink-500 mt-1.5">Press Enter or comma to add. {form.tags.length}/10 tags.</p>
      </Field>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// STEP 3 — Pricing
// ════════════════════════════════════════════════════════════
function Step3({ form, setForm }: any) {
  const mrp = parseFloat(form.mrp) || 0;
  const selling = parseFloat(form.sellingPrice) || 0;
  const cost = parseFloat(form.costPrice) || 0;
  const discount = mrp > 0 ? Math.max(0, mrp - selling) : 0;
  const discountPercent = mrp > 0 ? Math.round((discount / mrp) * 100) : 0;
  const margin = cost > 0 ? Math.round(((selling - cost) / selling) * 100) : 0;
  const gstAmount = selling * (form.gstPercent / 100);
  const finalPrice = selling + gstAmount;

  return (
    <div className="space-y-5 max-w-2xl">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="MRP" required help="Maximum Retail Price (₹)" suffix="₹">
          <input
            type="number"
            value={form.mrp}
            onChange={(e) => setForm({ ...form, mrp: e.target.value })}
            className="input tabular-nums"
            placeholder="0.00"
            step="0.01"
            min="0"
          />
        </Field>

        <Field label="Selling Price" required help="What customers actually pay (₹)" suffix="₹">
          <input
            type="number"
            value={form.sellingPrice}
            onChange={(e) => setForm({ ...form, sellingPrice: e.target.value })}
            className="input tabular-nums"
            placeholder="0.00"
            step="0.01"
            min="0"
          />
        </Field>

        <Field label="Cost Price" help="What you pay (for margin calculation)">
          <input
            type="number"
            value={form.costPrice}
            onChange={(e) => setForm({ ...form, costPrice: e.target.value })}
            className="input tabular-nums"
            placeholder="0.00"
            step="0.01"
            min="0"
          />
        </Field>

        <Field label="GST %" help="Goods & Services Tax percentage">
          <select
            value={form.gstPercent}
            onChange={(e) => setForm({ ...form, gstPercent: parseFloat(e.target.value) })}
            className="input"
          >
            <option value="0">0% (Exempt)</option>
            <option value="5">5%</option>
            <option value="12">12%</option>
            <option value="18">18% (Standard)</option>
            <option value="28">28%</option>
            <option value="40">40% (Luxury)</option>
          </select>
        </Field>
      </div>

      {/* Live price calculator */}
      {selling > 0 && (
        <div className="rounded-2xl border border-accent-200 bg-gradient-to-br from-accent-50/50 to-info-subtle/30 p-5 space-y-2.5">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-accent-500" />
            <p className="text-sm font-semibold text-ink-900">Price Calculator</p>
          </div>
          <PriceRow label="MRP" value={formatCurrency(mrp)} />
          <PriceRow label="Selling Price" value={formatCurrency(selling)} />
          {discount > 0 && (
            <PriceRow
              label="Discount"
              value={`− ${formatCurrency(discount)} (${discountPercent}% off)`}
              color="success"
            />
          )}
          {form.gstPercent > 0 && (
            <PriceRow label={`GST (${form.gstPercent}%)`} value={`+ ${formatCurrency(gstAmount)}`} color="info" />
          )}
          <div className="border-t border-ink-200 pt-2 mt-2">
            <PriceRow label="Customer pays" value={formatCurrency(finalPrice)} emphasis />
          </div>
          {cost > 0 && margin !== 0 && (
            <div className="border-t border-ink-200 pt-2 mt-2">
              <PriceRow
                label="Your margin"
                value={`${margin > 0 ? '+' : ''}${margin}% (${formatCurrency(selling - cost)})`}
                color={margin > 0 ? 'success' : 'danger'}
                emphasis
              />
            </div>
          )}
        </div>
      )}

      {selling > mrp && mrp > 0 && (
        <div className="rounded-xl border border-danger-200 bg-danger-50/50 p-3 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-danger-600 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-danger-700">Selling price cannot exceed MRP. Adjust either value.</p>
        </div>
      )}
    </div>
  );
}

function PriceRow({ label, value, color, emphasis }: { label: string; value: string; color?: 'success' | 'danger' | 'info'; emphasis?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className={clsx('text-sm', emphasis ? 'font-semibold text-ink-900' : 'text-ink-600')}>{label}</span>
      <span className={clsx(
        'tabular-nums',
        emphasis ? 'text-lg font-bold text-ink-900' : 'text-sm font-semibold',
        color === 'success' && 'text-success-700',
        color === 'danger' && 'text-danger-700',
        color === 'info' && 'text-info-700',
      )}>
        {value}
      </span>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// STEP 4 — Inventory
// ════════════════════════════════════════════════════════════
function Step4({ form, setForm }: any) {
  const UNITS = ['piece', 'kg', 'gram', 'liter', 'ml', 'meter', 'sqft', 'cubic-meter', 'bag', 'box', 'ton', 'dozen', 'pair', 'set'];

  return (
    <div className="space-y-5 max-w-2xl">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Stock Quantity" required>
          <input
            type="number"
            value={form.stock}
            onChange={(e) => setForm({ ...form, stock: parseInt(e.target.value) || 0 })}
            className="input tabular-nums"
            min="0"
          />
        </Field>

        <Field label="Unit" required help="Measurement unit (e.g. kg, piece, bag)">
          <select
            value={form.unit}
            onChange={(e) => setForm({ ...form, unit: e.target.value })}
            className="input"
          >
            {UNITS.map((u) => (
              <option key={u} value={u}>{u}</option>
            ))}
          </select>
        </Field>

        <Field label="Min Order Qty" help="Minimum customer order quantity">
          <input
            type="number"
            value={form.minOrderQty}
            onChange={(e) => setForm({ ...form, minOrderQty: parseInt(e.target.value) || 1 })}
            className="input tabular-nums"
            min="1"
          />
        </Field>

        <Field label="Max Order Qty" help="Optional maximum order quantity">
          <input
            type="number"
            value={form.maxOrderQty || ''}
            onChange={(e) => setForm({ ...form, maxOrderQty: e.target.value ? parseInt(e.target.value) : undefined })}
            className="input tabular-nums"
            min="1"
            placeholder="No max"
          />
        </Field>
      </div>

      <div className="rounded-xl border border-info-200 bg-info-subtle/30 p-4 flex items-start gap-3">
        <Info className="w-4 h-4 text-info-600 mt-0.5 flex-shrink-0" />
        <div className="text-sm text-ink-700">
          <p className="font-semibold mb-1">Inventory Tips</p>
          <ul className="text-xs space-y-0.5 list-disc list-inside text-ink-600">
            <li>When stock reaches 0, product auto-set to OUT_OF_STOCK</li>
            <li>Low stock alert shown in dashboard at ≤10 units</li>
            <li>Update stock anytime from product list with quick action</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// STEP 5 — Images
// ════════════════════════════════════════════════════════════
function Step5({ form, setForm }: any) {
  const [urlInput, setUrlInput] = useState('');
  const [altInput, setAltInput] = useState('');

  const addImage = () => {
    const url = urlInput.trim();
    if (!url) return;
    if (form.images.length >= 20) { toast.error('Maximum 20 images'); return; }
    setForm({
      ...form,
      images: [
        ...form.images,
        {
          url,
          alt: altInput || undefined,
          isPrimary: form.images.length === 0,
          sortOrder: form.images.length,
        },
      ],
    });
    setUrlInput('');
    setAltInput('');
  };

  const removeImage = (index: number) => {
    const next = form.images.filter((_: any, i: number) => i !== index);
    // Re-assign primary if needed
    if (next.length > 0 && !next.some((img: any) => img.isPrimary)) {
      next[0].isPrimary = true;
    }
    setForm({ ...form, images: next });
  };

  const setPrimary = (index: number) => {
    const next = form.images.map((img: any, i: number) => ({ ...img, isPrimary: i === index }));
    setForm({ ...form, images: next });
  };

  const moveImage = (index: number, direction: -1 | 1) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= form.images.length) return;
    const next = [...form.images];
    [next[index], next[newIndex]] = [next[newIndex], next[index]];
    // Re-assign sortOrder
    next.forEach((img, i) => { img.sortOrder = i; });
    setForm({ ...form, images: next });
  };

  return (
    <div className="space-y-5 max-w-3xl">
      {/* Add image form */}
      <Card>
        <CardBody className="space-y-3">
          <p className="text-sm font-semibold text-ink-900">Add Image</p>
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_200px_auto] gap-2">
            <input
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              className="input"
              placeholder="https://images.example.com/product.jpg"
            />
            <input
              type="text"
              value={altInput}
              onChange={(e) => setAltInput(e.target.value)}
              className="input"
              placeholder="Alt text (for SEO)"
            />
            <Button variant="primary" leftIcon={Plus} onClick={addImage}>Add</Button>
          </div>
          <p className="text-2xs text-ink-500 flex items-center gap-1">
            <Info className="w-3 h-3" />
            Tip: First image is the primary thumbnail. Drag-and-drop DAM coming in Part 2A-2B.
          </p>
        </CardBody>
      </Card>

      {/* Image grid */}
      {form.images.length === 0 ? (
        <EmptyState
          icon={ImageIcon}
          title="No images yet"
          description="Add image URLs above. The first image will be the primary thumbnail shown in product listings."
        />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {form.images.map((img: any, i: number) => (
            <div
              key={i}
              className={clsx(
                'group/img relative aspect-square rounded-2xl overflow-hidden bg-ink-100 ring-2',
                img.isPrimary ? 'ring-accent-500' : 'ring-transparent hover:ring-ink-300',
              )}
            >
              <img src={img.url} alt={img.alt || `Image ${i + 1}`} className="w-full h-full object-cover" />

              {/* Top-left primary badge */}
              {img.isPrimary && (
                <span className="absolute top-2 left-2 bg-accent-500 text-white text-2xs font-bold px-1.5 h-5 rounded inline-flex items-center">
                  PRIMARY
                </span>
              )}

              {/* Top-right actions */}
              <div className="absolute top-1.5 right-1.5 opacity-0 group-hover/img:opacity-100 transition-opacity flex flex-col gap-1">
                <button
                  onClick={() => removeImage(i)}
                  className="w-7 h-7 rounded-md bg-danger-500 text-white flex items-center justify-center shadow-md hover:bg-danger-600"
                  aria-label="Delete"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Bottom controls */}
              <div className="absolute bottom-1.5 left-1.5 right-1.5 flex items-center justify-between gap-1 opacity-0 group-hover/img:opacity-100 transition-opacity">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => moveImage(i, -1)}
                    disabled={i === 0}
                    className="w-7 h-7 rounded-md bg-white/90 backdrop-blur-sm text-ink-700 flex items-center justify-center shadow-md disabled:opacity-30"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => moveImage(i, 1)}
                    disabled={i === form.images.length - 1}
                    className="w-7 h-7 rounded-md bg-white/90 backdrop-blur-sm text-ink-700 flex items-center justify-center shadow-md disabled:opacity-30"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                </div>
                {!img.isPrimary && (
                  <button
                    onClick={() => setPrimary(i)}
                    className="text-2xs font-bold bg-white/90 backdrop-blur-sm text-ink-900 px-2 h-6 rounded inline-flex items-center gap-1 shadow-md hover:bg-white"
                  >
                    <Star className="w-2.5 h-2.5" fill="currentColor" /> Set primary
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-ink-500 flex items-center gap-1.5">
        <Hash className="w-3.5 h-3.5" />
        {form.images.length}/20 images · First is shown as primary thumbnail
      </p>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// STEP 6 — Variants
// ════════════════════════════════════════════════════════════
function Step6({ form, setForm }: any) {
  const addVariant = () => {
    setForm({
      ...form,
      variants: [
        ...form.variants,
        {
          name: '',
          sku: '',
          mrp: form.mrp,
          sellingPrice: form.sellingPrice,
          stock: 0,
          unit: form.unit,
        },
      ],
    });
  };

  const updateVariant = (index: number, field: string, value: any) => {
    const next = form.variants.map((v: any, i: number) =>
      i === index ? { ...v, [field]: value } : v
    );
    setForm({ ...form, variants: next });
  };

  const removeVariant = (index: number) => {
    setForm({
      ...form,
      variants: form.variants.filter((_: any, i: number) => i !== index),
    });
  };

  return (
    <div className="space-y-5 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-ink-900">Product Variants</p>
          <p className="text-xs text-ink-500 mt-0.5">
            Add size, color, or material variations. Each variant can have its own price and stock.
          </p>
        </div>
        <Button variant="primary" leftIcon={Plus} onClick={addVariant}>Add Variant</Button>
      </div>

      {form.variants.length === 0 ? (
        <EmptyState
          icon={Layers}
          title="No variants yet"
          description="Use variants if your product comes in different sizes, colors, or materials. Each variant can have its own SKU, price, and stock level."
          action={
            <Button variant="primary" leftIcon={Plus} onClick={addVariant}>Add First Variant</Button>
          }
        />
      ) : (
        <div className="space-y-2">
          {form.variants.map((v: any, i: number) => (
            <Card key={i}>
              <CardBody className="p-4">
                <div className="grid grid-cols-1 sm:grid-cols-6 gap-3">
                  <div className="sm:col-span-2">
                    <label className="label">Name</label>
                    <input
                      type="text"
                      value={v.name}
                      onChange={(e) => updateVariant(i, 'name', e.target.value)}
                      className="input"
                      placeholder="e.g. Red / Large"
                    />
                  </div>
                  <div>
                    <label className="label">SKU</label>
                    <input
                      type="text"
                      value={v.sku}
                      onChange={(e) => updateVariant(i, 'sku', e.target.value)}
                      className="input font-mono"
                      placeholder="SKU-001"
                    />
                  </div>
                  <div>
                    <label className="label">MRP (₹)</label>
                    <input
                      type="number"
                      value={v.mrp}
                      onChange={(e) => updateVariant(i, 'mrp', e.target.value)}
                      className="input tabular-nums"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <label className="label">Price (₹)</label>
                    <input
                      type="number"
                      value={v.sellingPrice}
                      onChange={(e) => updateVariant(i, 'sellingPrice', e.target.value)}
                      className="input tabular-nums"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <label className="label">Stock</label>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        value={v.stock}
                        onChange={(e) => updateVariant(i, 'stock', parseInt(e.target.value) || 0)}
                        className="input tabular-nums"
                        min="0"
                      />
                      <button
                        onClick={() => removeVariant(i)}
                        className="w-10 h-10 rounded-lg text-danger-600 hover:bg-danger-50 flex items-center justify-center"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// STEP 7 — Specifications
// ════════════════════════════════════════════════════════════
function Step7({ form, setForm }: any) {
  const SUGGESTIONS = [
    { key: 'Material', value: '' },
    { key: 'Color', value: '' },
    { key: 'Size', value: '' },
    { key: 'Weight', value: '' },
    { key: 'Capacity', value: '' },
    { key: 'Warranty', value: '' },
    { key: 'Origin', value: '' },
    { key: 'Brand', value: '' },
  ];

  const addSpec = (key = '', value = '') => {
    setForm({
      ...form,
      specs: [
        ...form.specs,
        { key, value, sortOrder: form.specs.length },
      ],
    });
  };

  const updateSpec = (index: number, field: 'key' | 'value', val: string) => {
    const next = form.specs.map((s: any, i: number) =>
      i === index ? { ...s, [field]: val } : s
    );
    setForm({ ...form, specs: next });
  };

  const removeSpec = (index: number) => {
    setForm({
      ...form,
      specs: form.specs.filter((_: any, i: number) => i !== index),
    });
  };

  return (
    <div className="space-y-5 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-ink-900">Product Specifications</p>
          <p className="text-xs text-ink-500 mt-0.5">
            Add key-value pairs shown in the specs table on the product page.
          </p>
        </div>
        <Button variant="primary" leftIcon={Plus} onClick={() => addSpec()}>Add Spec</Button>
      </div>

      {form.specs.length === 0 ? (
        <div className="space-y-2">
          <EmptyState
            icon={Ruler}
            title="No specifications yet"
            description="Add technical details shown in the product specifications table."
          />
          <div className="flex flex-wrap gap-1.5 justify-center">
            {SUGGESTIONS.map((s) => (
              <button
                key={s.key}
                onClick={() => addSpec(s.key, '')}
                className="text-xs px-2.5 h-7 rounded-pill bg-ink-100 hover:bg-ink-200 text-ink-700"
              >
                + {s.key}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {form.specs.map((s: any, i: number) => (
            <div key={i} className="flex items-center gap-2">
              <input
                type="text"
                value={s.key}
                onChange={(e) => updateSpec(i, 'key', e.target.value)}
                className="input flex-1"
                placeholder="Key (e.g. Material)"
              />
              <span className="text-ink-400">:</span>
              <input
                type="text"
                value={s.value}
                onChange={(e) => updateSpec(i, 'value', e.target.value)}
                className="input flex-[2]"
                placeholder="Value (e.g. Portland Cement)"
              />
              <button
                onClick={() => removeSpec(i)}
                className="w-10 h-10 rounded-lg text-danger-600 hover:bg-danger-50 flex items-center justify-center"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// STEP 8 — Shipping
// ════════════════════════════════════════════════════════════
function Step8({ form, setForm }: any) {
  return (
    <div className="space-y-5 max-w-2xl">
      <div>
        <p className="text-sm font-semibold text-ink-900">Shipping Details</p>
        <p className="text-xs text-ink-500 mt-0.5">
          Used to calculate shipping cost and display product dimensions.
        </p>
      </div>

      <Field label="Weight" help="In kilograms (kg)">
        <div className="relative">
          <input
            type="number"
            value={form.weight || ''}
            onChange={(e) => setForm({ ...form, weight: e.target.value ? parseFloat(e.target.value) : undefined })}
            className="input pr-12 tabular-nums"
            step="0.01"
            min="0"
            placeholder="0.00"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-ink-500 pointer-events-none">kg</span>
        </div>
      </Field>

      <div>
        <p className="label">Dimensions (cm)</p>
        <div className="grid grid-cols-3 gap-2">
          <div>
            <input
              type="number"
              value={form.length || ''}
              onChange={(e) => setForm({ ...form, length: e.target.value ? parseFloat(e.target.value) : undefined })}
              className="input tabular-nums"
              step="0.1"
              min="0"
              placeholder="L"
            />
            <p className="text-2xs text-ink-500 mt-1 text-center">Length</p>
          </div>
          <div>
            <input
              type="number"
              value={form.width || ''}
              onChange={(e) => setForm({ ...form, width: e.target.value ? parseFloat(e.target.value) : undefined })}
              className="input tabular-nums"
              step="0.1"
              min="0"
              placeholder="W"
            />
            <p className="text-2xs text-ink-500 mt-1 text-center">Width</p>
          </div>
          <div>
            <input
              type="number"
              value={form.height || ''}
              onChange={(e) => setForm({ ...form, height: e.target.value ? parseFloat(e.target.value) : undefined })}
              className="input tabular-nums"
              step="0.1"
              min="0"
              placeholder="H"
            />
            <p className="text-2xs text-ink-500 mt-1 text-center">Height</p>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-warning-200 bg-warning-50/50 p-4 flex items-start gap-3">
        <Info className="w-4 h-4 text-warning-600 mt-0.5 flex-shrink-0" />
        <div className="text-sm text-ink-700">
          <p className="font-semibold mb-1">Shipping Calculation</p>
          <p className="text-xs text-ink-600">
            Volumetric weight is calculated as (L × W × H) / 5000.
            Shipping cost is based on max(actual_weight, volumetric_weight).
          </p>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// STEP 9 — SEO
// ════════════════════════════════════════════════════════════
function Step9({ form, setForm }: any) {
  const titleLen = form.metaTitle.length;
  const descLen = form.metaDescription.length;
  return (
    <div className="space-y-5 max-w-2xl">
      <div>
        <p className="text-sm font-semibold text-ink-900">Search Engine Optimization</p>
        <p className="text-xs text-ink-500 mt-0.5">
          Improve how your product appears in search results.
        </p>
      </div>

      <Field
        label="Meta Title"
        help={`${titleLen}/200 characters — Recommended 50-60`}
      >
        <input
          type="text"
          value={form.metaTitle}
          onChange={(e) => setForm({ ...form, metaTitle: e.target.value })}
          className="input"
          placeholder="Buy Premium Portland Cement 50kg | ASIF TRADERS"
          maxLength={200}
        />
        <div className="h-1 bg-ink-100 rounded-full mt-1.5 overflow-hidden">
          <div
            className={clsx(
              'h-full transition-all',
              titleLen > 60 ? 'bg-warning-500' : 'bg-success-500',
            )}
            style={{ width: `${Math.min(100, (titleLen / 200) * 100)}%` }}
          />
        </div>
      </Field>

      <Field
        label="Meta Description"
        help={`${descLen}/500 characters — Recommended 150-160`}
      >
        <textarea
          value={form.metaDescription}
          onChange={(e) => setForm({ ...form, metaDescription: e.target.value })}
          className="input min-h-[100px] py-2"
          placeholder="Shop premium quality Portland Pozzolana Cement, 50kg bag, ISI certified. Free delivery on orders above ₹5000…"
          rows={4}
          maxLength={500}
        />
        <div className="h-1 bg-ink-100 rounded-full mt-1.5 overflow-hidden">
          <div
            className={clsx(
              'h-full transition-all',
              descLen > 160 ? 'bg-warning-500' : 'bg-success-500',
            )}
            style={{ width: `${Math.min(100, (descLen / 500) * 100)}%` }}
          />
        </div>
      </Field>

      <Field label="Meta Keywords" help="Comma-separated keywords (max 200 chars)">
        <input
          type="text"
          value={form.metaKeywords}
          onChange={(e) => setForm({ ...form, metaKeywords: e.target.value })}
          className="input"
          placeholder="cement, portland, building materials, construction"
          maxLength={200}
        />
      </Field>

      {/* SERP preview */}
      <div className="rounded-2xl border border-ink-200 bg-white p-5 space-y-1">
        <p className="text-2xs font-bold text-ink-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Eye className="w-3 h-3" />
          Google Search Preview
        </p>
        <p className="text-xs text-ink-500 truncate">
          asiftraders.com › products › {form.slug || 'product-name'}
        </p>
        <p className="text-base font-semibold text-info-700 line-clamp-1">
          {form.metaTitle || form.name || 'Product Title'}
        </p>
        <p className="text-xs text-ink-600 line-clamp-2">
          {form.metaDescription || form.shortDesc || 'Product description will appear here…'}
        </p>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// STEP 10 — Visibility & Status
// ════════════════════════════════════════════════════════════
function Step10({ form, setForm, categories }: any) {
  const STATUS_OPTIONS = [
    { value: 'DRAFT',        label: 'Draft',        desc: 'Not visible to customers. Only you can see it.',  color: 'ink' as const,     icon: Edit2 },
    { value: 'ACTIVE',       label: 'Active',       desc: 'Live and visible to all customers.',             color: 'success' as const,icon: CheckCircle2 },
    { value: 'OUT_OF_STOCK', label: 'Out of Stock', desc: 'Visible but customers can\'t order. Restock soon.', color: 'warning' as const, icon: Archive },
    { value: 'ARCHIVED',     label: 'Archived',     desc: 'Hidden from catalog. Can be restored later.',    color: 'danger' as const,  icon: Archive },
  ];

  const FLAGS = [
    { key: 'isFeatured',   label: 'Featured',   desc: 'Show in homepage featured section',  icon: Star,       color: 'text-accent-500' },
    { key: 'isBestseller', label: 'Bestseller', desc: 'Show in bestseller listings',         icon: TrendingUp, color: 'text-warning-500' },
    { key: 'isNew',        label: 'New Arrival',desc: 'Add "New" badge on product card',     icon: Sparkles,   color: 'text-info-500' },
  ];

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <p className="text-sm font-semibold text-ink-900">Product Status</p>
        <p className="text-xs text-ink-500 mt-0.5">
          Controls visibility and availability in the storefront.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {STATUS_OPTIONS.map((opt) => {
          const Icon = opt.icon;
          const isSelected = form.status === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => setForm({ ...form, status: opt.value as any })}
              className={clsx(
                'text-left p-4 rounded-2xl border-2 transition-all',
                isSelected
                  ? 'border-accent-500 bg-accent-50/50 shadow-sm'
                  : 'border-ink-200 hover:border-ink-300 bg-white',
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Icon className={clsx(
                    'w-4 h-4',
                    opt.color === 'success' && 'text-success-600',
                    opt.color === 'warning' && 'text-warning-600',
                    opt.color === 'danger' && 'text-danger-600',
                    opt.color === 'ink' && 'text-ink-500',
                  )} />
                  <p className="font-semibold text-sm text-ink-900">{opt.label}</p>
                </div>
                {isSelected && (
                  <Check className="w-4 h-4 text-accent-600" strokeWidth={3} />
                )}
              </div>
              <p className="text-xs text-ink-500 mt-1.5">{opt.desc}</p>
            </button>
          );
        })}
      </div>

      <div>
        <p className="text-sm font-semibold text-ink-900 mb-2">Marketing Flags</p>
        <p className="text-xs text-ink-500 mb-3">
          Highlight this product in special sections.
        </p>
        <div className="space-y-2">
          {FLAGS.map((f) => {
            const Icon = f.icon;
            const active = (form as any)[f.key];
            return (
              <button
                key={f.key}
                onClick={() => setForm({ ...form, [f.key]: !active })}
                className={clsx(
                  'w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left',
                  active
                    ? 'border-accent-500 bg-accent-50/50'
                    : 'border-ink-200 hover:border-ink-300 bg-white',
                )}
              >
                <div className={clsx(
                  'w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0',
                  active ? 'bg-accent-100' : 'bg-ink-100',
                )}>
                  <Icon className={clsx('w-4 h-4', active ? f.color : 'text-ink-400')} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-ink-900">{f.label}</p>
                  <p className="text-xs text-ink-500">{f.desc}</p>
                </div>
                <div className={clsx(
                  'w-10 h-6 rounded-pill transition-colors relative',
                  active ? 'bg-accent-500' : 'bg-ink-200',
                )}>
                  <span className={clsx(
                    'absolute top-0.5 w-5 h-5 bg-white rounded-pill shadow-sm transition-transform',
                    active ? 'translate-x-[18px]' : 'translate-x-0.5',
                  )} />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Final summary */}
      <Card>
        <CardHeader title="Ready to Publish?" description="Review your product before going live" />
        <CardBody className="grid grid-cols-2 gap-4">
          <SummaryRow label="Name" value={form.name || '—'} />
          <SummaryRow label="Status" value={form.status} variant={form.status === 'ACTIVE' ? 'success' : 'ink'} />
          <SummaryRow label="Category" value={((categories as Category[]) || []).find((c: Category) => c.id === form.categoryId)?.name || '—'} />
          <SummaryRow label="Price" value={form.sellingPrice ? formatCurrency(parseFloat(form.sellingPrice)) : '—'} />
          <SummaryRow label="Stock" value={`${form.stock} ${form.unit}`} />
          <SummaryRow label="Images" value={`${form.images.length}`} />
        </CardBody>
      </Card>
    </div>
  );
}

function SummaryRow({ label, value, variant }: { label: string; value: string; variant?: any }) {
  return (
    <div>
      <p className="text-2xs font-bold text-ink-500 uppercase tracking-wider">{label}</p>
      {variant ? (
        <Badge variant={variant} className="mt-1">{value}</Badge>
      ) : (
        <p className="text-sm font-semibold text-ink-900 mt-1">{value}</p>
      )}
    </div>
  );
}

// ─── Generic field wrapper ──────────────────────────────────
function Field({
  label, required, help, children, suffix,
}: {
  label: string;
  required?: boolean;
  help?: React.ReactNode;
  children: React.ReactNode;
  suffix?: string;
}) {
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

// Local re-imports
void Modal;
void Ruler;
void Send;
void Heart;
void Zap;
void RotateCcw;
void GripVertical;
void useRef;
