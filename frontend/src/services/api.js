import axios from 'axios';

const envBaseUrl = import.meta.env.VITE_API_BASE_URL;
const defaultBaseUrl = import.meta.env.PROD 
  ? 'https://globalco-jobboard-backend.onrender.com/api' 
  : '/api';

const api = axios.create({
  baseURL: (envBaseUrl && envBaseUrl.trim() !== '') ? envBaseUrl.trim() : defaultBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

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
