import React, { useState, useEffect } from 'react';
import { FaEdit, FaTrash } from 'react-icons/fa';

const BASE_URL = 'http://localhost:4000/api/v1'; // Replace with actual API

const OperationTypeManagement = () => {
  const [operationTypes, setOperationTypes] = useState([]);
  const [formData, setFormData] = useState({ name: '', type: '', price: '' });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchOperationTypes();
  }, []);

  //Fetch all active operation types
  const fetchOperationTypes = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/operation-types`, {
        credentials: 'include',
      });
      const data = await response.json();
      setOperationTypes(data.data);
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
    <div className='p-6 bg-white rounded-lg border mb-10'>
      <h2 className='text-xl font-semibold mb-8 text-gray-600'>
        Operation Biscayne OCT Price Bedroom type Management
      </h2>

      {/* Add / Edit Form */}
      <form
        onSubmit={handleSubmit}
        className='flex justify-start space-x-4 items-center'
      >
        <input
          type='text'
          name='name'
          required
          placeholder='Name'
          value={formData.name}
          onChange={handleChange}
          className='p-2 border border-gray-300 rounded'
        />
        <select
          type='text'
          name='type'
          required
          value={formData.type}
          onChange={handleChange}
          className='p-2 w-52 border border-gray-300 rounded'
        >
          <option value='' disabled>
            Type
          </option>
          <option value='operation'>Operation</option>
          <option value='oct'>OCT</option>
          <option value='biscayne'>Biscayne</option>
          <option value='bedroom'>Bedroom</option>
        </select>
        <input
          type='number'
          name='price'
          required
          placeholder='Price'
          value={formData.price}
          onChange={handleChange}
          className='p-2 border border-gray-300 rounded'
          min='0'
        />
        <button
          type='submit'
          className='bg-blue-600 text-white py-2 px-4 rounded'
        >
          {editingId ? 'Update' : 'Add'} Operation Type
        </button>
      </form>

      {/* Display Existing Operation Types */}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className='w-full mt-6 border-collapse border border-gray-300 text-center'>
          <thead className='bg-gray-200'>
            <tr>
              <th className='border px-4 py-2'>Name</th>
              <th className='border px-4 py-2'>Type</th>
              <th className='border px-4 py-2'>Price</th>
              <th className='border px-4 py-2'>Actions</th>
            </tr>
          </thead>
          <tbody>
            {operationTypes.map((type) => (
              <tr key={type._id} className='border-t'>
                <td className='border px-4 py-2'>{type.name}</td>
                <td className='border px-4 py-2'>{type.type}</td>
                <td className='border px-4 py-2'>{type.price}</td>
                <td className='border px-4 py-2'>
                  <button
                    onClick={() => handleEdit(type)}
                    className='text-blue-500 mr-2'
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDelete(type._id)}
                    className='text-red-500'
                  >
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default OperationTypeManagement;
