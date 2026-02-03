import React, { useState, useMemo } from 'react'
import { Wallet, TrendingUp, Download, RefreshCw, Search, Filter, ArrowUpRight, ArrowDownRight, CreditCard, Building2, DollarSign, Calendar, FileText, Send, X } from 'lucide-react'
import MainLayout from '../components/Layout/MainLayout'
import { useApi } from '../hooks/useApi'

const Contributions = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [showExportModal, setShowExportModal] = useState(false)

  const { data: contributionsData, loading: contributionsLoading, refetch: refetchContributions } = useApi(
    '/contributions',
    { pollInterval: 30000 }
  )

  const { data: walletStats } = useApi('/statistics/wallet')

  // Mock data for demonstration
  const mockContributions = [
    { id: 'TXN001', memberId: 'M001', memberName: 'John Adebayo', amount: 50000, type: 'monthly', method: 'bank_transfer', status: 'completed', date: '2024-03-15', time: '10:30 AM', reference: 'REF123456' },
    { id: 'TXN002', memberId: 'M002', memberName: 'Sarah Okonkwo', amount: 75000, type: 'special', method: 'card_payment', status: 'completed', date: '2024-03-15', time: '11:45 AM', reference: 'REF123457' },
    { id: 'TXN003', memberId: 'M003', memberName: 'Mike Ogunleye', amount: 50000, type: 'monthly', method: 'bank_transfer', status: 'pending', date: '2024-03-15', time: '02:15 PM', reference: 'REF123458' },
    { id: 'TXN004', memberId: 'M004', memberName: 'Grace Ibrahim', amount: 100000, type: 'special', method: 'bank_transfer', status: 'completed', date: '2024-03-14', time: '09:00 AM', reference: 'REF123459' },
    { id: 'TXN005', memberId: 'M005', memberName: 'David Adeyemi', amount: 50000, type: 'monthly', method: 'wallet', status: 'completed', date: '2024-03-14', time: '04:30 PM', reference: 'REF123460' },
    { id: 'TXN006', memberId: 'M006', memberName: 'Emma Thompson', amount: 25000, type: 'savings', method: 'card_payment', status: 'failed', date: '2024-03-14', time: '01:20 PM', reference: 'REF123461' }
  ]

  const mockWalletStats = {
    platformBalance: 45678900,
    totalInflow: 12500000,
    totalOutflow: 8750000,
    pendingTransactions: 23,
    failedTransactions: 5
  }

  const contributions = contributionsData?.data || mockContributions
  const stats = walletStats?.data || mockWalletStats

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0
    }).format(value || 0)
  }

  const filteredContributions = useMemo(() => {
    return contributions.filter(item => {
      if (filterType !== 'all' && item.type !== filterType) return false
      if (searchTerm && !item.memberName.toLowerCase().includes(searchTerm.toLowerCase()) && !item.id.toLowerCase().includes(searchTerm.toLowerCase())) return false
      return true
    })
  }, [contributions, filterType, searchTerm])

  const handleExport = (format) => {
    console.log(`Exporting as ${format}`)
    setShowExportModal(false)
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="section-title">E-Wallet & Transactions</h1>
            <p className="text-neutral-600 dark:text-neutral-400">Track contributions, wallet balances, and all financial transactions</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => refetchContributions()}
              className="flex items-center gap-2 px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors"
            >
              <RefreshCw size={18} />
              Refresh
            </button>
            <button
              onClick={() => setShowExportModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            >
              <Download size={18} />
              Export
            </button>
          </div>
        </div>

        {/* Wallet Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="card-hover">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">Platform Wallet Balance</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(stats.platformBalance)}</p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                <Wallet className="text-green-600 dark:text-green-400" size={24} />
              </div>
            </div>
          </div>

          <div className="card-hover">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">Total Inflows</p>
                <p className="text-2xl font-bold text-blue-600">{formatCurrency(stats.totalInflow)}</p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <ArrowUpRight className="text-blue-600 dark:text-blue-400" size={24} />
              </div>
            </div>
          </div>

          <div className="card-hover">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">Total Outflows</p>
                <p className="text-2xl font-bold text-red-600">{formatCurrency(stats.totalOutflow)}</p>
              </div>
              <div className="p-3 bg-red-100 dark:bg-red-900 rounded-lg">
                <ArrowDownRight className="text-red-600 dark:text-red-400" size={24} />
              </div>
            </div>
          </div>

          <div className="card-hover">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">Pending Transactions</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pendingTransactions}</p>
              </div>
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                <Clock className="text-yellow-600 dark:text-yellow-400" size={24} />
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
                placeholder="Search by member name or transaction ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-50 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter size={20} className="text-neutral-600 dark:text-neutral-400" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-50 focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="all">All Types</option>
                <option value="monthly">Monthly</option>
                <option value="special">Special</option>
                <option value="savings">Savings</option>
              </select>
            </div>
          </div>

          {/* Transactions Table */}
          {contributionsLoading ? (
            <div className="text-center py-8 text-neutral-500">Loading transactions...</div>
          ) : filteredContributions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-neutral-200 dark:border-neutral-700">
                    <th className="text-left py-3 px-4 font-semibold text-neutral-900 dark:text-neutral-50">TXN ID</th>
                    <th className="text-left py-3 px-4 font-semibold text-neutral-900 dark:text-neutral-50">Member</th>
                    <th className="text-left py-3 px-4 font-semibold text-neutral-900 dark:text-neutral-50">Type</th>
                    <th className="text-left py-3 px-4 font-semibold text-neutral-900 dark:text-neutral-50">Method</th>
                    <th className="text-left py-3 px-4 font-semibold text-neutral-900 dark:text-neutral-50">Amount</th>
                    <th className="text-left py-3 px-4 font-semibold text-neutral-900 dark:text-neutral-50">Date & Time</th>
                    <th className="text-left py-3 px-4 font-semibold text-neutral-900 dark:text-neutral-50">Status</th>
                    <th className="text-left py-3 px-4 font-semibold text-neutral-900 dark:text-neutral-50">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredContributions.map((item) => (
                    <tr key={item.id} className="border-b border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors">
                      <td className="py-3 px-4 font-mono text-sm text-neutral-600 dark:text-neutral-400">{item.id}</td>
                      <td className="py-3 px-4 font-medium text-neutral-900 dark:text-neutral-50">{item.memberName}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 rounded text-xs font-medium capitalize">
                          {item.type}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          {item.method === 'bank_transfer' && <Building2 size={16} className="text-neutral-500" />}
                          {item.method === 'card_payment' && <CreditCard size={16} className="text-neutral-500" />}
                          {item.method === 'wallet' && <Wallet size={16} className="text-neutral-500" />}
                          <span className="text-neutral-600 dark:text-neutral-400 capitalize">{item.method.replace('_', ' ')}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-semibold text-neutral-900 dark:text-neutral-50">{formatCurrency(item.amount)}</td>
                      <td className="py-3 px-4 text-neutral-600 dark:text-neutral-400">
                        <div>{item.date}</div>
                        <div className="text-xs text-neutral-400">{item.time}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          item.status === 'completed' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200' :
                          item.status === 'pending' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-200' :
                          'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200'
                        }`}>
                          {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <button className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900 rounded-lg transition-colors" title="View Details">
                            <FileText size={16} className="text-blue-600" />
                          </button>
                          <button className="p-2 hover:bg-green-100 dark:hover:bg-green-900 rounded-lg transition-colors" title="Download Receipt">
                            <Download size={16} className="text-green-600" />
                          </button>
                          {item.status === 'failed' && (
                            <button className="px-3 py-1 bg-yellow-600 hover:bg-yellow-700 text-white rounded text-xs transition-colors">
                              Retry
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
            <div className="text-center py-8 text-neutral-500">No transactions found</div>
          )}
        </div>

        {/* Payment Gateway Logs */}
        <div className="card">
          <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-50 mb-6">Payment Gateway Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-green-700 dark:text-green-300 font-medium">Paystack</span>
                <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
              </div>
              <p className="text-sm text-green-600 dark:text-green-400 mt-1">Operational</p>
            </div>
            <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-green-700 dark:text-green-300 font-medium">Flutterwave</span>
                <span className="w-3 h-3 bg-green-500 rounded-full"></span>
              </div>
              <p className="text-sm text-green-600 dark:text-green-400 mt-1">Operational</p>
            </div>
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-yellow-700 dark:text-yellow-300 font-medium">Bank Transfer</span>
                <span className="w-3 h-3 bg-yellow-500 rounded-full"></span>
              </div>
              <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-1">Delayed processing</p>
            </div>
          </div>
        </div>
      </div>

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-neutral-800 rounded-xl p-6 w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-50">Export Transactions</h2>
              <button
                onClick={() => setShowExportModal(false)}
                className="p-1 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <button
                onClick={() => handleExport('pdf')}
                className="w-full flex items-center gap-4 p-4 border border-neutral-200 dark:border-neutral-700 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors"
              >
                <FileText size={24} className="text-red-600" />
                <div className="text-left">
                  <p className="font-medium text-neutral-900 dark:text-neutral-50">Export as PDF</p>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">Download formatted report</p>
                </div>
              </button>
              <button
                onClick={() => handleExport('csv')}
                className="w-full flex items-center gap-4 p-4 border border-neutral-200 dark:border-neutral-700 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors"
              >
                <DollarSign size={24} className="text-green-600" />
                <div className="text-left">
                  <p className="font-medium text-neutral-900 dark:text-neutral-50">Export as CSV</p>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">Open in spreadsheet software</p>
                </div>
              </button>
              <button
                onClick={() => handleExport('excel')}
                className="w-full flex items-center gap-4 p-4 border border-neutral-200 dark:border-neutral-700 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors"
              >
                <TrendingUp size={24} className="text-blue-600" />
                <div className="text-left">
                  <p className="font-medium text-neutral-900 dark:text-neutral-50">Export as Excel</p>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">Full Excel with formulas</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  )
}

export default Contributions
