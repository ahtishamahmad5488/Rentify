import API from './axios.js';

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const loginAdmin = (email, password) =>
  API.post('/login', { email, password });

// ─── Dashboard ────────────────────────────────────────────────────────────────
export const getAnalytics = (period) =>
  API.get('/analytics', { params: period ? { period } : {} });

// ─── Properties (formerly Hostels) ───────────────────────────────────────────
export const getProperties = (params) => API.get('/hostels', { params });
export const getPropertyById = (id) => API.get(`/hostels/${id}`);
export const updatePropertyStatus = (id, status) =>
  API.patch(`/hostels/${id}/status`, { status });

// Keep old names as aliases so existing components don't break during migration
export const getHostels = getProperties;
export const getHostelById = getPropertyById;
export const updateHostelStatus = updatePropertyStatus;

// ─── Landlords (formerly Owners) ─────────────────────────────────────────────
export const getLandlords = (params) => API.get('/owners', { params });
export const updateLandlordStatus = (id, action) =>
  API.patch(`/owners/${id}/status`, { action });

// Aliases
export const getOwners = getLandlords;
export const updateOwnerStatus = updateLandlordStatus;

// ─── Bookings ─────────────────────────────────────────────────────────────────
// These call the /api/bookings routes added in the server step.
// Note: admin routes are under /api/admin/* but bookings/payments routes
// are at /api/bookings and /api/payments (public-ish for demo).
// We create a second axios instance pointing at the root /api path.
import axios from 'axios';

const BASE = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace('/admin', '')
  : 'http://localhost:5000/api';

const rootApi = axios.create({ baseURL: BASE });

// Attach the admin JWT to root-api calls too
rootApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const getAllBookings = () => rootApi.get('/bookings');
export const getAllPayments = () => rootApi.get('/payments');

// ─── Admin Profile ──────────────────────────────────────────────────────────
export const uploadAdminProfileImage = (formData) =>
  API.post('/profile-image', formData);
