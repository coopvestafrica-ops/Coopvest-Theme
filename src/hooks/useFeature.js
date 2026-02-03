import { useEffect, useState } from 'react'
import useFeatureStore from '../store/featureStore'

/**
 * Custom Hook: useFeature
 * Provides easy access to feature flags throughout the application
 * 
 * Usage:
 * const { isEnabled, feature } = useFeature('feature_name')
 * 
 * if (isEnabled) {
 *   // Render feature
 * }
 */

export const useFeature = (featureName, platform = null) => {
  const [isEnabled, setIsEnabled] = useState(false)
  const [feature, setFeature] = useState(null)
  const [loading, setLoading] = useState(true)

  const featureMap = useFeatureStore(state => state.featureMap)
  const fetchPlatformFeatures = useFeatureStore(state => state.fetchPlatformFeatures)

  useEffect(() => {
    const checkFeature = async () => {
      try {
        // If platform is specified, fetch platform-specific features
        if (platform && Object.keys(featureMap).length === 0) {
          await fetchPlatformFeatures(platform)
        }

        const featureData = featureMap[featureName]
        if (featureData) {
          setFeature(featureData)
          setIsEnabled(featureData.enabled)
        } else {
          setIsEnabled(false)
          setFeature(null)
        }
      } catch (error) {
        console.error(`Error checking feature ${featureName}:`, error)
        setIsEnabled(false)
      } finally {
        setLoading(false)
      }
    }

    checkFeature()
  }, [featureName, platform, featureMap, fetchPlatformFeatures])

  return {
    isEnabled,
    feature,
    loading
  }
}

/**
 * Custom Hook: useFeatures
 * Get multiple features at once
 * 
 * Usage:
 * const features = useFeatures(['feature1', 'feature2', 'feature3'])
 */

export const useFeatures = (featureNames = []) => {
  const [features, setFeatures] = useState({})
  const [loading, setLoading] = useState(true)

  const featureMap = useFeatureStore(state => state.featureMap)
  const fetchFeatures = useFeatureStore(state => state.fetchFeatures)

  useEffect(() => {
    const checkFeatures = async () => {
      try {
        if (Object.keys(featureMap).length === 0) {
          await fetchFeatures()
        }

        const result = {}
        featureNames.forEach(name => {
          const feature = featureMap[name]
          result[name] = {
            isEnabled: feature ? feature.enabled : false,
            feature: feature || null
          }
        })

        setFeatures(result)
      } catch (error) {
        console.error('Error checking features:', error)
      } finally {
        setLoading(false)
      }
    }

    checkFeatures()
  }, [featureNames, featureMap, fetchFeatures])

  return {
    features,
    loading,
    isEnabled: (name) => features[name]?.isEnabled || false,
    getFeature: (name) => features[name]?.feature || null
  }
}

export default useFeature
