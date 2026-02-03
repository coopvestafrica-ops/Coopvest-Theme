import React, { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts'
import Card from '../../components/Card'
import { useNotification } from '../../context/NotificationContext'

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8']

const ExecutiveDashboard = () => {
  const { unreadCount } = useNotification()
  const [dateRange, setDateRange] = useState('30d')
  const [loading, setLoading] = useState(true)
  
  const [kpiData, setKpiData] = useState({
    totalMembers: 1247,
    activeLoans: 892,
    totalDisbursed: 45600000,
    repaymentRate: 94.2,
    collections: 12300000,
    investments: 8900000,
    newMembers: 156,
    pendingApprovals: 23
  })
  
  const [riskData] = useState([
    { name: 'Low Risk', value: 65, color: '#00C49F' },
    { name: 'Medium Risk', value: 25, color: '#FFBB28' },
    { name: 'High Risk', value: 10, color: '#FF8042' }
  ])
  
  const [loanPerformance] = useState([
    { month: 'Jan', disbursed: 4500000, repaid: 4200000, defaulted: 150000 },
    { month: 'Feb', disbursed: 5200000, repaid: 4900000, defaulted: 180000 },
    { month: 'Mar', disbursed: 4800000, repaid: 4600000, defaulted: 120000 },
    { month: 'Apr', disbursed: 6100000, repaid: 5800000, defaulted: 200000 },
    { month: 'May', disbursed: 5500000, repaid: 5300000, defaulted: 160000 },
    { month: 'Jun', disbursed: 6700000, repaid: 6400000, defaulted: 210000 }
  ])
  
  const [topMembers] = useState([
    { name: 'John Adeyemi', contributions: 450000, loans: 3, status: 'low' },
    { name: 'Sarah Okonkwo', contributions: 380000, loans: 2, status: 'low' },
    { name: 'Michael Okafor', contributions: 320000, loans: 4, status: 'medium' },
    { name: 'Grace Ibrahim', contributions: 290000, loans: 1, status: 'low' },
    { name: 'David Adeola', contributions: 250000, loans: 5, status: 'high' }
  ])
  
  const [recentAlerts] = useState([
    { id: 1, type: 'warning', message: '3 loans approaching maturity date', time: '2 hours ago' },
    { id: 2, type: 'info', message: 'New member registration spike detected', time: '4 hours ago' },
    { id: 3, type: 'error', message: '2 repayment defaults recorded', time: '6 hours ago' },
    { id: 4, type: 'success', message: 'Monthly collection target achieved', time: '1 day ago' }
  ])
  
  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setLoading(false), 500)
    return () => clearTimeout(timer)
  }, [])
  
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value)
  }
  
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
          <h1 className="text-2xl font-bold text-gray-800">Executive Dashboard</h1>
          <p className="text-gray-500">Overview of cooperative performance metrics</p>
        </div>
        <div className="flex items-center gap-4">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Export Report
          </button>
        </div>
      </div>
      
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-blue-100 text-sm">Total Members</p>
              <h3 className="text-3xl font-bold mt-1">{kpiData.totalMembers.toLocaleString()}</h3>
              <p className="text-blue-100 text-sm mt-2">+{kpiData.newMembers} this month</p>
            </div>
            <div className="p-3 bg-white/20 rounded-lg">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-green-100 text-sm">Total Disbursed</p>
              <h3 className="text-3xl font-bold mt-1">{formatCurrency(kpiData.totalDisbursed)}</h3>
              <p className="text-green-100 text-sm mt-2">Active loans: {kpiData.activeLoans}</p>
            </div>
            <div className="p-3 bg-white/20 rounded-lg">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </Card>
        
        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-purple-100 text-sm">Repayment Rate</p>
              <h3 className="text-3xl font-bold mt-1">{kpiData.repaymentRate}%</h3>
              <p className="text-purple-100 text-sm mt-2">On-track performance</p>
            </div>
            <div className="p-3 bg-white/20 rounded-lg">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </Card>
        
        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-orange-100 text-sm">Pending Approvals</p>
              <h3 className="text-3xl font-bold mt-1">{kpiData.pendingApprovals}</h3>
              <p className="text-orange-100 text-sm mt-2">Awaiting review</p>
            </div>
            <div className="p-3 bg-white/20 rounded-lg">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </Card>
      </div>
      
      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Loan Performance Chart */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Loan Performance</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={loanPerformance}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`} />
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Legend />
              <Bar dataKey="disbursed" name="Disbursed" fill="#3B82F6" />
              <Bar dataKey="repaid" name="Repaid" fill="#10B981" />
              <Bar dataKey="defaulted" name="Defaulted" fill="#EF4444" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
        
        {/* Risk Distribution */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Member Risk Distribution</h3>
          <div className="flex items-center">
            <ResponsiveContainer width="50%" height={300}>
              <PieChart>
                <Pie
                  data={riskData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {riskData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-3">
              {riskData.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                    <span className="text-gray-600">{item.name}</span>
                  </div>
                  <span className="font-semibold">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
      
      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Members */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Top Contributing Members</h3>
          <div className="space-y-4">
            {topMembers.map((member, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{member.name}</p>
                    <p className="text-sm text-gray-500">{member.loans} active loans</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-green-600">{formatCurrency(member.contributions)}</p>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    member.status === 'low' ? 'bg-green-100 text-green-700' :
                    member.status === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {member.status} risk
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
        
        {/* Recent Alerts */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Alerts</h3>
          <div className="space-y-3">
            {recentAlerts.map((alert) => (
              <div key={alert.id} className={`p-3 rounded-lg border-l-4 ${
                alert.type === 'warning' ? 'bg-yellow-50 border-yellow-400' :
                alert.type === 'error' ? 'bg-red-50 border-red-400' :
                alert.type === 'success' ? 'bg-green-50 border-green-400' :
                'bg-blue-50 border-blue-400'
              }`}>
                <p className="text-sm text-gray-700">{alert.message}</p>
                <p className="text-xs text-gray-500 mt-1">{alert.time}</p>
              </div>
            ))}
          </div>
        </Card>
        
        {/* Quick Actions */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-between">
              <span>Review Pending Loans</span>
              <span className="bg-white/20 px-2 py-1 rounded text-sm">{kpiData.pendingApprovals}</span>
            </button>
            <button className="w-full py-3 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-between">
              <span>Generate Reports</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </button>
            <button className="w-full py-3 px-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center justify-between">
              <span>Risk Analysis</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </button>
            <button className="w-full py-3 px-4 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 flex items-center justify-between">
              <span>View All Members</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </button>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default ExecutiveDashboard
