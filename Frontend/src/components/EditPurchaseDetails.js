import React, { useState, useEffect } from "react";
import { FaTimes } from "react-icons/fa";

function EditPurchaseDetails({ purchase, products, onUpdate, onClose }) {
  const [editedPurchase, setEditedPurchase] = useState(purchase);

  useEffect(() => {
    setEditedPurchase(purchase);
  }, [purchase]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedPurchase((prev) => ({ ...prev, [name]: Number(value) }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate(editedPurchase); // Calls handleEditSubmit with the edited purchase
  };

  return (
    <div
      className='fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full'
      aria-labelledby='modal-title'
      role='dialog'
      aria-modal='true'
    >
      <div className='relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white'>
        <div className='mt-3 text-center'>
          <h3
            className='text-lg font-medium leading-6 text-gray-900'
            id='modal-title'
          >
            Edit Purchase
          </h3>
          <form onSubmit={handleSubmit} className='mt-2 text-left'>
            <div className='mb-4'>
              <label
                htmlFor='QuantityPurchased'
                className='block text-sm font-medium text-gray-700'
              >
                Quantity
              </label>
              <input
                type='number'
                id='QuantityPurchased'
                name='QuantityPurchased'
                value={editedPurchase.QuantityPurchased}
                onChange={handleChange}
                className='mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'
                min='1'
                required
              />
            </div>
            <div className='mb-4'>
              <label
                htmlFor='UnitPurchaseAmount'
                className='block text-sm font-medium text-gray-700'
              >
                Unit Purchase Amount
              </label>
              <input
                type='number'
                id='UnitPurchaseAmount'
                name='UnitPurchaseAmount'
                value={editedPurchase.UnitPurchaseAmount}
                onChange={handleChange}
                className='mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'
                min='0'
                step='0.01'
                required
              />
            </div>

            <div className='flex items-center justify-between mt-4'>
              <button
                type='submit'
                className='inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
              >
                Update Purchase
              </button>
              <button
                type='button'
                onClick={onClose}
                className='inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default EditPurchaseDetails;
