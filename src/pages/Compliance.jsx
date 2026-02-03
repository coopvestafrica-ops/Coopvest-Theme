import React from 'react'
import MainLayout from '../components/Layout/MainLayout'
import { Shield, AlertTriangle, CheckCircle } from 'lucide-react'

const Compliance = () => {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="section-title">Risk, Compliance & Governance</h1>
          <p className="text-neutral-600 dark:text-neutral-400">
            Monitor compliance and manage governance requirements
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card-hover">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">Compliance Score</p>
                <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">98%</p>
              </div>
              <div className="p-3 bg-accent-100 dark:bg-accent-900 rounded-lg">
                <CheckCircle className="text-accent-600 dark:text-accent-400" size={24} />
              </div>
            </div>
          </div>

          <div className="card-hover">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">Active Audits</p>
                <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">3</p>
              </div>
              <div className="p-3 bg-primary-100 dark:bg-primary-900 rounded-lg">
                <Shield className="text-primary-600 dark:text-primary-400" size={24} />
              </div>
            </div>
          </div>

          <div className="card-hover">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">Risk Alerts</p>
                <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">2</p>
              </div>
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                <AlertTriangle className="text-yellow-600 dark:text-yellow-400" size={24} />
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-50 mb-6">Compliance Dashboard</h2>
          <p className="text-neutral-600 dark:text-neutral-400">Compliance monitoring features coming soon...</p>
        </div>
      </div>
    </MainLayout>
  )
}

export default Compliance
