import React, { useState, useEffect, useMemo } from 'react'
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts'
import { TrendingUp, Users, Wallet, Banknote, AlertCircle, Activity, RefreshCw, Building2, CreditCard, ShieldAlert, Calendar, DollarSign, Percent, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import MainLayout from '../components/Layout/MainLayout'
import { useApi } from '../hooks/useApi'
import { useAuthStore } from '../store/authStore'

const Dashboard = () => {
  const [stats, setStats] = useState(null)
  const [chartData, setChartData] = useState([])
  const [loanStatus, setLoanStatus] = useState([])
  const [alerts, setAlerts] = useState([])
  const [recentActivity, setRecentActivity] = useState([])
  const [refreshing, setRefreshing] = useState(false)

  const { role } = useAuthStore()

  // Fetch dashboard statistics
  const { data: statsData, loading: statsLoading, refetch: refetchStats } = useApi(
    '/statistics/dashboard',
    { pollInterval: 30000 }
  )

  // Fetch chart data
  const { data: chartDataResponse, loading: chartLoading, refetch: refetchChart } = useApi(
    '/statistics/trends',
    { pollInterval: 60000 }
  )

  // Fetch alerts
  const { data: alertsData, loading: alertsLoading, refetch: refetchAlerts } = useApi(
    '/statistics/alerts',
    { pollInterval: 20000 }
  )

  // Fetch recent activity
  const { data: activityData, loading: activityLoading } = useApi(
    '/statistics/recent-activity',
    { pollInterval: 45000 }
  )

  useEffect(() => {
    if (statsData) {
      setStats(statsData.data || statsData)
    }
  }, [statsData])

  useEffect(() => {
    if (chartDataResponse) {
      const data = chartDataResponse.data || chartDataResponse
      setChartData(Array.isArray(data) ? data : [])
    }
  }, [chartDataResponse])

  useEffect(() => {
    if (alertsData) {
      const data = alertsData.data || alertsData
      setAlerts(Array.isArray(data) ? data : [])
    }
  }, [alertsData])

  useEffect(() => {
    if (activityData) {
      const data = activityData.data || activityData
      setRecentActivity(Array.isArray(data) ? data : [])
    }
  }, [activityData])

  useEffect(() => {
    if (stats?.loanStatus) {
      setLoanStatus(stats.loanStatus)
    }
  }, [stats])

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      await Promise.all([refetchStats(), refetchChart(), refetchAlerts()])
    } finally {
      setRefreshing(false)
    }
  }

  // Mock data for demonstration when API is not available
  const mockStats = {
    totalMembers: 1247,
    activeMembers: 1089,
    totalContributions: 45678900,
    totalLoansDisbursed: 32145000,
    outstandingLoanBalance: 18765000,
    repaymentRate: 94.2,
    defaultRate: 2.3,
    walletBalance: 8765400,
    riskExposure: 3245000,
    pendingApplications: 45,
    overdueAccounts: 12
  }

  const mockChartData = [
    { month: 'Jan', contributions: 3200000, loans: 2100000, repayments: 1800000, members: 45 },
    { month: 'Feb', contributions: 3500000, loans: 2400000, repayments: 2100000, members: 52 },
    { month: 'Mar', contributions: 3800000, loans: 2800000, repayments: 2400000, members: 48 },
    { month: 'Apr', contributions: 4200000, loans: 3100000, repayments: 2700000, members: 61 },
    { month: 'May', contributions: 3900000, loans: 2600000, repayments: 2900000, members: 55 },
    { month: 'Jun', contributions: 4500000, loans: 3500000, repayments: 3200000, members: 72 }
  ]

  const mockLoanStatus = [
    { name: 'Active', value: 342, fill: '#22c55e' },
    { name: 'Pending', value: 45, fill: '#f59e0b' },
    { name: 'Overdue', value: 23, fill: '#ef4444' },
    { name: 'Closed', value: 567, fill: '#94a3b8' }
  ]

  const mockAlerts = [
    { id: 1, type: 'warning', message: 'Pending Loan Applications', count: 12 },
    { id: 2, type: 'error', message: 'Overdue Accounts', count: 5 },
    { id: 3, type: 'info', message: 'New Member Registrations', count: 8 }
  ]

  const mockRecentActivity = [
    { id: 1, action: 'Loan Approved', member: 'John Doe', amount: 150000, time: '5 mins ago', type: 'loan' },
    { id: 2, action: 'Contribution Received', member: 'Jane Smith', amount: 50000, time: '12 mins ago', type: 'contribution' },
    { id: 3, action: 'Member Registered', member: 'Mike Johnson', time: '25 mins ago', type: 'member' },
    { id: 4, action: 'Loan Repayment', member: 'Sarah Williams', amount: 25000, time: '1 hour ago', type: 'repayment' },
    { id: 5, action: 'KYC Verified', member: 'David Brown', time: '2 hours ago', type: 'kyc' }
  ]

  const displayStats = stats || mockStats
  const displayChartData = chartData.length > 0 ? chartData : mockChartData
  const displayLoanStatus = loanStatus.length > 0 ? loanStatus : mockLoanStatus
  const displayAlerts = alerts.length > 0 ? alerts : mockAlerts
  const displayActivity = recentActivity.length > 0 ? recentActivity : mockRecentActivity

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value || 0)
  }

  const formatNumber = (value) => {
    return new Intl.NumberFormat('en-US').format(value || 0)
  }

  const StatCard = ({ icon: Icon, label, value, subtext, trend, trendValue, onClick, color = 'primary' }) => {
    const colorClasses = {
      primary: 'bg-primary-100 dark:bg-primary-900',
      green: 'bg-accent-100 dark:bg-accent-900',
      yellow: 'bg-yellow-100 dark:bg-yellow-900',
      red: 'bg-red-100 dark:bg-red-900',
      purple: 'bg-purple-100 dark:bg-purple-900'
    }

    const iconColorClasses = {
      primary: 'text-primary-600 dark:text-primary-400',
      green: 'text-accent-600 dark:text-accent-400',
      yellow: 'text-yellow-600 dark:text-yellow-400',
      red: 'text-red-600 dark:text-red-400',
      purple: 'text-purple-600 dark:text-purple-400'
    }

    return (
      <div className="card-hover cursor-pointer" onClick={onClick}>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">{label}</p>
            <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">
              {typeof value === 'number' && label.includes('Rate') ? `${value}%` :
               typeof value === 'number' && label.includes('Balance') ? formatCurrency(value) :
               typeof value === 'number' ? formatNumber(value) : value || 'Loading...'}
            </p>
            {subtext && <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">{subtext}</p>}
          </div>
          <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
            <Icon className={iconColorClasses[color]} size={24} />
          </div>
        </div>
        {trend && (
          <div className="mt-4 flex items-center gap-2">
            {trend === 'up' ? (
              <ArrowUpRight size={16} className="text-green-600 dark:text-green-400" />
            ) : (
              <ArrowDownRight size={16} className="text-red-600 dark:text-red-400" />
            )}
            <span className={`text-sm font-medium ${trend === 'up' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {trendValue || '+0%'}
            </span>
            <span className="text-xs text-neutral-500">vs last month</span>
          </div>
        )}
      </div>
    )
  }

  const getActivityIcon = (type) => {
    switch (type) {
      case 'loan': return <Banknote size={16} className="text-green-600" />
      case 'contribution': return <Wallet size={16} className="text-blue-600" />
      case 'repayment': return <DollarSign size={16} className="text-green-600" />
      case 'member': return <Users size={16} className="text-purple-600" />
      case 'kyc': return <ShieldAlert size={16} className="text-yellow-600" />
      default: return <Activity size={16} className="text-gray-600" />
    }
  }

  return (
    <MainLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="section-title">Dashboard</h1>
            <p className="text-neutral-600 dark:text-neutral-400">
              Welcome back! Here's your real-time system overview.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-neutral-600 dark:text-neutral-400">
              Last updated: {new Date().toLocaleTimeString()}
            </span>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white rounded-lg transition-colors"
            >
              <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            icon={Users}
            label="Total Members"
            value={displayStats.activeMembers}
            subtext={`${formatNumber(displayStats.totalMembers - displayStats.activeMembers)} inactive`}
            trend="up"
            trendValue="+2.5%"
            color="primary"
          />
          <StatCard
            icon={Wallet}
            label="Total Contributions"
            value={displayStats.totalContributions}
            subtext="All time"
            trend="up"
            trendValue="+1.2%"
            color="green"
          />
          <StatCard
            icon={Banknote}
            label="Loans Disbursed"
            value={displayStats.totalLoansDisbursed}
            subtext={`Outstanding: ${formatCurrency(displayStats.outstandingLoanBalance)}`}
            trend="up"
            trendValue="+3.8%"
            color="purple"
          />
          <StatCard
            icon={Percent}
            label="Repayment Rate"
            value={displayStats.repaymentRate}
            subtext="On-time repayments"
            trend="up"
            trendValue="+0.5%"
            color="green"
          />
        </div>

        {/* Secondary Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard
            icon={Building2}
            label="Wallet Balance"
            value={displayStats.walletBalance}
            color="blue"
          />
          <StatCard
            icon={ShieldAlert}
            label="Default Rate"
            value={displayStats.defaultRate}
            subtext="Risk exposure"
            color="red"
          />
          <StatCard
            icon={AlertCircle}
            label="Pending Apps"
            value={displayStats.pendingApplications}
            color="yellow"
          />
          <StatCard
            icon={Calendar}
            label="Overdue"
            value={displayStats.overdueAccounts}
            subtext="Accounts"
            color="red"
          />
          <StatCard
            icon={CreditCard}
            label="Risk Exposure"
            value={displayStats.riskExposure}
            color="purple"
          />
        </div>

        {/* Alerts Section */}
        {displayAlerts.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {displayAlerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-4 border rounded-lg bg-white dark:bg-neutral-800 ${
                  alert.type === 'error'
                    ? 'border-red-200 dark:border-red-800'
                    : alert.type === 'warning'
                    ? 'border-yellow-200 dark:border-yellow-800'
                    : 'border-blue-200 dark:border-blue-800'
                }`}
              >
                <div className="flex items-start gap-3">
                  <AlertCircle
                    size={20}
                    className={
                      alert.type === 'error'
                        ? 'text-red-600 dark:text-red-400'
                        : alert.type === 'warning'
                        ? 'text-yellow-600 dark:text-yellow-400'
                        : 'text-blue-600 dark:text-blue-400'
                    }
                  />
                  <div>
                    <p className="font-medium text-neutral-900 dark:text-neutral-50">{alert.message}</p>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                      {alert.count} item{alert.count !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 card">
            <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-50 mb-6">
              Monthly Trends
            </h3>
            {chartLoading ? (
              <div className="h-80 flex items-center justify-center text-neutral-500">
                Loading chart data...
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={displayChartData}>
                  <defs>
                    <linearGradient id="colorContributions" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorLoans" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" tickFormatter={(value) => `₦${(value / 1000000).toFixed(0)}M`} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1f2937',
                      border: 'none',
                      borderRadius: '8px',
                      color: '#fff',
                    }}
                    formatter={(value) => formatCurrency(value)}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="contributions"
                    stroke="#0ea5e9"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorContributions)"
                  />
                  <Area
                    type="monotone"
                    dataKey="loans"
                    stroke="#22c55e"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorLoans)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="card">
            <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-50 mb-6">
              Loan Status Distribution
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={displayLoanStatus}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {displayLoanStatus.map((entry, index) => (
                    <Cell key={index} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Member Growth and Activity */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card">
            <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-50 mb-6">
              Member Growth
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={displayChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff',
                  }}
                />
                <Bar dataKey="members" fill="#0ea5e9" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="card">
            <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-50 mb-6">
              Recent Activity
            </h3>
            <div className="space-y-4">
              {displayActivity.slice(0, 5).map((activity) => (
                <div key={activity.id} className="flex items-center gap-4 p-3 hover:bg-neutral-50 dark:hover:bg-neutral-700/50 rounded-lg transition-colors">
                  <div className="p-2 bg-neutral-100 dark:bg-neutral-700 rounded-lg">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-neutral-900 dark:text-neutral-50 truncate">{activity.action}</p>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">{activity.member}</p>
                  </div>
                  <div className="text-right">
                    {activity.amount && (
                      <p className="font-medium text-green-600 dark:text-green-400">{formatCurrency(activity.amount)}</p>
                    )}
                    <p className="text-xs text-neutral-500">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Risk Distribution */}
        <div className="card">
          <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-50 mb-6">
            Risk Distribution Analysis
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm text-green-700 dark:text-green-300">Low Risk</span>
                <ShieldAlert size={20} className="text-green-600" />
              </div>
              <p className="text-2xl font-bold text-green-800 dark:text-green-200 mt-2">847</p>
              <p className="text-xs text-green-600 dark:text-green-400 mt-1">68% of portfolio</p>
            </div>
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm text-yellow-700 dark:text-yellow-300">Medium Risk</span>
                <ShieldAlert size={20} className="text-yellow-600" />
              </div>
              <p className="text-2xl font-bold text-yellow-800 dark:text-yellow-200 mt-2">312</p>
              <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">25% of portfolio</p>
            </div>
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm text-red-700 dark:text-red-300">High Risk</span>
                <ShieldAlert size={20} className="text-red-600" />
              </div>
              <p className="text-2xl font-bold text-red-800 dark:text-red-200 mt-2">88</p>
              <p className="text-xs text-red-600 dark:text-red-400 mt-1">7% of portfolio</p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}

export default Dashboard
