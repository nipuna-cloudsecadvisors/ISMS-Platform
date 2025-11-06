import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authAPI = {
  login: (email, password) => api.post('/api/auth/login', { email, password }),
  getMe: () => api.get('/api/auth/me'),
};

// User API
export const userAPI = {
  list: () => api.get('/api/users'),
  get: (id) => api.get(`/api/users/${id}`),
  create: (data) => api.post('/api/users', data),
  update: (id, data) => api.put(`/api/users/${id}`, data),
};

// Framework API
export const frameworkAPI = {
  list: () => api.get('/api/frameworks'),
  get: (id) => api.get(`/api/frameworks/${id}`),
  create: (data) => api.post('/api/frameworks', data),
};

// Requirement API
export const requirementAPI = {
  list: (frameworkId) => api.get('/api/requirements', { params: { framework_id: frameworkId } }),
  create: (data) => api.post('/api/requirements', data),
};

// Control API
export const controlAPI = {
  list: () => api.get('/api/controls'),
  get: (id) => api.get(`/api/controls/${id}`),
  create: (data) => api.post('/api/controls', data),
  update: (id, data) => api.put(`/api/controls/${id}`, data),
  delete: (id) => api.delete(`/api/controls/${id}`),
};

// Evidence API
export const evidenceAPI = {
  list: (controlId) => api.get('/api/evidence', { params: { control_id: controlId } }),
  create: (formData) => api.post('/api/evidence', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  delete: (id) => api.delete(`/api/evidence/${id}`),
};

// Policy API
export const policyAPI = {
  list: () => api.get('/api/policies'),
  get: (id) => api.get(`/api/policies/${id}`),
  create: (data) => api.post('/api/policies', data),
  update: (id, data) => api.put(`/api/policies/${id}`, data),
  delete: (id) => api.delete(`/api/policies/${id}`),
  publish: (id) => api.post(`/api/policies/${id}/publish`),
};

// Policy Acknowledgment API
export const policyAckAPI = {
  acknowledge: (policyId) => api.post('/api/policy-acknowledgments', { policy_id: policyId }),
  getPending: () => api.get('/api/policy-acknowledgments/pending'),
};

// Risk API
export const riskAPI = {
  list: () => api.get('/api/risks'),
  get: (id) => api.get(`/api/risks/${id}`),
  create: (data) => api.post('/api/risks', data),
  update: (id, data) => api.put(`/api/risks/${id}`, data),
  delete: (id) => api.delete(`/api/risks/${id}`),
};

// Alert API
export const alertAPI = {
  list: (includeResolved = false) => api.get('/api/alerts', { params: { include_resolved: includeResolved } }),
};

// Dashboard API
export const dashboardAPI = {
  getStats: () => api.get('/api/dashboard/stats'),
};

// Report API
export const reportAPI = {
  policyAcknowledgment: (policyId) => api.get(`/api/reports/policy-acknowledgments/${policyId}`),
  riskRegister: () => api.get('/api/reports/risk-register'),
  compliance: (frameworkId) => api.get(`/api/reports/compliance/${frameworkId}`),
};

export default api;
