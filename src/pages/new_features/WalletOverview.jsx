import React, { useState, useEffect } from 'react'
import Card from '../../components/Card'

const WalletOverview = () => {
  const [wallets, setWallets] = useState([])
  const [selectedWallet, setSelectedWallet] = useState(null)
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  
  const [summary] = useState({
    totalBalance: 45600000,
    availableBalance: 38900000,
    lockedBalance: 6700000,
    totalTransactions: 1234
  })
  
  const mockWallets = [
    { id: '1', ownerType: 'member', ownerName: 'John Adeyemi', type: 'contribution', balance: 450000, available: 450000, locked: 0, status: 'active' },
    { id: '2', ownerType: 'member', ownerName: 'Sarah Okonkwo', type: 'loan', balance: 1200000, available: 800000, locked: 400000, status: 'active' },
    { id: '3', ownerType: 'platform', ownerName: 'Platform Reserve', type: 'reserve', balance: 15000000, available: 10000000, locked: 5000000, status: 'active' },
    { id: '4', ownerType: 'member', ownerName: 'Michael Okafor', type: 'contribution', balance: 280000, available: 250000, locked: 30000, status: 'frozen' },
    { id: '5', ownerType: 'platform', ownerName: 'Investment Pool', type: 'investment', balance: 8900000, available: 8900000, locked: 0, status: 'active' }
  ]
  
  const mockTransactions = [
    { id: 'TX001', date: '2024-01-15 10:30', type: 'credit', category: 'contribution', amount: 50000, balance: 500000 },
    { id: 'TX002', date: '2024-01-15 09:15', type: 'debit', category: 'withdrawal', amount: 25000, balance: 450000 },
    { id: 'TX003', date: '2024-01-14 14:22', type: 'credit', category: 'loan_repayment', amount: 35000, balance: 475000 },
    { id: 'TX004', date: '2024-01-14 11:00', type: 'credit', category: 'contribution', amount: 75000, balance: 440000 },
    { id: 'TX005', date: '2024-01-13 16:45', type: 'debit', category: 'fee', amount: 5000, balance: 365000 }
  ]
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setWallets(mockWallets)
      setSelectedWallet(mockWallets[0])
      setTransactions(mockTransactions)
      setLoading(false)
    }, 500)
    return () => clearTimeout(timer)
  }, [])
  
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0
    }).format(value)
  }
  
  const filteredWallets = filter === 'all' ? wallets : wallets.filter(w => w.status === filter)
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }
  
  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Wallet Management</h1>
          <p className="text-gray-500">Manage wallets and track transactions</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
            Reconcile All
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Export Report
          </button>
        </div>
      </div>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <p className="text-blue-100 text-sm">Total Balance</p>
          <h3 className="text-2xl font-bold mt-1">{formatCurrency(summary.totalBalance)}</h3>
        </Card>
        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <p className="text-green-100 text-sm">Available Balance</p>
          <h3 className="text-2xl font-bold mt-1">{formatCurrency(summary.availableBalance)}</h3>
        </Card>
        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
          <p className="text-orange-100 text-sm">Locked Balance</p>
          <h3 className="text-2xl font-bold mt-1">{formatCurrency(summary.lockedBalance)}</h3>
        </Card>
        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <p className="text-purple-100 text-sm">Total Transactions</p>
          <h3 className="text-2xl font-bold mt-1">{summary.totalTransactions.toLocaleString()}</h3>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Wallet List */}
        <Card className="lg:col-span-1">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Wallets</h3>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded text-sm"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="frozen">Frozen</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            {filteredWallets.map((wallet) => (
              <div
                key={wallet.id}
                onClick={() => setSelectedWallet(wallet)}
                className={`p-4 rounded-lg border cursor-pointer transition-all ${
                  selectedWallet?.id === wallet.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-medium text-gray-800">{wallet.ownerName}</p>
                    <p className="text-sm text-gray-500 capitalize">{wallet.type} • {wallet.ownerType}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    wallet.status === 'active' ? 'bg-green-100 text-green-700' :
                    wallet.status === 'frozen' ? 'bg-orange-100 text-orange-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {wallet.status}
                  </span>
                </div>
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-xs text-gray-500">Balance</p>
                    <p className="font-semibold text-gray-800">{formatCurrency(wallet.balance)}</p>
                  </div>
                  {wallet.locked > 0 && (
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Locked</p>
                      <p className="text-sm text-orange-600">{formatCurrency(wallet.locked)}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
        
        {/* Transaction History */}
        <Card className="lg:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">
              {selectedWallet ? `Transactions - ${selectedWallet.ownerName}` : 'Select a Wallet'}
            </h3>
            <div className="flex gap-2">
              <button className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50">
                Filter
              </button>
              <button className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50">
                Export
              </button>
            </div>
          </div>
          
          {selectedWallet ? (
            <>
              {/* Wallet Details */}
              <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-500">Total Balance</p>
                  <p className="text-xl font-bold text-gray-800">{formatCurrency(selectedWallet.balance)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Available</p>
                  <p className="text-xl font-bold text-green-600">{formatCurrency(selectedWallet.available)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Locked</p>
                  <p className="text-xl font-bold text-orange-600">{formatCurrency(selectedWallet.locked)}</p>
                </div>
              </div>
              
              {/* Transactions Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-sm text-gray-500 border-b">
                      <th className="pb-3 font-medium">Transaction ID</th>
                      <th className="pb-3 font-medium">Date & Time</th>
                      <th className="pb-3 font-medium">Type</th>
                      <th className="pb-3 font-medium">Category</th>
                      <th className="pb-3 font-medium">Amount</th>
                      <th className="pb-3 font-medium">Balance After</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {transactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-gray-50">
                        <td className="py-3 text-sm text-blue-600 font-mono">{tx.id}</td>
                        <td className="py-3 text-sm text-gray-600">{tx.date}</td>
                        <td className="py-3">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            tx.type === 'credit' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {tx.type}
                          </span>
                        </td>
                        <td className="py-3 text-sm text-gray-600 capitalize">{tx.category.replace('_', ' ')}</td>
                        <td className={`py-3 text-sm font-semibold ${
                          tx.type === 'credit' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {tx.type === 'credit' ? '+' : '-'}{formatCurrency(tx.amount)}
                        </td>
                        <td className="py-3 text-sm text-gray-600">{formatCurrency(tx.balance)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination */}
              <div className="flex justify-between items-center mt-4 pt-4 border-t">
                <p className="text-sm text-gray-500">Showing 1-5 of 123 transactions</p>
                <div className="flex gap-2">
                  <button className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50" disabled>Previous</button>
                  <button className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50">Next</button>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              <p>Select a wallet to view transactions</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}

export default WalletOverview
