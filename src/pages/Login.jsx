import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { Eye, EyeOff } from 'lucide-react'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mfaToken, setMfaToken] = useState('')
  const [mfaRequired, setMfaRequired] = useState(false)
  const [adminId, setAdminId] = useState(null)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const { login } = useAuthStore()

  const handleLoginSuccess = async (data) => {
    login(
      {
        id: data.admin.id,
        name: data.admin.name,
        email: data.admin.email
      },
      data.token,
      data.admin.role,
      data.admin.permissions || []
    )
    
    try {
      const verifyResponse = await fetch('/api/auth/verify', {
        headers: { 
          'Authorization': `Bearer ${data.token}`
        }
      })
      const verifyData = await verifyResponse.json()
      if (verifyData.allowedSheets) {
        localStorage.setItem('allowedSheets', JSON.stringify(verifyData.allowedSheets))
      }
    } catch (e) {
      console.error('Failed to fetch allowed sheets:', e)
    }
    
    navigate('/dashboard')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (mfaRequired) {
        const response = await fetch('/api/auth/verify-mfa', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ adminId, token: mfaToken })
        })
        const data = await response.json()
        if (!response.ok) {
          setError(data.error || 'Invalid MFA token')
          return
        }
        await handleLoginSuccess(data)
      } else {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        })

        const data = await response.json()

        if (!response.ok) {
          setError(data.error || 'Login failed')
          return
        }

        if (data.mfaRequired) {
          setMfaRequired(true)
          setAdminId(data.adminId)
          return
        }

        await handleLoginSuccess(data)
      }
    } catch (err) {
      setError('Network error. Please check your connection.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-accent-50 dark:from-neutral-900 dark:to-neutral-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary-600 dark:text-primary-400 mb-2">
            Coopvest
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400">Admin Dashboard</p>
        </div>

        {/* Login Card */}
        <div className="card">
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-50 mb-6">
            Welcome Back
          </h2>

          {error && (
            <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-700 dark:text-red-200">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!mfaRequired ? (
              <>
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@coopvest.com"
                    className="input-field"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="input-field pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="form-group">
                <label className="form-label">Two-Factor Authentication Code</label>
                <input
                  type="text"
                  value={mfaToken}
                  onChange={(e) => setMfaToken(e.target.value)}
                  placeholder="Enter 6-digit code"
                  className="input-field text-center tracking-widest text-2xl"
                  maxLength={6}
                  required
                  autoFocus
                />
                <p className="text-xs text-neutral-500 mt-2">
                  Enter the code from your authenticator app to continue.
                </p>
                <button
                  type="button"
                  onClick={() => setMfaRequired(false)}
                  className="text-primary-600 text-sm mt-2 hover:underline"
                >
                  Back to login
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full mt-6"
            >
              {loading ? 'Processing...' : mfaRequired ? 'Verify & Sign In' : 'Sign In'}
            </button>
          </form>

          {/* Demo credentials info */}
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-xs font-semibold text-blue-700 dark:text-blue-200 mb-2">Demo Credentials:</p>
            <p className="text-xs text-blue-600 dark:text-blue-300">
              Contact your administrator for login credentials.
            </p>
            <p className="text-xs text-blue-500 dark:text-blue-400 mt-2">
              Default admin: admin@coopvest.com / password123
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
