import axios from 'axios';
import { logout } from '../utils/auth';
import { toast } from 'react-toastify';

const api = axios.create({
  baseURL: '/api', // Sets the base path for all requests
});

// Interceptor to add the auth token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    // Only add the header if a token exists and the header isn't being explicitly cleared
    if (token && config.headers.Authorization !== null) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle global errors, like token expiration.
api.interceptors.response.use(
  (response) => {
    // Any status code that lie within the range of 2xx cause this function to trigger
    return response;
  },
  (error) => {
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    if (error.response && error.response.status === 401) {
      // Handle Unauthorized errors (e.g., expired or invalid token)
      const errorMessage = error.response.data?.message || 'Your session has expired. Please log in again.';
      toast.error(errorMessage);
      logout(); // Clear user data from storage
      // Redirect to login page. We use window.location as we are outside of React Router's context.
      window.location.href = '/admin-login';
    }
    return Promise.reject(error);
  }
);

export default api;