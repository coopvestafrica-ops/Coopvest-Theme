import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  Banknote, TrendingUp, AlertCircle, CheckCircle, X, Plus, DollarSign,
  Calendar, Clock, FileText, Send, RefreshCw, ChevronLeft, ChevronRight,
  Eye, Edit, Trash2, MessageSquare, BarChart3, Filter, Search, ArrowUpRight, ArrowDownRight
} from 'lucide-react'
import MainLayout from '../components/Layout/MainLayout'
import { useApi, useMutation } from '../hooks/useApi'
import { useAuthStore } from '../store/authStore'

const loanSchema = z.object({
  memberId: z.string().min(1, 'Member is required'),
  amount: z.number().min(1000, 'Minimum amount is ₦1,000'),
  duration: z.number().min(1, 'Minimum duration is 1 month').max(36, 'Maximum duration is 36 months'),
  purpose: z.string().min(10, 'Please provide loan purpose'),
  interestRate: z.number().optional(),
  status: z.enum(['pending', 'approved', 'rejected', 'active', 'overdue', 'closed']).default('pending')
})

const Loans = () => {
  const [showModal, setShowModal] = useState(false)
  const [showDetail, setShowDetail] = useState(false)
  const [selectedLoan, setSelectedLoan] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [page, setPage] = useState(1)

  const { role } = useAuthStore()

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(loanSchema),
    defaultValues: {
      memberId: '',
      amount: 0,
      duration: 12,
      purpose: '',
      interestRate: 5,
      status: 'pending'
    }
  })

  // Fetch loans
  const { data: loansData, loading: loansLoading, refetch: refetchLoans } = useApi(
    '/loans',
    { pollInterval: 30000 }
  )

  // Fetch loan statistics
  const { data: statsData } = useApi('/statistics/loans')

  // Mutations
  const { execute: createLoan, loading: createLoading } = useMutation('/loans', {
    method: 'POST',
    onSuccess: () => {
      refetchLoans()
      setShowModal(false)
      reset()
    }
  })

  const { execute: approveLoan, loading: approveLoading } = useMutation('/loans', {
    method: 'PUT',
    onSuccess: () => refetchLoans()
  })

  const { execute: rejectLoan, loading: rejectLoading } = useMutation('/loans', {
    method: 'PUT',
    onSuccess: () => refetchLoans()
  })

  const { execute: updateLoan, loading: updateLoading } = useMutation('/loans', {
    method: 'PUT',
    onSuccess: () => {
      refetchLoans()
      setShowDetail(false)
    }
  })

  // Mock data for demonstration
  const mockLoans = [
    { id: 'LN001', memberId: 'M001', memberName: 'John Adebayo', amount: 150000, duration: 12, purpose: 'Home renovation', status: 'active', disbursedDate: '2024-01-15', balance: 85000, repaidAmount: 75000, nextPaymentDate: '2024-04-15', eligibilityScore: 85, riskLevel: 'Low' },
    { id: 'LN002', memberId: 'M002', memberName: 'Sarah Okonkwo', amount: 200000, duration: 24, purpose: 'Business expansion', status: 'pending', disbursedDate: null, balance: 200000, repaidAmount: 0, nextPaymentDate: null, eligibilityScore: 72, riskLevel: 'Medium' },
    { id: 'LN003', memberId: 'M003', memberName: 'Mike Ogunleye', amount: 100000, duration: 6, purpose: 'Medical expenses', status: 'active', disbursedDate: '2024-02-01', balance: 45000, repaidAmount: 55000, nextPaymentDate: '2024-04-01', eligibilityScore: 91, riskLevel: 'Low' },
    { id: 'LN004', memberId: 'M004', memberName: 'Grace Ibrahim', amount: 250000, duration: 18, purpose: 'Education fees', status: 'overdue', disbursedDate: '2023-11-01', balance: 180000, repaidAmount: 70000, nextPaymentDate: '2024-03-01', eligibilityScore: 45, riskLevel: 'High' },
    { id: 'LN005', memberId: 'M005', memberName: 'David Adeyemi', amount: 180000, duration: 12, purpose: 'Vehicle purchase', status: 'active', disbursedDate: '2024-01-20', balance: 120000, repaidAmount: 60000, nextPaymentDate: '2024-04-20', eligibilityScore: 78, riskLevel: 'Low' }
  ]

  const mockStats = {
    totalDisbursed: 3250000,
    outstanding: 1875000,
    overdueAmount: 180000,
    repaymentRate: 94.2,
    pendingApplications: 12,
    averageLoanSize: 165000
  }

  const loans = loansData?.data || mockLoans

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0
    }).format(value || 0)
  }

  const calculateMonthlyPayment = (amount, duration, rate = 5) => {
    const monthlyRate = rate / 100 / 12
    const payment = (amount * monthlyRate * Math.pow(1 + monthlyRate, duration)) / (Math.pow(1 + monthlyRate, duration) - 1)
    return payment
  }

  const getStatusBadge = (status) => {
    const badges = {
      pending: { bg: 'bg-yellow-100 dark:bg-yellow-900', text: 'text-yellow-700 dark:text-yellow-200', icon: Clock },
      approved: { bg: 'bg-blue-100 dark:bg-blue-900', text: 'text-blue-700 dark:text-blue-200', icon: CheckCircle },
      active: { bg: 'bg-green-100 dark:bg-green-900', text: 'text-green-700 dark:text-green-200', icon: Banknote },
      overdue: { bg: 'bg-red-100 dark:bg-red-900', text: 'text-red-700 dark:text-red-200', icon: AlertCircle },
      rejected: { bg: 'bg-gray-100 dark:bg-gray-900', text: 'text-gray-700 dark:text-gray-200', icon: X },
      closed: { bg: 'bg-purple-100 dark:bg-purple-900', text: 'text-purple-700 dark:text-purple-200', icon: CheckCircle }
    }
    const badge = badges[status] || badges.pending
    const Icon = badge.icon
    return (
      <div className={`inline-flex items-center gap-1 px-2 py-1 ${badge.bg} ${badge.text} rounded text-xs font-medium`}>
        <Icon size={14} />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </div>
    )
  }

  const getRiskBadge = (level) => {
    const badges = {
      Low: { bg: 'bg-green-100 dark:bg-green-900', text: 'text-green-700' },
      Medium: { bg: 'bg-yellow-100 dark:bg-yellow-900', text: 'text-yellow-700' },
      High: { bg: 'bg-red-100 dark:bg-red-900', text: 'text-red-700' }
    }
    const badge = badges[level] || badges.Medium
    return <span className={`px-2 py-1 ${badge.bg} ${badge.text} rounded text-xs font-medium`}>{level}</span>
  }

  const handleSubmitLoan = async (data) => {
    await createLoan(data)
  }

  const handleApprove = async (loanId) => {
    await approveLoan({ status: 'approved' }, `/loans/${loanId}/approve`)
  }

  const handleReject = async (loanId) => {
    await rejectLoan({ status: 'rejected' }, `/loans/${loanId}/reject`)
  }

  const handleViewDetail = (loan) => {
    setSelectedLoan(loan)
    setShowDetail(true)
  }

  const handleSendReminder = async (loanId) => {
    // Send reminder logic
    console.log('Sending reminder for loan:', loanId)
  }

  const handleDisburse = async (loanId) => {
    await updateLoan({ status: 'active', disbursedDate: new Date().toISOString() }, `/loans/${loanId}/disburse`)
  }

  const displayStats = statsData?.data || mockStats

  const filteredLoans = loans.filter(loan => {
    if (filterStatus !== 'all' && loan.status !== filterStatus) return false
    if (searchTerm && !loan.memberName.toLowerCase().includes(searchTerm.toLowerCase()) && !loan.id.toLowerCase().includes(searchTerm.toLowerCase())) return false
    return true
  })

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="section-title">Loan Management</h1>
            <p className="text-neutral-600 dark:text-neutral-400">
              Manage loan applications, approvals, and repayments
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => refetchLoans()}
              className="flex items-center gap-2 px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors"
            >
              <RefreshCw size={18} />
              Refresh
            </button>
            <button
              onClick={() => { setEditingLoan(null); reset(); setShowModal(true); }}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <Plus size={18} />
              New Loan
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="card-hover">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">Total Disbursed</p>
                <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">
                  {formatCurrency(displayStats.totalDisbursed)}
                </p>
              </div>
              <div className="p-3 bg-primary-100 dark:bg-primary-900 rounded-lg">
                <Banknote className="text-primary-600 dark:text-primary-400" size={24} />
              </div>
            </div>
          </div>

          <div className="card-hover">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">Outstanding</p>
                <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">
                  {formatCurrency(displayStats.outstanding)}
                </p>
              </div>
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                <TrendingUp className="text-yellow-600 dark:text-yellow-400" size={24} />
              </div>
            </div>
          </div>

          <div className="card-hover">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">Overdue Amount</p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {formatCurrency(displayStats.overdueAmount)}
                </p>
              </div>
              <div className="p-3 bg-red-100 dark:bg-red-900 rounded-lg">
                <AlertCircle className="text-red-600 dark:text-red-400" size={24} />
              </div>
            </div>
          </div>

          <div className="card-hover">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">Repayment Rate</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {displayStats.repaymentRate}%
                </p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                <CheckCircle className="text-green-600 dark:text-green-400" size={24} />
              </div>
            </div>
          </div>

          <div className="card-hover">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">Pending Apps</p>
                <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">
                  {displayStats.pendingApplications}
                </p>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <Clock className="text-purple-600 dark:text-purple-400" size={24} />
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
                placeholder="Search by member name or loan ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-50 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter size={20} className="text-neutral-600 dark:text-neutral-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-50 focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="active">Active</option>
                <option value="overdue">Overdue</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          </div>

          {/* Loans Table */}
          {loansLoading ? (
            <div className="text-center py-8 text-neutral-500">Loading loans...</div>
          ) : filteredLoans.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-neutral-200 dark:border-neutral-700">
                    <th className="text-left py-3 px-4 font-semibold text-neutral-900 dark:text-neutral-50">Loan ID</th>
                    <th className="text-left py-3 px-4 font-semibold text-neutral-900 dark:text-neutral-50">Member</th>
                    <th className="text-left py-3 px-4 font-semibold text-neutral-900 dark:text-neutral-50">Amount</th>
                    <th className="text-left py-3 px-4 font-semibold text-neutral-900 dark:text-neutral-50">Duration</th>
                    <th className="text-left py-3 px-4 font-semibold text-neutral-900 dark:text-neutral-50">Monthly</th>
                    <th className="text-left py-3 px-4 font-semibold text-neutral-900 dark:text-neutral-50">Balance</th>
                    <th className="text-left py-3 px-4 font-semibold text-neutral-900 dark:text-neutral-50">Risk</th>
                    <th className="text-left py-3 px-4 font-semibold text-neutral-900 dark:text-neutral-50">Status</th>
                    <th className="text-left py-3 px-4 font-semibold text-neutral-900 dark:text-neutral-50">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLoans.map((loan) => (
                    <tr key={loan.id} className="border-b border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors">
                      <td className="py-3 px-4 font-medium text-neutral-900 dark:text-neutral-50">{loan.id}</td>
                      <td className="py-3 px-4 text-neutral-900 dark:text-neutral-50">{loan.memberName}</td>
                      <td className="py-3 px-4 font-medium text-neutral-900 dark:text-neutral-50">{formatCurrency(loan.amount)}</td>
                      <td className="py-3 px-4 text-neutral-600 dark:text-neutral-400">{loan.duration} months</td>
                      <td className="py-3 px-4 text-neutral-600 dark:text-neutral-400">
                        {formatCurrency(calculateMonthlyPayment(loan.amount, loan.duration))}
                      </td>
                      <td className="py-3 px-4 text-neutral-900 dark:text-neutral-50 font-medium">{formatCurrency(loan.balance)}</td>
                      <td className="py-3 px-4">{getRiskBadge(loan.riskLevel)}</td>
                      <td className="py-3 px-4">{getStatusBadge(loan.status)}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleViewDetail(loan)}
                            className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye size={18} className="text-blue-600" />
                          </button>
                          {loan.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleApprove(loan.id)}
                                disabled={approveLoading}
                                className="px-3 py-1 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded text-sm transition-colors"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleReject(loan.id)}
                                disabled={rejectLoading}
                                className="px-3 py-1 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded text-sm transition-colors"
                              >
                                Reject
                              </button>
                            </>
                          )}
                          {loan.status === 'approved' && (
                            <button
                              onClick={() => handleDisburse(loan.id)}
                              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors"
                            >
                              Disburse
                            </button>
                          )}
                          {loan.status === 'active' && (
                            <button
                              onClick={() => handleSendReminder(loan.id)}
                              className="p-2 hover:bg-yellow-100 dark:hover:bg-yellow-900 rounded-lg transition-colors"
                              title="Send Reminder"
                            >
                              <MessageSquare size={18} className="text-yellow-600" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-neutral-500">No loans found</div>
          )}
        </div>
      </div>

      {/* Create Loan Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-neutral-800 rounded-xl p-6 w-full max-w-lg shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-50">Create New Loan</h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit(handleSubmitLoan)} className="space-y-4">
              <div className="form-group">
                <label className="form-label">Member ID</label>
                <input
                  {...register('memberId')}
                  className={`input-field ${errors.memberId ? 'border-red-500' : ''}`}
                  placeholder="Enter Member ID"
                />
                {errors.memberId && <p className="text-red-500 text-xs mt-1">{errors.memberId.message}</p>}
              </div>

              <div className="form-group">
                <label className="form-label">Loan Amount (₦)</label>
                <input
                  type="number"
                  {...register('amount', { valueAsNumber: true })}
                  className={`input-field ${errors.amount ? 'border-red-500' : ''}`}
                  placeholder="10000"
                />
                {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount.message}</p>}
              </div>

              <div className="form-group">
                <label className="form-label">Duration (Months)</label>
                <input
                  type="number"
                  {...register('duration', { valueAsNumber: true })}
                  className={`input-field ${errors.duration ? 'border-red-500' : ''}`}
                  placeholder="12"
                />
                {errors.duration && <p className="text-red-500 text-xs mt-1">{errors.duration.message}</p>}
              </div>

              <div className="form-group">
                <label className="form-label">Loan Purpose</label>
                <textarea
                  {...register('purpose')}
                  className={`input-field ${errors.purpose ? 'border-red-500' : ''}`}
                  placeholder="Describe the purpose of this loan..."
                  rows={3}
                />
                {errors.purpose && <p className="text-red-500 text-xs mt-1">{errors.purpose.message}</p>}
              </div>

              <div className="form-group">
                <label className="form-label">Interest Rate (%)</label>
                <input
                  type="number"
                  {...register('interestRate', { valueAsNumber: true })}
                  className="input-field"
                  placeholder="5"
                  step="0.5"
                />
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Monthly Payment: <strong>{formatCurrency(calculateMonthlyPayment(0, 12))}</strong>
                </p>
              </div>

              <div className="flex gap-4 mt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-neutral-300 rounded-lg hover:bg-neutral-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createLoading}
                  className="flex-1 btn-primary"
                >
                  {createLoading ? 'Creating...' : 'Create Loan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Loan Detail Modal */}
      {showDetail && selectedLoan && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-neutral-800 rounded-xl w-full max-w-3xl shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700 p-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-50">Loan Details</h2>
                <p className="text-neutral-600 dark:text-neutral-400">{selectedLoan.id} - {selectedLoan.memberName}</p>
              </div>
              <button
                onClick={() => setShowDetail(false)}
                className="p-1 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Loan Info */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-neutral-50 dark:bg-neutral-900 rounded-lg">
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">Loan Amount</p>
                  <p className="text-xl font-bold text-neutral-900 dark:text-neutral-50">{formatCurrency(selectedLoan.amount)}</p>
                </div>
                <div className="p-4 bg-neutral-50 dark:bg-neutral-900 rounded-lg">
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">Outstanding</p>
                  <p className="text-xl font-bold text-neutral-900 dark:text-neutral-50">{formatCurrency(selectedLoan.balance)}</p>
                </div>
                <div className="p-4 bg-neutral-50 dark:bg-neutral-900 rounded-lg">
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">Repaid</p>
                  <p className="text-xl font-bold text-green-600">{formatCurrency(selectedLoan.repaidAmount)}</p>
                </div>
                <div className="p-4 bg-neutral-50 dark:bg-neutral-900 rounded-lg">
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">Monthly</p>
                  <p className="text-xl font-bold text-neutral-900 dark:text-neutral-50">
                    {formatCurrency(calculateMonthlyPayment(selectedLoan.amount, selectedLoan.duration))}
                  </p>
                </div>
              </div>

              {/* Progress Bar */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Repayment Progress</span>
                  <span className="text-sm font-medium text-green-600">
                    {Math.round((selectedLoan.repaidAmount / selectedLoan.amount) * 100)}%
                  </span>
                </div>
                <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-3">
                  <div
                    className="bg-green-600 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${(selectedLoan.repaidAmount / selectedLoan.amount) * 100}%` }}
                  />
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-neutral-900 dark:text-neutral-50 mb-4">Loan Details</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between p-3 bg-neutral-50 dark:bg-neutral-900 rounded-lg">
                      <span className="text-neutral-600 dark:text-neutral-400">Duration</span>
                      <span className="font-medium text-neutral-900 dark:text-neutral-50">{selectedLoan.duration} months</span>
                    </div>
                    <div className="flex justify-between p-3 bg-neutral-50 dark:bg-neutral-900 rounded-lg">
                      <span className="text-neutral-600 dark:text-neutral-400">Purpose</span>
                      <span className="font-medium text-neutral-900 dark:text-neutral-50">{selectedLoan.purpose}</span>
                    </div>
                    <div className="flex justify-between p-3 bg-neutral-50 dark:bg-neutral-900 rounded-lg">
                      <span className="text-neutral-600 dark:text-neutral-400">Disbursed Date</span>
                      <span className="font-medium text-neutral-900 dark:text-neutral-50">{selectedLoan.disbursedDate || 'Not yet'}</span>
                    </div>
                    <div className="flex justify-between p-3 bg-neutral-50 dark:bg-neutral-900 rounded-lg">
                      <span className="text-neutral-600 dark:text-neutral-400">Next Payment</span>
                      <span className="font-medium text-neutral-900 dark:text-neutral-50">{selectedLoan.nextPaymentDate || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-neutral-900 dark:text-neutral-50 mb-4">Risk Assessment</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between p-3 bg-neutral-50 dark:bg-neutral-900 rounded-lg">
                      <span className="text-neutral-600 dark:text-neutral-400">Eligibility Score</span>
                      <span className="font-medium text-neutral-900 dark:text-neutral-50">{selectedLoan.eligibilityScore}/100</span>
                    </div>
                    <div className="flex justify-between p-3 bg-neutral-50 dark:bg-neutral-900 rounded-lg">
                      <span className="text-neutral-600 dark:text-neutral-400">Risk Level</span>
                      <span>{getRiskBadge(selectedLoan.riskLevel)}</span>
                    </div>
                    <div className="flex justify-between p-3 bg-neutral-50 dark:bg-neutral-900 rounded-lg">
                      <span className="text-neutral-600 dark:text-neutral-400">Status</span>
                      <span>{getStatusBadge(selectedLoan.status)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-3 pt-4 border-t border-neutral-200 dark:border-neutral-700">
                {selectedLoan.status === 'pending' && (
                  <>
                    <button
                      onClick={() => { handleApprove(selectedLoan.id); setShowDetail(false); }}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                    >
                      Approve Loan
                    </button>
                    <button
                      onClick={() => { handleReject(selectedLoan.id); setShowDetail(false); }}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                    >
                      Reject Loan
                    </button>
                  </>
                )}
                {selectedLoan.status === 'approved' && (
                  <button
                    onClick={() => { handleDisburse(selectedLoan.id); setShowDetail(false); }}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    Disburse Funds
                  </button>
                )}
                {selectedLoan.status === 'active' && (
                  <>
                    <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                      Generate Agreement
                    </button>
                    <button
                      onClick={() => handleSendReminder(selectedLoan.id)}
                      className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors"
                    >
                      Send Reminder
                    </button>
                  </>
                )}
                <button className="px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors">
                  View Statements
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  )
}

export default Loans
