import React, { useState, useEffect } from 'react'
import { 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle,
  Users,
  DollarSign,
  Calendar,
  ChevronRight,
  Eye,
  X
} from 'lucide-react'
import MainLayout from '../components/Layout/MainLayout'
import { useRollovers, usePendingRollovers, useRolloverStats, useRollover } from '../services/rolloverService'
import toast from 'react-hot-toast'

const Rollovers = () => {
  const [statusFilter, setStatusFilter] = useState('')
  const [selectedRollover, setSelectedRollover] = useState(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [actionLoading, setActionLoading] = useState(false)

  const { rollovers, loading, refetch } = useRollovers({ status: statusFilter })
  const { pendingRollovers, refetch: refetchPending } = usePendingRollovers()
  const { stats, refetch: refetchStats } = useRolloverStats()
  const { approve, reject, rollover: currentRollover, guarantors } = useRollover(selectedRollover?._id || selectedRollover?.id)

  // Stats from API
  const rolloverStats = stats || {
    totalRequests: 0,
    pendingCount: 0,
    awaitingApprovalCount: 0,
    approvedCount: 0,
    rejectedCount: 0,
    cancelledCount: 0
  }

  const handleViewDetails = (rollover) => {
    setSelectedRollover(rollover)
    setShowDetailModal(true)
  }

  const handleApprove = async () => {
    if (!selectedRollover) return
    setActionLoading(true)
    try {
      await approve()
      toast.success('Rollover approved successfully!')
      setShowDetailModal(false)
      refetch()
      refetchPending()
      refetchStats()
    } catch (error) {
      toast.error(error.message || 'Failed to approve rollover')
    } finally {
      setActionLoading(false)
    }
  }

  const handleReject = async () => {
    if (!selectedRollover || !rejectReason.trim()) {
      toast.error('Please provide a rejection reason')
      return
    }
    setActionLoading(true)
    try {
      await reject(rejectReason)
      toast.success('Rollover rejected')
      setShowRejectModal(false)
      setRejectReason('')
      setShowDetailModal(false)
      refetch()
      refetchPending()
      refetchStats()
    } catch (error) {
      toast.error(error.message || 'Failed to reject rollover')
    } finally {
      setActionLoading(false)
    }
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300', label: 'Pending' },
      awaiting_admin_approval: { color: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300', label: 'Awaiting Approval' },
      approved: { color: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300', label: 'Approved' },
      rejected: { color: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300', label: 'Rejected' },
      cancelled: { color: 'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300', label: 'Cancelled' }
    }
    const config = statusConfig[status] || { color: 'bg-gray-100 text-gray-700', label: status }
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    )
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0
    }).format(amount || 0)
  }

  const formatDate = (date) => {
    if (!date) return 'N/A'
    return new Date(date).toLocaleDateString('en-NG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">
              Rollover Management
            </h1>
            <p className="text-neutral-600 dark:text-neutral-400">
              Review and manage loan rollover requests
            </p>
          </div>
          <button
            onClick={() => { refetch(); refetchPending(); refetchStats(); }}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
          >
            <RefreshCw size={18} />
            Refresh
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="card-hover">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <RefreshCw className="text-blue-600 dark:text-blue-400" size={20} />
              </div>
              <div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">Total Requests</p>
                <p className="text-xl font-bold text-neutral-900 dark:text-neutral-50">
                  {rolloverStats.totalRequests}
                </p>
              </div>
            </div>
          </div>

          <div className="card-hover">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                <Clock className="text-yellow-600 dark:text-yellow-400" size={20} />
              </div>
              <div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">Pending</p>
                <p className="text-xl font-bold text-neutral-900 dark:text-neutral-50">
                  {rolloverStats.pendingCount + rolloverStats.awaitingApprovalCount}
                </p>
              </div>
            </div>
          </div>

          <div className="card-hover">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <CheckCircle className="text-green-600 dark:text-green-400" size={20} />
              </div>
              <div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">Approved</p>
                <p className="text-xl font-bold text-neutral-900 dark:text-neutral-50">
                  {rolloverStats.approvedCount}
                </p>
              </div>
            </div>
          </div>

          <div className="card-hover">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                <XCircle className="text-red-600 dark:text-red-400" size={20} />
              </div>
              <div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">Rejected</p>
                <p className="text-xl font-bold text-neutral-900 dark:text-neutral-50">
                  {rolloverStats.rejectedCount}
                </p>
              </div>
            </div>
          </div>

          <div className="card-hover">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-accent-100 dark:bg-accent-900 rounded-lg">
                <AlertTriangle className="text-accent-600 dark:text-accent-400" size={20} />
              </div>
              <div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">In Queue</p>
                <p className="text-xl font-bold text-neutral-900 dark:text-neutral-50">
                  {pendingRollovers.length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Pending Queue Alert */}
        {pendingRollovers.length > 0 && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="text-yellow-600 dark:text-yellow-400" size={24} />
              <div className="flex-1">
                <p className="font-medium text-yellow-800 dark:text-yellow-200">
                  {pendingRollovers.length} rollover request(s) awaiting review
                </p>
                <p className="text-sm text-yellow-600 dark:text-yellow-300">
                  These requests have all guarantor consents and are ready for admin approval.
                </p>
              </div>
              <button
                onClick={() => {
                  if (pendingRollovers.length > 0) {
                    setSelectedRollover(pendingRollovers[0])
                    setShowDetailModal(true)
                  }
                }}
                className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg text-sm transition-colors"
              >
                Review Now
              </button>
            </div>
          </div>
        )}

        {/* Filter */}
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Filter by Status:
          </label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-primary-500"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="awaiting_admin_approval">Awaiting Approval</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {/* Rollover Table */}
        <div className="card">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50 mb-4">
            Rollover Requests
          </h2>
          
          {loading ? (
            <div className="text-center py-8 text-neutral-500">
              Loading rollovers...
            </div>
          ) : rollovers.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-neutral-200 dark:border-neutral-700">
                    <th className="text-left py-3 px-4 font-semibold text-neutral-900 dark:text-neutral-50">Member</th>
                    <th className="text-left py-3 px-4 font-semibold text-neutral-900 dark:text-neutral-50">Original Loan</th>
                    <th className="text-left py-3 px-4 font-semibold text-neutral-900 dark:text-neutral-50">New Terms</th>
                    <th className="text-left py-3 px-4 font-semibold text-neutral-900 dark:text-neutral-50">Guarantors</th>
                    <th className="text-left py-3 px-4 font-semibold text-neutral-900 dark:text-neutral-50">Status</th>
                    <th className="text-left py-3 px-4 font-semibold text-neutral-900 dark:text-neutral-50">Requested</th>
                    <th className="text-left py-3 px-4 font-semibold text-neutral-900 dark:text-neutral-50">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rollovers.map((rollover) => (
                    <tr 
                      key={rollover._id || rollover.id} 
                      className="border-b border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800"
                    >
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium text-neutral-900 dark:text-neutral-50">
                            {rollover.memberName || 'Unknown Member'}
                          </p>
                          <p className="text-sm text-neutral-500 dark:text-neutral-400">
                            {rollover.memberPhone || 'N/A'}
                          </p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <p className="text-neutral-900 dark:text-neutral-50">
                            {formatCurrency(rollover.originalPrincipal)}
                          </p>
                          <p className="text-sm text-neutral-500 dark:text-neutral-400">
                            {rollover.repaymentPercentage?.toFixed(0)}% repaid
                          </p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <p className="text-neutral-900 dark:text-neutral-50">
                            {rollover.newTenure} months @ {rollover.newInterestRate}%
                          </p>
                          <p className="text-sm text-neutral-500 dark:text-neutral-400">
                            {formatCurrency(rollover.newMonthlyRepayment)}/mo
                          </p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Users size={16} className="text-neutral-400" />
                          <span className="text-neutral-900 dark:text-neutral-50">
                            {rollover.acceptedGuarantorCount || rollover.guarantors?.filter(g => g.status === 'accepted').length || 0}/3
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {getStatusBadge(rollover.status)}
                      </td>
                      <td className="py-3 px-4 text-neutral-600 dark:text-neutral-400">
                        {formatDate(rollover.requestedAt)}
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleViewDetails(rollover)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 hover:bg-primary-200 dark:hover:bg-primary-800 rounded text-sm transition-colors"
                        >
                          <Eye size={16} />
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 text-neutral-500">
              <RefreshCw size={48} className="mx-auto mb-4 opacity-50" />
              <p>No rollover requests found</p>
              <p className="text-sm mt-1">Rollovers will appear here when members request them</p>
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedRollover && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-neutral-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-neutral-200 dark:border-neutral-700 flex items-center justify-between">
              <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-50">
                Rollover Details
              </h2>
              <button
                onClick={() => setShowDetailModal(false)}
                className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-colors"
              >
                <X size={20} className="text-neutral-500" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Member Info */}
              <div className="bg-neutral-50 dark:bg-neutral-900 rounded-lg p-4">
                <h3 className="font-semibold text-neutral-900 dark:text-neutral-50 mb-3">Member Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-neutral-500 dark:text-neutral-400">Name</p>
                    <p className="font-medium text-neutral-900 dark:text-neutral-50">{selectedRollover.memberName}</p>
                  </div>
                  <div>
                    <p className="text-neutral-500 dark:text-neutral-400">Phone</p>
                    <p className="font-medium text-neutral-900 dark:text-neutral-50">{selectedRollover.memberPhone}</p>
                  </div>
                </div>
              </div>

              {/* Loan Comparison */}
              <div className="grid grid-cols-2 gap-4">
                <div className="border border-neutral-200 dark:border-neutral-700 rounded-lg p-4">
                  <h4 className="font-medium text-neutral-500 dark:text-neutral-400 mb-2">Original Loan</h4>
                  <p className="text-lg font-bold text-neutral-900 dark:text-neutral-50">
                    {formatCurrency(selectedRollover.originalPrincipal)}
                  </p>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    {selectedRollover.repaymentPercentage?.toFixed(0)}% repaid
                  </p>
                </div>
                <div className="border border-primary-200 dark:border-primary-800 bg-primary-50 dark:bg-primary-900/20 rounded-lg p-4">
                  <h4 className="font-medium text-primary-600 dark:text-primary-400 mb-2">New Terms</h4>
                  <p className="text-lg font-bold text-primary-700 dark:text-primary-300">
                    {formatCurrency(selectedRollover.newTotalRepayment)}
                  </p>
                  <p className="text-sm text-primary-600 dark:text-primary-400">
                    {selectedRollover.newTenure} months @ {selectedRollover.newInterestRate}% interest
                  </p>
                </div>
              </div>

              {/* Guarantors */}
              <div>
                <h3 className="font-semibold text-neutral-900 dark:text-neutral-50 mb-3">Guarantor Consent</h3>
                <div className="space-y-2">
                  {(selectedRollover.guarantors || []).map((guarantor, index) => (
                    <div 
                      key={guarantor._id || index}
                      className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-900 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          guarantor.status === 'accepted' 
                            ? 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400'
                            : guarantor.status === 'declined'
                            ? 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400'
                            : 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-400'
                        }`}>
                          {guarantor.status === 'accepted' ? (
                            <CheckCircle size={16} />
                          ) : guarantor.status === 'declined' ? (
                            <XCircle size={16} />
                          ) : (
                            <Clock size={16} />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-neutral-900 dark:text-neutral-50">
                            {guarantor.guarantorName}
                          </p>
                          <p className="text-sm text-neutral-500 dark:text-neutral-400">
                            {guarantor.guarantorPhone}
                          </p>
                        </div>
                      </div>
                      {getStatusBadge(guarantor.status)}
                    </div>
                  ))}
                </div>
              </div>

              {/* Status */}
              <div className="flex items-center justify-between pt-4 border-t border-neutral-200 dark:border-neutral-700">
                <div>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">Current Status</p>
                  {getStatusBadge(selectedRollover.status)}
                </div>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  Requested: {formatDate(selectedRollover.requestedAt)}
                </p>
              </div>
            </div>

            {/* Actions */}
            {selectedRollover.status === 'pending' || selectedRollover.status === 'awaiting_admin_approval' ? (
              <div className="p-6 border-t border-neutral-200 dark:border-neutral-700 flex gap-3">
                <button
                  onClick={() => {
                    setShowDetailModal(false)
                    setShowRejectModal(true)
                  }}
                  disabled={actionLoading}
                  className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-lg transition-colors"
                >
                  Reject
                </button>
                <button
                  onClick={handleApprove}
                  disabled={actionLoading}
                  className="flex-1 px-4 py-2.5 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-lg transition-colors"
                >
                  {actionLoading ? 'Processing...' : 'Approve Rollover'}
                </button>
              </div>
            ) : (
              <div className="p-6 border-t border-neutral-200 dark:border-neutral-700">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="w-full px-4 py-2.5 bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-600 text-neutral-700 dark:text-neutral-300 rounded-lg transition-colors"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-neutral-800 rounded-xl max-w-md w-full">
            <div className="p-6 border-b border-neutral-200 dark:border-neutral-700">
              <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-50">
                Reject Rollover Request
              </h2>
            </div>
            
            <div className="p-6">
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Rejection Reason *
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Please provide a reason for rejection..."
                className="w-full px-4 py-3 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-primary-500"
                rows={4}
              />
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2">
                This reason will be visible to the member.
              </p>
            </div>

            <div className="p-6 border-t border-neutral-200 dark:border-neutral-700 flex gap-3">
              <button
                onClick={() => {
                  setShowRejectModal(false)
                  setRejectReason('')
                }}
                disabled={actionLoading}
                className="flex-1 px-4 py-2.5 bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-600 text-neutral-700 dark:text-neutral-300 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={actionLoading || !rejectReason.trim()}
                className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-lg transition-colors"
              >
                {actionLoading ? 'Processing...' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  )
}

export default Rollovers
