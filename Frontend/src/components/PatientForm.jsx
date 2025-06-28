import React, { useState } from "react";

export default function PatientForm({
  patientData,
  handlePatientChange,
  handlePatientSubmit,
  isEditing,
}) {
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    let formErrors = {};
    if (!patientData.name.trim()) formErrors.name = "Name is required";
    if (!patientData.age) formErrors.age = "Age is required";
    else if (patientData.age <= 0)
      formErrors.age = "Age must be a positive number";
    if (!patientData.contact.trim())
      formErrors.contact = "Contact details are required";
    if (!patientData.patientID.trim())
      formErrors.patientID = "Patient ID is required";
    if (!patientData.patientGender)
      formErrors.patientGender = "Gender is required";
    setErrors(formErrors);
    return Object.keys(formErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      handlePatientSubmit(e);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    handlePatientChange(e);
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  return (
    <form
      className='mb-8 p-6 grid md:grid-cols-2 gap-x-4 bg-white rounded-lg max-w-md mx-auto'
      onSubmit={handleSubmit}
    >
      <div className='mb-4'>
        <label className='block mb-2 text-sm font-medium'>Name:</label>
        <input
          type='text'
          name='name'
          value={patientData.name}
          onChange={handleChange}
          className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.name ? "border-red-500" : "border-gray-300"
          }`}
        />
        {errors.name && (
          <p className='text-red-500 text-xs mt-1'>{errors.name}</p>
        )}
      </div>

      <div className='mb-4'>
        <label className='block mb-2 text-sm font-medium'>Age:</label>
        <input
          type='number'
          name='age'
          value={patientData.age}
          onChange={handleChange}
          min='1'
          className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.age ? "border-red-500" : "border-gray-300"
          }`}
        />
        {errors.age && (
          <p className='text-red-500 text-xs mt-1'>{errors.age}</p>
        )}
      </div>

      <div className='mb-4'>
        <label className='block mb-2 text-sm font-medium'>
          Contact Details:
        </label>
        <input
          type='text'
          name='contact'
          value={patientData.contact}
          onChange={handleChange}
          className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.contact ? "border-red-500" : "border-gray-300"
          }`}
        />
        {errors.contact && (
          <p className='text-red-500 text-xs mt-1'>{errors.contact}</p>
        )}
      </div>

      <div className='mb-4'>
        <label className='block mb-2 text-sm font-medium'>Patient ID:</label>
        <input
          type='text'
          name='patientID'
          value={patientData.patientID}
          onChange={handleChange}
          className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.patientID ? "border-red-500" : "border-gray-300"
          }`}
        />
        {errors.patientID && (
          <p className='text-red-500 text-xs mt-1'>{errors.patientID}</p>
        )}
      </div>

      <div className='mb-4'>
        <label className='block mb-2 text-sm font-medium'>
          Patient Gender:
        </label>
        <select
          name='patientGender'
          value={patientData.patientGender}
          onChange={handleChange}
          className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.patientGender ? "border-red-500" : "border-gray-300"
          }`}
        >
          <option value=''>Select Gender</option>
          <option value='Male'>Male</option>
          <option value='Female'>Female</option>
          <option value='Other'>Other</option>
        </select>
        {errors.patientGender && (
          <p className='text-red-500 text-xs mt-1'>{errors.patientGender}</p>
        )}
      </div>

      <div className='mb-4'>
        <label className='block mb-2 text-sm font-medium'>
          Insurance Information:
        </label>
        <input
          type='text'
          name='insuranceContact'
          value={patientData.insuranceContact}
          onChange={handleChange}
          className='w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
        />
      </div>

      <button
        type='submit'
        className='w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200'
      >
        {isEditing ? "Update Patient" : "Register Patient"}
      </button>
    </form>
  );
}
