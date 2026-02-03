import { useState, useCallback } from 'react'

const API_BASE = import.meta.env.VITE_API_URL || '/api/v1'

/**
 * Rollover API Service for Admin Dashboard
 * Handles all rollover management operations
 */
export const rolloverService = {
  // Get all rollovers with optional filters
  async getRollovers(filters = {}) {
    const params = new URLSearchParams()
    if (filters.status) params.append('status', filters.status)
    if (filters.memberId) params.append('memberId', filters.memberId)
    if (filters.page) params.append('page', filters.page)
    if (filters.limit) params.append('limit', filters.limit)
    
    const response = await fetch(`${API_BASE}/rollovers?${params}`)
    if (!response.ok) throw new Error('Failed to fetch rollovers')
    return response.json()
  },

  // Get pending rollovers for admin queue
  async getPendingRollovers() {
    const response = await fetch(`${API_BASE}/rollovers/pending`)
    if (!response.ok) throw new Error('Failed to fetch pending rollovers')
    return response.json()
  },

  // Get rollover by ID
  async getRolloverById(id) {
    const response = await fetch(`${API_BASE}/rollovers/${id}`)
    if (!response.ok) throw new Error('Failed to fetch rollover')
    return response.json()
  },

  // Get guarantors for a rollover
  async getRolloverGuarantors(id) {
    const response = await fetch(`${API_BASE}/rollovers/${id}/guarantors`)
    if (!response.ok) throw new Error('Failed to fetch guarantors')
    return response.json()
  },

  // Approve rollover
  async approveRollover(id, notes = '') {
    const response = await fetch(`${API_BASE}/rollovers/${id}/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notes })
    })
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to approve rollover')
    }
    return response.json()
  },

  // Reject rollover
  async rejectRollover(id, reason) {
    const response = await fetch(`${API_BASE}/rollovers/${id}/reject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason })
    })
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to reject rollover')
    }
    return response.json()
  },

  // Get rollover statistics
  async getRolloverStats() {
    const response = await fetch(`${API_BASE}/rollovers/stats/summary`)
    if (!response.ok) throw new Error('Failed to fetch rollover stats')
    return response.json()
  }
}

/**
 * Hook for managing rollover data
 */
export function useRollovers(filters = {}) {
  const [rollovers, setRollovers] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 20, pages: 0 })

  const fetchRollovers = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await rolloverService.getRollovers(filters)
      setRollovers(result.rollovers || [])
      setPagination(result.pagination || pagination)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [filters.status, filters.page])

  const refetch = useCallback(() => {
    fetchRollovers()
  }, [fetchRollovers])

  return { rollovers, loading, error, pagination, refetch, setRollovers }
}

/**
 * Hook for managing single rollover
 */
export function useRollover(rolloverId = null) {
  const [rollover, setRollover] = useState(null)
  const [guarantors, setGuarantors] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchRollover = useCallback(async (id) => {
    setLoading(true)
    setError(null)
    try {
      const result = await rolloverService.getRolloverById(id)
      setRollover(result)
      
      // Also fetch guarantors
      try {
        const guarantorResult = await rolloverService.getRolloverGuarantors(id)
        setGuarantors(guarantorResult.guarantors || [])
      } catch {
        setGuarantors([])
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [rolloverId])

  const approve = async (notes = '') => {
    if (!rollover) throw new Error('No rollover selected')
    const result = await rolloverService.approveRollover(rollover._id || rollover.id, notes)
    setRollover(result.rollover)
    return result
  }

  const reject = async (reason) => {
    if (!rollover) throw new Error('No rollover selected')
    const result = await rolloverService.rejectRollover(rollover._id || rollover.id, reason)
    setRollover(result.rollover)
    return result
  }

  return {
    rollover,
    guarantors,
    loading,
    error,
    fetchRollover,
    approve,
    reject,
    setRollover,
    setGuarantors
  }
}

/**
 * Hook for pending rollovers queue
 */
export function usePendingRollovers() {
  const [pendingRollovers, setPendingRollovers] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchPending = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await rolloverService.getPendingRollovers()
      setPendingRollovers(result.rollovers || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  return { pendingRollovers, loading, error, refetch: fetchPending }
}

/**
 * Hook for rollover statistics
 */
export function useRolloverStats() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchStats = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await rolloverService.getRolloverStats()
      setStats(result)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  return { stats, loading, error, refetch: fetchStats }
}
