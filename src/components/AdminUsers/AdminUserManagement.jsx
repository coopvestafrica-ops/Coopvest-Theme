import React, { useEffect, useState } from 'react';
import { useFeatureStore } from '../../store/featureStore';
import { Plus, Search, Trash2, Shield, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminUserManagement() {
  const {
    adminUsers,
    adminUsersLoading,
    adminUsersError,
    adminUsersPagination,
    fetchAdminUsers,
    removeAdminRole,
    suspendAdminUser,
    activateAdminUser,
    clearErrors,
  } = useFeatureStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchAdminUsers({
      search: searchTerm,
      status: filterStatus,
      role_id: filterRole,
      page: currentPage,
    });
  }, [searchTerm, filterStatus, filterRole, currentPage]);

  useEffect(() => {
    if (adminUsersError) {
      toast.error(adminUsersError);
      clearErrors();
    }
  }, [adminUsersError]);

  const handleRemoveRole = async (adminUserId) => {
    if (window.confirm('Are you sure you want to remove this admin role?')) {
      try {
        await removeAdminRole(adminUserId);
        toast.success('Admin role removed successfully');
      } catch (error) {
        toast.error('Failed to remove admin role');
      }
    }
  };

  const handleSuspend = async (adminUserId) => {
    try {
      await suspendAdminUser(adminUserId);
      toast.success('Admin user suspended successfully');
    } catch (error) {
      toast.error('Failed to suspend admin user');
    }
  };

  const handleActivate = async (adminUserId) => {
    try {
      await activateAdminUser(adminUserId);
      toast.success('Admin user activated successfully');
    } catch (error) {
      toast.error('Failed to activate admin user');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-yellow-100 text-yellow-800';
      case 'suspended':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Admin Users</h1>
        <button
          onClick={() => setShowAssignModal(true)}
          className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition"
        >
          <Plus size={20} />
          Assign Role
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by email or name..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value);
              setCurrentPage(1);
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
          </select>

          {/* Role Filter */}
          <select
            value={filterRole}
            onChange={(e) => {
              setFilterRole(e.target.value);
              setCurrentPage(1);
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
          >
            <option value="">All Roles</option>
            <option value="1">Super Admin</option>
            <option value="2">Admin</option>
            <option value="3">Moderator</option>
            <option value="4">Support</option>
          </select>
        </div>
      </div>

      {/* Admin Users Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {adminUsersLoading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
            <p className="mt-2 text-gray-600">Loading admin users...</p>
          </div>
        ) : adminUsers.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No admin users found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">User</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Role</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Assigned By</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {adminUsers.map((adminUser) => (
                  <tr key={adminUser.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{adminUser.user?.name}</p>
                        <p className="text-sm text-gray-500">{adminUser.user?.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Shield size={16} className="text-blue-600" />
                        <span className="font-medium text-gray-900">{adminUser.role?.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                          adminUser.status
                        )}`}
                      >
                        {adminUser.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-600">{adminUser.assigned_by?.name || 'System'}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        {adminUser.status === 'active' ? (
                          <button
                            onClick={() => handleSuspend(adminUser.id)}
                            className="p-2 hover:bg-red-100 rounded-lg transition"
                            title="Suspend user"
                          >
                            <AlertCircle size={18} className="text-red-600" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleActivate(adminUser.id)}
                            className="p-2 hover:bg-green-100 rounded-lg transition"
                            title="Activate user"
                          >
                            <Shield size={18} className="text-green-600" />
                          </button>
                        )}
                        <button
                          onClick={() => handleRemoveRole(adminUser.id)}
                          className="p-2 hover:bg-red-100 rounded-lg transition"
                          title="Remove role"
                        >
                          <Trash2 size={18} className="text-red-600" />
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

      {/* Pagination */}
      {adminUsersPagination.total > 0 && (
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-600">
            Showing {(currentPage - 1) * adminUsersPagination.per_page + 1} to{' '}
            {Math.min(currentPage * adminUsersPagination.per_page, adminUsersPagination.total)} of{' '}
            {adminUsersPagination.total} admin users
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50 transition"
            >
              Previous
            </button>
            <button
              onClick={() =>
                setCurrentPage(
                  Math.min(
                    Math.ceil(adminUsersPagination.total / adminUsersPagination.per_page),
                    currentPage + 1
                  )
                )
              }
              disabled={
                currentPage >= Math.ceil(adminUsersPagination.total / adminUsersPagination.per_page)
              }
              className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50 transition"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
