import React, { useState, useEffect } from 'react'
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Calendar,
  Edit,
  Trash2,
  Plus,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Save,
  X
} from 'lucide-react'
import MainLayout from '../components/Layout/MainLayout'
import { useApi, useMutation } from '../hooks/useApi'
import toast from 'react-hot-toast'

const InterestRates = () => {
  const [rates, setRates] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingRate, setEditingRate] = useState(null)
  const [formData, setFormData] = useState({
    loanType: '',
    minTenure: 1,
    maxTenure: 12,
    rate: 5.0,
    description: ''
  })

  const { data: ratesData, refetch: refetchRates } = useApi('/features?type=interest_rate')
  const { execute: createRate, loading: createLoading } = useMutation('/features', { method: 'POST' })
  const { execute: updateRate, loading: updateLoading } = useMutation('/features', { method: 'PUT' })
  const { execute: deleteRate, loading: deleteLoading } = useMutation('/features', { method: 'DELETE' })

  useEffect(() => {
    if (ratesData?.data) {
      setRates(ratesData.data)
    }
  }, [ratesData])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const payload = {
        type: 'interest_rate',
        ...formData
      }

      if (editingRate) {
        await updateRate({ id: editingRate._id, ...payload })
        toast.success('Interest rate updated successfully')
      } else {
        await createRate(payload)
        toast.success('Interest rate created successfully')
      }

      setShowModal(false)
      resetForm()
      refetchRates()
    } catch (error) {
      toast.error(error.message || 'Failed to save interest rate')
    }
  }

  const handleEdit = (rate) => {
    setEditingRate(rate)
    setFormData({
      loanType: rate.loanType || rate.name || '',
      minTenure: rate.minTenure || 1,
      maxTenure: rate.maxTenure || 12,
      rate: rate.rate || 5.0,
      description: rate.description || ''
    })
    setShowModal(true)
  }

  const handleDelete = async (rateId) => {
    if (!window.confirm('Are you sure you want to delete this interest rate?')) return
    try {
      await deleteRate({ id: rateId })
      toast.success('Interest rate deleted')
      refetchRates()
    } catch (error) {
      toast.error(error.message || 'Failed to delete')
    }
  }

  const resetForm = () => {
    setEditingRate(null)
    setFormData({
      loanType: '',
      minTenure: 1,
      maxTenure: 12,
      rate: 5.0,
      description: ''
    })
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'percent',
      minimumFractionDigits: 2
    }).format((amount || 0) / 100)
  }

  // Default rates if API returns empty
  const defaultRates = [
    { _id: '1', loanType: 'Personal Loan', minTenure: 1, maxTenure: 6, rate: 5.0, description: 'Short-term personal loans' },
    { _id: '2', loanType: 'Personal Loan', minTenure: 7, maxTenure: 12, rate: 7.0, description: 'Long-term personal loans' },
    { _id: '3', loanType: 'Business Loan', minTenure: 1, maxTenure: 12, rate: 6.0, description: 'Business financing' },
    { _id: '4', loanType: 'Emergency Loan', minTenure: 1, maxTenure: 3, rate: 4.0, description: 'Quick emergency funds' },
    { _id: '5', loanType: 'Salary Advance', minTenure: 1, maxTenure: 1, rate: 3.0, description: 'One month advance' }
  ]

  const displayRates = rates.length > 0 ? rates : defaultRates

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">
              Interest Rate Management
            </h1>
            <p className="text-neutral-600 dark:text-neutral-400">
              Configure interest rates for different loan types and tenures
            </p>
          </div>
          <button
            onClick={() => {
              resetForm()
              setShowModal(true)
            }}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
          >
            <Plus size={18} />
            Add Interest Rate
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card-hover">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <TrendingUp className="text-blue-600 dark:text-blue-400" size={24} />
              </div>
              <div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">Active Rates</p>
                <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">
                  {displayRates.length}
                </p>
              </div>
            </div>
          </div>

          <div className="card-hover">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                <DollarSign className="text-green-600 dark:text-green-400" size={24} />
              </div>
              <div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">Avg Rate</p>
                <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">
                  {(displayRates.reduce((sum, r) => sum + r.rate, 0) / displayRates.length).toFixed(2)}%
                </p>
              </div>
            </div>
          </div>

          <div className="card-hover">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-accent-100 dark:bg-accent-900 rounded-lg">
                <Calendar className="text-accent-600 dark:text-accent-400" size={24} />
              </div>
              <div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">Loan Types</p>
                <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">
                  {new Set(displayRates.map(r => r.loanType)).size}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Rates Table */}
        <div className="card">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50 mb-4">
            Interest Rate Configurations
          </h2>

          {loading ? (
            <div className="text-center py-8 text-neutral-500">Loading rates...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-neutral-200 dark:border-neutral-700">
                    <th className="text-left py-3 px-4 font-semibold text-neutral-900 dark:text-neutral-50">Loan Type</th>
                    <th className="text-left py-3 px-4 font-semibold text-neutral-900 dark:text-neutral-50">Tenure</th>
                    <th className="text-left py-3 px-4 font-semibold text-neutral-900 dark:text-neutral-50">Rate</th>
                    <th className="text-left py-3 px-4 font-semibold text-neutral-900 dark:text-neutral-50">Description</th>
                    <th className="text-left py-3 px-4 font-semibold text-neutral-900 dark:text-neutral-50">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {displayRates.map((rate) => (
                    <tr 
                      key={rate._id} 
                      className="border-b border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800"
                    >
                      <td className="py-3 px-4 font-medium text-neutral-900 dark:text-neutral-50">
                        {rate.loanType}
                      </td>
                      <td className="py-3 px-4 text-neutral-600 dark:text-neutral-400">
                        {rate.minTenure} - {rate.maxTenure} months
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center px-2.5 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded text-sm font-bold">
                          {rate.rate}%
                        </span>
                      </td>
                      <td className="py-3 px-4 text-neutral-600 dark:text-neutral-400 text-sm">
                        {rate.description || '-'}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(rate)}
                            className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(rate._id)}
                            className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-neutral-800 rounded-xl max-w-md w-full">
            <div className="p-6 border-b border-neutral-200 dark:border-neutral-700 flex items-center justify-between">
              <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-50">
                {editingRate ? 'Edit Interest Rate' : 'Add Interest Rate'}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false)
                  resetForm()
                }}
                className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-colors"
              >
                <X size={20} className="text-neutral-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="form-group">
                <label className="form-label">Loan Type *</label>
                <select
                  value={formData.loanType}
                  onChange={(e) => setFormData({ ...formData, loanType: e.target.value })}
                  className="input-field"
                  required
                >
                  <option value="">Select loan type</option>
                  <option value="Personal Loan">Personal Loan</option>
                  <option value="Business Loan">Business Loan</option>
                  <option value="Emergency Loan">Emergency Loan</option>
                  <option value="Salary Advance">Salary Advance</option>
                  <option value="Group Loan">Group Loan</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">Min Tenure (months) *</label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={formData.minTenure}
                    onChange={(e) => setFormData({ ...formData, minTenure: parseInt(e.target.value) })}
                    className="input-field"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Max Tenure (months) *</label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={formData.maxTenure}
                    onChange={(e) => setFormData({ ...formData, maxTenure: parseInt(e.target.value) })}
                    className="input-field"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Interest Rate (%) *</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={formData.rate}
                  onChange={(e) => setFormData({ ...formData, rate: parseFloat(e.target.value) })}
                  className="input-field"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input-field"
                  rows={3}
                  placeholder="Enter description for this rate..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false)
                    resetForm()
                  }}
                  className="flex-1 px-4 py-2.5 bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-600 text-neutral-700 dark:text-neutral-300 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createLoading || updateLoading}
                  className="flex-1 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Save size={18} />
                  {createLoading || updateLoading ? 'Saving...' : 'Save Rate'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </MainLayout>
  )
}

export default InterestRates
