import { useState, useEffect } from 'react';
import { BASE_URL } from '../config';
import Pagination from './Pagination.jsx';

export default function CategoryManagement({ filterType = null }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentCategory, setCurrentCategory] = useState(null);
  const [categoryName, setCategoryName] = useState('');
  const [categoryType, setCategoryType] = useState(filterType || 'expense');
  const [nameError, setNameError] = useState('');
  const [typeError, setTypeError] = useState('');
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [filterTypeState, setFilterTypeState] = useState(filterType || '');

  // Fetch categories on component mount
  useEffect(() => {
    fetchCategories();
  }, [currentPage, limit, filterTypeState]);

  // Hide toast after 3 seconds
  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => {
        setToast({ ...toast, show: false });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Fetch categories (all or filtered by type)
  const fetchCategories = async () => {
    setLoading(true);
    try {
      let url = `${BASE_URL}/categories?page=${currentPage}&limit=${limit}`;
      // If filterTypeState is specified, add type query parameter
      if (filterTypeState) {
        url += `&type=${filterTypeState}`;
      }

      const response = await fetch(url, {
        credentials: 'include',
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch categories');
      }
      setCategories(data.data.results);
      setTotalPages(data.totalPages || Math.ceil(data.data.results.length / limit));
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Show toast message
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
  };

  // Validate category name
  const validateCategoryName = (name) => {
    if (!name.trim()) {
      setNameError('Category name is required');
      return false;
    }
    if (name.trim().length < 2) {
      setNameError('Category name must be at least 2 characters');
      return false;
    }
    if (name.trim().length > 50) {
      setNameError('Category name cannot exceed 50 characters');
      return false;
    }
    setNameError('');
    return true;
  };

  const validateCategoryType = (type) => {
    if (!type) {
      setTypeError('Category type is required');
      return false;
    }
    setTypeError('');
    return true;
  };

  const validateForm = () => {
    const nameValid = validateCategoryName(categoryName);
    const typeValid = validateCategoryType(categoryType);
    return nameValid && typeValid;
  };

  const resetForm = () => {
    setCategoryName('');
    setCategoryType(filterType || 'expense');
    setNameError('');
    setTypeError('');
  };

  // Handle creating a new category
  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);

    try {
      const response = await fetch(`${BASE_URL}/categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          name: categoryName,
          type: categoryType
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to create category');
      }

      await fetchCategories();
      setShowAddModal(false);
      resetForm();
      showToast(data.message || 'Category created successfully');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Handle updating a category
  const handleUpdateCategory = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);

    try {
      const response = await fetch(
        `${BASE_URL}/categories/${currentCategory._id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            name: categoryName,
            type: categoryType
          }),
        }
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update category');
      }

      await fetchCategories();
      setShowEditModal(false);
      resetForm();
      setCurrentCategory(null);
      showToast(data.message || 'Category updated successfully');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Handle deleting a category
  const handleDeleteCategory = async () => {
    if (!currentCategory) return;
    setLoading(true);

    try {
      const response = await fetch(
        `${BASE_URL}/categories/${currentCategory._id}`,
        {
          method: 'DELETE',
          credentials: 'include',
        }
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete category');
      }

      await fetchCategories();
      setShowDeleteModal(false);
      setCurrentCategory(null);
      showToast('Category deleted successfully');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Open edit modal
  const openEditModal = (category) => {
    setCurrentCategory(category);
    setCategoryName(category.name);
    setCategoryType(category.type || 'expense');
    setNameError('');
    setTypeError('');
    setShowEditModal(true);
  };

  // Open delete modal
  const openDeleteModal = (category) => {
    setCurrentCategory(category);
    setShowDeleteModal(true);
  };

  return (
    <div className='bg-white rounded-lg border border-gray-200'>
      {/* Header */}
      <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 sm:p-6 border-b border-gray-200'>
        <div>
          <h2 className='text-xl font-semibold text-gray-800'>
            Expenses and Income category management
          </h2>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className='mt-3 sm:mt-0 w-full sm:w-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md flex items-center justify-center transition-colors'
        >
          <svg
            xmlns='http://www.w3.org/2000/svg'
            className='h-4 w-4 mr-2'
            fill='none'
            viewBox='0 0 24 24'
            stroke='currentColor'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M12 4v16m8-8H4'
            />
          </svg>
          Add Category
        </button>
      </div>

      {/* Filter by Type UI */}
      <div className='p-4 sm:p-4'>
        <div className="mb-4">
          <label className="mr-2 font-medium">Filter by Type:</label>
          <select
            value={filterTypeState}
            onChange={e => {
              setCurrentPage(1);
              setFilterTypeState(e.target.value);
            }}
            className="border rounded px-2 py-1 min-w-[140px]"
          >
            <option value="">All</option>
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>
        </div>
  {loading && categories.length === 0 ? (
          <div className='flex justify-center items-center h-64'>
            <div className='animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600'></div>
          </div>
        ) : categories.length === 0 ? (
          <div className='flex flex-col justify-center items-center h-64 text-center'>
            <p className='text-gray-500 mb-4'>No categories found</p>
            <button
              onClick={() => setShowAddModal(true)}
              className='px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md flex items-center transition-colors'
            >
              <svg
                xmlns='http://www.w3.org/2000/svg'
                className='h-4 w-4 mr-2'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M12 4v16m8-8H4'
                />
              </svg>
              Add Your First Category
            </button>
          </div>
        ) : (
          <div className='overflow-x-auto border border-gray-200 rounded-md'>
            <table className='min-w-full divide-y divide-gray-200'>
              <thead className='bg-gray-50'>
                <tr>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Name
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Type
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Status
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Created
                  </th>
                  <th className='px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className='bg-white divide-y divide-gray-200'>
                {categories?.map((category) => (
                  <tr key={category._id || category.id} className='hover:bg-gray-50'>
                    <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900'>
                      {category.name}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        category.type === 'expense' ? 'bg-red-100 text-red-800' :
                        category.type === 'income' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {category.type || 'expense'}
                      </span>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm'>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        category.isActive !== false
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {category.isActive !== false ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                      {category.createdAt ? new Date(category.createdAt).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-right text-sm font-medium'>
                      <div className='flex justify-end space-x-2'>
                        <button
                          onClick={() => openEditModal(category)}
                          className='text-blue-600 hover:text-blue-900 p-1 rounded-md hover:bg-blue-50'
                        >
                          <svg
                            xmlns='http://www.w3.org/2000/svg'
                            className='h-5 w-5'
                            fill='none'
                            viewBox='0 0 24 24'
                            stroke='currentColor'
                          >
                            <path
                              strokeLinecap='round'
                              strokeLinejoin='round'
                              strokeWidth={2}
                              d='M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z'
                            />
                          </svg>
                          <span className='sr-only'>Edit</span>
                        </button>
                        <button
                          onClick={() => openDeleteModal(category)}
                          className='text-red-600 hover:text-red-900 p-1 rounded-md hover:bg-red-50'
                        >
                          <svg
                            xmlns='http://www.w3.org/2000/svg'
                            className='h-5 w-5'
                            fill='none'
                            viewBox='0 0 24 24'
                            stroke='currentColor'
                          >
                            <path
                              strokeLinecap='round'
                              strokeLinejoin='round'
                              strokeWidth={2}
                              d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16'
                            />
                          </svg>
                          <span className='sr-only'>Delete</span>
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
      <div className='mt-4'>
        <Pagination
          totalItems={categories.length}
          totalPagesCount={totalPages}
          itemsPerPage={limit}
          currentPage={currentPage}
          onPageChange={(page) => setCurrentPage(page)}
          onLimitChange={(limit) => setLimit(limit)}
        />
      </div>

      {/* Add Category Modal */}
      {showAddModal && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
          <div className='bg-white rounded-lg shadow-lg w-full max-w-md mx-auto'>
            <div className='flex justify-between items-center p-4 border-b border-gray-200'>
              <h3 className='text-lg font-semibold text-gray-900'>
                Add New Category
              </h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  resetForm();
                }}
                className='text-gray-400 hover:text-gray-500 focus:outline-none'
              >
                <svg
                  className='h-6 w-6'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M6 18L18 6M6 6l12 12'
                  />
                </svg>
              </button>
            </div>
            <form onSubmit={handleCreateCategory}>
              <div className='p-4'>
                <div className='mb-4'>
                  <label
                    htmlFor='name'
                    className='block text-sm font-medium text-gray-700 mb-1'
                  >
                    Name *
                  </label>
                  <input
                    id='name'
                    type='text'
                    value={categoryName}
                    onChange={(e) => {
                      setCategoryName(e.target.value);
                      if (nameError) validateCategoryName(e.target.value);
                    }}
                    className={`w-full p-2 border ${
                      nameError ? 'border-red-500' : 'border-gray-300'
                    } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                    placeholder='Enter category name'
                  />
                  {nameError && (
                    <p className='mt-1 text-xs text-red-600'>{nameError}</p>
                  )}
                </div>

                {!filterType && (
                  <div className='mb-4'>
                    <label
                      htmlFor='type'
                      className='block text-sm font-medium text-gray-700 mb-1'
                    >
                      Type *
                    </label>
                    <select
                      id='type'
                      value={categoryType}
                      onChange={(e) => {
                        setCategoryType(e.target.value);
                        if (typeError) validateCategoryType(e.target.value);
                      }}
                      className={`w-full p-2 border ${
                        typeError ? 'border-red-500' : 'border-gray-300'
                      } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                    >
                      <option value='expense'>Expense</option>
                      <option value='income'>Income</option>
                    </select>
                    {typeError && (
                      <p className='mt-1 text-xs text-red-600'>{typeError}</p>
                    )}
                  </div>
                )}

                {filterType && (
                  <div className='mb-4'>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      Type
                    </label>
                    <div className='p-2 bg-gray-50 border border-gray-300 rounded-md'>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        filterType === 'expense' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
              <div className='flex justify-end space-x-3 p-4 border-t border-gray-200'>
                <button
                  type='button'
                  onClick={() => {
                    setShowAddModal(false);
                    resetForm();
                  }}
                  className='px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                >
                  Cancel
                </button>
                <button
                  type='submit'
                  disabled={loading}
                  className='px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed'
                >
                  {loading ? (
                    <div className='flex items-center'>
                      <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2'></div>
                      Creating...
                    </div>
                  ) : (
                    'Create'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Category Modal */}
      {showEditModal && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
          <div className='bg-white rounded-lg shadow-lg w-full max-w-md mx-auto'>
            <div className='flex justify-between items-center p-4 border-b border-gray-200'>
              <h3 className='text-lg font-semibold text-gray-900'>
                Edit Category
              </h3>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  resetForm();
                }}
                className='text-gray-400 hover:text-gray-500 focus:outline-none'
              >
                <svg
                  className='h-6 w-6'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M6 18L18 6M6 6l12 12'
                  />
                </svg>
              </button>
            </div>
            <form onSubmit={handleUpdateCategory}>
              <div className='p-4'>
                <div className='mb-4'>
                  <label
                    htmlFor='edit-name'
                    className='block text-sm font-medium text-gray-700 mb-1'
                  >
                    Name *
                  </label>
                  <input
                    id='edit-name'
                    type='text'
                    value={categoryName}
                    onChange={(e) => {
                      setCategoryName(e.target.value);
                      if (nameError) validateCategoryName(e.target.value);
                    }}
                    className={`w-full p-2 border ${
                      nameError ? 'border-red-500' : 'border-gray-300'
                    } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                    placeholder='Enter category name'
                  />
                  {nameError && (
                    <p className='mt-1 text-xs text-red-600'>{nameError}</p>
                  )}
                </div>

                {!filterType && (
                  <div className='mb-4'>
                    <label
                      htmlFor='edit-type'
                      className='block text-sm font-medium text-gray-700 mb-1'
                    >
                      Type *
                    </label>
                    <select
                      id='edit-type'
                      value={categoryType}
                      onChange={(e) => {
                        setCategoryType(e.target.value);
                        if (typeError) validateCategoryType(e.target.value);
                      }}
                      className={`w-full p-2 border ${
                        typeError ? 'border-red-500' : 'border-gray-300'
                      } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                    >
                      <option value='expense'>Expense</option>
                      <option value='income'>Income</option>
                    </select>
                    {typeError && (
                      <p className='mt-1 text-xs text-red-600'>{typeError}</p>
                    )}
                  </div>
                )}

                {filterType && (
                  <div className='mb-4'>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      Type
                    </label>
                    <div className='p-2 bg-gray-50 border border-gray-300 rounded-md'>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        filterType === 'expense' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
              <div className='flex justify-end space-x-3 p-4 border-t border-gray-200'>
                <button
                  type='button'
                  onClick={() => {
                    setShowEditModal(false);
                    resetForm();
                  }}
                  className='px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                >
                  Cancel
                </button>
                <button
                  type='submit'
                  disabled={loading}
                  className='px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed'
                >
                  {loading ? (
                    <div className='flex items-center'>
                      <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2'></div>
                      Saving...
                    </div>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
          <div className='bg-white rounded-lg shadow-lg w-full max-w-md mx-auto'>
            <div className='flex justify-between items-center p-4 border-b border-gray-200'>
              <h3 className='text-lg font-semibold text-gray-900'>
                Delete Category
              </h3>
              <button
                onClick={() => setShowDeleteModal(false)}
                className='text-gray-400 hover:text-gray-500 focus:outline-none'
              >
                <svg
                  className='h-6 w-6'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M6 18L18 6M6 6l12 12'
                  />
                </svg>
              </button>
            </div>
            <div className='p-4'>
              <p className='text-gray-700'>
                Are you sure you want to delete the category "
                {currentCategory?.name}"? This action cannot be undone.
              </p>
            </div>
            <div className='flex justify-end space-x-3 p-4 border-t border-gray-200'>
              <button
                onClick={() => setShowDeleteModal(false)}
                className='px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteCategory}
                disabled={loading}
                className='px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed'
              >
                {loading ? (
                  <div className='flex items-center'>
                    <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2'></div>
                    Deleting...
                  </div>
                ) : (
                  'Delete'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast.show && (
        <div
          className={`fixed bottom-4 right-4 px-4 py-2 rounded-md shadow-lg z-50 ${
            toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'
          } text-white`}
          style={{ animation: 'fadeIn 0.3s, fadeOut 0.3s 2.7s' }}
        >
          <p>{toast.message}</p>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fadeOut {
          from {
            opacity: 1;
            transform: translateY(0);
          }
          to {
            opacity: 0;
            transform: translateY(20px);
          }
        }
      `}</style>
    </div>
  );
}
