import React from 'react'
import { X, CheckCircle, XCircle, Zap } from 'lucide-react'

/**
 * Feature Statistics Component
 * Displays overview statistics about features
 */

const FeatureStats = ({ stats, onClose }) => {
  const totalFeatures = stats.totalFeatures || 0
  const enabledFeatures = stats.enabledFeatures || 0
  const disabledFeatures = stats.disabledFeatures || 0
  const enabledPercentage = totalFeatures > 0 ? Math.round((enabledFeatures / totalFeatures) * 100) : 0

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900">Feature Overview</h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600"
        >
          <X size={24} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Total Features */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-medium">Total Features</p>
              <p className="text-3xl font-bold text-blue-900 mt-1">{totalFeatures}</p>
            </div>
            <Zap className="text-blue-600" size={32} />
          </div>
        </div>

        {/* Enabled Features */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 font-medium">Enabled</p>
              <p className="text-3xl font-bold text-green-900 mt-1">{enabledFeatures}</p>
              <p className="text-xs text-green-700 mt-1">{enabledPercentage}% active</p>
            </div>
            <CheckCircle className="text-green-600" size={32} />
          </div>
        </div>

        {/* Disabled Features */}
        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-4 border border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-600 font-medium">Disabled</p>
              <p className="text-3xl font-bold text-red-900 mt-1">{disabledFeatures}</p>
              <p className="text-xs text-red-700 mt-1">{100 - enabledPercentage}% inactive</p>
            </div>
            <XCircle className="text-red-600" size={32} />
          </div>
        </div>

        {/* Activation Rate */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
          <div>
            <p className="text-sm text-purple-600 font-medium">Activation Rate</p>
            <p className="text-3xl font-bold text-purple-900 mt-1">{enabledPercentage}%</p>
            <div className="w-full bg-purple-200 rounded-full h-2 mt-3">
              <div
                className="bg-purple-600 h-2 rounded-full transition-all"
                style={{ width: `${enabledPercentage}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FeatureStats
