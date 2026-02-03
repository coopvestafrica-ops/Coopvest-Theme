import client from './client'

/**
 * Feature Management API
 * Handles all feature flag operations
 */

export const featureApi = {
  // Get all features with optional filters
  getAllFeatures: async (filters = {}) => {
    const params = new URLSearchParams()
    if (filters.category) params.append('category', filters.category)
    if (filters.platform) params.append('platform', filters.platform)
    if (filters.status) params.append('status', filters.status)
    if (filters.enabled !== undefined) params.append('enabled', filters.enabled)
    if (filters.page) params.append('page', filters.page)
    if (filters.limit) params.append('limit', filters.limit)

    const response = await client.get(`/api/features?${params.toString()}`)
    return response.data
  },

  // Get feature by ID
  getFeatureById: async (id) => {
    const response = await client.get(`/api/features/${id}`)
    return response.data
  },

  // Get features for specific platform
  getFeaturesByPlatform: async (platform) => {
    const response = await client.get(`/api/features/platform/${platform}`)
    return response.data
  },

  // Create new feature
  createFeature: async (featureData) => {
    const response = await client.post('/api/features', featureData)
    return response.data
  },

  // Toggle feature on/off
  toggleFeature: async (id) => {
    const response = await client.post(`/api/features/${id}/toggle`)
    return response.data
  },

  // Update feature rollout percentage
  updateRollout: async (id, rolloutPercentage) => {
    const response = await client.patch(`/api/features/${id}/rollout`, {
      rolloutPercentage
    })
    return response.data
  },

  // Update feature configuration
  updateConfig: async (id, config) => {
    const response = await client.patch(`/api/features/${id}/config`, {
      config
    })
    return response.data
  },

  // Update feature status
  updateStatus: async (id, status) => {
    const response = await client.patch(`/api/features/${id}/status`, {
      status
    })
    return response.data
  },

  // Get feature changelog
  getChangelog: async (id) => {
    const response = await client.get(`/api/features/${id}/changelog`)
    return response.data
  },

  // Get feature statistics
  getStats: async () => {
    const response = await client.get('/api/features/stats/summary')
    return response.data
  }
}

export default featureApi
