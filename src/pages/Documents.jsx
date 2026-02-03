import React, { useState } from 'react'
import { FileText, Download, Eye, Send, Plus, X, Calendar, User, Building2, DollarSign, CheckCircle, Clock, FileCheck, FileSignature } from 'lucide-react'
import MainLayout from '../components/Layout/MainLayout'
import { useApi } from '../hooks/useApi'

const Documents = () => {
  const [showGenerateModal, setShowGenerateModal] = useState(false)
  const [selectedDocument, setSelectedDocument] = useState(null)
  const [documentType, setDocumentType] = useState('all')

  const { data: documentsData, loading: documentsLoading, refetch: refetchDocuments } = useApi('/documents')

  // Mock data for demonstration
  const mockDocuments = [
    { id: 'DOC001', type: 'loan_approval', title: 'Loan Approval Letter - John Adebayo', member: 'John Adebayo', amount: 150000, date: '2024-03-15', status: 'generated', downloaded: true, signature: true },
    { id: 'DOC002', type: 'contribution_statement', title: 'Contribution Statement - Q1 2024', member: 'Sarah Okonkwo', amount: null, date: '2024-03-14', status: 'generated', downloaded: false, signature: false },
    { id: 'DOC003', type: 'loan_statement', title: 'Loan Statement - Mike Ogunleye', member: 'Mike Ogunleye', amount: 100000, date: '2024-03-14', status: 'pending', downloaded: false, signature: false },
    { id: 'DOC004', type: 'loan_approval', title: 'Loan Approval Letter - Grace Ibrahim', member: 'Grace Ibrahim', amount: 250000, date: '2024-03-13', status: 'sent', downloaded: true, signature: true },
    { id: 'DOC005', type: 'contribution_statement', title: 'Contribution Statement - February 2024', member: 'David Adeyemi', amount: null, date: '2024-03-12', status: 'generated', downloaded: false, signature: false },
    { id: 'DOC006', type: 'loan_approval', title: 'Loan Approval Letter - Emma Thompson', member: 'Emma Thompson', amount: 180000, date: '2024-03-11', status: 'generated', downloaded: true, signature: false }
  ]

  const mockStats = {
    totalDocuments: 156,
    pendingSignatures: 23,
    generatedThisMonth: 45,
    sentToMembers: 128
  }

  const documents = documentsData?.data || mockDocuments
  const stats = mockStats

  const formatCurrency = (value) => {
    if (!value) return '-'
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0
    }).format(value)
  }

  const getTypeBadge = (type) => {
    const badges = {
      loan_approval: { bg: 'bg-blue-100 dark:bg-blue-900', text: 'text-blue-700 dark:text-blue-200', icon: FileSignature },
      contribution_statement: { bg: 'bg-green-100 dark:bg-green-900', text: 'text-green-700 dark:text-green-200', icon: FileText },
      loan_statement: { bg: 'bg-purple-100 dark:bg-purple-900', text: 'text-purple-700 dark:text-purple-200', icon: FileCheck }
    }
    const badge = badges[type] || badges.contribution_statement
    const Icon = badge.icon
    return (
      <div className={`inline-flex items-center gap-1 px-2 py-1 ${badge.bg} ${badge.text} rounded text-xs font-medium`}>
        <Icon size={12} />
        {type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
      </div>
    )
  }

  const getStatusBadge = (status) => {
    const badges = {
      generated: { bg: 'bg-blue-100 dark:bg-blue-900', text: 'text-blue-700 dark:text-blue-200' },
      pending: { bg: 'bg-yellow-100 dark:bg-yellow-900', text: 'text-yellow-700 dark:text-yellow-200' },
      sent: { bg: 'bg-green-100 dark:bg-green-900', text: 'text-green-700 dark:text-green-200' }
    }
    const badge = badges[status] || badges.generated
    return (
      <span className={`px-2 py-1 ${badge.bg} ${badge.text} rounded text-xs font-medium`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    )
  }

  const filteredDocuments = documentType === 'all' ? documents : documents.filter(d => d.type === documentType)

  const handleGenerateDocument = (type) => {
    console.log(`Generating ${type} document`)
    setShowGenerateModal(false)
  }

  const handlePreview = (doc) => {
    setSelectedDocument(doc)
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="section-title">Document Generation</h1>
            <p className="text-neutral-600 dark:text-neutral-400">Auto-generate loan approvals, statements, and official documents</p>
          </div>
          <button
            onClick={() => setShowGenerateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <Plus size={18} />
            Generate Document
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="card-hover">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">Total Documents</p>
                <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">{stats.totalDocuments}</p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <FileText className="text-blue-600 dark:text-blue-400" size={24} />
              </div>
            </div>
          </div>

          <div className="card-hover">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">Pending Signatures</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pendingSignatures}</p>
              </div>
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                <Clock className="text-yellow-600 dark:text-yellow-400" size={24} />
              </div>
            </div>
          </div>

          <div className="card-hover">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">Generated This Month</p>
                <p className="text-2xl font-bold text-green-600">{stats.generatedThisMonth}</p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                <CheckCircle className="text-green-600 dark:text-green-400" size={24} />
              </div>
            </div>
          </div>

          <div className="card-hover">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">Sent to Members</p>
                <p className="text-2xl font-bold text-purple-600">{stats.sentToMembers}</p>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <Send className="text-purple-600 dark:text-purple-400" size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Document Template Preview */}
        <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700 p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-primary-100 dark:bg-primary-900 rounded-lg">
              <Building2 className="text-primary-600 dark:text-primary-400" size={32} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-50">Coopvest Cooperative Society Limited</h2>
              <p className="text-neutral-600 dark:text-neutral-400">Official Document Templates</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="p-4 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-gradient-to-br from-blue-50 to-white dark:from-blue-900/20 dark:to-neutral-900">
              <FileSignature className="text-blue-600 mb-2" size={24} />
              <h3 className="font-semibold text-neutral-900 dark:text-neutral-50 mb-1">Loan Approval Letter</h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3">Official approval with terms</p>
              <ul className="text-xs text-neutral-500 space-y-1">
                <li> Coopvest letterhead</li>
                <li> Digital signature & seal</li>
                <li> Unique document ID</li>
                <li> Timestamp</li>
              </ul>
            </div>
            <div className="p-4 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-gradient-to-br from-green-50 to-white dark:from-green-900/20 dark:to-neutral-900">
              <FileText className="text-green-600 mb-2" size={24} />
              <h3 className="font-semibold text-neutral-900 dark:text-neutral-50 mb-1">Contribution Statement</h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3">Monthly/yearly summaries</p>
              <ul className="text-xs text-neutral-500 space-y-1">
                <li> Complete transaction history</li>
                <li> Running totals</li>
                <li> Period summary</li>
              </ul>
            </div>
            <div className="p-4 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-gradient-to-br from-purple-50 to-white dark:from-purple-900/20 dark:to-neutral-900">
              <FileCheck className="text-purple-600 mb-2" size={24} />
              <h3 className="font-semibold text-neutral-900 dark:text-neutral-50 mb-1">Loan Statement</h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3">Loan account details</p>
              <ul className="text-xs text-neutral-500 space-y-1">
                <li> Repayment schedule</li>
                <li> Balance history</li>
                <li> Interest breakdown</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Documents List */}
        <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-50">Generated Documents</h2>
            <div className="flex items-center gap-2">
              <select
                value={documentType}
                onChange={(e) => setDocumentType(e.target.value)}
                className="px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-50 focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="all">All Types</option>
                <option value="loan_approval">Loan Approvals</option>
                <option value="contribution_statement">Contribution Statements</option>
                <option value="loan_statement">Loan Statements</option>
              </select>
            </div>
          </div>

          {documentsLoading ? (
            <div className="text-center py-8 text-neutral-500">Loading documents...</div>
          ) : filteredDocuments.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-neutral-200 dark:border-neutral-700">
                    <th className="text-left py-3 px-4 font-semibold text-neutral-900 dark:text-neutral-50">Document</th>
                    <th className="text-left py-3 px-4 font-semibold text-neutral-900 dark:text-neutral-50">Member</th>
                    <th className="text-left py-3 px-4 font-semibold text-neutral-900 dark:text-neutral-50">Type</th>
                    <th className="text-left py-3 px-4 font-semibold text-neutral-900 dark:text-neutral-50">Amount</th>
                    <th className="text-left py-3 px-4 font-semibold text-neutral-900 dark:text-neutral-50">Date</th>
                    <th className="text-left py-3 px-4 font-semibold text-neutral-900 dark:text-neutral-50">Status</th>
                    <th className="text-left py-3 px-4 font-semibold text-neutral-900 dark:text-neutral-50">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDocuments.map((doc) => (
                    <tr key={doc.id} className="border-b border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                            <FileText size={18} className="text-blue-600" />
                          </div>
                          <span className="font-medium text-neutral-900 dark:text-neutral-50">{doc.title}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-neutral-600 dark:text-neutral-400">{doc.member}</td>
                      <td className="py-3 px-4">{getTypeBadge(doc.type)}</td>
                      <td className="py-3 px-4 text-neutral-600 dark:text-neutral-400">{formatCurrency(doc.amount)}</td>
                      <td className="py-3 px-4 text-neutral-600 dark:text-neutral-400">{doc.date}</td>
                      <td className="py-3 px-4">{getStatusBadge(doc.status)}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handlePreview(doc)}
                            className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900 rounded-lg transition-colors"
                            title="Preview"
                          >
                            <Eye size={16} className="text-blue-600" />
                          </button>
                          <button
                            className="p-2 hover:bg-green-100 dark:hover:bg-green-900 rounded-lg transition-colors"
                            title="Download"
                          >
                            <Download size={16} className="text-green-600" />
                          </button>
                          <button
                            className="p-2 hover:bg-purple-100 dark:hover:bg-purple-900 rounded-lg transition-colors"
                            title="Send to Member"
                          >
                            <Send size={16} className="text-purple-600" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-neutral-500">No documents found</div>
          )}
        </div>
      </div>

      {/* Generate Document Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-neutral-800 rounded-xl p-6 w-full max-w-lg shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-50">Generate Document</h2>
              <button
                onClick={() => setShowGenerateModal(false)}
                className="p-1 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <button
                onClick={() => handleGenerateDocument('loan_approval')}
                className="w-full flex items-center gap-4 p-4 border border-neutral-200 dark:border-neutral-700 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
              >
                <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <FileSignature size={24} className="text-blue-600" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-neutral-900 dark:text-neutral-50">Loan Approval Letter</p>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">Generate official loan approval document</p>
                </div>
              </button>
              <button
                onClick={() => handleGenerateDocument('contribution_statement')}
                className="w-full flex items-center gap-4 p-4 border border-neutral-200 dark:border-neutral-700 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
              >
                <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                  <FileText size={24} className="text-green-600" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-neutral-900 dark:text-neutral-50">Contribution Statement</p>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">Generate contribution summary report</p>
                </div>
              </button>
              <button
                onClick={() => handleGenerateDocument('loan_statement')}
                className="w-full flex items-center gap-4 p-4 border border-neutral-200 dark:border-neutral-700 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
              >
                <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                  <FileCheck size={24} className="text-purple-600" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-neutral-900 dark:text-neutral-50">Loan Statement</p>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">Generate loan account statement</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Document Preview Modal */}
      {selectedDocument && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-neutral-800 rounded-xl w-full max-w-3xl shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700 p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Building2 size={32} className="text-primary-600" />
                <div>
                  <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-50">Document Preview</h2>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">{selectedDocument.title}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedDocument(null)}
                className="p-1 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-8">
              {/* Mock Document Content */}
              <div className="border-2 border-dashed border-neutral-300 dark:border-neutral-600 rounded-lg p-8 text-center">
                <Building2 size={48} className="mx-auto text-neutral-400 mb-4" />
                <p className="text-neutral-500">Document Preview</p>
                <p className="text-sm text-neutral-400 mt-2">ID: {selectedDocument.id}</p>
                <p className="text-sm text-neutral-400">Generated on: {selectedDocument.date}</p>
              </div>
            </div>
            <div className="sticky bottom-0 bg-white dark:bg-neutral-800 border-t border-neutral-200 dark:border-neutral-700 p-6 flex items-center justify-end gap-3">
              <button
                onClick={() => setSelectedDocument(null)}
                className="px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors"
              >
                Close
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                <Download size={18} />
                Download PDF
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors">
                <Send size={18} />
                Send to Member
              </button>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  )
}

export default Documents
