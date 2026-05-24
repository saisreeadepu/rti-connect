import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
      toast.error('Session expired. Please login again.');
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  resetPassword: (data) => api.post('/auth/reset-password', data),
  changePassword: (data) => api.post('/auth/change-password', data),
};

// User API
export const userAPI = {
  getProfile: () => api.get('/users/me'),
  updateProfile: (data) => api.put('/users/profile', data),
  getAllUsers: (params) => api.get('/users', { params }),
  getUser: (id) => api.get(`/users/${id}`),
  updateUser: (id, data) => api.put(`/users/${id}`, data),
  deleteUser: (id) => api.delete(`/users/${id}`),
  getPIOs: (department) => api.get(`/users/pios/department/${department}`),
};

// RTI API
export const rtiAPI = {
  submit: (data) => {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      if (key === 'documents') {
        data.documents.forEach(doc => formData.append('documents', doc));
      } else if (key === 'questions') {
        formData.append('questions', JSON.stringify(data.questions));
      } else {
        formData.append(key, data[key]);
      }
    });
    return api.post('/rti/submit', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  getMyRequests: (params) => api.get('/rti/my-requests', { params }),
  getRequest: (requestId) => api.get(`/rti/${requestId}`),
  trackRequest: (requestId) => api.get(`/rti/track/${requestId}`),
  payFee: (requestId, data) => api.post(`/rti/pay-fee/${requestId}`, data),
  updateStatus: (requestId, data) => api.put(`/rti/status/${requestId}`, data),
  addFeedback: (requestId, data) => api.post(`/rti/feedback/${requestId}`, data),
  downloadPdf: (requestId) => api.get(`/rti/download/${requestId}`, { responseType: 'blob' }),
};

// Chatbot API
export const chatbotAPI = {
  chat: (data) => api.post('/chatbot', data)
};

// Payment API
export const paymentAPI = {
  createOrder: (data) => api.post('/payment/create-order', data),
  verify: (data) => api.post('/payment/verify', data),
};

// PIO API
export const pioAPI = {
  getDashboard: () => api.get('/pio/dashboard'),
  getRequests: (params) => api.get('/pio/requests', { params }),
  getPending: () => api.get('/pio/pending'),
  getRequest: (requestId) => api.get(`/pio/request/${requestId}`),
  respond: (requestId, data) => {
    const formData = new FormData();
    formData.append('response', data.response);
    if (data.documents) {
      data.documents.forEach(doc => formData.append('documents', doc));
    }
    return api.post(`/pio/respond/${requestId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  forward: (requestId, data) => api.post(`/pio/forward/${requestId}`, data),
  updateStatus: (requestId, data) => api.put(`/pio/status/${requestId}`, data),
};

// Appeals API
export const appealsAPI = {
  fileAppeal: (requestId, data) => api.post(`/appeals/file/${requestId}`, data),
  getPending: () => api.get('/appeals/pending'),
  getDecided: () => api.get('/appeals/decided'),
  getAppeal: (requestId) => api.get(`/appeals/${requestId}`),
  decide: (requestId, data) => api.post(`/appeals/decide/${requestId}`, data),
  getStats: () => api.get('/appeals/dashboard/stats'),
};

// Departments API
export const departmentsAPI = {
  getAll: (params) => api.get('/departments', { params }),
  getByName: (name) => api.get(`/departments/${name}`),
  recommend: (data) => api.post('/departments/recommend', data),
  create: (data) => api.post('/departments', data),
  update: (id, data) => api.put(`/departments/${id}`, data),
  assignPIO: (id, data) => api.post(`/departments/${id}/assign-pio`, data),
  removePIO: (id, pioId) => api.delete(`/departments/${id}/remove-pio/${pioId}`),
  assignAppellate: (id, data) => api.post(`/departments/${id}/assign-appellate`, data),
  getStats: (id) => api.get(`/departments/${id}/stats`),
};

// Analytics API
export const analyticsAPI = {
  getDashboard: () => api.get('/analytics/dashboard'),
  getDepartmentStats: () => api.get('/analytics/departments'),
  getTimeAnalysis: (params) => api.get('/analytics/time-analysis', { params }),
  getCitizenStats: (userId) => api.get(`/analytics/citizen/${userId}`),
  exportReport: (params) => api.get('/analytics/export', { params, responseType: 'blob' }),
};

// Notifications API
export const notificationsAPI = {
  getAll: (params) => api.get('/notifications', { params }),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put('/notifications/read-all'),
  delete: (id) => api.delete(`/notifications/${id}`),
  deleteAll: () => api.delete('/notifications'),
  getPreferences: () => api.get('/notifications/preferences'),
  updatePreferences: (data) => api.put('/notifications/preferences', data),
  test: () => api.post('/notifications/test'),
};

// Templates API
export const templatesAPI = {
  getAll: (params) => api.get('/templates', { params }),
  getById: (id, params) => api.get(`/templates/${id}`, { params }),
  getCategories: () => api.get('/templates/categories/list'),
  generate: (data) => api.post('/templates/generate', data),
  suggest: (data) => api.post('/templates/suggest', data),
};

export default api;