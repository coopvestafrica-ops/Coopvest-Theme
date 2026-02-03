import React, { useState } from 'react'
import { ShieldAlert, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Clock, X, BarChart3, Users, DollarSign, RefreshCw, Filter, Search } from 'lucide-react'
import MainLayout from '../components/Layout/MainLayout'
import { useApi } from '../hooks/useApi'

const RiskScoring = () => {
  const [selectedMember, setSelectedMember] = useState(null)
  const [filterRisk, setFilterRisk] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  // Mock data for demonstration
  const mockRiskData = [
    { id: 'M001', name: 'John Adebayo', riskScore: 85, riskLevel: 'Low', contributionRatio: 95, loanRepayment: 100, accountAge: 24, employmentStatus: 'stable', previousDefaults: 0, savingsHistory: 'excellent' },
    { id: 'M002', name: 'Sarah Okonkwo', riskScore: 72, riskLevel: 'Low', contributionRatio: 88, loanRepayment: 95, accountAge: 18, employmentStatus: 'stable', previousDefaults: 0, savingsHistory: 'good' },
    { id: 'M003', name: 'Mike Ogunleye', riskScore: 55, riskLevel: 'Medium', contributionRatio: 70, loanRepayment: 85, accountAge: 12, employmentStatus: 'contract', previousDefaults: 1, savingsHistory: 'average' },
    { id: 'M004', name: 'Grace Ibrahim', riskScore: 32, riskLevel: 'High', contributionRatio: 45, loanRepayment: 55, accountAge: 6, employmentStatus: 'unstable', previousDefaults: 2, savingsHistory: 'poor' },
    { id: 'M005', name: 'David Adeyemi', riskScore: 78, riskLevel: 'Low', contributionRatio: 92, loanRepayment: 98, accountAge: 36, employmentStatus: 'stable', previousDefaults: 0, savingsHistory: 'excellent' },
    { id: 'M006', name: 'Emma Thompson', riskScore: 48, riskLevel: 'Medium', contributionRatio: 65, loanRepayment: 75, accountAge: 8, employmentStatus: 'contract', previousDefaults: 1, savingsHistory: 'average' },
    { id: 'M007', name: 'Robert Chen', riskScore: 25, riskLevel: 'High', contributionRatio: 35, loanRepayment: 40, accountAge: 3, employmentStatus: 'unstable', previousDefaults: 3, savingsHistory: 'poor' }
  ]

  const mockStats = {
    averageScore: 62,
    lowRiskCount: 312,
    mediumRiskCount: 89,
    highRiskCount: 45,
    totalExposed: 2500000,
    defaultedAmount: 450000
  }

  const riskData = mockRiskData
  const stats = mockStats

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0
    }).format(value || 0)
  }

  const getRiskBadge = (level) => {
    const badges = {
      Low: { bg: 'bg-green-100 dark:bg-green-900', text: 'text-green-700 dark:text-green-200', icon: CheckCircle },
      Medium: { bg: 'bg-yellow-100 dark:bg-yellow-900', text: 'text-yellow-700 dark:text-yellow-200', icon: AlertTriangle },
      High: { bg: 'bg-red-100 dark:bg-red-900', text: 'text-red-700 dark:text-red-200', icon: ShieldAlert }
    }
    const badge = badges[level] || badges.Low
    const Icon = badge.icon
    return (
      <div className={`inline-flex items-center gap-1 px-2 py-1 ${badge.bg} ${badge.text} rounded text-xs font-medium`}>
        <Icon size={12} />
        {level} Risk
      </div>
    )
  }

  const getScoreColor = (score) => {
    if (score >= 70) return 'text-green-600'
    if (score >= 50) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreBg = (score) => {
    if (score >= 70) return 'bg-green-100 dark:bg-green-900'
    if (score >= 50) return 'bg-yellow-100 dark:bg-yellow-900'
    return 'bg-red-100 dark:bg-red-900'
  }

  const filteredData = riskData.filter(item => {
    if (filterRisk !== 'all' && item.riskLevel !== filterRisk) return false
    if (searchTerm && !item.name.toLowerCase().includes(searchTerm.toLowerCase())) return false
    return true
  })

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="section-title">Risk Scoring & Assessment</h1>
            <p className="text-neutral-600 dark:text-neutral-400">Evaluate member risk profiles and loan eligibility</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors">
            <RefreshCw size={18} />
            Recalculate All
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="card-hover">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">Average Score</p>
                <p className={`text-2xl font-bold ${getScoreColor(stats.averageScore)}`}>{stats.averageScore}</p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <BarChart3 className="text-blue-600 dark:text-blue-400" size={24} />
              </div>
            </div>
          </div>

          <div className="card-hover">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">Low Risk</p>
                <p className="text-2xl font-bold text-green-600">{stats.lowRiskCount}</p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                <CheckCircle className="text-green-600 dark:text-green-400" size={24} />
              </div>
            </div>
          </div>

          <div className="card-hover">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">Medium Risk</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.mediumRiskCount}</p>
              </div>
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                <AlertTriangle className="text-yellow-600 dark:text-yellow-400" size={24} />
              </div>
            </div>
          </div>

          <div className="card-hover">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">High Risk</p>
                <p className="text-2xl font-bold text-red-600">{stats.highRiskCount}</p>
              </div>
              <div className="p-3 bg-red-100 dark:bg-red-900 rounded-lg">
                <ShieldAlert className="text-red-600 dark:text-red-400" size={24} />
              </div>
            </div>
          </div>

          <div className="card-hover">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">Total Exposed</p>
                <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">{formatCurrency(stats.totalExposed)}</p>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <DollarSign className="text-purple-600 dark:text-purple-400" size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Risk Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="card">
            <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-50 mb-6">Risk Distribution</h3>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-neutral-600 dark:text-neutral-400">Low Risk (70-100)</span>
                  <span className="text-sm font-medium text-green-600">{Math.round((stats.lowRiskCount / (stats.lowRiskCount + stats.mediumRiskCount + stats.highRiskCount)) * 100)}%</span>
                </div>
                <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-3">
                  <div className="bg-green-500 h-3 rounded-full" style={{ width: `${(stats.lowRiskCount / (stats.lowRiskCount + stats.mediumRiskCount + stats.highRiskCount)) * 100}%` }}></div>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-neutral-600 dark:text-neutral-400">Medium Risk (50-69)</span>
                  <span className="text-sm font-medium text-yellow-600">{Math.round((stats.mediumRiskCount / (stats.lowRiskCount + stats.mediumRiskCount + stats.highRiskCount)) * 100)}%</span>
                </div>
                <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-3">
                  <div className="bg-yellow-500 h-3 rounded-full" style={{ width: `${(stats.mediumRiskCount / (stats.lowRiskCount + stats.mediumRiskCount + stats.highRiskCount)) * 100}%` }}></div>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-neutral-600 dark:text-neutral-400">High Risk (0-49)</span>
                  <span className="text-sm font-medium text-red-600">{Math.round((stats.highRiskCount / (stats.lowRiskCount + stats.mediumRiskCount + stats.highRiskCount)) * 100)}%</span>
                </div>
                <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-3">
                  <div className="bg-red-500 h-3 rounded-full" style={{ width: `${(stats.highRiskCount / (stats.lowRiskCount + stats.mediumRiskCount + stats.highRiskCount)) * 100}%` }}></div>
                </div>
              </div>
            </div>
          </div>

          <div className="card lg:col-span-2">
            <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-50 mb-6">Risk Factors Impact</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-neutral-50 dark:bg-neutral-900 rounded-lg text-center">
                <p className="text-2xl font-bold text-blue-600">35%</p>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">Contribution History</p>
              </div>
              <div className="p-4 bg-neutral-50 dark:bg-neutral-900 rounded-lg text-center">
                <p className="text-2xl font-bold text-green-600">25%</p>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">Loan Repayment</p>
              </div>
              <div className="p-4 bg-neutral-50 dark:bg-neutral-900 rounded-lg text-center">
                <p className="text-2xl font-bold text-purple-600">20%</p>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">Account Age</p>
              </div>
              <div className="p-4 bg-neutral-50 dark:bg-neutral-900 rounded-lg text-center">
                <p className="text-2xl font-bold text-yellow-600">20%</p>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">Employment Status</p>
              </div>
            </div>
          </div>
        </div>

        {/* Member Risk Table */}
        <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700 p-6">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 text-neutral-400" size={20} />
              <input
                type="text"
                placeholder="Search by member name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-50 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter size={20} className="text-neutral-600 dark:text-neutral-400" />
              <select
                value={filterRisk}
                onChange={(e) => setFilterRisk(e.target.value)}
                className="px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-50 focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="all">All Risk Levels</option>
                <option value="Low">Low Risk</option>
                <option value="Medium">Medium Risk</option>
                <option value="High">High Risk</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral-200 dark:border-neutral-700">
                  <th className="text-left py-3 px-4 font-semibold text-neutral-900 dark:text-neutral-50">Member</th>
                  <th className="text-left py-3 px-4 font-semibold text-neutral-900 dark:text-neutral-50">Risk Score</th>
                  <th className="text-left py-3 px-4 font-semibold text-neutral-900 dark:text-neutral-50">Level</th>
                  <th className="text-left py-3 px-4 font-semibold text-neutral-900 dark:text-neutral-50">Contribution</th>
                  <th className="text-left py-3 px-4 font-semibold text-neutral-900 dark:text-neutral-50">Repayment</th>
                  <th className="text-left py-3 px-4 font-semibold text-neutral-900 dark:text-neutral-50">Employment</th>
                  <th className="text-left py-3 px-4 font-semibold text-neutral-900 dark:text-neutral-50">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((member) => (
                  <tr key={member.id} className="border-b border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors">
                    <td className="py-3 px-4 font-medium text-neutral-900 dark:text-neutral-50">{member.name}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getScoreBg(member.riskScore)}`}>
                          <span className={`font-bold ${getScoreColor(member.riskScore)}`}>{member.riskScore}</span>
                        </div>
                        <div className="flex flex-col">
                          <div className="w-20 bg-neutral-200 dark:bg-neutral-700 rounded-full h-2">
                            <div className={`h-2 rounded-full ${member.riskScore >= 70 ? 'bg-green-500' : member.riskScore >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${member.riskScore}%` }}></div>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">{getRiskBadge(member.riskLevel)}</td>
                    <td className="py-3 px-4">
                      <span className={member.contributionRatio >= 80 ? 'text-green-600' : member.contributionRatio >= 60 ? 'text-yellow-600' : 'text-red-600'}>
                        {member.contributionRatio}%
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={member.loanRepayment >= 80 ? 'text-green-600' : member.loanRepayment >= 60 ? 'text-yellow-600' : 'text-red-600'}>
                        {member.loanRepayment}%
                      </span>
                    </td>
                    <td className="py-3 px-4 text-neutral-600 dark:text-neutral-400 capitalize">{member.employmentStatus}</td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => setSelectedMember(member)}
                        className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Member Risk Detail Modal */}
      {selectedMember && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-neutral-800 rounded-xl w-full max-w-2xl shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700 p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center ${getScoreBg(selectedMember.riskScore)}`}>
                  <span className={`text-2xl font-bold ${getScoreColor(selectedMember.riskScore)}`}>{selectedMember.riskScore}</span>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-50">{selectedMember.name}</h2>
                  <p className="text-neutral-600 dark:text-neutral-400">{selectedMember.id}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedMember(null)}
                className="p-1 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="flex items-center gap-4">
                {getRiskBadge(selectedMember.riskLevel)}
                <span className="text-neutral-600 dark:text-neutral-400">Account Age: {selectedMember.accountAge} months</span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-neutral-50 dark:bg-neutral-900 rounded-lg">
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">Contribution Ratio</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-neutral-200 dark:bg-neutral-700 rounded-full h-3">
                      <div className="bg-blue-500 h-3 rounded-full" style={{ width: `${selectedMember.contributionRatio}%` }}></div>
                    </div>
                    <span className="font-bold text-neutral-900 dark:text-neutral-50">{selectedMember.contributionRatio}%</span>
                  </div>
                </div>
                <div className="p-4 bg-neutral-50 dark:bg-neutral-900 rounded-lg">
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">Loan Repayment Rate</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-neutral-200 dark:bg-neutral-700 rounded-full h-3">
                      <div className="bg-green-500 h-3 rounded-full" style={{ width: `${selectedMember.loanRepayment}%` }}></div>
                    </div>
                    <span className="font-bold text-neutral-900 dark:text-neutral-50">{selectedMember.loanRepayment}%</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-neutral-900 dark:text-neutral-50 mb-4">Risk Factors Breakdown</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-900 rounded-lg">
                    <span className="text-neutral-600 dark:text-neutral-400">Contribution History</span>
                    <span className="font-medium text-neutral-900 dark:text-neutral-50">{selectedMember.contributionRatio}%</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-900 rounded-lg">
                    <span className="text-neutral-600 dark:text-neutral-400">Loan Repayment Track Record</span>
                    <span className="font-medium text-neutral-900 dark:text-neutral-50">{selectedMember.loanRepayment}%</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-900 rounded-lg">
                    <span className="text-neutral-600 dark:text-neutral-400">Account Age</span>
                    <span className="font-medium text-neutral-900 dark:text-neutral-50">{selectedMember.accountAge} months</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-900 rounded-lg">
                    <span className="text-neutral-600 dark:text-neutral-400">Employment Status</span>
                    <span className="font-medium text-neutral-900 dark:text-neutral-50 capitalize">{selectedMember.employmentStatus}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-900 rounded-lg">
                    <span className="text-neutral-600 dark:text-neutral-400">Previous Defaults</span>
                    <span className={`font-medium ${selectedMember.previousDefaults > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {selectedMember.previousDefaults} times
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-900 rounded-lg">
                    <span className="text-neutral-600 dark:text-neutral-400">Savings History</span>
                    <span className="font-medium text-neutral-900 dark:text-neutral-50 capitalize">{selectedMember.savingsHistory}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-neutral-200 dark:border-neutral-700">
                <button className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors">
                  Approve Loan
                </button>
                <button className="flex-1 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors">
                  Require Collateral
                </button>
                <button className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors">
                  Reject
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  )
}

export default RiskScoring
