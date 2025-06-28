import { useState, useEffect } from 'react';
import { FaEdit, FaTrash } from 'react-icons/fa';
import Pagination from "./Pagination.jsx";

import { BASE_URL } from '../config';

const OperationTypeManagement = () => {
  const [operationTypes, setOperationTypes] = useState([]);
  const [formData, setFormData] = useState({ name: '', type: '', price: '' });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isAddButtonDisabled, setIsAddButtonDisabled] = useState(false);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchOperationTypes();
  }, [limit, currentPage]);

  //Fetch all active operation types
  const fetchOperationTypes = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${BASE_URL}/operation-types?page=${currentPage}&limit=${limit}`,
        {
          credentials: 'include',
        }
      );
      const data = await response.json();
      setOperationTypes(data.data);
      setTotalPages(data.totalPages || Math.ceil(data.results / limit));
    } catch (error) {
      console.error('Error fetching operation types:', error);
    } finally {
      setLoading(false);
    }
  };

  //Handle form input change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  //Create or Update an operation type
  const handleSubmit = async (e) => {
    e.preventDefault();

    setIsAddButtonDisabled(true);

    if (!formData.name || !formData.type || !formData.price) {
      alert('Please fill all fields');
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

      if (!response.ok) throw new Error('Failed to save operation type');

      setFormData({ name: '', type: '', price: '' });
      setEditingId(null);
      fetchOperationTypes();
    } catch (error) {
      console.error('Error saving operation type:', error);
    } finally {
      setIsAddButtonDisabled(false);
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

      if (!response.ok) throw new Error('Failed to delete operation type');

      fetchOperationTypes();
    } catch (error) {
      console.error('Error deleting operation type:', error);
    }
  };

  //Set form fields for editing
  const handleEdit = (type) => {
    setFormData({ name: type.name, type: type.type, price: type.price });
    setEditingId(type._id);
  };

  return (
    <div className='p-4 sm:p-6 bg-white rounded-lg border shadow-sm mb-10'>
      <h2 className='text-lg sm:text-xl font-semibold mb-6 text-gray-600'>
        Operation Type Management
      </h2>

      {/* Add / Edit Form */}
      <form
        onSubmit={handleSubmit}
        className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3'
      >
        <div>
          <label
            htmlFor='name'
            className='block text-sm font-medium text-gray-700 mb-1'
          >
            Name
          </label>
          <input
            id='name'
            type='text'
            name='name'
            required
            placeholder='Name'
            value={formData.name}
            onChange={handleChange}
            className='p-2 border border-gray-300 rounded-md w-full focus:ring-blue-500 focus:border-blue-500'
          />
        </div>

        <div>
          <label
            htmlFor='type'
            className='block text-sm font-medium text-gray-700 mb-1'
          >
            Type
          </label>
          <select
            id='type'
            name='type'
            required
            value={formData.type}
            onChange={handleChange}
            className='p-2 border border-gray-300 rounded-md w-full focus:ring-blue-500 focus:border-blue-500'
          >
            <option value='' disabled>
              Select Type
            </option>
            <option value='operation'>Operation</option>
            <option value='oct'>OCT</option>
            <option value='biscayne'>Biscayne</option>
            <option value='bedroom'>Bedroom</option>
            <option value='perimetry'>Perimetry</option>
            <option value='FA'>FA</option>
            <option value='PRP'>Prp</option>
          </select>
        </div>

        <div>
          <label
            htmlFor='price'
            className='block text-sm font-medium text-gray-700 mb-1'
          >
            Price
          </label>
          <input
            id='price'
            type='number'
            name='price'
            required
            placeholder='Price'
            value={formData.price}
            onChange={handleChange}
            className='p-2 border border-gray-300 rounded-md w-full focus:ring-blue-500 focus:border-blue-500'
            min='0'
          />
        </div>

        <div className='flex items-end'>
          <button
            type='submit'
            className={`w-full bg-blue-600 text-white py-2 px-4 rounded-md transition-colors ${
              isAddButtonDisabled
                ? 'bg-gray-400 cursor-not-allowed'
                : 'hover:bg-blue-700'
            }`}
            disabled={isAddButtonDisabled}
          >
            {editingId ? 'Update' : 'Add'}
          </button>
        </div>
      </form>

      {/* Display Existing Operation Types */}
      {loading ? (
        <div className='flex justify-center items-center py-10'>
          <div className='animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500'></div>
          <p className='ml-3 text-gray-600'>Loading...</p>
        </div>
      ) : (
        <>
          {/* Table with horizontal scrolling for all screen sizes */}
          <div className='overflow-x-auto shadow-sm rounded-lg mt-6'>
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
                        {type.type}
                      </td>
                      <td className='px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                        {type.price}
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
    </div>
  );
};

export default OperationTypeManagement;
