import { axiosInstance } from '../axios';

export interface Booking {
  _id: string;
  tenantUid: string;
  tenantName?: string;
  tenantEmail?: string;
  property: any;
  checkInDate: string;
  durationMonths: number;
  totalAmount: number;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  paymentStatus: 'UNPAID' | 'PAID' | 'REFUNDED';
  createdAt: string;
}

export const createBooking = async (payload: {
  tenantUid: string;
  tenantName?: string;
  tenantEmail?: string;
  propertyId: string;
  checkInDate: string;
  durationMonths?: number;
}) => {
  const res = await axiosInstance.post('/bookings', payload);
  return res.data?.data as Booking;
};

export const listMyBookings = async (uid: string) => {
  const res = await axiosInstance.get(`/bookings/tenant/${uid}`);
  return res.data?.data as Booking[];
};

export const processPayment = async (payload: {
  bookingId: string;
  tenantUid: string;
  method?: 'CARD' | 'WALLET' | 'CASH';
}) => {
  const res = await axiosInstance.post('/payments', payload);
  return res.data?.data as { payment: any; booking: Booking };
};
