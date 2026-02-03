import React, { useState } from 'react'
import { AlertCircle, Save } from 'lucide-react'
import useFeatureStore from '../../store/featureStore'

/**
 * Feature Configuration Component
 * Manages feature-specific configuration
 */

const FeatureConfig = ({ feature, onClose }) => {
  const [config, setConfig] = useState(feature.config || {})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const updateConfig = useFeatureStore(state => state.updateConfig)

  const handleConfigChange = (key, value) => {
    setConfig(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const handleSave = async () => {
    setLoading(true)
    setError(null)
    setSuccess(false)
    try {
      await updateConfig(feature._id, config)
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full mx-4 max-h-96 overflow-y-auto">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Configuration: {feature.displayName}
        </h2>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
            <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={18} />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-3">
            <p className="text-green-700 text-sm font-medium">Configuration updated successfully!</p>
          </div>
        )}

        <div className="space-y-4">
          {Object.keys(config).length === 0 ? (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
              <p className="text-gray-600 text-sm">No configuration options available</p>
            </div>
          ) : (
            Object.entries(config).map(([key, value]) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                  {key.replace(/_/g, ' ')}
                </label>
                {typeof value === 'boolean' ? (
                  <button
                    onClick={() => handleConfigChange(key, !value)}
                    disabled={loading}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      value
                        ? 'bg-green-600 hover:bg-green-700'
                        : 'bg-gray-300 hover:bg-gray-400'
                    } ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        value ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                ) : typeof value === 'number' ? (
                  <input
                    type="number"
                    value={value}
                    onChange={(e) => handleConfigChange(key, parseFloat(e.target.value))}
                    disabled={loading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                  />
                ) : (
                  <input
                    type="text"
                    value={value}
                    onChange={(e) => handleConfigChange(key, e.target.value)}
                    disabled={loading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                  />
                )}
              </div>
            ))
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
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

export default FeatureConfig
