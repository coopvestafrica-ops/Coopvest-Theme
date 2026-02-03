import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useSheetStore } from '../store/sheetStore'
import { useAuthStore } from '../store/authStore'
import DataGrid from '../components/DataSheets/DataGrid'
import { sheetApi } from '../api/sheetApi'
import toast from 'react-hot-toast'
import { 
  ArrowLeft, Plus, RefreshCw, ChevronLeft, ChevronRight,
  Download, Upload, Settings, Users, History
} from 'lucide-react'
import clsx from 'clsx'

const DataSheets = () => {
  const navigate = useNavigate()
  const { sheetId } = useParams()
  
  const { 
    sheets, 
    currentSheet, 
    setCurrentSheet,
    fetchSheets, 
    fetchSheetData,
    createRow,
    updateRow,
    deleteRow,
    bulkSubmit,
    bulkApprove,
    pagination,
    goToPage,
    loading,
    reset
  } = useSheetStore()
  
  const { allowedSheets, isSuperAdmin, getSheetPermissions } = useAuthStore()
  
  const [activeTab, setActiveTab] = useState(sheetId || null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newRowData, setNewRowData] = useState({})
  const [showAuditLog, setShowAuditLog] = useState(false)
  
  const permissions = sheetId ? getSheetPermissions(sheetId) : {}
  
  // Load sheets on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const userSheets = await fetchSheets()
        
        // If sheetId provided in URL, set it as active
        if (sheetId && userSheets.find(s => s.sheetId === sheetId)) {
          setActiveTab(sheetId)
          const sheet = userSheets.find(s => s.sheetId === sheetId)
          setCurrentSheet(sheet)
          await fetchSheetData(sheetId)
        } else if (userSheets.length > 0 && !activeTab) {
          setActiveTab(userSheets[0].sheetId)
          setCurrentSheet(userSheets[0])
          await fetchSheetData(userSheets[0].sheetId)
        }
      } catch (error) {
        console.error('Failed to load sheets:', error)
        toast.error('Failed to load data sheets')
      }
    }
    
    loadData()
    
    return () => reset()
  }, [sheetId])
  
  // Switch sheet tab
  const handleTabChange = async (newSheetId) => {
    const sheet = sheets.find(s => s.sheetId === newSheetId)
    setActiveTab(newSheetId)
    setCurrentSheet(sheet)
    setNewRowData({})
    await fetchSheetData(newSheetId)
  }
  
  // Handle row create
  const handleCreateRow = async () => {
    if (!activeTab) return
    
    try {
      await createRow(activeTab, { data: newRowData })
      toast.success('Row created successfully')
      setShowCreateModal(false)
      setNewRowData({})
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to create row')
    }
  }
  
  // Handle row update
  const handleRowUpdate = async (rowId, data) => {
    try {
      await updateRow(activeTab, rowId, data)
      toast.success('Row updated')
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update row')
    }
  }
  
  // Handle row delete
  const handleRowDelete = async (sheetId, rowId) => {
    if (!window.confirm('Are you sure you want to delete this row?')) return
    
    try {
      await deleteRow(sheetId, rowId)
      toast.success('Row deleted')
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to delete row')
    }
  }
  
  // Handle row submit
  const handleRowSubmit = async (sheetId, rowIds) => {
    try {
      await bulkSubmit(sheetId, rowIds, 'Bulk submit')
      toast.success(`${rowIds.length} rows submitted for review`)
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to submit rows')
    }
  }
  
  // Handle row approve
  const handleRowApprove = async (sheetId, rowIds) => {
    try {
      await bulkApprove(sheetId, rowIds, 'Bulk approve')
      toast.success(`${rowIds.length} rows approved`)
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to approve rows')
    }
  }
  
  // Current sheet data
  const currentSheetData = sheets.find(s => s.sheetId === activeTab)
  
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Data Sheets</h1>
                <p className="text-sm text-gray-500">
                  Manage your operational data with spreadsheet-like interface
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {isSuperAdmin() && (
                <button
                  onClick={() => navigate('/sheet-admin')}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 flex items-center gap-2"
                >
                  <Settings className="w-4 h-4" />
                  Admin Panel
                </button>
              )}
            </div>
          </div>
        </div>
        
        {/* Sheet Tabs */}
        {sheets.length > 0 && (
          <div className="px-6 border-t">
            <div className="flex gap-1 -mb-px overflow-x-auto">
              {sheets.map((sheet) => (
                <button
                  key={sheet.sheetId}
                  onClick={() => handleTabChange(sheet.sheetId)}
                  className={clsx(
                    'px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors',
                    activeTab === sheet.sheetId
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  )}
                >
                  {sheet.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Main Content */}
      <div className="p-6">
        {sheets.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="max-w-md mx-auto">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">No Data Sheets Assigned</h2>
              <p className="text-gray-500 mb-4">
                You don't have any data sheets assigned to your account. 
                Contact an administrator to get access.
              </p>
              {isSuperAdmin() && (
                <button
                  onClick={() => navigate('/sheet-admin')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
                >
                  Go to Admin Panel
                </button>
              )}
            </div>
          </div>
        ) : activeTab ? (
          <div>
            {/* Sheet Info Bar */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <h2 className="text-lg font-medium text-gray-900">
                  {currentSheetData?.name || activeTab}
                </h2>
                <span className="text-sm text-gray-500">
                  {pagination.total} rows
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => fetchSheetData(activeTab)}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-white rounded-lg"
                  title="Refresh"
                >
                  <RefreshCw className={clsx('w-5 h-5', loading && 'animate-spin')} />
                </button>
                
                <div className="flex border rounded-lg overflow-hidden bg-white shadow-sm">
                  <button
                    onClick={() => toast.success('Exporting CSV...')}
                    className="p-2 text-gray-600 hover:bg-gray-50 border-r"
                    title="Export CSV"
                  >
                    <Download className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => toast.success('Opening Import Dialog...')}
                    className="p-2 text-gray-600 hover:bg-gray-50"
                    title="Import CSV"
                  >
                    <Upload className="w-5 h-5" />
                  </button>
                </div>

                {permissions.canCreate && (
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center gap-2 shadow-sm"
                  >
                    <Plus className="w-4 h-4" />
                    Add Row
                  </button>
                )}
              </div>
            </div>
            
            {/* Data Grid */}
            <DataGrid
              sheetId={activeTab}
              columns={currentSheetData?.columns || []}
              onRowUpdate={handleRowUpdate}
              onRowDelete={handleRowDelete}
              onRowSubmit={handleRowSubmit}
              onRowApprove={handleRowApprove}
            />
            
            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-gray-500">
                  Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                  {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                  {pagination.total} results
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => goToPage(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className="p-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <span className="px-3 py-1 text-sm">
                    Page {pagination.page} of {pagination.pages}
                  </span>
                  <button
                    onClick={() => goToPage(pagination.page + 1)}
                    disabled={pagination.page === pagination.pages}
                    className="p-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : null}
      </div>
      
      {/* Create Row Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[80vh] overflow-auto">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">Add New Row</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-4">
              <div className="grid grid-cols-2 gap-4">
                {currentSheetData?.columns?.map((column) => (
                  <div key={column.key}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {column.label}
                      {column.required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    <input
                      type={column.type === 'number' ? 'number' : column.type === 'date' ? 'date' : 'text'}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={newRowData[column.key] || ''}
                      onChange={(e) => setNewRowData({
                        ...newRowData,
                        [column.key]: column.type === 'number' ? parseFloat(e.target.value) : e.target.value
                      })}
                      placeholder={column.placeholder}
                    />
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex items-center justify-end gap-2 p-4 border-t bg-gray-50">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateRow}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DataSheets
