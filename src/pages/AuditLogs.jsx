import React, { useState } from 'react'
import { FileText, Search, Filter, Download, Calendar, User, Activity, Shield, Clock, ChevronLeft, ChevronRight, Eye, X } from 'lucide-react'
import MainLayout from '../components/Layout/MainLayout'
import { useApi } from '../hooks/useApi'

const AuditLogs = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterAction, setFilterAction] = useState('all')
  const [filterDate, setFilterDate] = useState('all')
  const [page, setPage] = useState(1)
  const [selectedLog, setSelectedLog] = useState(null)

  // Mock data for demonstration
  const mockAuditLogs = [
    { id: 'LOG001', timestamp: '2024-03-15 10:30:45', adminId: 'ADM001', adminName: 'Admin Johnson', action: 'LOAN_APPROVE', resource: 'Loan', resourceId: 'LN001', member: 'John Adebayo', details: 'Approved loan application for ₦150,000', ipAddress: '192.168.1.100', status: 'success' },
    { id: 'LOG002', timestamp: '2024-03-15 10:28:12', adminId: 'ADM002', adminName: 'Admin Williams', action: 'MEMBER_CREATE', resource: 'Member', resourceId: 'M100', member: 'New Member', details: 'Created new member account', ipAddress: '192.168.1.101', status: 'success' },
    { id: 'LOG003', timestamp: '2024-03-15 10:25:30', adminId: 'ADM001', adminName: 'Admin Johnson', action: 'LOAN_REJECT', resource: 'Loan', resourceId: 'LN002', member: 'Sarah Okonkwo', details: 'Rejected loan application - insufficient documents', ipAddress: '192.168.1.100', status: 'success' },
    { id: 'LOG004', timestamp: '2024-03-15 10:20:15', adminId: 'ADM003', adminName: 'Admin Brown', action: 'SETTINGS_UPDATE', resource: 'Settings', resourceId: 'SET001', member: '-', details: 'Updated interest rate settings to 5%', ipAddress: '192.168.1.102', status: 'success' },
    { id: 'LOG005', timestamp: '2024-03-15 10:15:00', adminId: 'ADM002', adminName: 'Admin Williams', action: 'KYC_VERIFY', resource: 'Member', resourceId: 'M003', member: 'Mike Ogunleye', details: 'Verified KYC documents', ipAddress: '192.168.1.101', status: 'success' },
    { id: 'LOG006', timestamp: '2024-03-15 10:10:22', adminId: 'ADM001', adminName: 'Admin Johnson', action: 'LOAN_DISBURSE', resource: 'Loan', resourceId: 'LN003', member: 'Grace Ibrahim', details: 'Disbursed loan amount to member wallet', ipAddress: '192.168.1.100', status: 'success' },
    { id: 'LOG007', timestamp: '2024-03-15 10:05:18', adminId: 'ADM004', adminName: 'Super Admin', action: 'USER_LOGIN', resource: 'Auth', resourceId: 'AUTH001', member: '-', details: 'Successful login from new device', ipAddress: '192.168.1.103', status: 'success' },
    { id: 'LOG008', timestamp: '2024-03-15 10:00:45', adminId: 'ADM002', adminName: 'Admin Williams', action: 'CONTRIBUTION_REVERSE', resource: 'Transaction', resourceId: 'TXN001', member: 'David Adeyemi', details: 'Reversed contribution due to failed payment', ipAddress: '192.168.1.101', status: 'warning' },
    { id: 'LOG009', timestamp: '2024-03-15 09:55:30', adminId: 'ADM003', adminName: 'Admin Brown', action: 'ROLE_UPDATE', resource: 'Admin', resourceId: 'ADM005', member: '-', details: 'Updated admin role permissions', ipAddress: '192.168.1.102', status: 'success' },
    { id: 'LOG010', timestamp: '2024-03-15 09:50:12', adminId: 'ADM001', adminName: 'Admin Johnson', action: 'DATA_EXPORT', resource: 'Report', resourceId: 'RPT001', member: '-', details: 'Exported monthly report', ipAddress: '192.168.1.100', status: 'success' }
  ]

  const mockStats = {
    totalLogs: 15847,
    todayLogs: 156,
    failedActions: 12,
    criticalActions: 23
  }

  const auditLogs = mockAuditLogs
  const stats = mockStats

  const getActionBadge = (action) => {
    const types = {
      LOAN_APPROVE: { bg: 'bg-green-100 dark:bg-green-900', text: 'text-green-700 dark:text-green-200', icon: Activity },
      LOAN_REJECT: { bg: 'bg-red-100 dark:bg-red-900', text: 'text-red-700 dark:text-red-200', icon: X },
      LOAN_DISBURSE: { bg: 'bg-blue-100 dark:bg-blue-900', text: 'text-blue-700 dark:text-blue-200', icon: Activity },
      MEMBER_CREATE: { bg: 'bg-purple-100 dark:bg-purple-900', text: 'text-purple-700 dark:text-purple-200', icon: User },
      KYC_VERIFY: { bg: 'bg-green-100 dark:bg-green-900', text: 'text-green-700 dark:text-green-200', icon: Shield },
      SETTINGS_UPDATE: { bg: 'bg-yellow-100 dark:bg-yellow-900', text: 'text-yellow-700 dark:text-yellow-200', icon: FileText },
      USER_LOGIN: { bg: 'bg-blue-100 dark:bg-blue-900', text: 'text-blue-700 dark:text-blue-200', icon: User },
      CONTRIBUTION_REVERSE: { bg: 'bg-orange-100 dark:bg-orange-900', text: 'text-orange-700 dark:text-orange-200', icon: Activity },
      ROLE_UPDATE: { bg: 'bg-purple-100 dark:bg-purple-900', text: 'text-purple-700 dark:text-purple-200', icon: Shield },
      DATA_EXPORT: { bg: 'bg-cyan-100 dark:bg-cyan-900', text: 'text-cyan-700 dark:text-cyan-200', icon: Download }
    }
    const badge = types[action] || { bg: 'bg-gray-100 dark:bg-gray-900', text: 'text-gray-700 dark:text-gray-200', icon: Activity }
    const Icon = badge.icon
    return {
      className: `${badge.bg} ${badge.text}`,
      icon: Icon
    }
  }

  const filteredLogs = auditLogs.filter(log => {
    if (filterAction !== 'all' && !log.action.includes(filterAction)) return false
    if (searchTerm && !log.adminName.toLowerCase().includes(searchTerm.toLowerCase()) && !log.resourceId.toLowerCase().includes(searchTerm.toLowerCase())) return false
    return true
  })

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="section-title">Audit Logs</h1>
            <p className="text-neutral-600 dark:text-neutral-400">Track all administrative actions and system activities</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
            <Download size={18} />
            Export Logs
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="card-hover">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">Total Logs</p>
                <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">{stats.totalLogs.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <FileText className="text-blue-600 dark:text-blue-400" size={24} />
              </div>
            </div>
          </div>

          <div className="card-hover">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">Today's Logs</p>
                <p className="text-2xl font-bold text-green-600">{stats.todayLogs}</p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                <Clock className="text-green-600 dark:text-green-400" size={24} />
              </div>
            </div>
          </div>

          <div className="card-hover">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">Failed Actions</p>
                <p className="text-2xl font-bold text-red-600">{stats.failedActions}</p>
              </div>
              <div className="p-3 bg-red-100 dark:bg-red-900 rounded-lg">
                <Activity className="text-red-600 dark:text-red-400" size={24} />
              </div>
            </div>
          </div>

          <div className="card-hover">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">Critical Actions</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.criticalActions}</p>
              </div>
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                <Shield className="text-yellow-600 dark:text-yellow-400" size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700 p-6">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 text-neutral-400" size={20} />
              <input
                type="text"
                placeholder="Search by admin or resource ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-50 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter size={20} className="text-neutral-600 dark:text-neutral-400" />
              <select
                value={filterAction}
                onChange={(e) => setFilterAction(e.target.value)}
                className="px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-50 focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="all">All Actions</option>
                <option value="LOAN">Loan Actions</option>
                <option value="MEMBER">Member Actions</option>
                <option value="SETTINGS">Settings</option>
                <option value="AUTH">Authentication</option>
              </select>
              <select
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-50 focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>
            </div>
          </div>

          {/* Audit Logs Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral-200 dark:border-neutral-700">
                  <th className="text-left py-3 px-4 font-semibold text-neutral-900 dark:text-neutral-50">Timestamp</th>
                  <th className="text-left py-3 px-4 font-semibold text-neutral-900 dark:text-neutral-50">Action</th>
                  <th className="text-left py-3 px-4 font-semibold text-neutral-900 dark:text-neutral-50">Admin</th>
                  <th className="text-left py-3 px-4 font-semibold text-neutral-900 dark:text-neutral-50">Resource</th>
                  <th className="text-left py-3 px-4 font-semibold text-neutral-900 dark:text-neutral-50">Details</th>
                  <th className="text-left py-3 px-4 font-semibold text-neutral-900 dark:text-neutral-50">IP Address</th>
                  <th className="text-left py-3 px-4 font-semibold text-neutral-900 dark:text-neutral-50">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log) => {
                  const badge = getActionBadge(log.action)
                  return (
                    <tr key={log.id} className="border-b border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors">
                      <td className="py-3 px-4 text-neutral-600 dark:text-neutral-400">
                        <div className="flex items-center gap-2">
                          <Clock size={14} />
                          {log.timestamp}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className={`inline-flex items-center gap-1 px-2 py-1 ${badge.className} rounded text-xs font-medium`}>
                          <badge.icon size={12} />
                          {log.action.replace(/_/g, ' ')}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <User size={14} className="text-neutral-500" />
                          <span className="text-neutral-900 dark:text-neutral-50">{log.adminName}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-neutral-600 dark:text-neutral-400">{log.resource}</span>
                        <span className="text-neutral-400 mx-1">/</span>
                        <span className="text-blue-600">{log.resourceId}</span>
                      </td>
                      <td className="py-3 px-4 text-neutral-600 dark:text-neutral-400 max-w-xs truncate">
                        {log.details}
                      </td>
                      <td className="py-3 px-4 text-neutral-600 dark:text-neutral-400 font-mono text-sm">
                        {log.ipAddress}
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => setSelectedLog(log)}
                          className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye size={16} className="text-blue-600" />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-6">
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Showing <span className="font-medium">{filteredLogs.length}</span> of <span className="font-medium">{stats.totalLogs}</span> logs
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 border border-neutral-300 dark:border-neutral-600 rounded-lg disabled:opacity-50 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
              >
                <ChevronLeft size={20} />
              </button>
              <span className="text-sm font-medium">Page {page}</span>
              <button
                onClick={() => setPage(p => p + 1)}
                className="p-2 border border-neutral-300 dark:border-neutral-600 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Log Detail Modal */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-neutral-800 rounded-xl p-6 w-full max-w-2xl shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-50">Audit Log Details</h2>
              <button
                onClick={() => setSelectedLog(null)}
                className="p-1 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-neutral-50 dark:bg-neutral-900 rounded-lg">
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">Log ID</p>
                  <p className="font-mono font-medium text-neutral-900 dark:text-neutral-50">{selectedLog.id}</p>
                </div>
                <div className="p-4 bg-neutral-50 dark:bg-neutral-900 rounded-lg">
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">Timestamp</p>
                  <p className="font-medium text-neutral-900 dark:text-neutral-50">{selectedLog.timestamp}</p>
                </div>
                <div className="p-4 bg-neutral-50 dark:bg-neutral-900 rounded-lg">
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">Admin</p>
                  <p className="font-medium text-neutral-900 dark:text-neutral-50">{selectedLog.adminName} ({selectedLog.adminId})</p>
                </div>
                <div className="p-4 bg-neutral-50 dark:bg-neutral-900 rounded-lg">
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">IP Address</p>
                  <p className="font-mono font-medium text-neutral-900 dark:text-neutral-50">{selectedLog.ipAddress}</p>
                </div>
              </div>
              <div className="p-4 bg-neutral-50 dark:bg-neutral-900 rounded-lg">
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">Action</p>
                <p className="font-medium text-neutral-900 dark:text-neutral-50">{selectedLog.action.replace(/_/g, ' ')}</p>
              </div>
              <div className="p-4 bg-neutral-50 dark:bg-neutral-900 rounded-lg">
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">Details</p>
                <p className="text-neutral-700 dark:text-neutral-300">{selectedLog.details}</p>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-neutral-200 dark:border-neutral-700">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  selectedLog.status === 'success' ? 'bg-green-100 text-green-700' :
                  selectedLog.status === 'warning' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {selectedLog.status.toUpperCase()}
                </span>
                <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                  <Download size={18} />
                  Download Log
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  )
}

export default AuditLogs
