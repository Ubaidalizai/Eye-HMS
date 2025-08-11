import React, { useState } from 'react';
import { FaTimes } from 'react-icons/fa';
import ScrollableSelect from './ScrollableSelect.jsx';

const FormModal = ({
  title,
  isOpen,
  handleCancel,
  fields = [],
  fieldValues,
  setFieldValues,
  url,
  method,
  fetchData,
}) => {
  const [errors, setErrors] = useState({});
  const [submissionStatus, setSubmissionStatus] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      } else if (
        (field.type === 'date' ||
          field.type === 'time' ||
          field.type === 'select') &&
        !value
      ) {
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

    setIsSubmitting(true); // Set submitting state to true
    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(fieldValues),
      });

      if (!response.ok) {
        // Attempt to parse backend error as JSON
        let errorMessage = 'An unexpected error occurred.';
        try {
          const errorResponse = await response.json();
          errorMessage = errorResponse.message || errorMessage;
        } catch {
          errorMessage = await response.text(); // Fallback to plain text
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
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

      if (fetchData) fetchData();

      // Close modal after a short delay
      setTimeout(() => {
        setSubmissionStatus(null);
        handleCancel();
      }, 300);
    } catch (error) {
      console.error('Error submitting data:', error.message);
      setSubmissionStatus(
        error.message || 'An error occurred. Please try again.'
      );
    } finally {
      setIsSubmitting(false); // Reset submitting state
    }
  };

  return (
    <div className='fixed inset-0 bg-gray-800 bg-opacity-50 z-50 flex items-center justify-center p-4'>
      <div className='bg-white p-4 sm:p-6 rounded-lg shadow-lg max-h-[90vh] w-full max-w-lg overflow-auto'>
        <div className='flex justify-between items-center mb-4'>
          <h2 className='text-lg sm:text-xl font-semibold'>{title}</h2>
          <button
            onClick={handleCancel}
            className='text-gray-500 hover:text-red-500'
          >
            <FaTimes size={20} />
          </button>
        </div>
        <form onSubmit={handleFormSubmit} className='space-y-4'>
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
            {Array.isArray(fields) &&
              fields.map((field, index) => (
                <div key={index} className='flex flex-col'>
                  <label
                    htmlFor={field.name}
                    className='mb-1 text-sm font-medium'
                  >
                    {field.label}
                  </label>
                  {field.type === 'select' ? (
                    <ScrollableSelect
                      id={field.name}
                      name={field.name}
                      value={fieldValues[field.name] || ''}
                      onChange={(e) =>
                        setFieldValues({
                          ...fieldValues,
                          [field.name]: e.target.value,
                        })
                      }
                      options={field.options || []}
                      placeholder={`Select ${field.label}`}
                      error={!!errors[field.name]}
                      maxHeight="200px"
                    />
                  ) : (
                    <input
                      id={field.name}
                      name={field.name}
                      type={field.type}
                      className={`border rounded w-full h-10 px-3 focus:outline-none focus:ring transition ${
                        errors[field.name]
                          ? 'border-red-500'
                          : 'border-gray-300'
                      }`}
                      value={fieldValues[field.name]}
                      onChange={(e) =>
                        setFieldValues({
                          ...fieldValues,
                          [field.name]: e.target.value,
                        })
                      }
                      min='0'
                    />
                  )}
                  {errors[field.name] && (
                    <span className='text-red-500 text-xs mt-1'>
                      {errors[field.name]}
                    </span>
                  )}
                </div>
              ))}
          </div>

          <div className='flex justify-end gap-2 mt-6'>
            <button
              type='button'
              onClick={handleCancel}
              className='inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500'
            >
              Cancel
            </button>
            <button
              type='submit'
              className='inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
              disabled={isSubmitting}
            >
              {isSubmitting
                ? 'Submitting...'
                : method === 'POST'
                ? 'Add'
                : 'Update'}
            </button>
          </div>
        </form>

        {/* Display submission status */}
        {submissionStatus && (
          <p
            className={`mt-4 text-center text-sm ${
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
