import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to add the auth token to requests
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

// Add a response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized errors
    if (error.response && error.response.status === 401) {
      // If we're not on the login page, redirect to login
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Wallet API
export const createWallet = async () => {
  const response = await api.post('/api/wallet/create');
  return response.data;
};

export const recoverWallet = async (recoveryPhrase) => {
  const response = await api.post('/api/wallet/recover', { recoveryPhrase });
  return response.data;
};

export const getWalletInfo = async () => {
  const response = await api.get('/api/wallet');
  return response.data;
};

// Link API
export const createLink = async (content, type, options) => {
  const response = await api.post('/api/links', { content, type, options });
  return response.data;
};

export const viewLink = async (id, password) => {
  const params = password ? { password } : {};
  const response = await api.get(`/api/links/${id}`, { params });
  return response.data;
};

export const getLinks = async () => {
  const response = await api.get('/api/links');
  return response.data;
};

// Credit API
export const addCredits = async (amount, paymentMethod) => {
  const response = await api.post('/api/credits/add', { amount, paymentMethod });
  return response.data;
};

export const getBalance = async () => {
  const response = await api.get('/api/credits/balance');
  return response.data;
};

export const getTransactions = async () => {
  const response = await api.get('/api/credits/transactions');
  return response.data;
};

export default api;