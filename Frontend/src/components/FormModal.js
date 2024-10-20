// components/FormModal.js
import React from "react";
import { FaTimes } from "react-icons/fa";

const FormModal = ({
  title,
  isOpen,
  handleSubmit,
  handleCancel,
  fields,
  fieldValues,
  setFieldValues,
}) => {
  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 bg-gray-800 bg-opacity-50 z-50 flex items-center justify-center'>
      <div className='bg-white p-6 rounded-lg shadow-lg w-full max-w-md h-full max-h-screen flex flex-col overflow-auto z-60'>
        <h2 className='text-xl font-semibold mb-6 text-center'>{title}</h2>
        <form onSubmit={handleSubmit} className='space-y-4'>
          {fields.map((field, index) => (
            <div key={index}>
              <label className='block text-sm font-medium'>
                {field.label}:
              </label>
              <input
                type={field.type}
                className='border border-gray-300 p-3 rounded w-full focus:outline-none focus:ring focus:ring-blue-300 transition'
                value={fieldValues[field.name]}
                onChange={(e) =>
                  setFieldValues({
                    ...fieldValues,
                    [field.name]: e.target.value,
                  })
                }
              />
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
      </div>
    </div>
  );
};

export default FormModal;
