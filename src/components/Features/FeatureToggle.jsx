import React, { useState } from 'react'
import { AlertCircle } from 'lucide-react'
import useFeatureStore from '../../store/featureStore'

/**
 * Feature Toggle Component
 * Enables/disables a feature flag
 */

const FeatureToggle = ({ feature }) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const toggleFeature = useFeatureStore(state => state.toggleFeature)

  const handleToggle = async () => {
    setLoading(true)
    setError(null)
    try {
      await toggleFeature(feature._id)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-3">
      {error && (
        <div className="text-red-600 text-sm flex items-center gap-1">
          <AlertCircle size={16} />
          {error}
        </div>
      )}
      <button
        onClick={handleToggle}
        disabled={loading}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          feature.enabled
            ? 'bg-green-600 hover:bg-green-700'
            : 'bg-gray-300 hover:bg-gray-400'
        } ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            feature.enabled ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
      <span className="text-sm font-medium text-gray-700">
        {feature.enabled ? 'Enabled' : 'Disabled'}
      </span>
    </div>
  )
}

export default FeatureToggle
