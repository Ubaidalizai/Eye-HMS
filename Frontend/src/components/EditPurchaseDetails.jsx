import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { BASE_URL } from '../config';

function EditPurchaseDetails({ editModalSetting, purchase, handlePageUpdate }) {
  const [formData, setFormData] = useState({
    QuantityPurchased: purchase?.QuantityPurchased || 0,
    date: purchase.date ? purchase.date.split('T')[0] : '',
    expiryDate: purchase?.expiryDate ? purchase.expiryDate.split('T')[0] : '',
    UnitPurchaseAmount: purchase?.UnitPurchaseAmount || 0,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Update form data when purchase prop changes
    if (purchase) {
      setFormData({
        QuantityPurchased: purchase.QuantityPurchased || 0,
        date: purchase.date ? purchase.date.split('T')[0] : '',
        expiryDate: purchase?.expiryDate
          ? purchase.expiryDate.split('T')[0]
          : '',
        UnitPurchaseAmount: purchase.UnitPurchaseAmount || 0,
      });
    }
  }, [purchase]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = { ...formData };

      const response = await fetch(`${BASE_URL}/purchase/${purchase._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        // Try to extract error message from server response
        let errorMsg = 'Failed to update purchase.';
        try {
          const errorData = await response.json();
          errorMsg = errorData.message || errorMsg;
        } catch (err) {
          // If response is not JSON (e.g. HTML error page), use fallback
          errorMsg = (await response.text()) || errorMsg;
        }
        throw new Error(errorMsg);
      }

      toast.success('Purchase updated successfully!');
      handlePageUpdate();
      editModalSetting();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className='fixed inset-0 z-50 overflow-auto bg-black bg-opacity-50 flex items-center justify-center'>
      <div className='bg-white rounded-lg p-8 max-w-md w-full'>
        <div className='flex justify-between items-center mb-6'>
          <h2 className='text-xl font-semibold'>
            Edit{' '}
            <span className='text-blue-700'>{purchase.ProductID.name}</span>{' '}
            Purchase
          </h2>
          <button
            onClick={editModalSetting}
            className='text-gray-500 hover:text-gray-700'
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className='mb-4'>
            <label className='block text-gray-700 text-sm font-bold mb-2'>
              Quantity Purchased
            </label>
            <input
              type='number'
              name='QuantityPurchased'
              value={formData.QuantityPurchased}
              onChange={handleChange}
              className='shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline'
              required
              min='1'
            />
          </div>

          <div className='mb-4'>
            <label className='block text-gray-700 text-sm font-bold mb-2'>
              Purchase Date
            </label>
            <input
              type='date'
              name='date'
              value={formData.date}
              onChange={handleChange}
              className='shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline'
              required
            />
          </div>
          <div className='mb-4'>
            <label className='block text-gray-700 text-sm font-bold mb-2'>
              Purchase Expiry Date
            </label>
            <input
              type='date'
              name='expiryDate'
              value={formData.expiryDate}
              onChange={handleChange}
              className='shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline'
              required
            />
          </div>

          <div className='mb-4'>
            <label className='block text-gray-700 text-sm font-bold mb-2'>
              Unit Purchase Amount
            </label>
            <input
              type='number'
              name='UnitPurchaseAmount'
              value={formData.UnitPurchaseAmount}
              onChange={handleChange}
              className='shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline'
              required
              min='1'
              step='1'
            />
          </div>

          <div className='flex items-center justify-end'>
            <button
              type='button'
              onClick={editModalSetting}
              className='bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded mr-2'
            >
              Cancel
            </button>
            <button
              type='submit'
              className='bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline'
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Updating...' : 'Update Purchase'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditPurchaseDetails;
