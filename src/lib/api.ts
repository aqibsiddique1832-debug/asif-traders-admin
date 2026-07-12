// ────────────────────────────────────────────────────────────
// API Client — Axios with JWT interceptors
// ────────────────────────────────────────────────────────────

import axios, { AxiosError, AxiosInstance } from 'axios';
import toast from 'react-hot-toast';

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'https://asifbhai-production.up.railway.app/api/v1';

export const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 (auto-logout) and 403
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ error?: { code: string; message: string } }>) => {
    const status = error.response?.status;
    const message = error.response?.data?.error?.message || error.message;

    if (status === 401) {
      // Token expired or invalid
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_refresh_token');
      localStorage.removeItem('admin_user');
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login?expired=1';
      }
      toast.error('Session expired. Please log in again.');
    } else if (status === 403) {
      toast.error('Access denied. Admin privileges required.');
    } else if (status && status >= 500) {
      toast.error('Server error. Please try again later.');
    } else if (message) {
      toast.error(message);
    }

    return Promise.reject(error);
  },
);

export default api;
