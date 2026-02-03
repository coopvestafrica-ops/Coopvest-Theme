import React, { useState } from 'react'
import { Plus, Edit, Trash2, Shield, CheckCircle, AlertCircle, Users } from 'lucide-react'
import MainLayout from '../components/Layout/MainLayout'

const RoleAssignment = () => {
  const [roles] = useState([
    {
      id: 1,
      name: 'super_admin',
      displayName: 'Super Admin',
      description: 'Full system control and governance authority',
      permissions: ['read', 'write', 'approve', 'manage_admins', 'manage_features'],
      adminCount: 1,
      maxAdmins: -1,
      isActive: true
    },
    {
      id: 2,
      name: 'finance',
      displayName: 'Finance Admin',
      description: 'Manage contributions, loans, and financial operations',
      permissions: ['read', 'write', 'approve'],
      adminCount: 2,
      maxAdmins: 5,
      isActive: true
    },
    {
      id: 3,
      name: 'operations',
      displayName: 'Operations Admin',
      description: 'Manage day-to-day operations and member services',
      permissions: ['read', 'write'],
      adminCount: 1,
      maxAdmins: 3,
      isActive: true
    },
    {
      id: 4,
      name: 'compliance',
      displayName: 'Compliance Admin',
      description: 'Monitor compliance and regulatory requirements',
      permissions: ['read', 'view_audit_logs'],
      adminCount: 1,
      maxAdmins: 2,
      isActive: true
    },
    {
      id: 5,
      name: 'member_support',
      displayName: 'Member Support Admin',
      description: 'Handle member inquiries and support',
      permissions: ['read', 'write'],
      adminCount: 3,
      maxAdmins: 10,
      isActive: true
    }
  ])

  const [admins] = useState([
    {
      id: 1,
      name: 'Chioma Okafor',
      email: 'chioma@coopvest.com',
      role: 'super_admin',
      status: 'active',
      joinDate: '2024-01-15'
    },
    {
      id: 2,
      name: 'Adebayo Oluwaseun',
      email: 'adebayo@coopvest.com',
      role: 'finance',
      status: 'active',
      joinDate: '2024-02-20'
    },
    {
      id: 3,
      name: 'Zainab Mohammed',
      email: 'zainab@coopvest.com',
      role: 'finance',
      status: 'active',
      joinDate: '2024-03-10'
    },
    {
      id: 4,
      name: 'Emeka Nwosu',
      email: 'emeka@coopvest.com',
      role: 'operations',
      status: 'active',
      joinDate: '2024-04-05'
    },
    {
      id: 5,
      name: 'Fatima Hassan',
      email: 'fatima@coopvest.com',
      role: 'member_support',
      status: 'active',
      joinDate: '2024-05-12'
    }
  ])

  const [selectedRole, setSelectedRole] = useState(null)
  const [showAssignModal, setShowAssignModal] = useState(false)

  const getRoleAdmins = (roleName) => {
    return admins.filter(admin => admin.role === roleName)
  }

  const getPermissionBadgeColor = (permission) => {
    const colors = {
      read: 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200',
      write: 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200',
      approve: 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-200',
      manage_admins: 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200',
      manage_features: 'bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-200',
      manage_members: 'bg-pink-100 dark:bg-pink-900 text-pink-700 dark:text-pink-200',
      manage_loans: 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-200',
      manage_investments: 'bg-cyan-100 dark:bg-cyan-900 text-cyan-700 dark:text-cyan-200',
      view_audit_logs: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-200'
    }
    return colors[permission] || colors.read
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="section-title">Role & Duty Assignment</h1>
            <p className="text-neutral-600 dark:text-neutral-400">
              Manage admin roles, permissions, and duty assignments
            </p>
          </div>
          <button className="btn-primary flex items-center gap-2">
            <Plus size={20} />
            Assign Admin
          </button>
        </div>

        {/* Tabs */}
        <div className="card">
          <div className="flex gap-4 border-b border-neutral-200 dark:border-neutral-700">
            <button className="px-4 py-3 font-medium text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400">
              Roles ({roles.length})
            </button>
            <button className="px-4 py-3 font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-50">
              Admins ({admins.length})
            </button>
          </div>
        </div>

        {/* Roles Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {roles.map((role) => (
            <div key={role.id} className="card">
              {/* Role Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-primary-100 dark:bg-primary-900 rounded-lg">
                    <Shield className="text-primary-600 dark:text-primary-400" size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-neutral-900 dark:text-neutral-50">
                      {role.displayName}
                    </h3>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                      {role.description}
                    </p>
                  </div>
                </div>
                <button className="p-2 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-colors">
                  <Edit size={18} />
                </button>
              </div>

              {/* Admin Count */}
              <div className="mb-4 p-3 bg-neutral-50 dark:bg-neutral-700/50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users size={18} className="text-primary-600 dark:text-primary-400" />
                    <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                      Admins Assigned
                    </span>
                  </div>
                  <span className="text-lg font-bold text-primary-600 dark:text-primary-400">
                    {role.adminCount}
                    {role.maxAdmins !== -1 && ` / ${role.maxAdmins}`}
                  </span>
                </div>
              </div>

              {/* Permissions */}
              <div className="mb-4">
                <p className="text-xs font-semibold text-neutral-600 dark:text-neutral-400 mb-2">
                  PERMISSIONS
                </p>
                <div className="flex flex-wrap gap-2">
                  {role.permissions.map((permission) => (
                    <span
                      key={permission}
                      className={`badge ${getPermissionBadgeColor(permission)}`}
                    >
                      {permission.replace(/_/g, ' ').toUpperCase()}
                    </span>
                  ))}
                </div>
              </div>

              {/* Assigned Admins */}
              <div className="mb-4">
                <p className="text-xs font-semibold text-neutral-600 dark:text-neutral-400 mb-2">
                  ASSIGNED ADMINS
                </p>
                <div className="space-y-2">
                  {getRoleAdmins(role.name).length > 0 ? (
                    getRoleAdmins(role.name).map((admin) => (
                      <div
                        key={admin.id}
                        className="flex items-center justify-between p-2 bg-neutral-50 dark:bg-neutral-700/50 rounded"
                      >
                        <div>
                          <p className="text-sm font-medium text-neutral-900 dark:text-neutral-50">
                            {admin.name}
                          </p>
                          <p className="text-xs text-neutral-600 dark:text-neutral-400">
                            {admin.email}
                          </p>
                        </div>
                        <button className="p-1 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 italic">
                      No admins assigned yet
                    </p>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-4 border-t border-neutral-200 dark:border-neutral-700">
                <button className="flex-1 btn-primary flex items-center justify-center gap-2">
                  <Plus size={18} />
                  Assign Admin
                </button>
                <button className="flex-1 btn-secondary flex items-center justify-center gap-2">
                  <Edit size={18} />
                  Edit Role
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Info Box */}
        <div className="card border-l-4 border-l-blue-500 bg-blue-50 dark:bg-blue-900/20">
          <div className="flex items-start gap-3">
            <AlertCircle className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1" size={20} />
            <div>
              <p className="font-medium text-blue-900 dark:text-blue-100">
                Role Assignment Guidelines
              </p>
              <ul className="text-sm text-blue-800 dark:text-blue-200 mt-2 space-y-1">
                <li>• Only Super Admin can assign and modify roles</li>
                <li>• Each admin can have only one primary role</li>
                <li>• Permissions are inherited from the assigned role</li>
                <li>• All role changes are logged in audit trail</li>
                <li>• Respect maximum admin limits per role</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}

export default RoleAssignment
