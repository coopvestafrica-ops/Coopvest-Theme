import React, { createContext, useContext, useEffect } from 'react'
import useFeatureStore from '../store/featureStore'

/**
 * Feature Context
 * Provides feature flags to the entire application
 */

const FeatureContext = createContext()

export const FeatureProvider = ({ children, platform = 'web' }) => {
  const {
    features,
    featureMap,
    loading,
    error,
    fetchPlatformFeatures,
    isFeatureEnabled,
    getFeature
  } = useFeatureStore()

  // Initialize features on mount
  useEffect(() => {
    const initializeFeatures = async () => {
      try {
        await fetchPlatformFeatures(platform)
      } catch (err) {
        console.error('Failed to initialize features:', err)
      }
    }

    initializeFeatures()
  }, [platform, fetchPlatformFeatures])

  const value = {
    features,
    featureMap,
    loading,
    error,
    isFeatureEnabled,
    getFeature,
    platform
  }

  return (
    <FeatureContext.Provider value={value}>
      {children}
    </FeatureContext.Provider>
  )
}

/**
 * Hook to use Feature Context
 */
export const useFeatureContext = () => {
  const context = useContext(FeatureContext)
  if (!context) {
    throw new Error('useFeatureContext must be used within FeatureProvider')
  }
  return context
}

/**
 * HOC to wrap components with feature flag check
 * Usage: withFeature('feature_name')(MyComponent)
 */
export const withFeature = (featureName) => (Component) => {
  return (props) => {
    const { isFeatureEnabled } = useFeatureContext()
    
    if (!isFeatureEnabled(featureName)) {
      return null
    }

    return <Component {...props} />
  }
}

/**
 * Component to conditionally render based on feature flag
 * Usage: <FeatureGate feature="feature_name"><MyComponent /></FeatureGate>
 */
export const FeatureGate = ({ feature, children, fallback = null }) => {
  const { isFeatureEnabled } = useFeatureContext()

  if (!isFeatureEnabled(feature)) {
    return fallback
  }

  return children
}

export default FeatureProvider
