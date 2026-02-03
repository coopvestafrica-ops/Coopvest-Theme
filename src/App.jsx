import React, { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import { useUIStore } from './store/uiStore'
import { Toaster } from 'react-hot-toast'

// Pages
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import AdminDashboard from './pages/AdminDashboard'
import Members from './pages/Members'
import MemberProfile from './pages/MemberProfile'
import Contributions from './pages/Contributions'
import LoanApplication from './pages/LoanApplication'
import ContributionTracker from './pages/ContributionTracker'
import Loans from './pages/Loans'
import LoanReview from './pages/LoanReview'
import Rollovers from './pages/Rollovers'
import Investments from './pages/Investments'
import InvestmentPool from './pages/InvestmentPool'
import WalletScreen from './pages/WalletScreen'
import Documents from './pages/Documents'
import DocumentGenerator from './pages/DocumentGenerator'
import Notifications from './pages/Notifications'
import Compliance from './pages/Compliance'
import Settings from './pages/Settings'
import AccessManagement from './pages/AccessManagement'
import AuditLogs from './pages/AuditLogs'
import FeatureManagement from './pages/FeatureManagement'
import RoleAssignment from './pages/RoleAssignment'
import InterestRates from './pages/InterestRates'
import RiskScoring from './pages/RiskScoring'
import RiskScorecard from './pages/RiskScorecard'
import Referrals from './pages/Referrals'
import ReferralScreen from './pages/ReferralScreen'
import DataSheets from './pages/DataSheets'
import Support from './pages/Support'
import SupportChat from './pages/SupportChat'
import SheetApproval from './pages/SheetApproval'

// New Feature Pages
import ExecutiveDashboard from './pages/new_features/ExecutiveDashboard'
import WalletOverview from './pages/new_features/WalletOverview'
import NotificationCenter from './pages/new_features/NotificationCenter'
import RiskProfile from './pages/new_features/RiskProfile'

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { token } = useAuthStore()
  
  if (!token) {
    return <Navigate to="/login" replace />
  }
  
  return children
}

function App() {
  const { darkMode } = useUIStore()

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [darkMode])

  return (
    <Router>
      <Toaster position="top-right" />
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/loan-application"
          element={
            <ProtectedRoute>
              <LoanApplication />
            </ProtectedRoute>
          }
        />
        <Route
          path="/contribution-tracker"
          element={
            <ProtectedRoute>
              <ContributionTracker />
            </ProtectedRoute>
          }
        />
        <Route
          path="/investment-pool"
          element={
            <ProtectedRoute>
              <InvestmentPool />
            </ProtectedRoute>
          }
        />
        <Route
          path="/wallet"
          element={
            <ProtectedRoute>
              <WalletScreen />
            </ProtectedRoute>
          }
        />
        <Route
          path="/referral"
          element={
            <ProtectedRoute>
              <ReferralScreen />
            </ProtectedRoute>
          }
        />
        <Route
          path="/risk-scorecard"
          element={
            <ProtectedRoute>
              <RiskScorecard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/document-generator"
          element={
            <ProtectedRoute>
              <DocumentGenerator />
            </ProtectedRoute>
          }
        />
        <Route
          path="/members"
          element={
            <ProtectedRoute>
              <Members />
            </ProtectedRoute>
          }
        />
        <Route
          path="/contributions"
          element={
            <ProtectedRoute>
              <Contributions />
            </ProtectedRoute>
          }
        />
        <Route
          path="/loans"
          element={
            <ProtectedRoute>
              <Loans />
            </ProtectedRoute>
          }
        />
        <Route
          path="/rollovers"
          element={
            <ProtectedRoute>
              <Rollovers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/investments"
          element={
            <ProtectedRoute>
              <Investments />
            </ProtectedRoute>
          }
        />
        <Route
          path="/documents"
          element={
            <ProtectedRoute>
              <Documents />
            </ProtectedRoute>
          }
        />
        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <Notifications />
            </ProtectedRoute>
          }
        />
        <Route
          path="/compliance"
          element={
            <ProtectedRoute>
              <Compliance />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/access-management"
          element={
            <ProtectedRoute>
              <AccessManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/audit-logs"
          element={
            <ProtectedRoute>
              <AuditLogs />
            </ProtectedRoute>
          }
        />
        <Route
          path="/feature-management"
          element={
            <ProtectedRoute>
              <FeatureManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/role-assignment"
          element={
            <ProtectedRoute>
              <RoleAssignment />
            </ProtectedRoute>
          }
        />
        <Route
          path="/interest-rates"
          element={
            <ProtectedRoute>
              <InterestRates />
            </ProtectedRoute>
          }
        />
        <Route
          path="/risk-scoring"
          element={
            <ProtectedRoute>
              <RiskScoring />
            </ProtectedRoute>
          }
        />
        <Route
          path="/referrals"
          element={
            <ProtectedRoute>
              <Referrals />
            </ProtectedRoute>
          }
        />
        <Route
          path="/data-sheets"
          element={
            <ProtectedRoute>
              <DataSheets />
            </ProtectedRoute>
          }
        />
        <Route
          path="/data-sheets/:sheetId"
          element={
            <ProtectedRoute>
              <DataSheets />
            </ProtectedRoute>
          }
        />
        <Route
          path="/support"
          element={
            <ProtectedRoute>
              <Support />
            </ProtectedRoute>
          }
        />

        {/* New Feature Routes */}
        <Route
          path="/executive-dashboard"
          element={
            <ProtectedRoute>
              <ExecutiveDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/wallet-overview"
          element={
            <ProtectedRoute>
              <WalletOverview />
            </ProtectedRoute>
          }
        />
        <Route
          path="/risk-management"
          element={
            <ProtectedRoute>
              <RiskProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/notification-center"
          element={
            <ProtectedRoute>
              <NotificationCenter />
            </ProtectedRoute>
          }
        />
        <Route
          path="/members/:id"
          element={
            <ProtectedRoute>
              <MemberProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/loan-review"
          element={
            <ProtectedRoute>
              <LoanReview />
            </ProtectedRoute>
          }
        />
        <Route
          path="/sheet-approval"
          element={
            <ProtectedRoute>
              <SheetApproval />
            </ProtectedRoute>
          }
        />
        <Route
          path="/support/chat"
          element={
            <ProtectedRoute>
              <SupportChat />
            </ProtectedRoute>
          }
        />

        {/* Default Route */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  )
}

export default App