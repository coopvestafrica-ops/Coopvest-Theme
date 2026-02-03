/**
 * API Service
 * Centralized API handling with axios
 */

import axios from 'axios'
import { showToast } from '../components/ui/LoadingStates.jsx'

// Create axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    // Add request ID for tracking
    config.headers['X-Request-ID'] = generateRequestId()

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response.data
  },
  async (error) => {
    const originalRequest = error.config

    // Handle 401 errors
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      // Try to refresh token
      try {
        const refreshToken = localStorage.getItem('refreshToken')
        if (refreshToken) {
          const response = await axios.post('/api/auth/refresh', {
            refreshToken
          })

          const { token } = response.data.data
          localStorage.setItem('token', token)

          originalRequest.headers.Authorization = `Bearer ${token}`
          return api(originalRequest)
        }
      } catch (refreshError) {
        // Redirect to login
        localStorage.removeItem('token')
        localStorage.removeItem('refreshToken')
        window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }

    // Handle 403 errors
    if (error.response?.status === 403) {
      showToast.error('You do not have permission to perform this action')
    }

    // Handle 404 errors
    if (error.response?.status === 404) {
      showToast.error('The requested resource was not found')
    }

    // Handle 422 validation errors
    if (error.response?.status === 422 && error.response.data?.details) {
      const errors = error.response.data.details
      const firstError = errors[0]
      showToast.error(firstError?.message || 'Validation error')
    }

    // Handle 429 rate limit errors
    if (error.response?.status === 429) {
      showToast.error('Too many requests. Please try again later.')
    }

    // Handle 500 errors
    if (error.response?.status >= 500) {
      showToast.error('Server error. Please try again later.')
    }

    return Promise.reject(error.response?.data || error)
  }
)

// Helper to generate request ID
function generateRequestId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9)
}

// API methods
export const apiService = {
  // GET request
  get: (url, params = {}) => api.get(url, { params }),

  // POST request
  post: (url, data) => api.post(url, data),

  // PUT request
  put: (url, data) => api.put(url, data),

  // PATCH request
  patch: (url, data) => api.patch(url, data),

  // DELETE request
  delete: (url) => api.delete(url),

  // Form data POST
  postForm: (url, formData) => api.post(url, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}

// Auth API
export const authApi = {
  login: (credentials) => apiService.post('/auth/login', credentials),
  register: (userData) => apiService.post('/auth/register', userData),
  logout: () => apiService.post('/auth/logout'),
  refreshToken: () => apiService.post('/auth/refresh'),
  forgotPassword: (email) => apiService.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => apiService.post('/auth/reset-password', { token, password }),
  changePassword: (passwords) => apiService.post('/auth/change-password', passwords),
  getProfile: () => apiService.get('/auth/profile'),
  updateProfile: (data) => apiService.put('/auth/profile', data),
  getNotifications: (params) => apiService.get('/auth/notifications', params),
  markNotificationRead: (id) => apiService.patch(`/auth/notifications/${id}/read`),
  markAllNotificationsRead: () => apiService.post('/auth/notifications/read-all')
}

// Members API
export const membersApi = {
  getAll: (params) => apiService.get('/members', params),
  getById: (id) => apiService.get(`/members/${id}`),
  create: (data) => apiService.post('/members', data),
  update: (id, data) => apiService.put(`/members/${id}`, data),
  delete: (id) => apiService.delete(`/members/${id}`),
  getContributions: (id, params) => apiService.get(`/members/${id}/contributions`, params),
  getLoans: (id, params) => apiService.get(`/members/${id}/loans`, params),
  getInvestments: (id, params) => apiService.get(`/members/${id}/investments`, params),
  getRiskScore: (id) => apiService.get(`/members/${id}/risk-score`),
  export: (params) => apiService.get('/members/export', params)
}

// Loans API
export const loansApi = {
  getAll: (params) => apiService.get('/loans', params),
  getById: (id) => apiService.get(`/loans/${id}`),
  create: (data) => apiService.post('/loans', data),
  update: (id, data) => apiService.put(`/loans/${id}`, data),
  approve: (id, data) => apiService.post(`/loans/${id}/approve`, data),
  reject: (id, reason) => apiService.post(`/loans/${id}/reject`, { reason }),
  disburse: (id, data) => apiService.post(`/loans/${id}/disburse`, data),
  repay: (id, data) => apiService.post(`/loans/${id}/repay`, data),
  getRepaymentSchedule: (id) => apiService.get(`/loans/${id}/repayment-schedule`),
  getStatistics: (params) => apiService.get('/loans/statistics', params)
}

// Contributions API
export const contributionsApi = {
  getAll: (params) => apiService.get('/contributions', params),
  getById: (id) => apiService.get(`/contributions/${id}`),
  create: (data) => apiService.post('/contributions', data),
  update: (id, data) => apiService.put(`/contributions/${id}`, data),
  delete: (id) => apiService.delete(`/contributions/${id}`),
  getStatistics: (params) => apiService.get('/contributions/statistics', params),
  getMemberSummary: (memberId) => apiService.get(`/contributions/member/${memberId}/summary`)
}

// Investments API
export const investmentsApi = {
  getAll: (params) => apiService.get('/investments', params),
  getById: (id) => apiService.get(`/investments/${id}`),
  create: (data) => apiService.post('/investments', data),
  update: (id, data) => apiService.put(`/investments/${id}`, data),
  close: (id, data) => apiService.post(`/investments/${id}/close`, data),
  getMatured: (params) => apiService.get('/investments/matured', params),
  getStatistics: (params) => apiService.get('/investments/statistics', params)
}

// Rollovers API
export const rolloversApi = {
  getAll: (params) => apiService.get('/rollovers', params),
  getById: (id) => apiService.get(`/rollovers/${id}`),
  create: (data) => apiService.post('/rollovers', data),
  approve: (id) => apiService.post(`/rollovers/${id}/approve`),
  reject: (id, reason) => apiService.post(`/rollovers/${id}/reject`, { reason })
}

// Support API
export const supportApi = {
  getTickets: (params) => apiService.get('/support/tickets', params),
  getTicket: (id) => apiService.get(`/support/tickets/${id}`),
  createTicket: (data) => apiService.post('/support/tickets', data),
  updateTicket: (id, data) => apiService.put(`/support/tickets/${id}`, data),
  addReply: (id, message) => apiService.post(`/support/tickets/${id}/replies`, { message }),
  resolve: (id) => apiService.post(`/support/tickets/${id}/resolve`)
}

// Admin API
export const adminApi = {
  getAll: (params) => apiService.get('/admin', params),
  getById: (id) => apiService.get(`/admin/${id}`),
  create: (data) => apiService.post('/admin', data),
  update: (id, data) => apiService.put(`/admin/${id}`, data),
  delete: (id) => apiService.delete(`/admin/${id}`),
  getRoles: () => apiService.get('/admin/roles'),
  createRole: (data) => apiService.post('/admin/roles', data),
  updateRole: (id, data) => apiService.put(`/admin/roles/${id}`, data),
  deleteRole: (id) => apiService.delete(`/admin/roles/${id}`),
  getAuditLogs: (params) => apiService.get('/admin/audit-logs', params)
}

// Statistics API
export const statisticsApi = {
  getDashboard: () => apiService.get('/statistics/dashboard'),
  getOverview: (params) => apiService.get('/statistics/overview', params),
  getMembersStats: (params) => apiService.get('/statistics/members', params),
  getLoansStats: (params) => apiService.get('/statistics/loans', params),
  getContributionsStats: (params) => apiService.get('/statistics/contributions', params),
  getInvestmentsStats: (params) => apiService.get('/statistics/investments', params),
  getRiskStats: () => apiService.get('/statistics/risk'),
  exportReport: (params) => apiService.get('/statistics/export', params)
}

// Documents API
export const documentsApi = {
  getAll: (params) => apiService.get('/documents', params),
  getById: (id) => apiService.get(`/documents/${id}`),
  generate: (data) => apiService.post('/documents/generate', data),
  download: (id) => apiService.get(`/documents/${id}/download`),
  delete: (id) => apiService.delete(`/documents/${id}`)
}

// Export default API instance
export default api
