import { API_URL } from '@env';
import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';

export const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});
console.log('API_URL:', API_URL);
axiosInstance.interceptors.request.use(config => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (__DEV__) {
    console.log(
      `[API →] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`,
    );
  }
  return config;
});

axiosInstance.interceptors.response.use(
  response => response,
  error => {
    if (__DEV__) {
      if (error.response) {
        console.error(`[API ←] ${error.response.status}`, error.response.data);
      } else if (error.request) {
        console.error('[API ✗] No response — baseURL:', error.config?.baseURL);
        console.error(
          '[API ✗] Full URL:',
          `${error.config?.baseURL}${error.config?.url}`,
        );
        console.error('[API ✗] Message:', error.message);
      } else {
        console.error('[API ✗]', error.message);
      }
    }
    return Promise.reject(error);
  },
);
