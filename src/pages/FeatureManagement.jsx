import React, { useState, useEffect } from 'react'
import { Search, Plus, Filter, RefreshCw, AlertCircle } from 'lucide-react'
import useFeatureStore from '../store/featureStore'
import FeatureToggle from '../components/Features/FeatureToggle'
import FeatureRollout from '../components/Features/FeatureRollout'
import FeatureStats from '../components/Features/FeatureStats'
import FeatureChangelog from '../components/Features/FeatureChangelog'

/**
 * Feature Management Page
 * Admin interface for managing feature flags
 */

const FeatureManagement = () => {
  const {
    features,
    loading,
    error,
    stats,
    filters,
    pagination,
    fetchFeatures,
    fetchStats,
    setFilters,
    setPagination,
    clearError
  } = useFeatureStore()

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFeature, setSelectedFeature] = useState(null)
  const [showStats, setShowStats] = useState(true)
  const [showChangelog, setShowChangelog] = useState(false)

  // Fetch features on mount and when filters change
  useEffect(() => {
    fetchFeatures(filters, pagination.page, pagination.limit)
    fetchStats()
  }, [filters, pagination.page])

  // Filter features based on search term
  const filteredFeatures = features.filter(feature =>
    feature.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    feature.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    feature.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleFilterChange = (key, value) => {
    setFilters({ ...filters, [key]: value })
    setPagination({ ...pagination, page: 1 })
  }

  const handleRefresh = () => {
    fetchFeatures(filters, pagination.page, pagination.limit)
    fetchStats()
  }

  const getCategoryColor = (category) => {
    const colors = {
      payment: 'bg-blue-100 text-blue-800',
      lending: 'bg-green-100 text-green-800',
      investment: 'bg-purple-100 text-purple-800',
      savings: 'bg-yellow-100 text-yellow-800',
      admin: 'bg-red-100 text-red-800',
      security: 'bg-orange-100 text-orange-800',
      communication: 'bg-pink-100 text-pink-800',
      other: 'bg-gray-100 text-gray-800'
    }
    return colors[category] || colors.other
  }

  const getStatusColor = (status) => {
    const colors = {
      planning: 'bg-gray-100 text-gray-800',
      development: 'bg-blue-100 text-blue-800',
      testing: 'bg-yellow-100 text-yellow-800',
      active: 'bg-green-100 text-green-800',
      paused: 'bg-orange-100 text-orange-800',
      deprecated: 'bg-red-100 text-red-800'
    }
    return colors[status] || colors.other
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Feature Management</h1>
          <p className="text-gray-600 mt-1">Control feature flags for web, mobile, and admin dashboard</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
          <div className="flex-1">
            <h3 className="font-semibold text-red-900">Error</h3>
            <p className="text-red-700 text-sm">{error}</p>
          </div>
          <button
            onClick={clearError}
            className="text-red-600 hover:text-red-800 font-semibold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Stats Section */}
      {showStats && stats && (
        <FeatureStats stats={stats} onClose={() => setShowStats(false)} />
      )}

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <div className="flex gap-4 flex-wrap">
          {/* Search */}
          <div className="flex-1 min-w-64">
            <div className="relative">
              <Search className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search features..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Category Filter */}
          <select
            value={filters.category || ''}
            onChange={(e) => handleFilterChange('category', e.target.value || null)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Categories</option>
            <option value="payment">Payment</option>
            <option value="lending">Lending</option>
            <option value="investment">Investment</option>
            <option value="savings">Savings</option>
            <option value="admin">Admin</option>
            <option value="security">Security</option>
            <option value="communication">Communication</option>
            <option value="other">Other</option>
          </select>

          {/* Status Filter */}
          <select
            value={filters.status || ''}
            onChange={(e) => handleFilterChange('status', e.target.value || null)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Status</option>
            <option value="planning">Planning</option>
            <option value="development">Development</option>
            <option value="testing">Testing</option>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="deprecated">Deprecated</option>
          </select>

          {/* Enabled Filter */}
          <select
            value={filters.enabled === null ? '' : filters.enabled}
            onChange={(e) => {
              if (e.target.value === '') {
                handleFilterChange('enabled', null)
              } else {
                handleFilterChange('enabled', e.target.value === 'true')
              }
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All States</option>
            <option value="true">Enabled</option>
            <option value="false">Disabled</option>
          </select>
        </div>
      </div>

      {/* Features List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="text-gray-600 mt-2">Loading features...</p>
          </div>
        ) : filteredFeatures.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p>No features found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Feature</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Category</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Platforms</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Rollout</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">State</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredFeatures.map((feature) => (
                  <tr key={feature._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-gray-900">{feature.displayName}</p>
                        <p className="text-sm text-gray-500">{feature.name}</p>
                        {feature.description && (
                          <p className="text-sm text-gray-600 mt-1">{feature.description}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(feature.category)}`}>
                        {feature.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        {feature.platforms.map(platform => (
                          <span key={platform} className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                            {platform}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(feature.status)}`}>
                        {feature.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all"
                            style={{ width: `${feature.rolloutPercentage}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-700">{feature.rolloutPercentage}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <FeatureToggle feature={feature} />
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => {
                          setSelectedFeature(feature)
                          setShowChangelog(true)
                        }}
                        className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(page => (
            <button
              key={page}
              onClick={() => setPagination({ ...pagination, page })}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                pagination.page === page
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
            >
              {page}
            </button>
          ))}
        </div>
      )}

      {/* Changelog Modal */}
      {showChangelog && selectedFeature && (
        <FeatureChangelog
          feature={selectedFeature}
          onClose={() => {
            setShowChangelog(false)
            setSelectedFeature(null)
          }}
        />
      )}
    </div>
  )
}

export default FeatureManagement
