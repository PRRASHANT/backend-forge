import axios from 'axios';

const getApiUrl = () => {
  const url = import.meta.env.VITE_API_URL;
  if (url) return url;
  if (import.meta.env.PROD) {
    throw new Error('VITE_API_URL environment variable is required in production.');
  }
  return 'http://localhost:5000/api';
};

export const BASE_URL = getApiUrl();

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
apiClient.interceptors.request.use(
  (config) => {
    // In this MVP, we use localStorage for the management JWT token.
    const token = localStorage.getItem('bf_token');
    if (token && token !== 'undefined') {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle 401s (e.g. clear token and redirect)
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear invalid token
      localStorage.removeItem('bf_token');
      localStorage.removeItem('bf_user');
      // If we are not already on login/register, redirect
      if (
        window.location.pathname !== '/login' &&
        window.location.pathname !== '/register'
      ) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
