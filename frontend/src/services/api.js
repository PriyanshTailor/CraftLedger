import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor — attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — unwrap data and handle errors
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const status = error.response?.status;
    const isOnLoginPage = window.location.pathname === '/login';

    if (status === 401 && !isOnLoginPage) {
      // Token expired or invalid — clear state and redirect
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('isAuthenticated');
      window.location.href = '/login?expired=true';
      return Promise.reject({ message: 'Session expired. Please log in again.' });
    }

    // Pass error data through for components to handle
    return Promise.reject(error.response?.data || { message: 'An unexpected error occurred' });
  }
);

export default api;
