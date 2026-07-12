// ────────────────────────────────────────────────────────────
// Admin Frontend — Type Definitions
// ────────────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  role: string;
  roleId: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'PENDING_VERIFICATION' | 'DELETED';
  emailVerified: boolean;
  lastLoginAt?: string;
  createdAt: string;
  _count?: {
    orders: number;
    quotes: number;
    addresses: number;
  };
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  icon?: string;
  parentId?: string | null;
  sortOrder: number;
  isActive: boolean;
  metaTitle?: string;
  metaDescription?: string;
  createdAt: string;
  updatedAt: string;
  parent?: { id: string; name: string; slug: string };
  children?: Array<{ id: string; name: string; slug: string; isActive: boolean }>;
  _count?: { products: number; children: number };
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  sku?: string;
  description?: string;
  shortDesc?: string;
  categoryId: string;
  brandId?: string;
  mrp: string;
  sellingPrice: string;
  gstPercent: number;
  stock: number;
  unit: string;
  minOrderQty: number;
  maxOrderQty?: number;
  status: 'DRAFT' | 'ACTIVE' | 'OUT_OF_STOCK' | 'ARCHIVED';
  isFeatured: boolean;
  isBestseller: boolean;
  isNew: boolean;
  weight?: number;
  length?: number;
  width?: number;
  height?: number;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  createdAt: string;
  updatedAt: string;
  category?: { id: string; name: string; slug: string };
  brand?: { id: string; name: string; slug: string };
  images?: Array<{ id: string; url: string; alt?: string; isPrimary: boolean; sortOrder: number }>;
  specs?: Array<{ id: string; key: string; value: string; sortOrder: number }>;
  variants?: Array<{
    id: string;
    name: string;
    sku?: string;
    mrp: string;
    sellingPrice: string;
    stock: number;
    unit: string;
    isActive: boolean;
  }>;
  _count?: { variants: number; reviews: number };
}

export interface Quote {
  id: string;
  quoteNumber: string;
  status: 'DRAFT' | 'SUBMITTED' | 'REVIEWED' | 'QUOTED' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED' | 'CONVERTED';
  userId?: string;
  name: string;
  email: string;
  phone: string;
  company?: string;
  gstin?: string;
  subject: string;
  message: string;
  productInterest?: string;
  quantityNeeded?: number;
  budgetMin?: string;
  budgetMax?: string;
  finalSubtotal?: string;
  finalTaxAmount?: string;
  finalShippingAmount?: string;
  finalTotal?: string;
  finalTerms?: string;
  deliveryDays?: number;
  paymentTerms?: string;
  validUntil?: string;
  internalNotes?: string;
  customerNotes?: string;
  customerRejectionReason?: string;
  createdAt: string;
  updatedAt: string;
  user?: { id: string; email: string; firstName?: string; lastName?: string; phone?: string };
  address?: Address;
  items: Array<{
    id: string;
    productId: string;
    variantId?: string;
    productName: string;
    productSlug: string;
    variantName?: string;
    unit: string;
    quantity: number;
    unitPrice?: string;
    totalPrice?: string;
    finalUnitPrice?: string;
    finalTotalPrice?: string;
    notes?: string;
    product?: { id: string; name: string; slug: string; images?: Array<{ url: string }> };
  }>;
  reviewedBy?: { id: string; email: string; firstName?: string; lastName?: string };
  pricedBy?: { id: string; email: string; firstName?: string; lastName?: string };
  assignedTo?: { id: string; email: string; firstName?: string; lastName?: string };
  convertedOrder?: { id: string; orderNumber: string };
  _count?: { items: number };
}

export interface Address {
  id: string;
  userId: string;
  type: 'HOME' | 'WORK' | 'OTHER';
  label?: string;
  fullName: string;
  phone: string;
  alternatePhone?: string;
  line1: string;
  line2?: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  isDefault: boolean;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  addressId: string;
  status: 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED' | 'REFUNDED' | 'RETURNED';
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
  paymentMethod: string;
  paymentId?: string;
  paymentRef?: string;
  subtotal: string;
  taxAmount: string;
  shippingAmount: string;
  discountAmount: string;
  total: string;
  couponCode?: string;
  notes?: string;
  internalNotes?: string;
  trackingNumber?: string;
  carrier?: string;
  cancelReason?: string;
  shippedAt?: string;
  deliveredAt?: string;
  cancelledAt?: string;
  createdAt: string;
  updatedAt: string;
  user?: { id: string; email: string; firstName?: string; lastName?: string; phone?: string };
  address?: Address;
  items: Array<{
    id: string;
    productId: string;
    variantId?: string;
    productName: string;
    productSlug: string;
    productImage?: string;
    variantName?: string;
    unit: string;
    quantity: number;
    unitPrice: string;
    totalPrice: string;
    taxPercent: string;
    taxAmount: string;
    discountAmount: string;
    product?: { id: string; name: string; slug: string; images?: Array<{ url: string }> };
  }>;
  timeline?: Array<{
    id: string;
    status: string;
    message?: string;
    changedById?: string;
    trackingNumber?: string;
    carrier?: string;
    createdAt: string;
    changedBy?: { id: string; email: string; firstName?: string; lastName?: string };
  }>;
  fromQuote?: { id: string; quoteNumber: string };
  _count?: { items: number; timeline: number };
}

export interface Pincode {
  id: string;
  pincode: string;
  city: string;
  state: string;
  area?: string;
  isActive: boolean;
  deliveryDays: number;
  deliveryCharge: number;
  freeDeliveryAbove?: number;
  codAvailable: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryRecord {
  id: string;
  productId: string;
  variantId?: string;
  changeType: 'PURCHASE' | 'SALE' | 'RETURN' | 'ADJUSTMENT' | 'TRANSFER' | 'DAMAGE' | 'EXPIRY';
  quantityBefore: number;
  quantityChange: number;
  quantityAfter: number;
  reason?: string;
  referenceType?: string;
  referenceId?: string;
  performedById?: string;
  ip?: string;
  createdAt: string;
  product?: { id: string; name: string; slug: string; sku?: string; unit: string };
  performedBy?: { id: string; email: string; firstName?: string; lastName?: string };
}

export interface Notification {
  id: string;
  userId?: string;
  type: string;
  channel: string;
  status: string;
  subject: string;
  body: string;
  referenceType?: string;
  referenceId?: string;
  isRead: boolean;
  createdAt: string;
}

export interface DashboardStats {
  summary: {
    totalCustomers: number;
    totalActiveCustomers: number;
    totalProducts: number;
    totalCategories: number;
    totalQuotes: number;
    pendingQuotes: number;
    approvedQuotes: number;
    rejectedQuotes: number;
    totalOrders: number;
    todaysOrders: number;
    lowStockCount: number;
    outOfStockCount: number;
  };
  revenue: { thisMonth: number; lastMonth: number; growthPercent: number };
  growth: { customersThisMonth: number; customersLastMonth: number; customerGrowthPercent: number };
  lowStockProducts: Array<{ id: string; name: string; slug: string; sku?: string; stock: number; unit: string; image?: string }>;
  recentActivities: Array<{
    id: string;
    action: string;
    resource?: string;
    user: { email: string; name: string } | null;
    ip?: string;
    createdAt: string;
  }>;
  generatedAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: { code: string; message: string; details?: any };
}
