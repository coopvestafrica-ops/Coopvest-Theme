import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X, LayoutDashboard, Users, Wallet, Banknote, TrendingUp, FileText, Settings, LogOut, Shield, Bell, RefreshCw, TrendingDown, Percent, Users2, MessageSquare, BarChart3, DollarSign, Activity } from 'lucide-react'
import { useUIStore } from '../../store/uiStore'
import { useAuthStore } from '../../store/authStore'

export default function Sidebar() {
  const { sidebarOpen, toggleSidebar } = useUIStore()
  const { logout, role, isSuperAdmin } = useAuthStore()
  const location = useLocation()

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard', roles: ['super_admin', 'admin'] },
    { icon: BarChart3, label: 'Executive View', path: '/executive-dashboard', roles: ['super_admin', 'admin', 'executive'] },
    { icon: Users, label: 'Members', path: '/members', roles: ['super_admin', 'admin', 'member_support'] },
    { icon: Users2, label: 'Referrals', path: '/referrals', roles: ['super_admin', 'admin', 'member_support'] },
    { icon: Wallet, label: 'Contributions', path: '/contributions', roles: ['super_admin', 'admin', 'finance'] },
    { icon: Banknote, label: 'Loans', path: '/loans', roles: ['super_admin', 'admin', 'finance', 'investment'] },
    { icon: FileText, label: 'Loan Review', path: '/loan-review', roles: ['super_admin', 'admin', 'finance'] },
    { icon: RefreshCw, label: 'Rollovers', path: '/rollovers', roles: ['super_admin', 'admin', 'finance'] },
    { icon: TrendingUp, label: 'Investments', path: '/investments', roles: ['super_admin', 'admin', 'investment'] },
    { icon: Percent, label: 'Interest Rates', path: '/interest-rates', roles: ['super_admin', 'admin', 'finance'] },
    { icon: TrendingDown, label: 'Risk Scoring', path: '/risk-scoring', roles: ['super_admin', 'admin', 'risk'] },
    { icon: Activity, label: 'Risk Management', path: '/risk-management', roles: ['super_admin', 'admin', 'risk'] },
    { icon: DollarSign, label: 'Wallet Overview', path: '/wallet-overview', roles: ['super_admin', 'admin', 'finance'] },
    { icon: FileText, label: 'Documents', path: '/documents', roles: ['super_admin', 'admin'] },
    { icon: Bell, label: 'Notifications', path: '/notifications', roles: ['super_admin', 'admin'] },
    { icon: Bell, label: 'Notification Center', path: '/notification-center', roles: ['super_admin', 'admin'] },
    { icon: MessageSquare, label: 'Support', path: '/support', roles: ['super_admin', 'admin', 'member_support'] },
    { icon: MessageSquare, label: 'Support Chat', path: '/support/chat', roles: ['super_admin', 'admin', 'member_support'] },
    { icon: Shield, label: 'Compliance', path: '/compliance', roles: ['super_admin', 'admin', 'compliance'] },
    { icon: Settings, label: 'Settings', path: '/settings', roles: ['super_admin', 'admin'] },
  ]

  const superAdminItems = [
    { icon: Shield, label: 'Access Management', path: '/access-management', roles: ['super_admin'] },
    { icon: FileText, label: 'Audit Logs', path: '/audit-logs', roles: ['super_admin'] },
    { icon: Settings, label: 'Feature Management', path: '/feature-management', roles: ['super_admin'] },
    { icon: Shield, label: 'Role Assignment', path: '/role-assignment', roles: ['super_admin'] },
    { icon: FileText, label: 'Sheet Approval', path: '/sheet-approval', roles: ['super_admin', 'admin'] },
  ]

  const isActive = (path) => location.pathname === path

  const handleLogout = () => {
    logout()
    window.location.href = '/login'
  }

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={toggleSidebar}
        className="fixed top-4 left-4 z-50 lg:hidden p-2 rounded-lg bg-primary-500 text-white"
      >
        {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen w-64 bg-white dark:bg-neutral-800 border-r border-neutral-200 dark:border-neutral-700 overflow-y-auto transition-transform duration-300 z-40 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-neutral-200 dark:border-neutral-700">
          <h1 className="text-2xl font-bold text-primary-600 dark:text-primary-400">
            Coopvest
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">Admin Dashboard</p>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {/* Regular menu items */}
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive(item.path)
                  ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-200'
                  : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700'
              }`}
            >
              <item.icon size={20} />
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}

          {/* Super Admin section */}
          {isSuperAdmin() && (
            <>
              <div className="my-4 border-t border-neutral-200 dark:border-neutral-700 pt-4">
                <p className="px-4 text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-2">
                  Super Admin
                </p>
                {superAdminItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                      isActive(item.path)
                        ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-200'
                        : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700'
                    }`}
                  >
                    <item.icon size={20} />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                ))}
              </div>
            </>
          )}
        </nav>

        {/* Logout button */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200"
          >
            <LogOut size={20} />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={toggleSidebar}
        />
      )}
    </>
  )
}