import axios from 'axios';
import { ROUTES, STORAGE_KEYS, API_PATHS, MESSAGES } from '../constants';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

// Attach JWT token from localStorage to every request
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle 401 responses by attempting a token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken =
          typeof window !== 'undefined'
            ? localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN)
            : null;

        if (!refreshToken) throw new Error(MESSAGES.AUTH.NO_REFRESH_TOKEN);

        const response = await axios.post(`${API_BASE}${API_PATHS.AUTH.REFRESH}`, {
          refresh_token: refreshToken,
        });

        const payload = response.data?.data ?? response.data;
        const newAccess =
          payload?.access_token ?? response.data?.access_token ?? null;
        if (!newAccess) throw new Error(MESSAGES.AUTH.NO_REFRESH_TOKEN);

        localStorage.setItem(STORAGE_KEYS.TOKEN, newAccess);
        api.defaults.headers.common['Authorization'] = `Bearer ${newAccess}`;
        originalRequest.headers['Authorization'] = `Bearer ${newAccess}`;

        return api(originalRequest);
      } catch {
        if (typeof window !== 'undefined') {
          localStorage.removeItem(STORAGE_KEYS.TOKEN);
          localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
          window.location.href = ROUTES.LOGIN;
        }
      }
    }

    return Promise.reject(error);
  }
);

export default api;
