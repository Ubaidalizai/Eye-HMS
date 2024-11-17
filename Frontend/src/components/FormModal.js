import React, { useState } from 'react';
import { FaTimes } from 'react-icons/fa';

const FormModal = ({
  title,
  isOpen,
  handleCancel,
  fields,
  fieldValues,
  setFieldValues,
}) => {
  const [errors, setErrors] = useState({});
  const [submissionStatus, setSubmissionStatus] = useState(null);

  if (!isOpen) return null;

  const validateFields = () => {
    const newErrors = {};
    fields.forEach((field) => {
      if (!fieldValues[field.name]) {
        newErrors[field.name] = `${field.label} is required`;
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0; // Return true if no errors
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (validateFields()) {
      try {
        // Make the API request to the backend
        const response = await fetch(
          'http://127.0.0.1:4000/api/v1/operation/',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(fieldValues),
          }
        );

        if (!response.ok) {
          throw new Error('Failed to submit data');
        }

        const result = await response.json();
        console.log('Operation Record Created: ', result);

        // Clear the form, close modal, and show success message
        setFieldValues(
          fields.reduce((acc, field) => ({ ...acc, [field.name]: '' }), {})
        );
        setErrors({});
        setSubmissionStatus('Operation record created successfully!');
      } catch (error) {
        console.error('Error submitting data:', error);
        setSubmissionStatus(
          'Failed to create operation record. Please try again.'
        );
      }
    }
  };

  return (
    <div className='fixed inset-0 bg-gray-800 bg-opacity-50 z-50 flex items-center justify-center'>
      <div className='bg-white p-6 rounded-lg shadow-lg w-full max-w-md h-full max-h-screen flex flex-col overflow-auto z-60'>
        <h2 className='text-xl font-semibold mb-6 text-center'>{title}</h2>
        <form onSubmit={handleFormSubmit} className='space-y-4'>
          {fields.map((field, index) => (
            <div key={index} className='flex flex-col'>
              <label className='block text-sm font-medium'>
                {field.label}:
              </label>
              <input
                type={field.type}
                className={`border p-3 rounded w-full focus:outline-none focus:ring transition ${
                  errors[field.name] ? 'border-red-500' : 'border-gray-300'
                }`}
                value={fieldValues[field.name]}
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
              Submit
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
