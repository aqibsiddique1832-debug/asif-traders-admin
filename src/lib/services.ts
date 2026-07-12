// ────────────────────────────────────────────────────────────
// API Service Layer — All backend calls
// ────────────────────────────────────────────────────────────

import api from './api';
import type {
  Category, Product, Quote, Order, User, Pincode, InventoryRecord,
  Notification, DashboardStats, PaginatedResponse, ApiResponse
} from '../types';

const unwrap = <T,>(res: { data: ApiResponse<T> | T }): T => {
  const body = res.data as any;
  return body.data !== undefined ? body.data : (body as T);
};

// ─── Auth ──────────────────────────────────────────────────

export const authService = {
  async login(email: string, password: string) {
    const res = await api.post('/auth/login', { email, password });
    return unwrap<{
      user: { id: string; email: string; firstName?: string; lastName?: string; role: string };
      tokens: { accessToken: string; refreshToken: string };
    }>(res);
  },
  async me() {
    const res = await api.get('/auth/me');
    return unwrap<{ id: string; email: string; firstName?: string; lastName?: string; role: string }>(res);
  },
  async logout(refreshToken?: string) {
    const res = await api.post('/auth/logout', { refreshToken, allDevices: false });
    return res.data;
  },
};

// ─── Dashboard ─────────────────────────────────────────────

export const dashboardService = {
  async getStats() {
    const res = await api.get('/admin/dashboard');
    return unwrap<DashboardStats>(res);
  },
  async getSalesChart(days = 30) {
    const res = await api.get(`/admin/dashboard/sales-chart?days=${days}`);
    return unwrap<{ data: Array<{ date: string; orders: number; revenue: number }>; days: number }>(res);
  },
};

// ─── Categories ────────────────────────────────────────────

export const categoryService = {
  async list(params: { page?: number; limit?: number; search?: string; isActive?: boolean } = {}) {
    const res = await api.get('/admin/categories', { params });
    return unwrap<PaginatedResponse<Category>>(res);
  },
  async get(id: string) {
    const res = await api.get(`/admin/categories/${id}`);
    return unwrap<Category>(res);
  },
  async create(data: Partial<Category>) {
    const res = await api.post('/admin/categories', data);
    return unwrap<Category>(res);
  },
  async update(id: string, data: Partial<Category>) {
    const res = await api.patch(`/admin/categories/${id}`, data);
    return unwrap<Category>(res);
  },
  async remove(id: string) {
    const res = await api.delete(`/admin/categories/${id}`);
    return res.data;
  },
};

// ─── Products ──────────────────────────────────────────────

export const productService = {
  async list(params: any = {}) {
    const res = await api.get('/admin/products', { params });
    return unwrap<PaginatedResponse<Product>>(res);
  },
  async get(id: string) {
    const res = await api.get(`/admin/products/${id}`);
    return unwrap<Product>(res);
  },
  async create(data: any) {
    const res = await api.post('/admin/products', data);
    return unwrap<Product>(res);
  },
  async update(id: string, data: any) {
    const res = await api.patch(`/admin/products/${id}`, data);
    return unwrap<Product>(res);
  },
  async remove(id: string) {
    const res = await api.delete(`/admin/products/${id}`);
    return res.data;
  },
  async updateStock(id: string, stock: number, reason: string) {
    const res = await api.patch(`/admin/products/${id}/stock`, { stock, reason });
    return unwrap<Product>(res);
  },
};

// ─── Quotes ────────────────────────────────────────────────

export const quoteService = {
  async list(params: any = {}) {
    const res = await api.get('/admin/quotes', { params });
    return unwrap<PaginatedResponse<Quote>>(res);
  },
  async stats() {
    const res = await api.get('/admin/quotes/stats');
    return unwrap<{ total: number; byStatus: Record<string, number> }>(res);
  },
  async updateNotes(id: string, data: { internalNotes?: string; customerNotes?: string; assignedToId?: string | null; paymentTerms?: string; finalTerms?: string }) {
    const res = await api.patch(`/admin/quotes/${id}/notes`, data);
    return unwrap<Quote>(res);
  },
  async changeStatus(id: string, status: string, reason?: string) {
    const res = await api.patch(`/admin/quotes/${id}/status`, { status, reason });
    return unwrap<Quote>(res);
  },
  async convertToOrder(id: string) {
    const res = await api.post(`/admin/quotes/${id}/convert-to-order`);
    return unwrap<Order>(res);
  },
};

// ─── Orders ────────────────────────────────────────────────

export const orderService = {
  async list(params: any = {}) {
    const res = await api.get('/admin/orders', { params });
    return unwrap<PaginatedResponse<Order>>(res);
  },
  async stats() {
    const res = await api.get('/admin/orders/stats');
    return unwrap<{ total: number; today: number; byStatus: Record<string, number> }>(res);
  },
  async get(id: string) {
    const res = await api.get(`/admin/orders/${id}`);
    return unwrap<Order>(res);
  },
  async timeline(id: string) {
    const res = await api.get(`/admin/orders/${id}/timeline`);
    return unwrap<{ timeline: Order['timeline'] }>(res);
  },
  async updateStatus(id: string, data: { status: string; message?: string; trackingNumber?: string; carrier?: string }) {
    const res = await api.patch(`/admin/orders/${id}/status`, data);
    return unwrap<Order>(res);
  },
  async updateDelivery(id: string, data: { deliveryStatus: string; message?: string; trackingNumber?: string; carrier?: string }) {
    const res = await api.patch(`/admin/orders/${id}/delivery`, data);
    return unwrap(res);
  },
  async cancel(id: string, data: { reason: string; restoreStock?: boolean; refund?: boolean }) {
    const res = await api.post(`/admin/orders/${id}/cancel`, data);
    return unwrap<Order>(res);
  },
  async complete(id: string, message?: string) {
    const res = await api.post(`/admin/orders/${id}/complete`, { message });
    return unwrap<Order>(res);
  },
};

// ─── Customers ─────────────────────────────────────────────

export const customerService = {
  async list(params: any = {}) {
    const res = await api.get('/admin/customers', { params });
    return unwrap<PaginatedResponse<User>>(res);
  },
  async get(id: string) {
    const res = await api.get(`/admin/customers/${id}`);
    return unwrap<User & { addresses: any[] }>(res);
  },
  async updateStatus(id: string, status: string, reason?: string) {
    const res = await api.patch(`/admin/customers/${id}/status`, { status, reason });
    return unwrap<User>(res);
  },
  async quotes(id: string, params: any = {}) {
    const res = await api.get(`/admin/customers/${id}/quotes`, { params });
    return unwrap<PaginatedResponse<Quote>>(res);
  },
  async orders(id: string, params: any = {}) {
    const res = await api.get(`/admin/customers/${id}/orders`, { params });
    return unwrap<PaginatedResponse<Order>>(res);
  },
};

// ─── Inventory ─────────────────────────────────────────────

export const inventoryService = {
  async summary() {
    const res = await api.get('/admin/inventory/summary');
    return unwrap<{ totalProducts: number; inStockCount: number; lowStockCount: number; outOfStockCount: number; totalStockUnits: number; lowStockThreshold: number }>(res);
  },
  async history(params: any = {}) {
    const res = await api.get('/admin/inventory/history', { params });
    return unwrap<PaginatedResponse<InventoryRecord>>(res);
  },
  async lowStock(threshold?: number) {
    const res = await api.get('/admin/inventory/low-stock', { params: { threshold } });
    return unwrap<{ threshold: number; count: number; data: any[] }>(res);
  },
  async outOfStock() {
    const res = await api.get('/admin/inventory/out-of-stock');
    return unwrap<{ count: number; data: any[] }>(res);
  },
  async bulkUpdate(items: Array<{ productId: string; stock: number; reason: string }>) {
    const res = await api.post('/admin/inventory/bulk-update', { items });
    return unwrap<{ updated: number; products: any[] }>(res);
  },
};

// ─── Pincodes (Delivery Management) ────────────────────────

// Backend doesn't have pincode CRUD yet — use the settings service for delivery areas
export const pincodeService = {
  async list() {
    // Will use local mock + settings service for delivery areas
    const stored = localStorage.getItem('admin_pincodes');
    return stored ? JSON.parse(stored) : defaultPincodes();
  },
  async create(data: any) {
    const list = await this.list();
    const newItem = { ...data, id: `pc_${Date.now()}`, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    list.push(newItem);
    localStorage.setItem('admin_pincodes', JSON.stringify(list));
    return newItem;
  },
  async update(id: string, data: any) {
    const list = await this.list();
    const idx = list.findIndex((p: any) => p.id === id);
    if (idx === -1) throw new Error('Pincode not found');
    list[idx] = { ...list[idx], ...data, updatedAt: new Date().toISOString() };
    localStorage.setItem('admin_pincodes', JSON.stringify(list));
    return list[idx];
  },
  async remove(id: string) {
    const list = await this.list();
    const filtered = list.filter((p: any) => p.id !== id);
    localStorage.setItem('admin_pincodes', JSON.stringify(filtered));
    return { success: true };
  },
};

function defaultPincodes(): Pincode[] {
  return [
    { id: 'pc_default_mum_east', pincode: '400001', city: 'Mumbai', state: 'Maharashtra', area: 'Fort', isActive: true, deliveryDays: 1, deliveryCharge: 0, freeDeliveryAbove: 500, codAvailable: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: 'pc_default_mum_west', pincode: '400002', city: 'Mumbai', state: 'Maharashtra', area: 'Kalbadevi', isActive: true, deliveryDays: 1, deliveryCharge: 0, freeDeliveryAbove: 500, codAvailable: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: 'pc_default_mum_central', pincode: '400008', city: 'Mumbai', state: 'Maharashtra', area: 'Malabar Hill', isActive: true, deliveryDays: 2, deliveryCharge: 50, freeDeliveryAbove: 1000, codAvailable: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: 'pc_default_mum_andheri', pincode: '400053', city: 'Mumbai', state: 'Maharashtra', area: 'Andheri West', isActive: true, deliveryDays: 2, deliveryCharge: 50, freeDeliveryAbove: 1000, codAvailable: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: 'pc_default_navi_belapur', pincode: '400614', city: 'Navi Mumbai', state: 'Maharashtra', area: 'Belapur', isActive: true, deliveryDays: 2, deliveryCharge: 50, freeDeliveryAbove: 1000, codAvailable: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: 'pc_default_navi_vashi', pincode: '400703', city: 'Navi Mumbai', state: 'Maharashtra', area: 'Vashi', isActive: true, deliveryDays: 2, deliveryCharge: 50, freeDeliveryAbove: 1000, codAvailable: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: 'pc_default_navi_kharghar', pincode: '410210', city: 'Navi Mumbai', state: 'Maharashtra', area: 'Kharghar', isActive: true, deliveryDays: 3, deliveryCharge: 100, freeDeliveryAbove: 1500, codAvailable: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  ];
}

// ─── Notifications ─────────────────────────────────────────

export const notificationService = {
  async list() {
    // Will integrate with backend notification API once exposed
    const stored = localStorage.getItem('admin_notifications');
    return stored ? JSON.parse(stored) : [];
  },
  async markRead(id: string) {
    const list = await this.list();
    const updated = list.map((n: any) => n.id === id ? { ...n, isRead: true } : n);
    localStorage.setItem('admin_notifications', JSON.stringify(updated));
    return { success: true };
  },
  async markAllRead() {
    const list = await this.list();
    const updated = list.map((n: any) => ({ ...n, isRead: true }));
    localStorage.setItem('admin_notifications', JSON.stringify(updated));
    return { success: true };
  },
};

// ─── Settings ──────────────────────────────────────────────

export interface AdminSettings {
  business: {
    name: string;
    email: string;
    phone: string;
    whatsapp: string;
    address: string;
    gstin: string;
    pan: string;
    logoUrl: string;
  };
  hours: { open: string; close: string; days: string };
  delivery: { baseCharge: number; freeAbove: number; standardDays: number; expressDays: number };
  quote: { expiryDays: number; autoApprove: boolean; requireApproval: boolean; taxRate: number };
  social: { facebook: string; instagram: string; twitter: string; linkedin: string; youtube: string };
  banners: Array<{ id: string; url: string; title: string; active: boolean; sortOrder: number }>;
}

const DEFAULT_SETTINGS: AdminSettings = {
  business: {
    name: 'ASIF TRADERS',
    email: 'contact@asiftraders.com',
    phone: '+91 9876543210',
    whatsapp: '+91 9876543210',
    address: 'Shop No. 5, Building Name, Mumbai, Maharashtra - 400001',
    gstin: '27ABCDE1234F1Z5',
    pan: 'ABCDE1234F',
    logoUrl: '',
  },
  hours: { open: '09:00', close: '21:00', days: 'Monday - Sunday' },
  delivery: { baseCharge: 50, freeAbove: 1000, standardDays: 2, expressDays: 1 },
  quote: { expiryDays: 30, autoApprove: false, requireApproval: true, taxRate: 18 },
  social: { facebook: '', instagram: '', twitter: '', linkedin: '', youtube: '' },
  banners: [],
};

export const settingsService = {
  async get() {
    const stored = localStorage.getItem('admin_settings');
    return stored ? { ...DEFAULT_SETTINGS, ...JSON.parse(stored) } : DEFAULT_SETTINGS;
  },
  async update(settings: AdminSettings) {
    localStorage.setItem('admin_settings', JSON.stringify(settings));
    return settings;
  },
  async reset() {
    localStorage.removeItem('admin_settings');
    return DEFAULT_SETTINGS;
  },
};
