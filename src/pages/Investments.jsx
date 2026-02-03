import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import MainLayout from '../components/Layout/MainLayout'
import { TrendingUp, PieChart, BarChart3, Plus, X } from 'lucide-react'

const poolSchema = z.object({
  name: z.string().min(3, 'Pool name is required'),
  targetAmount: z.number().min(10000, 'Minimum target is ₦10,000'),
  expectedRoi: z.number().min(0, 'ROI cannot be negative'),
  duration: z.number().min(1, 'Minimum duration is 1 month'),
  description: z.string().min(10, 'Description is too short')
})

const Investments = () => {
  const [showModal, setShowModal] = useState(false)
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(poolSchema),
    defaultValues: {
      name: '',
      targetAmount: 0,
      expectedRoi: 0,
      duration: 1,
      description: ''
    }
  })

  const onFormSubmit = (data) => {
    console.log('New Pool Data:', data)
    // API call would go here
    setShowModal(false)
    reset()
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className="bg-white dark:bg-neutral-800 rounded-xl p-6 w-full max-w-md shadow-xl">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Create Investment Pool</h2>
                <button onClick={() => setShowModal(false)} className="text-neutral-500 hover:text-neutral-700">
                  <X size={24} />
                </button>
              </div>
              
              <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
                <div className="form-group">
                  <label className="form-label text-sm">Pool Name</label>
                  <input
                    {...register('name')}
                    className={`input-field ${errors.name ? 'border-red-500' : ''}`}
                    placeholder="e.g., Real Estate Pool A"
                  />
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="form-group">
                    <label className="form-label text-sm">Target Amount (₦)</label>
                    <input
                      type="number"
                      {...register('targetAmount', { valueAsNumber: true })}
                      className={`input-field ${errors.targetAmount ? 'border-red-500' : ''}`}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label text-sm">Expected ROI (%)</label>
                    <input
                      type="number"
                      {...register('expectedRoi', { valueAsNumber: true })}
                      className={`input-field ${errors.expectedRoi ? 'border-red-500' : ''}`}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label text-sm">Duration (Months)</label>
                  <input
                    type="number"
                    {...register('duration', { valueAsNumber: true })}
                    className={`input-field ${errors.duration ? 'border-red-500' : ''}`}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label text-sm">Description</label>
                  <textarea
                    {...register('description')}
                    className={`input-field h-24 ${errors.description ? 'border-red-500' : ''}`}
                  ></textarea>
                </div>

                <div className="flex gap-4 mt-6">
                  <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 border rounded-lg">Cancel</button>
                  <button type="submit" className="flex-1 btn-primary">Create Pool</button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div>
            <h1 className="section-title">Investment Pool Management</h1>
            <p className="text-neutral-600 dark:text-neutral-400">
              Create and manage cooperative investment projects
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
          >
            <Plus size={18} />
            New Pool
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card-hover">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">Active Pools</p>
                <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">8</p>
              </div>
              <div className="p-3 bg-primary-100 dark:bg-primary-900 rounded-lg">
                <PieChart className="text-primary-600 dark:text-primary-400" size={24} />
              </div>
            </div>
          </div>

          <div className="card-hover">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">Total Invested</p>
                <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">₦15.8M</p>
              </div>
              <div className="p-3 bg-accent-100 dark:bg-accent-900 rounded-lg">
                <BarChart3 className="text-accent-600 dark:text-accent-400" size={24} />
              </div>
            </div>
          </div>

          <div className="card-hover">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">Average ROI</p>
                <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">12.5%</p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                <TrendingUp className="text-green-600 dark:text-green-400" size={24} />
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-50 mb-6">Investment Pools</h2>
          <p className="text-neutral-600 dark:text-neutral-400">Investment pool management features coming soon...</p>
        </div>
      </div>
    </MainLayout>
  )
}

export default Investments
