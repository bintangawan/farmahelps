import axios from 'axios';
import type { AxiosInstance, InternalAxiosRequestConfig } from 'axios'; // FIX: type-only import
import type { ApiResponse } from '@/types';

const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const postData = async <T, D>(url: string, data: D): Promise<T> => {
  // Axios response type <ApiResponse<T>>
  const response = await api.post<ApiResponse<T>>(url, data);
  return response.data.data;
};

export const getData = async <T>(url: string): Promise<T> => {
  const response = await api.get<ApiResponse<T>>(url);
  return response.data.data;
};

export default api;