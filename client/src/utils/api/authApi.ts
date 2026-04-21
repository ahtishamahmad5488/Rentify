import { axiosInstance } from '../axios';

// ─── Register ─────────────────────────────────────────────────────────────────
export const register = async (name: string, email: string, password: string) => {
  const res = await axiosInstance.post('/auth/user/signup', { name, email, password });
  return res.data as { success: boolean; token: string; user: any; message: string };
};

// ─── Login ────────────────────────────────────────────────────────────────────
export const login = async (email: string, password: string) => {
  const res = await axiosInstance.post('/auth/user/login', { email, password });
  return res.data as { success: boolean; token: string; user: any; message: string };
};

// ─── Forgot Password ──────────────────────────────────────────────────────────
export const forgotPassword = async (email: string) => {
  const res = await axiosInstance.post('/auth/user/forgot-password', { email });
  return res.data as { success: boolean; message: string };
};

// ─── Verify OTP ───────────────────────────────────────────────────────────────
export const verifyOTP = async (email: string, otp: string) => {
  const res = await axiosInstance.post('/auth/user/verify-otp', { email, otp });
  return res.data as { success: boolean; message: string };
};

// ─── Reset Password ───────────────────────────────────────────────────────────
export const resetPassword = async (email: string, otp: string, newPassword: string) => {
  const res = await axiosInstance.post('/auth/user/reset-password', { email, otp, newPassword });
  return res.data as { success: boolean; message: string };
};
