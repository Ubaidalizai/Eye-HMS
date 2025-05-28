'use client';
import { useAuth } from '../AuthContext';
import Select from 'react-select';

const AddExpense = ({
  isOpen,
  onClose,
  onSubmit,
  newExpense,
  handleChange,
  isSubmitting,
}) => {
  const { categories } = useAuth();

  // Convert categories to the format expected by React Select
  const categoryOptions =
    categories?.map((category) => ({
      value: category.name,
      label: category.name,
    })) || [];

  // Custom handler for React Select
  const handleCategoryChange = (selectedOption) => {
    // Create a synthetic event object that mimics the structure expected by handleChange
    const event = {
      target: {
        name: 'category',
        value: selectedOption ? selectedOption.value : '',
      },
    };
    handleChange(event);
  };

  // Find the currently selected option
  const selectedCategory =
    categoryOptions.find((option) => option.value === newExpense.category) ||
    null;

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 sm:p-0 z-50'>
      <div className='bg-white rounded-lg shadow-xl w-full max-w-md'>
        <div className='flex justify-between items-center border-b px-6 py-4'>
          <h3 className='text-lg sm:text-xl font-semibold text-gray-800'>
            {newExpense._id ? 'Edit Expense' : 'Add Expense'}
          </h3>
          <button
            type='button'
            onClick={onClose}
            className='text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-md'
            disabled={isSubmitting}
          >
            <span className='sr-only'>Close</span>
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

        <form onSubmit={onSubmit} className='px-6 py-4'>
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
            <div>
              <label
                htmlFor='amount'
                className='block text-sm font-medium text-gray-700 mb-1'
              >
                Amount
              </label>
              <input
                type='number'
                name='amount'
                id='amount'
                placeholder='Enter Amount'
                className='w-full h-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm'
                value={newExpense.amount}
                onChange={handleChange}
                required
                min='1'
              />
            </div>

            <div>
              <label
                htmlFor='date'
                className='block text-sm font-medium text-gray-700 mb-1'
              >
                Date
              </label>
              <input
                type='date'
                name='date'
                id='date'
                className='w-full h-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm'
                value={newExpense.date ? newExpense.date.split('T')[0] : ''}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label
                htmlFor='reason'
                className='block text-sm font-medium text-gray-700 mb-1'
              >
                Reason
              </label>
              <input
                type='text'
                name='reason'
                id='reason'
                placeholder='Enter Reason'
                className='w-full h-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm'
                value={newExpense.reason}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label
                htmlFor='category'
                className='block text-sm font-medium text-gray-700 mb-1'
              >
                Category
              </label>
              <Select
                id='category'
                name='category'
                options={categoryOptions}
                value={selectedCategory}
                onChange={handleCategoryChange}
                placeholder='Select Category'
                isClearable
                className='react-select-container'
                classNamePrefix='react-select'
                styles={{
                  control: (base) => ({
                    ...base,
                    minHeight: '40px',
                  }),
                }}
                required
              />
            </div>
          </div>
        </form>

        <div className='px-6 py-4 bg-gray-50 flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-3 border-t'>
          <button
            type='button'
            onClick={onClose}
            className='mt-3 sm:mt-0 inline-flex justify-center items-center px-4 py-2 h-10 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors'
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type='button'
            onClick={onSubmit}
            className={`inline-flex justify-center items-center px-4 py-2 h-10 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
              isSubmitting
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors'
            }`}
            disabled={isSubmitting}
          >
            {isSubmitting
              ? 'Processing...'
              : newExpense._id
              ? 'Update Expense'
              : 'Add Expense'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddExpense;
