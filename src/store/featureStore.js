import { create } from 'zustand'
import featureApi from '../api/featureApi'

/**
 * Feature Store
 * Manages feature flags and their state across the application
 */

export const useFeatureStore = create((set, get) => ({
  // State
  features: [],
  featureMap: {}, // For quick lookup by name
  loading: false,
  error: null,
  stats: null,
  filters: {
    category: null,
    platform: null,
    status: null,
    enabled: null
  },
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  },

  // Actions
  setFilters: (filters) => set({ filters }),

  setPagination: (pagination) => set({ pagination }),

  // Fetch all features
  fetchFeatures: async (filters = {}, page = 1, limit = 20) => {
    set({ loading: true, error: null })
    try {
      const response = await featureApi.getAllFeatures({
        ...filters,
        page,
        limit
      })
      
      const featureMap = {}
      response.features.forEach(feature => {
        featureMap[feature.name] = feature
      })

      set({
        features: response.features,
        featureMap,
        pagination: response.pagination,
        loading: false
      })
      return response
    } catch (error) {
      set({ error: error.message, loading: false })
      throw error
    }
  },

  // Fetch features for specific platform
  fetchPlatformFeatures: async (platform) => {
    set({ loading: true, error: null })
    try {
      const features = await featureApi.getFeaturesByPlatform(platform)
      
      const featureMap = {}
      features.forEach(feature => {
        featureMap[feature.name] = feature
      })

      set({
        features,
        featureMap,
        loading: false
      })
      return features
    } catch (error) {
      set({ error: error.message, loading: false })
      throw error
    }
  },

  // Fetch single feature
  fetchFeature: async (id) => {
    set({ loading: true, error: null })
    try {
      const feature = await featureApi.getFeatureById(id)
      
      set(state => ({
        features: state.features.map(f => f._id === id ? feature : f),
        featureMap: {
          ...state.featureMap,
          [feature.name]: feature
        },
        loading: false
      }))
      return feature
    } catch (error) {
      set({ error: error.message, loading: false })
      throw error
    }
  },

  // Toggle feature
  toggleFeature: async (id) => {
    try {
      const response = await featureApi.toggleFeature(id)
      
      set(state => ({
        features: state.features.map(f => f._id === id ? response.feature : f),
        featureMap: {
          ...state.featureMap,
          [response.feature.name]: response.feature
        }
      }))
      return response.feature
    } catch (error) {
      set({ error: error.message })
      throw error
    }
  },

  // Update rollout percentage
  updateRollout: async (id, rolloutPercentage) => {
    try {
      const response = await featureApi.updateRollout(id, rolloutPercentage)
      
      set(state => ({
        features: state.features.map(f => f._id === id ? response.feature : f),
        featureMap: {
          ...state.featureMap,
          [response.feature.name]: response.feature
        }
      }))
      return response.feature
    } catch (error) {
      set({ error: error.message })
      throw error
    }
  },

  // Update feature config
  updateConfig: async (id, config) => {
    try {
      const response = await featureApi.updateConfig(id, config)
      
      set(state => ({
        features: state.features.map(f => f._id === id ? response.feature : f),
        featureMap: {
          ...state.featureMap,
          [response.feature.name]: response.feature
        }
      }))
      return response.feature
    } catch (error) {
      set({ error: error.message })
      throw error
    }
  },

  // Update feature status
  updateStatus: async (id, status) => {
    try {
      const response = await featureApi.updateStatus(id, status)
      
      set(state => ({
        features: state.features.map(f => f._id === id ? response.feature : f),
        featureMap: {
          ...state.featureMap,
          [response.feature.name]: response.feature
        }
      }))
      return response.feature
    } catch (error) {
      set({ error: error.message })
      throw error
    }
  },

  // Fetch feature changelog
  fetchChangelog: async (id) => {
    try {
      const changelog = await featureApi.getChangelog(id)
      return changelog
    } catch (error) {
      set({ error: error.message })
      throw error
    }
  },

  // Fetch statistics
  fetchStats: async () => {
    try {
      const stats = await featureApi.getStats()
      set({ stats })
      return stats
    } catch (error) {
      set({ error: error.message })
      throw error
    }
  },

  // Check if feature is enabled
  isFeatureEnabled: (featureName) => {
    const state = get()
    const feature = state.featureMap[featureName]
    return feature ? feature.enabled : false
  },

  // Get feature by name
  getFeature: (featureName) => {
    const state = get()
    return state.featureMap[featureName] || null
  },

  // Clear error
  clearError: () => set({ error: null })
}))

export default useFeatureStore
