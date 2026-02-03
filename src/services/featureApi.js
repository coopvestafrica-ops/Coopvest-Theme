import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Feature Management API
export const featureApi = {
  // Get all features
  getFeatures: (params = {}) => 
    api.get('/features', { params }),

  // Get single feature
  getFeature: (id) => 
    api.get(`/features/${id}`),

  // Create feature
  createFeature: (data) => 
    api.post('/features', data),

  // Update feature
  updateFeature: (id, data) => 
    api.put(`/features/${id}`, data),

  // Delete feature
  deleteFeature: (id) => 
    api.delete(`/features/${id}`),

  // Enable feature
  enableFeature: (id) => 
    api.post(`/features/${id}/enable`),

  // Disable feature
  disableFeature: (id) => 
    api.post(`/features/${id}/disable`),

  // Toggle feature
  toggleFeature: (id) => 
    api.post(`/features/${id}/toggle`),

  // Get feature logs
  getFeatureLogs: (id, params = {}) => 
    api.get(`/features/${id}/logs`, { params }),

  // Get features by platform
  getFeaturesByPlatform: (platform) => 
    api.get(`/features/platform/${platform}`),

  // Check if feature is enabled
  isFeatureEnabled: (slug, platform = 'web') => 
    api.get(`/features/check/${slug}`, { params: { platform } }),
};

// Admin Role Management API
export const adminRoleApi = {
  // Get all roles
  getRoles: (params = {}) => 
    api.get('/admin-roles', { params }),

  // Get single role
  getRole: (id) => 
    api.get(`/admin-roles/${id}`),

  // Create role
  createRole: (data) => 
    api.post('/admin-roles', data),

  // Update role
  updateRole: (id, data) => 
    api.put(`/admin-roles/${id}`, data),

  // Delete role
  deleteRole: (id) => 
    api.delete(`/admin-roles/${id}`),

  // Add permission to role
  addPermission: (id, permission) => 
    api.post(`/admin-roles/${id}/permissions/add`, { permission }),

  // Remove permission from role
  removePermission: (id, permission) => 
    api.post(`/admin-roles/${id}/permissions/remove`, { permission }),

  // Get users with role
  getRoleUsers: (id, params = {}) => 
    api.get(`/admin-roles/${id}/users`, { params }),
};

// Admin User Management API
export const adminUserApi = {
  // Get all admin users
  getAdminUsers: (params = {}) => 
    api.get('/admin-users', { params }),

  // Get single admin user
  getAdminUser: (id) => 
    api.get(`/admin-users/${id}`),

  // Assign role to user
  assignRole: (data) => 
    api.post('/admin-users', data),

  // Update admin user
  updateAdminUser: (id, data) => 
    api.put(`/admin-users/${id}`, data),

  // Remove admin role
  removeAdminRole: (id) => 
    api.delete(`/admin-users/${id}`),

  // Activate admin user
  activateAdminUser: (id) => 
    api.post(`/admin-users/${id}/activate`),

  // Deactivate admin user
  deactivateAdminUser: (id) => 
    api.post(`/admin-users/${id}/deactivate`),

  // Suspend admin user
  suspendAdminUser: (id) => 
    api.post(`/admin-users/${id}/suspend`),

  // Check if user is admin
  isAdmin: (userId) => 
    api.get(`/admin-users/check/${userId}`),

  // Get admin user by user ID
  getByUserId: (userId) => 
    api.get(`/admin-users/user/${userId}`),
};

export default api;
