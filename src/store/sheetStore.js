import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { sheetApi, sheetAssignmentApi, sheetAdminApi } from '../api/sheetApi'

// Main sheet store
export const useSheetStore = create(
  persist(
    (set, get) => ({
      // State
      sheets: [],
      currentSheet: null,
      currentSheetData: null,
      rows: [],
      columns: [],
      loading: false,
      error: null,
      pagination: {
        page: 1,
        limit: 50,
        total: 0,
        pages: 0
      },
      selectedRows: [],
      filters: {},
      sortBy: null,
      sortOrder: 'desc',
      pendingCount: 0,

      // Actions
      setSheets: (sheets) => set({ sheets }),
      
      setCurrentSheet: (sheet) => set({ currentSheet: sheet }),
      
      setLoading: (loading) => set({ loading }),
      
      setError: (error) => set({ error }),
      
      setRows: (rows) => set({ rows }),
      
      setColumns: (columns) => set({ columns }),
      
      setPagination: (pagination) => set({ pagination }),
      
      setSelectedRows: (selectedRows) => set({ selectedRows }),
      
      toggleRowSelection: (rowId) => {
        const selectedRows = get().selectedRows
        if (selectedRows.includes(rowId)) {
          set({ selectedRows: selectedRows.filter(id => id !== rowId) })
        } else {
          set({ selectedRows: [...selectedRows, rowId] })
        }
      },
      
      selectAllRows: (rowIds) => set({ selectedRows: rowIds }),
      
      clearSelection: () => set({ selectedRows: [] }),
      
      setFilters: (filters) => set({ filters }),
      
      updateFilter: (key, value) => {
        const filters = get().filters
        set({ filters: { ...filters, [key]: value } })
      },
      
      clearFilters: () => set({ filters: {} }),
      
      setSorting: (sortBy, sortOrder = 'desc') => set({ sortBy, sortOrder }),
      
      // Fetch sheets for current user
      fetchSheets: async () => {
        try {
          set({ loading: true, error: null })
          const response = await sheetApi.getSheets()
          set({ sheets: response.sheets, loading: false })
          return response.sheets
        } catch (error) {
          set({ error: error.message, loading: false })
          throw error
        }
      },
      
      // Fetch sheet data
      fetchSheetData: async (sheetId, options = {}) => {
        try {
          set({ loading: true, error: null })
          const { page, limit, sortBy, sortOrder, filters } = get()
          
          const params = {
            page: options.page || page,
            limit: options.limit || 50,
            sortBy: options.sortBy || sortBy,
            sortOrder: options.sortOrder || sortOrder,
            ...filters,
            ...options.filters
          }
          
          const response = await sheetApi.getSheetData(sheetId, params)
          
          set({
            rows: response.rows,
            columns: response.columns,
            pagination: response.pagination,
            loading: false
          })
          
          return response
        } catch (error) {
          set({ error: error.message, loading: false })
          throw error
        }
      },
      
      // Create a new row
      createRow: async (sheetId, data) => {
        try {
          set({ loading: true, error: null })
          const response = await sheetApi.createRow(sheetId, data)
          
          // Refresh data
          await get().fetchSheetData(sheetId)
          
          set({ loading: false })
          return response
        } catch (error) {
          set({ error: error.message, loading: false })
          throw error
        }
      },
      
      // Update a row
      updateRow: async (sheetId, rowId, data) => {
        try {
          set({ loading: true, error: null })
          const response = await sheetApi.updateRow(sheetId, rowId, data)
          
          // Update row in local state
          const rows = get().rows.map(row => 
            row._id === rowId ? { ...row, ...response.row } : row
          )
          set({ rows, loading: false })
          
          return response
        } catch (error) {
          set({ error: error.message, loading: false })
          throw error
        }
      },
      
      // Delete a row
      deleteRow: async (sheetId, rowId) => {
        try {
          set({ loading: true, error: null })
          await sheetApi.deleteRow(sheetId, rowId)
          
          // Refresh data
          await get().fetchSheetData(sheetId)
          
          set({ loading: false })
        } catch (error) {
          set({ error: error.message, loading: false })
          throw error
        }
      },
      
      // Lock a row
      lockRow: async (sheetId, rowId) => {
        try {
          const response = await sheetApi.lockRow(sheetId, rowId)
          
          // Update row lock status
          const rows = get().rows.map(row => 
            row._id === rowId ? { ...row, isLocked: true, lockInfo: response.lock } : row
          )
          set({ rows })
          
          return response
        } catch (error) {
          throw error
        }
      },
      
      // Unlock a row
      unlockRow: async (sheetId, rowId) => {
        try {
          await sheetApi.unlockRow(sheetId, rowId)
          
          // Update row lock status
          const rows = get().rows.map(row => 
            row._id === rowId ? { ...row, isLocked: false, lockInfo: null } : row
          )
          set({ rows })
        } catch (error) {
          throw error
        }
      },
      
      // Submit row for review
      submitRow: async (sheetId, rowId, notes) => {
        try {
          const response = await sheetApi.submitRow(sheetId, rowId, notes)
          
          // Update row status
          const rows = get().rows.map(row => 
            row._id === rowId ? { ...row, status: 'pending_review' } : row
          )
          set({ rows })
          
          return response
        } catch (error) {
          throw error
        }
      },
      
      // Approve row
      approveRow: async (sheetId, rowId, notes) => {
        try {
          const response = await sheetApi.approveRow(sheetId, rowId, notes)
          
          // Update row status
          const rows = get().rows.map(row => 
            row._id === rowId ? { ...row, status: 'approved' } : row
          )
          set({ rows })
          
          return response
        } catch (error) {
          throw error
        }
      },
      
      // Reject row
      rejectRow: async (sheetId, rowId, reason) => {
        try {
          const response = await sheetApi.rejectRow(sheetId, rowId, reason)
          
          // Update row status
          const rows = get().rows.map(row => 
            row._id === rowId ? { ...row, status: 'rejected' } : row
          )
          set({ rows })
          
          return response
        } catch (error) {
          throw error
        }
      },
      
      // Return row for revision
      returnRow: async (sheetId, rowId, reason) => {
        try {
          const response = await sheetApi.returnRow(sheetId, rowId, reason)
          
          // Update row status
          const rows = get().rows.map(row => 
            row._id === rowId ? { ...row, status: 'returned' } : row
          )
          set({ rows })
          
          return response
        } catch (error) {
          throw error
        }
      },
      
      // Bulk submit
      bulkSubmit: async (sheetId, rowIds, notes) => {
        try {
          const response = await sheetApi.bulkSubmit(sheetId, rowIds, notes)
          
          // Refresh data
          await get().fetchSheetData(sheetId)
          set({ selectedRows: [] })
          
          return response
        } catch (error) {
          throw error
        }
      },
      
      // Bulk approve
      bulkApprove: async (sheetId, rowIds, notes) => {
        try {
          const response = await sheetApi.bulkApprove(sheetId, rowIds, notes)
          
          // Refresh data
          await get().fetchSheetData(sheetId)
          set({ selectedRows: [] })
          
          return response
        } catch (error) {
          throw error
        }
      },
      
      // Get pending rows
      fetchPendingRows: async (sheetId) => {
        try {
          const response = await sheetApi.getPendingRows(sheetId)
          return response
        } catch (error) {
          throw error
        }
      },
      
      // Navigate pagination
      goToPage: async (page) => {
        const { currentSheet, fetchSheetData } = get()
        if (currentSheet) {
          await fetchSheetData(currentSheet.sheetId, { page })
        }
      },
      
      // Reset store
      reset: () => {
        set({
          sheets: [],
          currentSheet: null,
          currentSheetData: null,
          rows: [],
          columns: [],
          loading: false,
          error: null,
          pagination: { page: 1, limit: 50, total: 0, pages: 0 },
          selectedRows: [],
          filters: {},
          sortBy: null,
          sortOrder: 'desc'
        })
      }
    }),
    {
      name: 'sheet-store',
      partialize: (state) => ({
        selectedRows: state.selectedRows,
        filters: state.filters
      })
    }
  )
)

export default useSheetStore
