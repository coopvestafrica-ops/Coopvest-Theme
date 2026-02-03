import { useState, useEffect, useCallback } from 'react'
import client from '../api/client.js'

/**
 * Custom hook for making API calls with automatic polling support
 * @param {string} endpoint - API endpoint path
 * @param {object} options - Configuration options
 * @param {number} options.pollInterval - Polling interval in milliseconds (0 = no polling)
 * @param {boolean} options.skip - Skip initial fetch
 * @param {object} options.params - Query parameters
 * @returns {object} - { data, loading, error, refetch }
 */
export const useApi = (endpoint, options = {}) => {
  const { pollInterval = 0, skip = false, params = {} } = options

  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(!skip)
  const [error, setError] = useState(null)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await client.get(endpoint, { params })
      setData(response.data)
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to fetch data')
      console.error(`API Error (${endpoint}):`, err)
    } finally {
      setLoading(false)
    }
  }, [endpoint, JSON.stringify(params)])

  useEffect(() => {
    if (skip) return

    // Initial fetch
    fetchData()

    // Set up polling if interval is specified
    if (pollInterval > 0) {
      const interval = setInterval(fetchData, pollInterval)
      return () => clearInterval(interval)
    }
  }, [fetchData, pollInterval, skip])

  return {
    data,
    loading,
    error,
    refetch: fetchData
  }
}

/**
 * Custom hook for making mutations (POST, PUT, DELETE)
 * @param {string} endpoint - API endpoint path
 * @param {object} options - Configuration options
 * @returns {object} - { execute, loading, error, data }
 */
export const useMutation = (endpoint, options = {}) => {
  const { method = 'POST', onSuccess } = options
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [data, setData] = useState(null)

  const execute = useCallback(
    async (payload = null, dynamicEndpoint = null) => {
      try {
        setLoading(true)
        setError(null)
        const targetEndpoint = dynamicEndpoint || endpoint
        const config = {
          method,
          url: targetEndpoint,
          data: payload
        }
        const response = await client(config)
        setData(response.data)
        if (onSuccess) onSuccess(response.data)
        return response.data
      } catch (err) {
        const errorMessage = err.response?.data?.error || err.message || 'Failed to perform action'
        setError(errorMessage)
        console.error(`Mutation Error (${method} ${endpoint}):`, err)
        throw err
      } finally {
        setLoading(false)
      }
    },
    [endpoint, method, onSuccess]
  )

  return {
    execute,
    loading,
    error,
    data
  }
}

export default useApi
