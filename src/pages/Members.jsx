import React, { useState, useMemo, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  Search, Filter, Edit, Trash2, CheckCircle, AlertCircle, Clock, Plus, X,
  ChevronLeft, ChevronRight, User, Mail, Phone, Building2, Briefcase,
  FileText, Wallet, Banknote, Eye, Shield, MapPin, Calendar, Download,
  MoreVertical, ToggleLeft, ToggleRight, Ban
} from 'lucide-react'
import MainLayout from '../components/Layout/MainLayout'
import { useApi, useMutation } from '../hooks/useApi'

const memberSchema = z.object({
  firstName: z.string().min(2, 'First name is required'),
  lastName: z.string().min(2, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Invalid phone number'),
  employmentType: z.enum(['permanent', 'contract', 'temporary']).default('permanent'),
  organization: z.string().min(2, 'Organization is required'),
  status: z.enum(['active', 'pending', 'suspended', 'inactive', 'blacklisted']).default('pending'),
  bvn: z.string().optional(),
  nin: z.string().optional(),
  address: z.string().optional()
})

const Members = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterEmployment, setFilterEmployment] = useState('all')
  const [page, setPage] = useState(1)
  const [showModal, setShowModal] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const [editingMember, setEditingMember] = useState(null)
  const [selectedMember, setSelectedMember] = useState(null)
  const [activeTab, setActiveTab] = useState('overview')

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(memberSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      employmentType: 'permanent',
      organization: '',
      status: 'pending',
      bvn: '',
      nin: '',
      address: ''
    }
  })

  // Memoize params to prevent unnecessary refetches
  const params = useMemo(() => ({
    search: searchTerm,
    status: filterStatus === 'all' ? undefined : filterStatus,
    employmentType: filterEmployment === 'all' ? undefined : filterEmployment,
    page,
    limit: 10
  }), [searchTerm, filterStatus, filterEmployment, page])

  // Fetch members with server-side params
  const { data: membersData, loading: membersLoading, refetch: refetchMembers } = useApi(
    '/members',
    { params }
  )

  // Fetch member details for profile
  const { data: memberDetails, loading: detailsLoading } = useApi(
    selectedMember ? `/members/${selectedMember._id}/details` : null
  )

  // Mutations
  const { execute: createMember, loading: createLoading } = useMutation('/members', {
    method: 'POST',
    onSuccess: () => {
      setShowModal(false)
      refetchMembers()
    }
  })

  const { execute: updateMember, loading: updateLoading } = useMutation('/members', {
    method: 'PUT',
    onSuccess: () => {
      setShowModal(false)
      setEditingMember(null)
      refetchMembers()
    }
  })

  const { execute: deleteMember, loading: deleteLoading } = useMutation('/members', {
    method: 'DELETE',
    onSuccess: () => refetchMembers()
  })

  const { execute: verifyKyc, loading: verifyLoading } = useMutation('/members', {
    method: 'PUT',
    onSuccess: () => refetchMembers()
  })

  const { execute: updateStatus, loading: statusLoading } = useMutation('/members', {
    method: 'PUT',
    onSuccess: () => refetchMembers()
  })

  const members = membersData?.members || []
  const pagination = membersData?.pagination || { total: 0, pages: 0 }

  // Mock data for demonstration
  const mockMemberDetails = {
    ...selectedMember,
    contributions: [
      { id: 1, date: '2024-01-15', amount: 50000, type: 'monthly', status: 'completed' },
      { id: 2, date: '2024-02-15', amount: 50000, type: 'monthly', status: 'completed' },
      { id: 3, date: '2024-03-15', amount: 50000, type: 'monthly', status: 'completed' }
    ],
    loans: [
      { id: 1, amount: 150000, status: 'active', disbursedDate: '2023-06-15', balance: 85000 },
      { id: 2, amount: 100000, status: 'pending', disbursedDate: null, balance: 100000 }
    ],
    wallet: {
      balance: 125000,
      transactions: [
        { id: 1, date: '2024-03-20', type: 'credit', amount: 50000, description: 'Monthly contribution' },
        { id: 2, date: '2024-03-18', type: 'debit', amount: 15000, description: 'Loan repayment' }
      ]
    },
    documents: [
      { id: 1, name: 'ID Card', type: 'identification', status: 'verified' },
      { id: 2, name: 'Employment Letter', type: 'employment', status: 'verified' },
      { id: 3, name: 'Bank Statement', type: 'financial', status: 'pending' }
    ],
    riskScore: 72,
    riskLevel: 'Low',
    joinedDate: '2023-01-15',
    lastActive: '2024-03-20'
  }

  const displayDetails = memberDetails?.data || mockMemberDetails

  const getStatusBadge = (status) => {
    const badges = {
      active: { bg: 'bg-green-100 dark:bg-green-900', text: 'text-green-700 dark:text-green-200', icon: CheckCircle },
      pending: { bg: 'bg-yellow-100 dark:bg-yellow-900', text: 'text-yellow-700 dark:text-yellow-200', icon: Clock },
      suspended: { bg: 'bg-red-100 dark:bg-red-900', text: 'text-red-700 dark:text-red-200', icon: AlertCircle },
      inactive: { bg: 'bg-gray-100 dark:bg-gray-900', text: 'text-gray-700 dark:text-gray-200', icon: X },
      blacklisted: { bg: 'bg-purple-100 dark:bg-purple-900', text: 'text-purple-700 dark:text-purple-200', icon: Ban }
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

  const getEmploymentBadge = (type) => {
    const badges = {
      permanent: { bg: 'bg-blue-100 dark:bg-blue-900', text: 'text-blue-700 dark:text-blue-200' },
      contract: { bg: 'bg-purple-100 dark:bg-purple-900', text: 'text-purple-700 dark:text-purple-200' },
      temporary: { bg: 'bg-orange-100 dark:bg-orange-900', text: 'text-orange-700 dark:text-orange-200' }
    }
    const badge = badges[type] || badges.permanent
    return (
      <span className={`inline-flex px-2 py-1 ${badge.bg} ${badge.text} rounded text-xs font-medium capitalize`}>
        {type}
      </span>
    )
  }

  const getKycBadge = (status) => {
    const badges = {
      verified: { bg: 'bg-green-100 dark:bg-green-900', text: 'text-green-700' },
      pending: { bg: 'bg-yellow-100 dark:bg-yellow-900', text: 'text-yellow-700' },
      rejected: { bg: 'bg-red-100 dark:bg-red-900', text: 'text-red-700' }
    }
    const badge = badges[status] || badges.pending
    return (
      <span className={`px-2 py-0.5 ${badge.bg} ${badge.text} rounded text-xs font-medium`}>
        {status}
      </span>
    )
  }

  const handleOpenModal = (member = null) => {
    if (member) {
      setEditingMember(member)
      reset({
        firstName: member.firstName,
        lastName: member.lastName,
        email: member.email,
        phone: member.phone,
        employmentType: member.employmentType || 'permanent',
        organization: member.organization || '',
        status: member.status,
        bvn: member.bvn || '',
        nin: member.nin || '',
        address: member.address || ''
      })
    } else {
      setEditingMember(null)
      reset({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        employmentType: 'permanent',
        organization: '',
        status: 'pending',
        bvn: '',
        nin: '',
        address: ''
      })
    }
    setShowModal(true)
  }

  const onFormSubmit = async (data) => {
    if (editingMember) {
      await updateMember(data, `/members/${editingMember._id}`)
    } else {
      await createMember(data)
    }
  }

  const handleDelete = async (memberId) => {
    if (window.confirm('Are you sure you want to delete this member?')) {
      await deleteMember(null, `/members/${memberId}`)
    }
  }

  const handleViewProfile = (member) => {
    setSelectedMember(member)
    setShowProfile(true)
  }

  const handleStatusChange = async (memberId, newStatus) => {
    await updateStatus({ status: newStatus }, `/members/${memberId}/status`)
  }

  const handleKycVerification = async (memberId) => {
    await verifyKyc({ kycStatus: 'verified' }, `/members/${memberId}/kyc`)
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0
    }).format(value || 0)
  }

  const predefinedOrganizations = [
    'Federal Civil Service',
    'State Civil Service',
    'Local Government',
    'Nigerian Police Force',
    'Nigerian Army',
    'Nigerian Air Force',
    'Nigerian Navy',
    'Teaching Service',
    'Healthcare Service',
    'Private Sector',
    'Other'
  ]

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">Member Management</h1>
            <p className="text-neutral-600 dark:text-neutral-400">Manage and monitor all cooperative members</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors">
              <Download size={18} />
              Export
            </button>
            <button
              onClick={() => handleOpenModal()}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <Plus size={18} />
              Add Member
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700 p-6">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 text-neutral-400" size={20} />
              <input
                type="text"
                placeholder="Search by name, email, phone, or organization..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setPage(1)
                }}
                className="w-full pl-10 pr-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-50 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter size={20} className="text-neutral-600 dark:text-neutral-400" />
              <select
                value={filterStatus}
                onChange={(e) => {
                  setFilterStatus(e.target.value)
                  setPage(1)
                }}
                className="px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-50 focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="suspended">Suspended</option>
                <option value="inactive">Inactive</option>
                <option value="blacklisted">Blacklisted</option>
              </select>
              <select
                value={filterEmployment}
                onChange={(e) => {
                  setFilterEmployment(e.target.value)
                  setPage(1)
                }}
                className="px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-50 focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="all">All Employment</option>
                <option value="permanent">Permanent</option>
                <option value="contract">Contract</option>
                <option value="temporary">Temporary</option>
              </select>
            </div>
          </div>

          {/* Members Table */}
          {membersLoading ? (
            <div className="text-center py-12 text-neutral-500">Loading members...</div>
          ) : members.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-neutral-200 dark:border-neutral-700">
                      <th className="text-left py-3 px-4 font-semibold text-neutral-900 dark:text-neutral-50">Member</th>
                      <th className="text-left py-3 px-4 font-semibold text-neutral-900 dark:text-neutral-50">Employment</th>
                      <th className="text-left py-3 px-4 font-semibold text-neutral-900 dark:text-neutral-50">Organization</th>
                      <th className="text-left py-3 px-4 font-semibold text-neutral-900 dark:text-neutral-50">KYC Status</th>
                      <th className="text-left py-3 px-4 font-semibold text-neutral-900 dark:text-neutral-50">Status</th>
                      <th className="text-left py-3 px-4 font-semibold text-neutral-900 dark:text-neutral-50">Risk Score</th>
                      <th className="text-left py-3 px-4 font-semibold text-neutral-900 dark:text-neutral-50">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {members.map((member) => (
                      <tr key={member._id} className="border-b border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                              <User size={20} className="text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                              <p className="font-medium text-neutral-900 dark:text-neutral-50">{member.firstName} {member.lastName}</p>
                              <p className="text-sm text-neutral-600 dark:text-neutral-400">{member.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">{getEmploymentBadge(member.employmentType)}</td>
                        <td className="py-3 px-4 text-neutral-600 dark:text-neutral-400">{member.organization || '-'}</td>
                        <td className="py-3 px-4">{getKycBadge(member.kycStatus || 'pending')}</td>
                        <td className="py-3 px-4">{getStatusBadge(member.status)}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            member.riskScore >= 70 ? 'bg-green-100 text-green-700' :
                            member.riskScore >= 40 ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {member.riskScore || 0}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleViewProfile(member)}
                              className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900 rounded-lg transition-colors"
                              title="View Profile"
                            >
                              <Eye size={18} className="text-blue-600 dark:text-blue-400" />
                            </button>
                            <button
                              onClick={() => handleOpenModal(member)}
                              className="p-2 hover:bg-green-100 dark:hover:bg-green-900 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <Edit size={18} className="text-green-600 dark:text-green-400" />
                            </button>
                            <button
                              onClick={() => handleDelete(member._id)}
                              disabled={deleteLoading}
                              className="p-2 hover:bg-red-100 dark:hover:bg-red-900 rounded-lg transition-colors disabled:opacity-50"
                              title="Delete"
                            >
                              <Trash2 size={18} className="text-red-600 dark:text-red-400" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-6">
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  Showing <span className="font-medium">{members.length}</span> of <span className="font-medium">{pagination.total}</span> members
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="p-2 border border-neutral-300 dark:border-neutral-600 rounded-lg disabled:opacity-50 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <span className="text-sm font-medium">Page {page} of {pagination.pages}</span>
                  <button
                    onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
                    disabled={page === pagination.pages}
                    className="p-2 border border-neutral-300 dark:border-neutral-600 rounded-lg disabled:opacity-50 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-neutral-500">No members found</div>
          )}
        </div>
      </div>

      {/* Member Profile Modal */}
      {showProfile && selectedMember && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-neutral-800 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="sticky top-0 bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700 p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                  <User size={32} className="text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-50">
                    {selectedMember.firstName} {selectedMember.lastName}
                  </h2>
                  <p className="text-neutral-600 dark:text-neutral-400">{selectedMember.email}</p>
                </div>
              </div>
              <button
                onClick={() => setShowProfile(false)}
                className="p-2 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-lg transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6">
              {/* Tabs */}
              <div className="flex gap-2 mb-6 border-b border-neutral-200 dark:border-neutral-700">
                {['overview', 'contributions', 'loans', 'wallet', 'documents'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2 font-medium capitalize transition-colors ${
                      activeTab === tab
                        ? 'text-blue-600 border-b-2 border-blue-600'
                        : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              {activeTab === 'overview' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-neutral-900 dark:text-neutral-50">Personal Information</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 bg-neutral-50 dark:bg-neutral-900 rounded-lg">
                        <Mail size={18} className="text-neutral-500" />
                        <span className="text-neutral-700 dark:text-neutral-300">{selectedMember.email}</span>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-neutral-50 dark:bg-neutral-900 rounded-lg">
                        <Phone size={18} className="text-neutral-500" />
                        <span className="text-neutral-700 dark:text-neutral-300">{selectedMember.phone}</span>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-neutral-50 dark:bg-neutral-900 rounded-lg">
                        <MapPin size={18} className="text-neutral-500" />
                        <span className="text-neutral-700 dark:text-neutral-300">{selectedMember.address || 'Not provided'}</span>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-neutral-50 dark:bg-neutral-900 rounded-lg">
                        <Calendar size={18} className="text-neutral-500" />
                        <span className="text-neutral-700 dark:text-neutral-300">Joined: {selectedMember.joinedDate || '2023-01-15'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h3 className="font-semibold text-neutral-900 dark:text-neutral-50">Employment Details</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 bg-neutral-50 dark:bg-neutral-900 rounded-lg">
                        <Briefcase size={18} className="text-neutral-500" />
                        <span className="text-neutral-700 dark:text-neutral-300 capitalize">{selectedMember.employmentType || 'Permanent'}</span>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-neutral-50 dark:bg-neutral-900 rounded-lg">
                        <Building2 size={18} className="text-neutral-500" />
                        <span className="text-neutral-700 dark:text-neutral-300">{selectedMember.organization || 'Not assigned'}</span>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-neutral-50 dark:bg-neutral-900 rounded-lg">
                        <Shield size={18} className="text-neutral-500" />
                        <span className="text-neutral-700 dark:text-neutral-300">Risk Score: {selectedMember.riskScore || 0}/100</span>
                      </div>
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <h3 className="font-semibold text-neutral-900 dark:text-neutral-50 mb-4">Quick Actions</h3>
                    <div className="flex flex-wrap gap-3">
                      <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors">
                        Approve KYC
                      </button>
                      <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                        Send Notification
                      </button>
                      <button className="px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors">
                        View Statements
                      </button>
                      <button className="px-4 py-2 border border-yellow-300 dark:border-yellow-700 text-yellow-700 dark:text-yellow-300 rounded-lg hover:bg-yellow-50 dark:hover:bg-yellow-900/20 transition-colors">
                        Suspend Member
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'contributions' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-neutral-900 dark:text-neutral-50">Contribution History</h3>
                    <span className="text-green-600 font-medium">Total: {formatCurrency(150000)}</span>
                  </div>
                  <div className="space-y-3">
                    {displayDetails.contributions.map((contribution) => (
                      <div key={contribution.id} className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-900 rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                            <Wallet size={20} className="text-green-600" />
                          </div>
                          <div>
                            <p className="font-medium text-neutral-900 dark:text-neutral-50">{contribution.type} Contribution</p>
                            <p className="text-sm text-neutral-500">{contribution.date}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="font-semibold text-green-600">{formatCurrency(contribution.amount)}</span>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${contribution.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                            {contribution.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'loans' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-neutral-900 dark:text-neutral-50">Loan History</h3>
                  </div>
                  <div className="space-y-3">
                    {displayDetails.loans.map((loan) => (
                      <div key={loan.id} className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-900 rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                            <Banknote size={20} className="text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium text-neutral-900 dark:text-neutral-50">Loan #{loan.id}</p>
                            <p className="text-sm text-neutral-500">Disbursed: {loan.disbursedDate || 'Pending'}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="font-semibold text-neutral-900 dark:text-neutral-50">{formatCurrency(loan.amount)}</p>
                            <p className="text-sm text-neutral-500">Balance: {formatCurrency(loan.balance)}</p>
                          </div>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            loan.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {loan.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'wallet' && (
                <div className="space-y-4">
                  <div className="p-4 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg text-white">
                    <p className="text-sm opacity-80">Wallet Balance</p>
                    <p className="text-3xl font-bold">{formatCurrency(displayDetails.wallet.balance)}</p>
                  </div>
                  <h3 className="font-semibold text-neutral-900 dark:text-neutral-50">Recent Transactions</h3>
                  <div className="space-y-3">
                    {displayDetails.wallet.transactions.map((tx) => (
                      <div key={tx.id} className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-900 rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className={`p-2 rounded-lg ${tx.type === 'credit' ? 'bg-green-100' : 'bg-red-100'}`}>
                            {tx.type === 'credit' ? (
                              <ArrowUpRight size={20} className="text-green-600" />
                            ) : (
                              <ArrowDownRight size={20} className="text-red-600" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-neutral-900 dark:text-neutral-50">{tx.description}</p>
                            <p className="text-sm text-neutral-500">{tx.date}</p>
                          </div>
                        </div>
                        <span className={`font-semibold ${tx.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                          {tx.type === 'credit' ? '+' : '-'}{formatCurrency(tx.amount)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'documents' && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-neutral-900 dark:text-neutral-50">Uploaded Documents</h3>
                  <div className="space-y-3">
                    {displayDetails.documents.map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-900 rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                            <FileText size={20} className="text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium text-neutral-900 dark:text-neutral-50">{doc.name}</p>
                            <p className="text-sm text-neutral-500 capitalize">{doc.type}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <button className="text-blue-600 hover:underline text-sm">Download</button>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            doc.status === 'verified' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {doc.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Member Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-neutral-800 rounded-xl p-6 w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-50">
                {editingMember ? 'Edit Member' : 'Add New Member'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">First Name</label>
                  <input
                    {...register('firstName')}
                    className={`w-full px-4 py-2 border ${errors.firstName ? 'border-red-500' : 'border-neutral-300 dark:border-neutral-600'} rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-50 focus:ring-2 focus:ring-blue-500 outline-none`}
                  />
                  {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Last Name</label>
                  <input
                    {...register('lastName')}
                    className={`w-full px-4 py-2 border ${errors.lastName ? 'border-red-500' : 'border-neutral-300 dark:border-neutral-600'} rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-50 focus:ring-2 focus:ring-blue-500 outline-none`}
                  />
                  {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName.message}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Email Address</label>
                <input
                  {...register('email')}
                  type="email"
                  className={`w-full px-4 py-2 border ${errors.email ? 'border-red-500' : 'border-neutral-300 dark:border-neutral-600'} rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-50 focus:ring-2 focus:ring-blue-500 outline-none`}
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Phone Number</label>
                <input
                  {...register('phone')}
                  className={`w-full px-4 py-2 border ${errors.phone ? 'border-red-500' : 'border-neutral-300 dark:border-neutral-600'} rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-50 focus:ring-2 focus:ring-blue-500 outline-none`}
                />
                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Employment Type</label>
                  <select
                    {...register('employmentType')}
                    className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-50 focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="permanent">Permanent</option>
                    <option value="contract">Contract</option>
                    <option value="temporary">Temporary</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Organization</label>
                  <select
                    {...register('organization')}
                    className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-50 focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="">Select organization</option>
                    {predefinedOrganizations.map((org) => (
                      <option key={org} value={org}>{org}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">BVN (Optional)</label>
                  <input
                    {...register('bvn')}
                    className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-50 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">NIN (Optional)</label>
                  <input
                    {...register('nin')}
                    className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-50 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Address</label>
                <textarea
                  {...register('address')}
                  rows={2}
                  className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-50 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Status</label>
                <select
                  {...register('status')}
                  className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-50 focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="pending">Pending</option>
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                  <option value="inactive">Inactive</option>
                  <option value="blacklisted">Blacklisted</option>
                </select>
              </div>

              <div className="flex gap-4 mt-8">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createLoading || updateLoading}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors"
                >
                  {createLoading || updateLoading ? 'Saving...' : editingMember ? 'Update Member' : 'Add Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </MainLayout>
  )
}

export default Members
