import axios from 'axios'

const API_BASE = '/api'

// Create axios instance
const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('role')
      localStorage.removeItem('permissions')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Sheet API
export const sheetApi = {
  // Get all sheets for current user
  getSheets: async () => {
    const response = await api.get('/sheets')
    return response.data
  },

  // Get sheet definition
  getSheet: async (sheetId) => {
    const response = await api.get(`/sheets/${sheetId}`)
    return response.data
  },

  // Get sheet data with pagination and filters
  getSheetData: async (sheetId, params = {}) => {
    const response = await api.get(`/sheets/${sheetId}/data`, { params })
    return response.data
  },

  // Get a specific row
  getRow: async (sheetId, rowId) => {
    const response = await api.get(`/sheets/${sheetId}/data/${rowId}`)
    return response.data
  },

  // Create a new row
  createRow: async (sheetId, data) => {
    const response = await api.post(`/sheets/${sheetId}/data`, data)
    return response.data
  },

  // Update a row
  updateRow: async (sheetId, rowId, data) => {
    const response = await api.put(`/sheets/${sheetId}/data/${rowId}`, data)
    return response.data
  },

  // Delete a row (soft delete)
  deleteRow: async (sheetId, rowId) => {
    const response = await api.delete(`/sheets/${sheetId}/data/${rowId}`)
    return response.data
  },

  // Lock a row
  lockRow: async (sheetId, rowId, timeout = 15) => {
    const response = await api.post(`/sheets/${sheetId}/data/${rowId}/lock`, { timeout })
    return response.data
  },

  // Unlock a row
  unlockRow: async (sheetId, rowId) => {
    const response = await api.delete(`/sheets/${sheetId}/data/${rowId}/lock`)
    return response.data
  },

  // Get lock status
  getLockStatus: async (sheetId, rowId) => {
    const response = await api.get(`/sheets/${sheetId}/data/${rowId}/lock-status`)
    return response.data
  },

  // Assign/reassign a row
  assignRow: async (sheetId, rowId, assignedTo, reason) => {
    const response = await api.put(`/sheets/${sheetId}/data/${rowId}/assign`, { assignedTo, reason })
    return response.data
  },

  // Submit row for review
  submitRow: async (sheetId, rowId, notes) => {
    const response = await api.post(`/sheets/${sheetId}/submit/${rowId}`, { notes })
    return response.data
  },

  // Approve a row
  approveRow: async (sheetId, rowId, notes) => {
    const response = await api.post(`/sheets/${sheetId}/approve/${rowId}`, { notes })
    return response.data
  },

  // Reject a row
  rejectRow: async (sheetId, rowId, reason) => {
    const response = await api.post(`/sheets/${sheetId}/reject/${rowId}`, { reason })
    return response.data
  },

  // Return row for revision
  returnRow: async (sheetId, rowId, reason) => {
    const response = await api.post(`/sheets/${sheetId}/return/${rowId}`, { reason })
    return response.data
  },

  // Bulk submit
  bulkSubmit: async (sheetId, rowIds, notes) => {
    const response = await api.post(`/sheets/${sheetId}/bulk-submit`, { rowIds, notes })
    return response.data
  },

  // Bulk approve
  bulkApprove: async (sheetId, rowIds, notes) => {
    const response = await api.post(`/sheets/${sheetId}/bulk-approve`, { rowIds, notes })
    return response.data
  },

  // Get pending rows
  getPendingRows: async (sheetId, params = {}) => {
    const response = await api.get(`/sheets/${sheetId}/pending`, { params })
    return response.data
  }
}

// Sheet Assignment API
export const sheetAssignmentApi = {
  // Get my assignments
  getMyAssignments: async () => {
    const response = await api.get('/sheet-assignments/my')
    return response.data
  },

  // Get all assignments (admin)
  getAssignments: async (params = {}) => {
    const response = await api.get('/sheet-assignments', { params })
    return response.data
  },

  // Get assignments for a sheet
  getSheetAssignments: async (sheetId) => {
    const response = await api.get(`/sheet-assignments/sheet/${sheetId}`)
    return response.data
  },

  // Create assignment
  createAssignment: async (data) => {
    const response = await api.post('/sheet-assignments', data)
    return response.data
  },

  // Update assignment
  updateAssignment: async (assignmentId, data) => {
    const response = await api.put(`/sheet-assignments/${assignmentId}`, data)
    return response.data
  },

  // Revoke assignment
  revokeAssignment: async (assignmentId, reason) => {
    const response = await api.delete(`/sheet-assignments/${assignmentId}`, { data: { reason } })
    return response.data
  },

  // Bulk create assignments
  bulkCreate: async (data) => {
    const response = await api.post('/sheet-assignments/bulk', data)
    return response.data
  }
}

// Sheet Admin API
export const sheetAdminApi = {
  // Get admin dashboard
  getDashboard: async () => {
    const response = await api.get('/sheet-admin/dashboard')
    return response.data
  },

  // Get all sheet definitions (admin)
  getAllDefinitions: async (params = {}) => {
    const response = await api.get('/sheets/definitions', { params })
    return response.data
  },

  // Create sheet definition
  createSheet: async (data) => {
    const response = await api.post('/sheet-admin/sheets', data)
    return response.data
  },

  // Update sheet definition
  updateSheet: async (sheetId, data) => {
    const response = await api.put(`/sheet-admin/sheets/${sheetId}`, data)
    return response.data
  },

  // Get sheet stats
  getSheetStats: async (sheetId) => {
    const response = await api.get(`/sheet-admin/sheets/${sheetId}/stats`)
    return response.data
  },

  // Seed sheet with test data
  seedSheet: async (sheetId, count = 10) => {
    const response = await api.post(`/sheet-admin/sheets/${sheetId}/seed`, { count })
    return response.data
  },

  // Get staff for assignment
  getStaff: async (params = {}) => {
    const response = await api.get('/sheet-admin/staff', { params })
    return response.data
  },

  // Bulk reassign rows
  reassignRows: async (data) => {
    const response = await api.post('/sheet-admin/reassign-rows', data)
    return response.data
  },

  // Lock rows (admin)
  lockRows: async (data) => {
    const response = await api.post('/sheet-admin/lock-rows', data)
    return response.data
  },

  // Unlock rows (admin)
  unlockRows: async (data) => {
    const response = await api.post('/sheet-admin/unlock-rows', data)
    return response.data
  }
}

// Sheet Audit API
export const sheetAuditApi = {
  // Get audit logs
  getAuditLogs: async (params = {}) => {
    const response = await api.get('/sheet-audit', { params })
    return response.data
  },

  // Get audit logs for a sheet
  getSheetAudit: async (sheetId, params = {}) => {
    const response = await api.get(`/sheet-audit/sheet/${sheetId}`, { params })
    return response.data
  },

  // Get audit logs for a row
  getRowAudit: async (rowId) => {
    const response = await api.get(`/sheet-audit/row/${rowId}`)
    return response.data
  },

  // Get audit logs for a user
  getUserAudit: async (userId, params = {}) => {
    const response = await api.get(`/sheet-audit/user/${userId}`, { params })
    return response.data
  },

  // Get audit stats
  getAuditStats: async (params = {}) => {
    const response = await api.get('/sheet-audit/stats', { params })
    return response.data
  },

  // Export audit logs
  exportAudit: async (params = {}) => {
    const response = await api.get('/sheet-audit/export', { params })
    return response.data
  }
}

export default api
