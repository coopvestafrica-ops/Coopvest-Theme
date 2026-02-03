import React, { useState, useEffect } from 'react'
import { X, Clock, User } from 'lucide-react'
import useFeatureStore from '../../store/featureStore'

/**
 * Feature Changelog Component
 * Displays the history of changes to a feature
 */

const FeatureChangelog = ({ feature, onClose }) => {
  const [changelog, setChangelog] = useState([])
  const [loading, setLoading] = useState(true)
  const fetchChangelog = useFeatureStore(state => state.fetchChangelog)

  useEffect(() => {
    const loadChangelog = async () => {
      try {
        const data = await fetchChangelog(feature._id)
        setChangelog(data)
      } catch (error) {
        console.error('Failed to load changelog:', error)
      } finally {
        setLoading(false)
      }
    }

    loadChangelog()
  }, [feature._id, fetchChangelog])

  const formatDate = (date) => {
    return new Date(date).toLocaleString()
  }

  const getActionColor = (action) => {
    if (action.includes('enabled')) return 'bg-green-100 text-green-800'
    if (action.includes('disabled')) return 'bg-red-100 text-red-800'
    if (action.includes('updated')) return 'bg-blue-100 text-blue-800'
    if (action.includes('created')) return 'bg-purple-100 text-purple-800'
    return 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl w-full mx-4 max-h-96 overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Changelog: {feature.displayName}
            </h2>
            <p className="text-sm text-gray-600 mt-1">{feature.name}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="text-gray-600 mt-2">Loading changelog...</p>
          </div>
        ) : changelog.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No changes recorded yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {changelog.map((entry, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start gap-4">
                  {/* Timeline dot */}
                  <div className="flex flex-col items-center">
                    <div className="w-3 h-3 bg-blue-600 rounded-full mt-1.5"></div>
                    {index < changelog.length - 1 && (
                      <div className="w-0.5 h-12 bg-gray-300 my-1"></div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getActionColor(entry.action)}`}>
                        {entry.action}
                      </span>
                      <span className="text-sm text-gray-600 flex items-center gap-1">
                        <Clock size={14} />
                        {formatDate(entry.timestamp)}
                      </span>
                    </div>

                    {entry.changedBy && (
                      <p className="text-sm text-gray-600 mt-2 flex items-center gap-1">
                        <User size={14} />
                        {entry.changedBy.name || entry.changedBy.email}
                      </p>
                    )}

                    {entry.changes && (
                      <div className="mt-3 bg-gray-50 rounded p-3 text-sm">
                        <p className="font-medium text-gray-900 mb-2">Changes:</p>
                        <div className="space-y-1 font-mono text-xs text-gray-700">
                          {Object.entries(entry.changes).map(([key, value]) => (
                            <div key={key} className="flex gap-2">
                              <span className="text-gray-500">{key}:</span>
                              <span className="text-red-600">
                                {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Close Button */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

export default FeatureChangelog
