import React, { useState } from 'react'
import { Plus, Edit, Trash2, Shield, AlertCircle } from 'lucide-react'
import MainLayout from '../components/Layout/MainLayout'

const AccessManagement = () => {
  const [admins] = useState([
    {
      id: 1,
      name: 'Chioma Okafor',
      email: 'chioma.admin@coopvest.com',
      role: 'super_admin',
      permissions: ['read', 'write', 'approve', 'manage_admins'],
      status: 'active',
      createdAt: '2024-01-15',
    },
    {
      id: 2,
      name: 'Adebayo Oluwaseun',
      email: 'adebayo.admin@coopvest.com',
      role: 'finance',
      permissions: ['read', 'write', 'approve'],
      status: 'active',
      createdAt: '2024-02-20',
    },
    {
      id: 3,
      name: 'Zainab Mohammed',
      email: 'zainab.admin@coopvest.com',
      role: 'compliance',
      permissions: ['read', 'write'],
      status: 'pending_approval',
      createdAt: '2024-11-10',
    },
  ])

  const roleDescriptions = {
    super_admin: 'Full system control and governance authority',
    finance: 'Manage contributions, loans, and financial operations',
    operations: 'Manage day-to-day operations and member services',
    compliance: 'Monitor compliance and regulatory requirements',
    member_support: 'Handle member inquiries and support',
    investment: 'Manage investment pools and allocations',
    technology: 'System administration and technical operations',
  }

  const getRoleBadge = (role) => {
    const colors = {
      super_admin: 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-200',
      finance: 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200',
      operations: 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200',
      compliance: 'bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-200',
      member_support: 'bg-pink-100 dark:bg-pink-900 text-pink-700 dark:text-pink-200',
      investment: 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-200',
      technology: 'bg-cyan-100 dark:bg-cyan-900 text-cyan-700 dark:text-cyan-200',
    }
    return (
      <span className={`badge ${colors[role] || colors.operations}`}>
        {role.replace('_', ' ').toUpperCase()}
      </span>
    )
  }

  const getStatusBadge = (status) => {
    const colors = {
      active: 'bg-accent-100 dark:bg-accent-900 text-accent-700 dark:text-accent-200',
      pending_approval: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-200',
      suspended: 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200',
    }
    return (
      <span className={`badge ${colors[status] || colors.active}`}>
        {status.replace('_', ' ').toUpperCase()}
      </span>
    )
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="section-title">Access Management</h1>
            <p className="text-neutral-600 dark:text-neutral-400">
              Manage admin roles, permissions, and access control
            </p>
          </div>
          <button className="btn-primary flex items-center gap-2">
            <Plus size={20} />
            <span>Create Admin</span>
          </button>
        </div>

        {/* Warning Alert */}
        <div className="card border-l-4 border-l-yellow-500 bg-yellow-50 dark:bg-yellow-900/20">
          <div className="flex items-start gap-3">
            <AlertCircle className="text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-1" size={20} />
            <div>
              <p className="font-medium text-yellow-900 dark:text-yellow-100">
                Super Admin Authority
              </p>
              <p className="text-sm text-yellow-800 dark:text-yellow-200 mt-1">
                Only Super Admins can create, modify, or revoke admin roles. All role changes are logged and auditable.
              </p>
            </div>
          </div>
        </div>

        {/* Admins Table */}
        <div className="card overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-200 dark:border-neutral-700">
                <th className="text-left py-4 px-4 font-semibold text-neutral-700 dark:text-neutral-300">Name</th>
                <th className="text-left py-4 px-4 font-semibold text-neutral-700 dark:text-neutral-300">Email</th>
                <th className="text-left py-4 px-4 font-semibold text-neutral-700 dark:text-neutral-300">Role</th>
                <th className="text-left py-4 px-4 font-semibold text-neutral-700 dark:text-neutral-300">Status</th>
                <th className="text-left py-4 px-4 font-semibold text-neutral-700 dark:text-neutral-300">Created</th>
                <th className="text-left py-4 px-4 font-semibold text-neutral-700 dark:text-neutral-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              {admins.map((admin) => (
                <tr key={admin.id} className="table-row">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                        <Shield className="text-primary-600 dark:text-primary-400" size={20} />
                      </div>
                      <p className="font-medium text-neutral-900 dark:text-neutral-50">{admin.name}</p>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-neutral-600 dark:text-neutral-400">{admin.email}</td>
                  <td className="py-4 px-4">{getRoleBadge(admin.role)}</td>
                  <td className="py-4 px-4">{getStatusBadge(admin.status)}</td>
                  <td className="py-4 px-4 text-neutral-600 dark:text-neutral-400">{admin.createdAt}</td>
                  <td className="py-4 px-4">
                    <div className="flex gap-2">
                      <button className="p-2 text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors">
                        <Edit size={18} />
                      </button>
                      <button className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Role Descriptions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.entries(roleDescriptions).map(([role, description]) => (
            <div key={role} className="card">
              <div className="flex items-start gap-3">
                <Shield className="text-primary-600 dark:text-primary-400 flex-shrink-0 mt-1" size={20} />
                <div>
                  <p className="font-semibold text-neutral-900 dark:text-neutral-50 capitalize">
                    {role.replace('_', ' ')}
                  </p>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">{description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </MainLayout>
  )
}

export default AccessManagement
