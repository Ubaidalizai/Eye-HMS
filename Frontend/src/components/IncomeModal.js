import React, { useState, useEffect } from 'react';
import Select from 'react-select';

const IncomeModal = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  categories,
  isSubmitting, // Add isSubmitting prop
}) => {
  const [formData, setFormData] = useState(initialData);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setFormData(initialData);
    setErrors({});
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    // Clear the error when the user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const validateForm = () => {
    let newErrors = {};

    if (!formData.totalNetIncome) {
      newErrors.totalNetIncome = 'Total Net Income is required';
    } else if (
      isNaN(formData.totalNetIncome) ||
      Number(formData.totalNetIncome) <= 0
    ) {
      newErrors.totalNetIncome = 'Total Net Income must be a positive number';
    }

    if (!formData.date) {
      newErrors.date = 'Date is required';
    } else {
      const selectedDate = new Date(formData.date);
      const currentDate = new Date();
      if (selectedDate > currentDate) {
        newErrors.date = 'Date cannot be in the future';
      }
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.length > 100) {
      newErrors.description = 'Description must be 100 characters or less';
    }

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  if (!isOpen) return null;

  // Convert to react-select format
  const categoryOptions = categories.map((cat) => ({
    label: cat,
    value: cat,
  }));

  return (
    <div className='fixed inset-0 flex items-center justify-center z-50'>
      <div
        className='overlay absolute inset-0 bg-black opacity-50'
        onClick={onClose}
      ></div>
      <div className='relative bg-white rounded-lg shadow-xl w-full max-w-lg z-60 p-6'>
        <h3 className='text-lg font-semibold mb-4'>
          {formData._id ? 'Edit Income' : 'Add Income'}
        </h3>
        <form onSubmit={handleSubmit}>
          <div className='grid gap-4 mb-4 sm:grid-cols-2'>
            <div>
              <label
                htmlFor='totalNetIncome'
                className='block mb-2 text-sm font-medium text-gray-900'
              >
                Total Net Income
              </label>
              <input
                type='number'
                min='1'
                name='totalNetIncome'
                id='totalNetIncome'
                placeholder='Enter Total Net Income'
                required
                className={`bg-gray-50 border text-gray-900 text-sm rounded-lg w-full p-2.5 ${
                  errors.totalNetIncome ? 'border-red-500' : 'border-gray-300'
                }`}
                value={formData.totalNetIncome}
                onChange={handleChange}
              />
              {errors.totalNetIncome && (
                <p className='mt-1 text-sm text-red-500'>
                  {errors.totalNetIncome}
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor='date'
                className='block mb-2 text-sm font-medium text-gray-900'
              >
                Date
              </label>
              <input
                type='date'
                name='date'
                id='date'
                className={`bg-gray-50 border text-gray-900 text-sm rounded-lg w-full p-2.5 ${
                  errors.date ? 'border-red-500' : 'border-gray-300'
                }`}
                value={formData.date}
                onChange={handleChange}
              />
              {errors.date && (
                <p className='mt-1 text-sm text-red-500'>{errors.date}</p>
              )}
            </div>
            <div>
              <label
                htmlFor='description'
                className='block mb-2 text-sm font-medium text-gray-900'
              >
                Description
              </label>
              <input
                type='text'
                name='description'
                id='description'
                placeholder='Enter Description'
                required
                className={`bg-gray-50 border text-gray-900 text-sm rounded-lg w-full p-2.5 ${
                  errors.description ? 'border-red-500' : 'border-gray-300'
                }`}
                value={formData.description}
                onChange={handleChange}
              />
              {errors.description && (
                <p className='mt-1 text-sm text-red-500'>
                  {errors.description}
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor='category'
                className='block mb-2 text-sm font-medium text-gray-900'
              >
                Category
              </label>
              <Select
                id='category'
                name='category'
                options={categoryOptions}
                value={
                  categoryOptions.find(
                    (option) => option.value === formData.category
                  ) || null
                }
                onChange={(option) => {
                  setFormData({
                    ...formData,
                    category: option ? option.value : '',
                  });
                }}
                placeholder='Select Category'
                isClearable
                className='basic-single'
                classNamePrefix='select'
                required
              />
              {errors.category && (
                <p className='mt-1 text-sm text-red-500'>{errors.category}</p>
              )}
            </div>
          </div>
          <div className='flex items-center justify-end gap-2'>
            <button
              type='button'
              className='inline-flex items-center px-3 py-1 border border-transparent text-sm mr-0 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none  focus:ring-2 focus:ring-offset-2 focus:ring-red-500'
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type='submit'
              className='inline-flex items-center px-2 py-1 border border-transparent text-sm mr-0 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none  focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
              disabled={isSubmitting} // Disable the button when submitting
            >
              {isSubmitting ? 'Submitting...' : formData._id ? 'Update' : 'Add'}{' '}
              Income
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default IncomeModal;
