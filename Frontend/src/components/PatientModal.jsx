import React, { useState } from "react";
import Modal from "react-modal";
import { XIcon } from "@heroicons/react/outline";

const PatientModal = ({
  isOpen,
  onRequestClose,
  onSubmit,
  patientData,
  handleChange,
}) => {
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    let formErrors = {};
    if (!patientData.name.trim()) formErrors.name = "Name is required";
    if (!patientData.dob) formErrors.dob = "Date of Birth is required";
    if (!patientData.contact.trim()) formErrors.contact = "Contact is required";
    setErrors(formErrors);
    return Object.keys(formErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(e);
    }
  };

  const handleInputChange = (e) => {
    handleChange(e);
    // Clear error when user starts typing
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: "" });
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      className='fixed inset-0 flex items-center justify-center'
      overlayClassName='fixed inset-0 bg-black bg-opacity-50'
    >
      <div className='bg-white rounded-lg p-8 max-w-md w-full'>
        <div className='flex justify-between items-center mb-6'>
          <h2 className='text-2xl font-semibold text-gray-800'>
            Register Patient
          </h2>
          <button
            onClick={onRequestClose}
            className='text-gray-500 hover:text-gray-700 transition-colors'
          >
            <XIcon className='h-6 w-6' />
          </button>
        </div>
        <form onSubmit={handleSubmit} className='space-y-4'>
          <div>
            <label
              htmlFor='name'
              className='block text-sm font-medium text-gray-700'
            >
              Patient Name
            </label>
            <input
              type='text'
              id='name'
              name='name'
              value={patientData.name}
              onChange={handleInputChange}
              className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                errors.name ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.name && (
              <p className='mt-1 text-sm text-red-600'>{errors.name}</p>
            )}
          </div>
          <div>
            <label
              htmlFor='dob'
              className='block text-sm font-medium text-gray-700'
            >
              Date of Birth
            </label>
            <input
              type='date'
              id='dob'
              name='dob'
              value={patientData.dob}
              onChange={handleInputChange}
              className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                errors.dob ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.dob && (
              <p className='mt-1 text-sm text-red-600'>{errors.dob}</p>
            )}
          </div>
          <div>
            <label
              htmlFor='contact'
              className='block text-sm font-medium text-gray-700'
            >
              Contact
            </label>
            <input
              type='text'
              id='contact'
              name='contact'
              value={patientData.contact}
              onChange={handleInputChange}
              className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                errors.contact ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.contact && (
              <p className='mt-1 text-sm text-red-600'>{errors.contact}</p>
            )}
          </div>
          <div>
            <label
              htmlFor='insurance'
              className='block text-sm font-medium text-gray-700'
            >
              Insurance
            </label>
            <input
              type='text'
              id='insurance'
              name='insurance'
              value={patientData.insurance}
              onChange={handleInputChange}
              className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
            />
          </div>
          <div className='flex justify-end space-x-3 mt-6'>
            <button
              type='button'
              onClick={onRequestClose}
              className='px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
            >
              Cancel
            </button>
            <button
              type='submit'
              className='px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default PatientModal;
