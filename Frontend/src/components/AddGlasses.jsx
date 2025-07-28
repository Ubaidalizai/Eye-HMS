import React, { useState } from 'react';
import 'react-toastify/dist/ReactToastify.css';
import { BASE_URL } from '../config';

const AddGlasses = ({ handleUpdatePage, onClose }) => {
  const [isAddButtonDisabled, setIsAddButtonDisabled] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    manufacturer: '',
    minLevel: '',
    quantity: '',
    category: '',
    purchasePrice: '',
  });

  const handleAddProduct = async (e) => {
    e.preventDefault();
    setIsAddButtonDisabled(true);

    try {
      const response = await fetch(`${BASE_URL}/glasses`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProduct),
      });

      if (!response.ok) {
        let errorMessage = 'Failed to add product';
        try {
          const errorResponse = await response.json();
          errorMessage = errorResponse.message || errorMessage;
        } catch {
          errorMessage = await response.text();
        }
        throw new Error(errorMessage);
      }

      await response.json();

      setNewProduct({
        name: '',
        manufacturer: '',
        minLevel: '',
        quantity: '',
        category: '',
        purchasePrice: '',
      });

      handleUpdatePage();
      onClose(); // Close the modal
    } catch (error) {
      console.error('Error saving item:', error.message);
    } finally {
      setIsAddButtonDisabled(false);
    }
  };

  return (
    <div className='fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full p-4 sm:p-0 z-50'>
      <div className='relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white'>
        <h3 className='text-lg leading-6 font-medium text-gray-900'>
          Add New Product
        </h3>
        <form onSubmit={handleAddProduct} className='mt-2 text-left'>
          <div className='grid grid-cols-1 gap-2'>
            <input
              type='text'
              placeholder='Product Name'
              value={newProduct.name}
              onChange={(e) =>
                setNewProduct({ ...newProduct, name: e.target.value })
              }
              className='mt-2 p-2 w-full border rounded'
              required
            />
            <input
              type='text'
              placeholder='Manufacturer'
              value={newProduct.manufacturer}
              onChange={(e) =>
                setNewProduct({ ...newProduct, manufacturer: e.target.value })
              }
              className='mt-2 p-2 w-full border rounded'
            />
            <input
              type='number'
              placeholder='Min Level'
              value={newProduct.minLevel}
              onChange={(e) =>
                setNewProduct({ ...newProduct, minLevel: e.target.value })
              }
              className='mt-2 p-2 w-full border rounded'
              min={1}
            />
            <select
              value={newProduct.category}
              onChange={(e) =>
                setNewProduct({ ...newProduct, category: e.target.value })
              }
              className='mt-2 p-2 w-full border rounded'
              required
            >
              <option value='' disabled>
                Select a category
              </option>
              <option value='sunglasses'>sunglasses</option>
              <option value='glass'>glass</option>
              <option value='frame'>Frame</option>
            </select>
          </div>
          <div className='flex items-center justify-end gap-2 mt-10'>
            <button
              type='button'
              onClick={onClose}
              className='px-3 py-1 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md'
            >
              Cancel
            </button>

            <button
              type='submit'
              disabled={isAddButtonDisabled}
              className={`px-3 py-1 text-sm font-medium text-white rounded-md ${
                isAddButtonDisabled
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700'
              }`}
            >
              Add Product
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddGlasses;
