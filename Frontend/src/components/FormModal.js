import React, { useState } from 'react';
import { FaTimes } from 'react-icons/fa';

const FormModal = ({
  title,
  isOpen,
  handleCancel,
  fields = [], // Default to an empty array
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
      } else if (
        field.type === 'number' &&
        (value == null || value === '' || isNaN(value) || value < 0)
      ) {
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
        credentials: 'include',
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
      <div className='bg-white p-6 rounded-lg shadow-lg max-h-screen flex flex-col overflow-auto'>
        <div className='flex justify-between items-center mb-4'>
          <h2 className='text-xl font-semibold'>{title}</h2>
          <button
            onClick={handleCancel}
            className='text-gray-500 hover:text-red-500'
          >
            <FaTimes size={20} />
          </button>
        </div>
        <form onSubmit={handleFormSubmit} className='grid grid-cols-2 gap-4'>
          {Array.isArray(fields) &&
            fields.map((field, index) => (
              <div key={index} className='flex flex-col'>
                <label htmlFor={field.name} className='mb-1'>
                  {field.label}
                </label>
                {field.type === 'select' ? (
                  <select
                    id={field.name}
                    name={field.name}
                    className={`border rounded w-48 h-10 focus:outline-none focus:ring transition ${
                      errors[field.name] ? 'border-red-500' : 'border-gray-300'
                    }`}
                    value={fieldValues[field.name] || ''}
                    onChange={(e) =>
                      setFieldValues({
                        ...fieldValues,
                        [field.name]: e.target.value,
                      })
                    }
                  >
                    <option value='' disabled>
                      Select {field.label}
                    </option>
                    {field.options?.map((option, idx) => (
                      <option key={idx} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    id={field.name}
                    name={field.name}
                    type={field.type}
                    className={`border rounded w-48 h-10 focus:outline-none focus:ring transition ${
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
                )}
                {errors[field.name] && (
                  <span className='text-red-500 text-sm mt-1'>
                    {errors[field.name]}
                  </span>
                )}
              </div>
            ))}

          <div className='flex justify-end col-span-2 gap-2 mt-6'>
            <button
              type='button'
              onClick={handleCancel}
              className='inline-flex items-center px-3 py-1 border border-transparent text-sm mr-0 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none  focus:ring-2 focus:ring-offset-2 focus:ring-red-500'
            >
              Cancel
            </button>
            <button
              type='submit'
              className='inline-flex items-center px-2 py-1 border border-transparent text-sm mr-0 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none  focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
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
