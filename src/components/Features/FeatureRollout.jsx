import React, { useState } from 'react'
import { AlertCircle, Save } from 'lucide-react'
import useFeatureStore from '../../store/featureStore'

/**
 * Feature Rollout Component
 * Manages gradual rollout percentage for features
 */

const FeatureRollout = ({ feature, onClose }) => {
  const [rolloutPercentage, setRolloutPercentage] = useState(feature.rolloutPercentage)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const updateRollout = useFeatureStore(state => state.updateRollout)

  const handleSave = async () => {
    setLoading(true)
    setError(null)
    setSuccess(false)
    try {
      await updateRollout(feature._id, rolloutPercentage)
      setSuccess(true)
      setTimeout(() => {
        onClose()
      }, 1500)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const presets = [0, 25, 50, 75, 100]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full mx-4">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Rollout: {feature.displayName}
        </h2>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
            <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={18} />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-3">
            <p className="text-green-700 text-sm font-medium">Rollout updated successfully!</p>
          </div>
        )}

        <div className="space-y-4">
          {/* Percentage Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rollout Percentage: {rolloutPercentage}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={rolloutPercentage}
              onChange={(e) => setRolloutPercentage(parseInt(e.target.value))}
              disabled={loading}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-blue-600 h-3 rounded-full transition-all"
              style={{ width: `${rolloutPercentage}%` }}
            ></div>
          </div>

          {/* Preset Buttons */}
          <div className="flex gap-2 flex-wrap">
            {presets.map(preset => (
              <button
                key={preset}
                onClick={() => setRolloutPercentage(preset)}
                disabled={loading}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  rolloutPercentage === preset
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                } disabled:opacity-50`}
              >
                {preset}%
              </button>
            ))}
          </div>

          {/* Description */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              <strong>Rollout Percentage:</strong> Gradually roll out this feature to a percentage of users. 
              0% = disabled for all, 100% = enabled for all.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={loading || rolloutPercentage === feature.rolloutPercentage}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Save size={18} />
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FeatureRollout
