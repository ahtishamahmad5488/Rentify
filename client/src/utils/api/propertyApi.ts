import { axiosInstance } from '../axios';

export interface PropertyImage {
  public_id: string;
  secure_url: string;
}

export interface Property {
  _id: string;
  title: string;
  description: string;
  city: string;
  area: string;
  address: string;
  price: number;
  propertyType: 'Shared' | 'Private' | 'Apartment' | 'House' | 'Room';
  totalRooms: number;
  availableRooms: number;
  genderType: 'Male' | 'Female' | 'Co-Ed' | 'Any';
  facilities: string[];
  images: PropertyImage[];
  views: number;
  status: string;
  isAvailable: boolean;
  latitude?: number;
  longitude?: number;
  location?: { type: 'Point'; coordinates: [number, number] }; // [lng, lat]
  owner?: { _id: string; name?: string; email?: string; phone?: string };
  createdAt: string;
}

export interface PropertyQuery {
  q?: string;
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  propertyType?: string;
  facilities?: string[];
  lat?: number;
  lng?: number;
  radiusKm?: number;
  page?: number;
  limit?: number;
}

export const fetchProperties = async (q: PropertyQuery = {}) => {
  const params: Record<string, string | number> = {};
  Object.entries(q).forEach(([k, v]) => {
    if (v === undefined || v === null || v === '') return;
    params[k] = Array.isArray(v) ? v.join(',') : (v as any);
  });
  const res = await axiosInstance.get('/properties', { params });
  return res.data?.data as Property[];
};

export const fetchPropertyById = async (id: string) => {
  const res = await axiosInstance.get(`/properties/${id}`);
  return res.data?.data as Property;
};

export const incrementPropertyView = async (id: string) => {
  await axiosInstance.patch(`/properties/${id}/view`);
};

export const getMyProperties = async () => {
  const res = await axiosInstance.get('/landlord/properties');
  return res.data;
};
