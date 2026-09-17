import axios from 'axios';

const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api')
  .replace(/\/$/, '');

export const API_ORIGIN = apiBaseUrl.replace(/\/api$/, '');
export const BACKEND_URL = API_ORIGIN;

const api = axios.create({
  baseURL: apiBaseUrl,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Non-blocking warm-up ping for serverless/cold-start hosts (Render/Neon).
 * Fires silently on initial load without blocking UI.
 */
export const warmUpBackend = () => {
  fetch(`${BACKEND_URL}/health`, { method: 'GET', cache: 'no-store' }).catch(() => {});
};

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('role');
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register' && window.location.pathname !== '/') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
