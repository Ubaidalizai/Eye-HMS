import React, { useState } from 'react';
import { FaTimes } from 'react-icons/fa';

const FormModal = ({
  title,
  isOpen,
  handleCancel,
  fields,
  fieldValues,
  setFieldValues,
  url, // API endpoint (handles POST for adding and PATCH for editing)
  method, // HTTP method (POST or PATCH)
}) => {
  const [errors, setErrors] = useState({});
  const [submissionStatus, setSubmissionStatus] = useState(null);

  if (!isOpen) return null;

  // Field validation function
  const validateFields = () => {
    const newErrors = {};
    fields.forEach((field) => {
      const value = fieldValues[field.name];
      if (
        (field.type === 'text' ||
          field.type === 'textarea' ||
          field.type === 'email') &&
        (!value || (typeof value === 'string' && !value.trim()))
      ) {
        newErrors[field.name] = `${field.label} is required`;
      } else if (field.type === 'number' && (value == null || value === '')) {
        newErrors[field.name] = `${field.label} is required`;
      } else if ((field.type === 'date' || field.type === 'time') && !value) {
        newErrors[field.name] = `${field.label} is required`;
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0; // Return true if no errors
  };

  // Form submission handler
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!validateFields()) {
      console.error('Validation failed, cannot submit form.');
      return;
    }
    try {
      console.log('Submitting data:', fieldValues);
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(fieldValues),
      });

      if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(`Failed to submit: ${errorMessage}`);
      }

      const result = await response.json();
      console.log(`${method === 'POST' ? 'Created' : 'Updated'}:`, result);

      // Reset form and show success message
      setFieldValues(
        fields.reduce((acc, field) => ({ ...acc, [field.name]: '' }), {})
      );
      setErrors({});
      setSubmissionStatus(
        `Operation record ${
          method === 'POST' ? 'created' : 'updated'
        } successfully!`
      );

      // Close modal after a short delay
      setTimeout(() => {
        setSubmissionStatus(null);
        handleCancel();
      }, 1500);
    } catch (error) {
      console.error('Error submitting data:', error);
      setSubmissionStatus(
        `Failed to ${
          method === 'POST' ? 'create' : 'update'
        } record. Please try again.`
      );
    }
  };

  return (
    <div className='fixed inset-0 bg-gray-800 bg-opacity-50 z-50 flex items-center justify-center'>
      <div className='bg-white p-6 rounded-lg shadow-lg w-full max-w-md h-full max-h-screen flex flex-col overflow-auto'>
        <div className='flex justify-between items-center mb-4'>
          <h2 className='text-xl font-semibold'>{title}</h2>
          <button
            onClick={handleCancel}
            className='text-gray-500 hover:text-red-500'
          >
            <FaTimes size={20} />
          </button>
        </div>
        <form onSubmit={handleFormSubmit} className='space-y-4'>
          {fields.map((field, index) => (
            <div key={index} className='flex flex-col'>
              <label htmlFor={field.name} className='mb-1'>
                {field.label}
              </label>
              <input
                id={field.name}
                name={field.name}
                type={field.type}
                className={`border p-3 rounded w-full focus:outline-none focus:ring transition ${
                  errors[field.name] ? 'border-red-500' : 'border-gray-300'
                }`}
                value={fieldValues[field.name] || ''}
                onChange={(e) =>
                  setFieldValues({
                    ...fieldValues,
                    [field.name]: e.target.value,
                  })
                }
              />
              {errors[field.name] && (
                <span className='text-red-500 text-sm mt-1'>
                  {errors[field.name]}
                </span>
              )}
            </div>
          ))}

          <div className='flex justify-end space-x-4 mt-6'>
            <button
              type='button'
              onClick={handleCancel}
              className='bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition'
            >
              Cancel
            </button>
            <button
              type='submit'
              className='bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition'
            >
              {method === 'POST' ? 'Add' : 'Update'}
            </button>
          </div>
        </form>

        {/* Display submission status */}
        {submissionStatus && (
          <p
            className={`mt-4 text-center ${
              submissionStatus.includes('success')
                ? 'text-green-600'
                : 'text-red-600'
            }`}
          >
            {submissionStatus}
          </p>
        )}
      </div>
    </div>
  );
};

export default FormModal;
