/**
 * API Service
 * Centralized API handling using the consolidated client
 */

import client from '../api/client'

// API methods
export const apiService = {
  get: (url, params = {}) => client.get(url, { params }),
  post: (url, data) => client.post(url, data),
  put: (url, data) => client.put(url, data),
  patch: (url, data) => client.patch(url, data),
  delete: (url) => client.delete(url),
  postForm: (url, formData) => client.post(url, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}

// Auth API
export const authApi = {
  login: (credentials) => apiService.post('/auth/login', credentials),
  register: (userData) => apiService.post('/auth/register', userData),
  logout: () => apiService.post('/auth/logout'),
  refreshToken: () => apiService.post('/auth/refresh'),
  forgotPassword: (email) => apiService.post('/auth/password/reset', { email }),
  resetPassword: (token, password) => apiService.post('/auth/password/reset/confirm', { token, password }),
  getProfile: () => apiService.get('/auth/profile'),
}

// Members API
export const membersApi = {
  getAll: (params) => apiService.get('/members', params),
  getById: (id) => apiService.get(`/members/${id}`),
  create: (data) => apiService.post('/members', data),
  update: (id, data) => apiService.put(`/members/${id}`, data),
  delete: (id) => apiService.delete(`/members/${id}`),
}

// Loans API
export const loansApi = {
  getAll: (params) => apiService.get('/loans', params),
  getById: (id) => apiService.get(`/loans/${id}`),
  create: (data) => apiService.post('/loans', data),
  approve: (id, data) => apiService.post(`/loans/${id}/approve`, data),
  reject: (id, reason) => apiService.post(`/loans/${id}/reject`, { reason }),
}

// Export default client
export default client
