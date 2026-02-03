import { create } from 'zustand'

export const useAuthStore = create((set) => ({
  user: null,
  token: localStorage.getItem('token') || null,
  role: localStorage.getItem('role') || null,
  permissions: JSON.parse(localStorage.getItem('permissions') || '[]'),
  allowedSheets: JSON.parse(localStorage.getItem('allowedSheets') || '[]'),
  
  login: (user, token, role, permissions, allowedSheets = []) => {
    localStorage.setItem('token', token)
    localStorage.setItem('role', role)
    localStorage.setItem('permissions', JSON.stringify(permissions))
    localStorage.setItem('allowedSheets', JSON.stringify(allowedSheets))
    set({ user, token, role, permissions, allowedSheets })
  },
  
  updateUserData: (user, permissions, allowedSheets) => {
    if (permissions) localStorage.setItem('permissions', JSON.stringify(permissions))
    if (allowedSheets) localStorage.setItem('allowedSheets', JSON.stringify(allowedSheets))
    set({ user, permissions, allowedSheets })
  },
  
  logout: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('role')
    localStorage.removeItem('permissions')
    localStorage.removeItem('allowedSheets')
    set({ user: null, token: null, role: null, permissions: [], allowedSheets: [] })
  },
  
  hasPermission: (permission) => {
    const state = useAuthStore.getState()
    return state.permissions.includes(permission) || state.role === 'super_admin'
  },
  
  isSuperAdmin: () => {
    const state = useAuthStore.getState()
    return state.role === 'super_admin'
  },
  
  hasSheetAccess: (sheetId) => {
    const state = useAuthStore.getState()
    if (state.role === 'super_admin') return true
    return state.allowedSheets.some(s => s.sheetId === sheetId)
  },
  
  getSheetPermissions: (sheetId) => {
    const state = useAuthStore.getState()
    if (state.role === 'super_admin') {
      return {
        canView: true,
        canEdit: true,
        canCreate: true,
        canDelete: true,
        canSubmit: true,
        canApprove: true,
        canAssignRows: true,
        canExport: true,
        canViewAudit: true
      }
    }
    const sheet = state.allowedSheets.find(s => s.sheetId === sheetId)
    return sheet?.permissions || {}
  }
}))
