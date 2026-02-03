import React, { useEffect, useState } from 'react';
import { useFeatureStore } from '../../store/featureStore';
import { Plus, Search, Trash2, Users } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminRoleManagement() {
  const {
    roles,
    rolesLoading,
    rolesError,
    rolesPagination,
    fetchRoles,
    deleteRole,
    clearErrors,
  } = useFeatureStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchRoles({
      search: searchTerm,
      status: filterStatus,
      page: currentPage,
    });
  }, [searchTerm, filterStatus, currentPage]);

  useEffect(() => {
    if (rolesError) {
      toast.error(rolesError);
      clearErrors();
    }
  }, [rolesError]);

  const handleDeleteRole = async (roleId) => {
    if (window.confirm('Are you sure you want to delete this role?')) {
      try {
        await deleteRole(roleId);
        toast.success('Role deleted successfully');
      } catch (error) {
        toast.error('Failed to delete role');
      }
    }
  };

  const getLevelLabel = (level) => {
    const levels = {
      0: 'Super Admin',
      1: 'Admin',
      2: 'Moderator',
      3: 'Support',
    };
    return levels[level] || 'Unknown';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Admin Roles</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition"
        >
          <Plus size={20} />
          New Role
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search roles..."
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
          </select>
        </div>
      </div>

      {/* Roles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rolesLoading ? (
          <div className="col-span-full text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
            <p className="mt-2 text-gray-600">Loading roles...</p>
          </div>
        ) : roles.length === 0 ? (
          <div className="col-span-full text-center py-8 text-gray-500">
            No roles found
          </div>
        ) : (
          roles.map((role) => (
            <div key={role.id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{role.name}</h3>
                  <p className="text-sm text-gray-500">{role.slug}</p>
                </div>
                <span
                  className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                    role.is_active
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {role.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>

              <p className="text-sm text-gray-600 mb-4">{role.description}</p>

              <div className="mb-4">
                <p className="text-xs font-semibold text-gray-700 mb-2">Level: {getLevelLabel(role.level)}</p>
              </div>

              <div className="mb-4">
                <p className="text-xs font-semibold text-gray-700 mb-2">Permissions:</p>
                <div className="flex flex-wrap gap-2">
                  {role.permissions && role.permissions.length > 0 ? (
                    role.permissions.slice(0, 3).map((permission, idx) => (
                      <span
                        key={idx}
                        className="inline-block px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded"
                      >
                        {permission}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-gray-500">No permissions</span>
                  )}
                  {role.permissions && role.permissions.length > 3 && (
                    <span className="text-xs text-gray-500">+{role.permissions.length - 3} more</span>
                  )}
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t border-gray-200">
                <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition text-sm font-medium">
                  <Users size={16} />
                  View Users
                </button>
                <button
                  onClick={() => handleDeleteRole(role.id)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition text-sm font-medium"
                >
                  <Trash2 size={16} />
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {rolesPagination.total > 0 && (
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-600">
            Showing {(currentPage - 1) * rolesPagination.per_page + 1} to{' '}
            {Math.min(currentPage * rolesPagination.per_page, rolesPagination.total)} of{' '}
            {rolesPagination.total} roles
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
                    Math.ceil(rolesPagination.total / rolesPagination.per_page),
                    currentPage + 1
                  )
                )
              }
              disabled={currentPage >= Math.ceil(rolesPagination.total / rolesPagination.per_page)}
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
