import { useState, useEffect, useCallback } from 'react';
import { FaEdit, FaTrash, FaPlus, FaSearch, FaTimes } from 'react-icons/fa';
import Pagination from "./Pagination.jsx";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { BASE_URL } from '../config';

// Modal Component - moved outside to prevent recreation on every render
const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FaTimes size={20} />
          </button>
        </div>
        <div className="p-4">
          {children}
        </div>
      </div>
    </div>
  );
};

const OperationTypeManagement = () => {
  const [operationTypes, setOperationTypes] = useState([]);
  const [formData, setFormData] = useState({ name: '', type: '', price: '' });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // Filter and search states
  const [filterType, setFilterType] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchInput, setSearchInput] = useState('');

  useEffect(() => {
    fetchOperationTypes();
  }, [limit, currentPage, filterType, searchTerm]);

  //Fetch all active operation types with filtering and search
  const fetchOperationTypes = async () => {
    setLoading(true);
    try {
      // Build query parameters
      const params = new URLSearchParams({
        page: currentPage,
        limit: limit,
      });

      if (filterType) {
        params.append('type', filterType);
      }

      if (searchTerm) {
        params.append('search', searchTerm);
      }

      const response = await fetch(
        `${BASE_URL}/operation-types?${params.toString()}`,
        {
          credentials: 'include',
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setOperationTypes(data.data || []);
      setTotalPages(data.totalPages || Math.ceil(data.results / limit));
    } catch (error) {
      console.error('Error fetching operation types:', error);
      toast.error('Failed to fetch operation types');
      setOperationTypes([]);
    } finally {
      setLoading(false);
    }
  };

  //Handle form input change
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  //Create or Update an operation type
  const handleSubmit = async (e) => {
    e.preventDefault();

    setIsSubmitting(true);

    if (!formData.name || !formData.type || !formData.price) {
      toast.error('Please fill all fields');
      setIsSubmitting(false);
      return;
    }

    const method = editingId ? 'PATCH' : 'POST';
    const url = editingId
      ? `${BASE_URL}/operation-types/${editingId}`
      : `${BASE_URL}/operation-types`;

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save operation type');
      }

      const result = await response.json();
      toast.success(result.message || `Operation type ${editingId ? 'updated' : 'created'} successfully`);

      // Reset form and close modals
      setFormData({ name: '', type: '', price: '' });
      setEditingId(null);
      setShowAddModal(false);
      setShowEditModal(false);

      // Refresh data
      fetchOperationTypes();
    } catch (error) {
      console.error('Error saving operation type:', error);
      toast.error(error.message || 'Failed to save operation type');
    } finally {
      setIsSubmitting(false);
    }
  };

  //Soft delete operation type (mark `isDeleted: true`)
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this type?')) return;
    try {
      const response = await fetch(`${BASE_URL}/operation-types/delete/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ isDeleted: true }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete operation type');
      }

      toast.success('Operation type deleted successfully');
      fetchOperationTypes();
    } catch (error) {
      console.error('Error deleting operation type:', error);
      toast.error(error.message || 'Failed to delete operation type');
    }
  };

  //Set form fields for editing
  const handleEdit = (type) => {
    setFormData({ name: type.name, type: type.type, price: type.price });
    setEditingId(type._id);
    setShowEditModal(true);
  };

  // Modal handlers
  const openAddModal = useCallback(() => {
    setFormData({ name: '', type: '', price: '' });
    setEditingId(null);
    setShowAddModal(true);
  }, []);

  const closeAddModal = useCallback(() => {
    setFormData({ name: '', type: '', price: '' });
    setEditingId(null);
    setShowAddModal(false);
  }, []);

  const closeEditModal = useCallback(() => {
    setFormData({ name: '', type: '', price: '' });
    setEditingId(null);
    setShowEditModal(false);
  }, []);

  // Search handlers
  const handleSearch = () => {
    setSearchTerm(searchInput);
    setCurrentPage(1); // Reset to first page when searching
  };

  const clearSearch = () => {
    setSearchInput('');
    setSearchTerm('');
    setCurrentPage(1);
  };

  // Filter handler
  const handleFilterChange = (e) => {
    setFilterType(e.target.value);
    setCurrentPage(1); // Reset to first page when filtering
  };



  return (
    <div className='p-4 sm:p-6 bg-white rounded-lg border shadow-sm mb-10'>
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <h2 className='text-lg sm:text-xl font-semibold text-gray-600 mb-4 sm:mb-0'>
          Operation Type Management
        </h2>
        <button
          onClick={openAddModal}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <FaPlus className="mr-2" size={14} />
          Add Operation Type
        </button>
      </div>

      {/* Filters and Search */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {/* Search */}
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Search by Name
          </label>
          <div className="flex">
            <input
              type="text"
              placeholder="Search operation types..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="flex-1 p-2 border border-gray-300 rounded-l-md focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              onClick={handleSearch}
              className="px-3 py-2 bg-blue-600 text-white border border-blue-600 rounded-r-md hover:bg-blue-700 transition-colors"
            >
              <FaSearch size={14} />
            </button>
          </div>
          {searchTerm && (
            <button
              onClick={clearSearch}
              className="absolute right-12 top-8 text-gray-400 hover:text-gray-600"
            >
              <FaTimes size={14} />
            </button>
          )}
        </div>

        {/* Type Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Filter by Type
          </label>
          <select
            value={filterType}
            onChange={handleFilterChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 scrollable-select"
          >
            <option value="">All Types</option>
            <option value="operation">Operation</option>
            <option value="laboratory">Laboratory</option>
            <option value="oct">OCT</option>
            <option value="biscayne">Biscayne</option>
            <option value="bedroom">Bedroom</option>
            <option value="perimetry">Perimetry</option>
            <option value="FA">FA</option>
            <option value="PRP">PRP</option>
          </select>
        </div>

        {/* Active Filters Display */}
        <div className="flex flex-wrap items-end gap-2">
          {(searchTerm || filterType) && (
            <div className="text-sm text-gray-600">
              <span className="font-medium">Active filters:</span>
              {searchTerm && (
                <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                  Search: {searchTerm}
                </span>
              )}
              {filterType && (
                <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                  Type: {filterType}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Table Section */}
      {loading ? (
        <div className='flex justify-center items-center py-10'>
          <div className='animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500'></div>
          <p className='ml-3 text-gray-600'>Loading...</p>
        </div>
      ) : operationTypes.length === 0 ? (
        <div className="text-center py-10">
          <div className="text-gray-500 mb-2">No operation types found</div>
          {(searchTerm || filterType) && (
            <button
              onClick={() => {
                setSearchTerm('');
                setSearchInput('');
                setFilterType('');
              }}
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              Clear filters to see all operation types
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Table with horizontal scrolling for all screen sizes */}
          <div className='overflow-x-auto shadow-sm rounded-lg'>
            <div className='inline-block min-w-full align-middle'>
              <table className='min-w-full divide-y divide-gray-200'>
                <thead className='bg-gray-100'>
                  <tr>
                    <th className='px-4 sm:px-6 py-3 text-xs font-medium text-gray-700 uppercase tracking-wider text-left'>
                      Name
                    </th>
                    <th className='px-4 sm:px-6 py-3 text-xs font-medium text-gray-700 uppercase tracking-wider text-left'>
                      Type
                    </th>
                    <th className='px-4 sm:px-6 py-3 text-xs font-medium text-gray-700 uppercase tracking-wider text-left'>
                      Price
                    </th>
                    <th className='px-4 sm:px-6 py-3 text-xs font-medium text-gray-700 uppercase tracking-wider text-center'>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className='bg-white divide-y divide-gray-200'>
                  {operationTypes.map((type) => (
                    <tr
                      key={type._id}
                      className='hover:bg-gray-50 transition-colors'
                    >
                      <td className='px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900'>
                        {type.name}
                      </td>
                      <td className='px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                          {type.type}
                        </span>
                      </td>
                      <td className='px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                        ${type.price}
                      </td>
                      <td className='px-4 sm:px-6 py-4 whitespace-nowrap text-center'>
                        <div className='flex justify-center space-x-2'>
                          <button
                            onClick={() => handleEdit(type)}
                            className='text-blue-500 hover:bg-blue-50 p-1.5 rounded transition-colors'
                            aria-label='Edit operation type'
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => handleDelete(type._id)}
                            className='text-red-500 hover:bg-red-50 p-1.5 rounded transition-colors'
                            aria-label='Delete operation type'
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Responsive indicator - only visible on small screens */}
          <div className='block sm:hidden text-center text-xs text-gray-500 mt-2 px-4'>
            <p>Swipe horizontally to see more data</p>
          </div>
        </>
      )}

      {/* Pagination */}
      <div className='mt-4'>
        <Pagination
          totalItems={operationTypes.length}
          totalPagesCount={totalPages}
          itemsPerPage={limit}
          currentPage={currentPage}
          onPageChange={(page) => setCurrentPage(page)}
          onLimitChange={(limit) => setLimit(limit)}
        />
      </div>

      {/* Add Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={closeAddModal}
        title="Add Operation Type"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="add-name" className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              id="add-name"
              type="text"
              name="name"
              required
              placeholder="Enter operation type name"
              value={formData.name}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label htmlFor="add-type" className="block text-sm font-medium text-gray-700 mb-1">
              Type
            </label>
            <select
              id="add-type"
              name="type"
              required
              value={formData.type}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 scrollable-select"
            >
              <option value="" disabled>Select Type</option>
              <option value="operation">Operation</option>
              <option value="laboratory">Laboratory</option>
              <option value="oct">OCT</option>
              <option value="biscayne">Biscayne</option>
              <option value="bedroom">Bedroom</option>
              <option value="perimetry">Perimetry</option>
              <option value="FA">FA</option>
              <option value="PRP">PRP</option>
            </select>
          </div>

          <div>
            <label htmlFor="add-price" className="block text-sm font-medium text-gray-700 mb-1">
              Price
            </label>
            <input
              id="add-price"
              type="number"
              name="price"
              required
              placeholder="Enter price"
              value={formData.price}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              min="0"
              step="0.01"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={closeAddModal}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-4 py-2 text-white rounded-md transition-colors ${
                isSubmitting
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isSubmitting ? 'Adding...' : 'Add Operation Type'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={closeEditModal}
        title="Edit Operation Type"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="edit-name" className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              id="edit-name"
              type="text"
              name="name"
              required
              placeholder="Enter operation type name"
              value={formData.name}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label htmlFor="edit-type" className="block text-sm font-medium text-gray-700 mb-1">
              Type
            </label>
            <select
              id="edit-type"
              name="type"
              required
              value={formData.type}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 scrollable-select"
            >
              <option value="" disabled>Select Type</option>
              <option value="operation">Operation</option>
              <option value="laboratory">Laboratory</option>
              <option value="oct">OCT</option>
              <option value="biscayne">Biscayne</option>
              <option value="bedroom">Bedroom</option>
              <option value="perimetry">Perimetry</option>
              <option value="FA">FA</option>
              <option value="PRP">PRP</option>
            </select>
          </div>

          <div>
            <label htmlFor="edit-price" className="block text-sm font-medium text-gray-700 mb-1">
              Price
            </label>
            <input
              id="edit-price"
              type="number"
              name="price"
              required
              placeholder="Enter price"
              value={formData.price}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              min="0"
              step="0.01"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={closeEditModal}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-4 py-2 text-white rounded-md transition-colors ${
                isSubmitting
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isSubmitting ? 'Updating...' : 'Update Operation Type'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default OperationTypeManagement;
