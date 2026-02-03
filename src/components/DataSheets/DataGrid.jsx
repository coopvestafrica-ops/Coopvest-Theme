import React, { useState, useCallback, useRef, useEffect } from 'react'
import { useSheetStore } from '../../store/sheetStore'
import { useAuthStore } from '../../store/authStore'
import { 
  ChevronUp, ChevronDown, Filter, Search, Plus, Trash2, 
  Lock, Unlock, CheckSquare, Square, Loader2, Save, X
} from 'lucide-react'
import clsx from 'clsx'

// Cell renderer based on column type
const CellRenderer = ({ value, column, row, onEdit, isEditing, isLocked }) => {
  const canEdit = column.allowEdit && !column.readOnly && !isLocked && row.canEdit
  
  if (column.type === 'boolean') {
    return (
      <div className="flex items-center justify-center">
        {value ? (
          <CheckSquare className="w-5 h-5 text-green-600" />
        ) : (
          <Square className="w-5 h-5 text-gray-300" />
        )}
      </div>
    )
  }
  
  if (column.type === 'date' && value) {
    const date = new Date(value)
    return <span>{date.toLocaleDateString()}</span>
  }
  
  if (column.type === 'currency' && value !== null && value !== undefined) {
    return <span>{typeof value === 'number' ? `$${value.toLocaleString()}` : value}</span>
  }
  
  if (column.type === 'enum' && column.validation?.enumValues) {
    const displayValue = column.validation.enumValues.find(e => e === value) || value
    return <span>{displayValue}</span>
  }
  
  return <span className="truncate">{value?.toString() || ''}</span>
}

// Inline cell editor
const CellEditor = ({ value, column, onSave, onCancel, autoFocus }) => {
  const [editValue, setEditValue] = useState(value || '')
  
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      onSave(editValue)
    } else if (e.key === 'Escape') {
      onCancel()
    }
  }
  
  const renderInput = () => {
    switch (column.type) {
      case 'number':
      case 'currency':
        return (
          <input
            type="number"
            className="w-full px-2 py-1 border border-blue-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-200"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus={autoFocus}
            step={column.type === 'currency' ? '0.01' : '1'}
            min={column.validation?.min}
            max={column.validation?.max}
            placeholder={column.placeholder}
          />
        )
      
      case 'date':
        return (
          <input
            type="date"
            className="w-full px-2 py-1 border border-blue-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-200"
            value={editValue ? editValue.split('T')[0] : ''}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus={autoFocus}
          />
        )
      
      case 'boolean':
        return (
          <select
            className="w-full px-2 py-1 border border-blue-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-200"
            value={editValue ? 'true' : 'false'}
            onChange={(e) => onSave(e.target.value === 'true')}
            autoFocus={autoFocus}
          >
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        )
      
      case 'enum':
        return (
          <select
            className="w-full px-2 py-1 border border-blue-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-200"
            value={editValue}
            onChange={(e) => onSave(e.target.value)}
            autoFocus={autoFocus}
          >
            <option value="">Select...</option>
            {column.validation?.enumValues?.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        )
      
      case 'textarea':
        return (
          <textarea
            className="w-full px-2 py-1 border border-blue-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-200"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                onSave(editValue)
              } else if (e.key === 'Escape') {
                onCancel()
              }
            }}
            autoFocus={autoFocus}
            rows={3}
            placeholder={column.placeholder}
          />
        )
      
      default:
        return (
          <input
            type="text"
            className="w-full px-2 py-1 border border-blue-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-200"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus={autoFocus}
            maxLength={column.validation?.maxLength}
            placeholder={column.placeholder}
          />
        )
    }
  }
  
  return <div className="w-full">{renderInput()}</div>
}

// Status badge component
const StatusBadge = ({ status }) => {
  const statusConfig = {
    draft: { color: 'bg-gray-100 text-gray-700', label: 'Draft' },
    pending_review: { color: 'bg-yellow-100 text-yellow-700', label: 'Pending Review' },
    approved: { color: 'bg-green-100 text-green-700', label: 'Approved' },
    rejected: { color: 'bg-red-100 text-red-700', label: 'Rejected' },
    returned: { color: 'bg-orange-100 text-orange-700', label: 'Returned' },
    locked: { color: 'bg-purple-100 text-purple-700', label: 'Locked' }
  }
  
  const config = statusConfig[status] || statusConfig.draft
  
  return (
    <span className={clsx('px-2 py-0.5 rounded-full text-xs font-medium', config.color)}>
      {config.label}
    </span>
  )
}

// Main DataGrid component
const DataGrid = ({ sheetId, columns, rows, onRowUpdate, onRowDelete, onRowSubmit, onRowApprove }) => {
  const { loading, selectedRows, toggleRowSelection, selectAllRows, clearSelection } = useSheetStore()
  const { getSheetPermissions, isSuperAdmin } = useAuthStore()
  const permissions = getSheetPermissions(sheetId)
  
  const [editingCell, setEditingCell] = useState(null)
  const [sortColumn, setSortColumn] = useState(null)
  const [sortDirection, setSortDirection] = useState('asc')
  const [filterText, setFilterText] = useState('')
  const [columnWidths, setColumnWidths] = useState({})
  const tableRef = useRef(null)
  
  // Handle cell edit
  const handleCellEdit = (rowId, columnKey, value) => {
    const row = rows.find(r => r._id === rowId)
    const newData = { ...row.data, [columnKey]: value }
    onRowUpdate(rowId, { data: newData })
    setEditingCell(null)
  }
  
  // Handle sorting
  const handleSort = (columnKey) => {
    if (sortColumn === columnKey) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(columnKey)
      setSortDirection('asc')
    }
  }
  
  // Filter and sort rows
  const filteredRows = rows.filter(row => {
    if (!filterText) return true
    const searchLower = filterText.toLowerCase()
    return Object.values(row.data || {}).some(
      val => val?.toString().toLowerCase().includes(searchLower)
    )
  })
  
  const sortedRows = [...filteredRows].sort((a, b) => {
    if (!sortColumn) return 0
    
    const aVal = a.data?.[sortColumn] || a[sortColumn]
    const bVal = b.data?.[sortColumn] || b[sortColumn]
    
    if (aVal === bVal) return 0
    
    const comparison = aVal > bVal ? 1 : -1
    return sortDirection === 'asc' ? comparison : -comparison
  })
  
  // Resize column
  const handleColumnResize = (columnKey, delta) => {
    setColumnWidths(prev => ({
      ...prev,
      [columnKey]: Math.max(50, (prev[columnKey] || 150) + delta)
    }))
  }
  
  // Select all rows
  const handleSelectAll = () => {
    if (selectedRows.length === sortedRows.length) {
      clearSelection()
    } else {
      selectAllRows(sortedRows.map(r => r._id))
    }
  }
  
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-4 border-b bg-gray-50">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              className="pl-9 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
            />
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {selectedRows.length > 0 && permissions.canSubmit && (
            <>
              <button
                onClick={() => onRowSubmit(sheetId, selectedRows)}
                className="px-3 py-2 bg-yellow-100 text-yellow-700 rounded-lg text-sm font-medium hover:bg-yellow-200"
              >
                Submit ({selectedRows.length})
              </button>
              {permissions.canApprove && (
                <button
                  onClick={() => onRowApprove(sheetId, selectedRows)}
                  className="px-3 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200"
                >
                  Approve ({selectedRows.length})
                </button>
              )}
            </>
          )}
        </div>
      </div>
      
      {/* Table */}
      <div className="overflow-auto max-h-[600px]" ref={tableRef}>
        <table className="w-full border-collapse">
          <thead className="bg-gray-100 sticky top-0 z-10">
            <tr>
              {permissions.canEdit || permissions.canDelete || permissions.canSubmit ? (
                <th className="w-10 px-2 py-3 text-center border-b">
                  <input
                    type="checkbox"
                    checked={selectedRows.length === sortedRows.length && sortedRows.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300"
                  />
                </th>
              ) : null}
              <th className="w-10 px-2 py-3 text-center border-b">Status</th>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b cursor-pointer hover:bg-gray-200"
                  style={{ width: columnWidths[column.key] || column.width || 150 }}
                  onClick={() => handleSort(column.key)}
                >
                  <div className="flex items-center gap-1">
                    <span>{column.label}</span>
                    {column.required && <span className="text-red-500">*</span>}
                    {sortColumn === column.key && (
                      sortDirection === 'asc' 
                        ? <ChevronUp className="w-4 h-4" />
                        : <ChevronDown className="w-4 h-4" />
                    )}
                  </div>
                </th>
              ))}
              {(permissions.canDelete || permissions.canAssignRows) && (
                <th className="w-20 px-2 py-3 text-center border-b">Actions</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={columns.length + 3} className="px-6 py-12 text-center">
                  <div className="flex items-center justify-center gap-2 text-gray-500">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Loading...
                  </div>
                </td>
              </tr>
            ) : sortedRows.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 3} className="px-6 py-12 text-center text-gray-500">
                  No data available
                </td>
              </tr>
            ) : (
              sortedRows.map((row) => (
                <tr 
                  key={row._id} 
                  className={clsx(
                    'hover:bg-gray-50',
                    row.isLocked && 'bg-yellow-50',
                    selectedRows.includes(row._id) && 'bg-blue-50'
                  )}
                >
                  {permissions.canEdit || permissions.canDelete || permissions.canSubmit ? (
                    <td className="px-2 py-3 text-center border-r">
                      <input
                        type="checkbox"
                        checked={selectedRows.includes(row._id)}
                        onChange={() => toggleRowSelection(row._id)}
                        className="rounded border-gray-300"
                      />
                    </td>
                  ) : null}
                  <td className="px-2 py-3 text-center border-r">
                    <StatusBadge status={row.status} />
                  </td>
                  {columns.map((column) => (
                    <td
                      key={`${row._id}-${column.key}`}
                      className={clsx(
                        'px-3 py-2 text-sm text-gray-900 border-r',
                        column.hidden && 'hidden',
                        !row.canEdit && column.allowEdit && !column.readOnly && 'bg-gray-50'
                      )}
                      style={{ width: columnWidths[column.key] || column.width || 150 }}
                      onDoubleClick={() => {
                        if (column.allowEdit && !column.readOnly && row.canEdit && !row.isLocked && row.status !== 'approved') {
                          setEditingCell({ rowId: row._id, columnKey: column.key })
                        }
                      }}
                    >
                      {editingCell?.rowId === row._id && editingCell?.columnKey === column.key ? (
                        <CellEditor
                          value={row.data?.[column.key]}
                          column={column}
                          onSave={(value) => handleCellEdit(row._id, column.key, value)}
                          onCancel={() => setEditingCell(null)}
                          autoFocus
                        />
                      ) : (
                        <CellRenderer
                          value={row.data?.[column.key]}
                          column={column}
                          row={row}
                          isLocked={row.isLocked}
                        />
                      )}
                    </td>
                  ))}
                  {(permissions.canDelete || permissions.canAssignRows) && (
                    <td className="px-2 py-3 text-center border-l">
                      <div className="flex items-center justify-center gap-1">
                        {permissions.canDelete && row.canEdit && (
                          <button
                            onClick={() => onRowDelete(sheetId, row._id)}
                            className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                        {row.isLocked && (
                          <button
                            onClick={() => {/* Unlock handler */}}
                            className="p-1 text-green-500 hover:text-green-700 hover:bg-green-50 rounded"
                            title="Unlock"
                          >
                            <Unlock className="w-4 h-4" />
                          </button>
                        )}
                        {!row.isLocked && row.canEdit && (
                          <button
                            onClick={() => {/* Lock handler */}}
                            className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
                            title="Lock"
                          >
                            <Lock className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default DataGrid
