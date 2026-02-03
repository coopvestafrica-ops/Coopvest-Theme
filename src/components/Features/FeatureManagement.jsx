import React, { useEffect, useState } from 'react';
import { useFeatureStore } from '../../store/featureStore';
import { Plus, Search, Filter, ToggleRight, Trash2, Edit2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function FeatureManagement() {
  const {
    features,
    featuresLoading,
    featuresError,
    featuresPagination,
    fetchFeatures,
    toggleFeature,
    deleteFeature,
    clearErrors,
  } = useFeatureStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPlatform, setFilterPlatform] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchFeatures({
      search: searchTerm,
      status: filterStatus,
      platform: filterPlatform,
      page: currentPage,
    });
  }, [searchTerm, filterStatus, filterPlatform, currentPage]);

  useEffect(() => {
    if (featuresError) {
      toast.error(featuresError);
      clearErrors();
    }
  }, [featuresError]);

  const handleToggleFeature = async (featureId) => {
    try {
      await toggleFeature(featureId);
      toast.success('Feature toggled successfully');
    } catch (error) {
      toast.error('Failed to toggle feature');
    }
  };

  const handleDeleteFeature = async (featureId) => {
    if (window.confirm('Are you sure you want to delete this feature?')) {
      try {
        await deleteFeature(featureId);
        toast.success('Feature deleted successfully');
      } catch (error) {
        toast.error('Failed to delete feature');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Feature Management</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition"
        >
          <Plus size={20} />
          New Feature
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
              placeholder="Search features..."
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
            <option value="enabled">Enabled</option>
            <option value="disabled">Disabled</option>
          </select>

          {/* Platform Filter */}
          <select
            value={filterPlatform}
            onChange={(e) => {
              setFilterPlatform(e.target.value);
              setCurrentPage(1);
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
          >
            <option value="">All Platforms</option>
            <option value="web">Web</option>
            <option value="mobile">Mobile</option>
          </select>
        </div>
      </div>

      {/* Features Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {featuresLoading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
            <p className="mt-2 text-gray-600">Loading features...</p>
          </div>
        ) : features.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No features found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Name</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Category</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Platforms</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {features.map((feature) => (
                  <tr key={feature.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{feature.name}</p>
                        <p className="text-sm text-gray-500">{feature.slug}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-block px-3 py-1 bg-gray-100 text-gray-800 text-sm rounded-full">
                        {feature.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        {feature.platforms?.map((platform) => (
                          <span
                            key={platform}
                            className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
                          >
                            {platform}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                          feature.is_enabled
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {feature.is_enabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleToggleFeature(feature.id)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition"
                          title="Toggle feature"
                        >
                          <ToggleRight size={18} className="text-gray-600" />
                        </button>
                        <button
                          onClick={() => handleDeleteFeature(feature.id)}
                          className="p-2 hover:bg-red-100 rounded-lg transition"
                          title="Delete feature"
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
      {featuresPagination.total > 0 && (
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-600">
            Showing {(currentPage - 1) * featuresPagination.per_page + 1} to{' '}
            {Math.min(currentPage * featuresPagination.per_page, featuresPagination.total)} of{' '}
            {featuresPagination.total} features
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
                    Math.ceil(featuresPagination.total / featuresPagination.per_page),
                    currentPage + 1
                  )
                )
              }
              disabled={currentPage >= Math.ceil(featuresPagination.total / featuresPagination.per_page)}
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
