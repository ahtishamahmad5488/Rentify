import axios from 'axios';
import API from './axios.js';

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const loginAdmin = (email, password) =>
  API.post('/login', { email, password });

// ─── Dashboard ────────────────────────────────────────────────────────────────
export const getAnalytics = (period) =>
  API.get('/analytics', { params: period ? { period } : {} });

// ─── Properties ───────────────────────────────────────────────────────────────
export const getProperties = (params) => API.get('/properties', { params });
export const getPropertyById = (id) => API.get(`/properties/${id}`);
export const updatePropertyStatus = (id, status) =>
  API.patch(`/properties/${id}/status`, { status });

// ─── Landlords ────────────────────────────────────────────────────────────────
export const getLandlords = (params) => API.get('/landlords', { params });
export const updateLandlordStatus = (id, action) =>
  API.patch(`/landlords/${id}/status`, { action });

// ─── Users ────────────────────────────────────────────────────────────────────
export const getUsers = (params) => API.get('/users', { params });

// ─── Bookings & Payments (root /api, not /api/auth/admin) ────────────────────
const rootBase = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api/auth/admin')
  .replace('/auth/admin', '');

const rootApi = axios.create({ baseURL: rootBase });

rootApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const getAllBookings = () => rootApi.get('/bookings');
export const getAllPayments = () => rootApi.get('/payments');

// ─── Admin Profile ────────────────────────────────────────────────────────────
export const uploadAdminProfileImage = (formData) =>
  API.post('/profile-image', formData);
