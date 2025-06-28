import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

export function PrescriptionForm() {
  const { prescriptionId, patientId } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    date: '',
    doctor: '',
    rightEye: { sphere: '', cylinder: '', axis: '' },
    leftEye: { sphere: '', cylinder: '', axis: '' },
    pdDistance: '',
    pdNear: '',
    pdPower: '',
    lensType: '',
  });

  // Debugging to ensure patientId and prescriptionId are present
  useEffect(() => {
    console.log('Patient ID:', patientId);
    console.log('Prescription ID:', prescriptionId);
  }, [patientId, prescriptionId]);

  useEffect(() => {
    if (prescriptionId) {
      axios
        .get(
          `http://127.0.0.1:4000/api/v1/prescriptions/prescription/${prescriptionId}`
        )
        .then((response) => setFormData(response.data.data))
        .catch((error) => console.error('Error fetching prescription:', error));
    }
  }, [prescriptionId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleEyeChange = (eye, field, value) => {
    setFormData((prevData) => ({
      ...prevData,
      [eye]: {
        ...prevData[eye],
        [field]: value,
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (prescriptionId) {
        // Update existing prescription
        const response = await axios.patch(
          `http://localhost:4000/api/v1/prescriptions/prescription/${prescriptionId}`,
          formData
        );
        if (response.status === 200) {
          alert('Prescription updated successfully!');
        }
      } else if (patientId) {
        // Create a new prescription if only patientId exists
        const response = await axios.post(
          `http://127.0.0.1:4000/api/v1/prescriptions/patient/name/${patientId}`,
          formData
        );
        if (response.status === 201) {
          alert('Prescription created successfully!');
        }
      } else {
        throw new Error('Patient ID is missing. Cannot create prescription.');
      }

      // Navigate to prescriptions page for the specific patient
      navigate(`/patients/${patientId}/prescriptions`);
    } catch (error) {
      console.error(
        'Error saving prescription:',
        error.response ? error.response.data.data : error.message
      );
      alert('Error saving prescription. Please try again.');
    }
  };
  return (
    <div>
      <h1 className='text-2xl font-semibold mb-4'>
        {prescriptionId ? 'Edit' : 'Add'} Prescription
      </h1>
      <form onSubmit={handleSubmit} className='space-y-4'>
        {/* Date */}
        <div>
          <label
            htmlFor='date'
            className='block text-sm font-medium text-gray-700'
          >
            Date
          </label>
          <input
            type='date'
            id='date'
            name='date'
            value={formData.date}
            onChange={handleChange}
            className='mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3'
          />
        </div>

        {/* Doctor */}
        <div>
          <label
            htmlFor='doctor'
            className='block text-sm font-medium text-gray-700'
          >
            Doctor
          </label>
          <input
            type='text'
            id='doctor'
            name='doctor'
            value={formData.doctor}
            onChange={handleChange}
            className='mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3'
          />
        </div>

        {/* Right Eye */}
        <div className='grid grid-cols-2 gap-4'>
          <div>
            <h3 className='text-lg font-medium text-gray-900'>Right Eye</h3>
            <div className='mt-2 space-y-2'>
              <input
                type='text'
                placeholder='Sphere'
                value={formData.rightEye.sphere}
                onChange={(e) =>
                  handleEyeChange('rightEye', 'sphere', e.target.value)
                }
                className='block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3'
              />
              <input
                type='text'
                placeholder='Cylinder'
                value={formData.rightEye.cylinder}
                onChange={(e) =>
                  handleEyeChange('rightEye', 'cylinder', e.target.value)
                }
                className='block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3'
              />
              <input
                type='text'
                placeholder='Axis'
                value={formData.rightEye.axis}
                onChange={(e) =>
                  handleEyeChange('rightEye', 'axis', e.target.value)
                }
                className='block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3'
              />
            </div>
          </div>

          {/* Left Eye */}
          <div>
            <h3 className='text-lg font-medium text-gray-900'>Left Eye</h3>
            <div className='mt-2 space-y-2'>
              <input
                type='text'
                placeholder='Sphere'
                value={formData.leftEye.sphere}
                onChange={(e) =>
                  handleEyeChange('leftEye', 'sphere', e.target.value)
                }
                className='block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3'
              />
              <input
                type='text'
                placeholder='Cylinder'
                value={formData.leftEye.cylinder}
                onChange={(e) =>
                  handleEyeChange('leftEye', 'cylinder', e.target.value)
                }
                className='block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3'
              />
              <input
                type='text'
                placeholder='Axis'
                value={formData.leftEye.axis}
                onChange={(e) =>
                  handleEyeChange('leftEye', 'axis', e.target.value)
                }
                className='block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3'
              />
            </div>
          </div>
        </div>

        {/* PD Distance */}
        <div>
          <label
            htmlFor='pdDistance'
            className='block text-sm font-medium text-gray-700'
          >
            PD Distance
          </label>
          <input
            type='text'
            id='pdDistance'
            name='pdDistance'
            value={formData.pdDistance}
            onChange={handleChange}
            className='mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3'
          />
        </div>

        {/* PD Near */}
        <div>
          <label
            htmlFor='pdNear'
            className='block text-sm font-medium text-gray-700'
          >
            PD Near
          </label>
          <input
            type='text'
            id='pdNear'
            name='pdNear'
            value={formData.pdNear}
            onChange={handleChange}
            className='mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3'
          />
        </div>

        {/* Add Power */}
        <div>
          <label
            htmlFor='pdPower'
            className='block text-sm font-medium text-gray-700'
          >
            Add Power
          </label>
          <input
            type='text'
            id='pdPower'
            name='pdPower'
            value={formData.pdPower}
            onChange={handleChange}
            className='mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3'
          />
        </div>

        {/* Lens Type */}
        <div>
          <label
            htmlFor='lensType'
            className='block text-sm font-medium text-gray-700'
          >
            Lens Type
          </label>
          <select
            id='lensType'
            name='lensType'
            value={formData.lensType}
            onChange={handleChange}
            className='mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3'
          >
            <option value=''>Select lens type</option>
            <option value='Single Vision'>Single Vision</option>
            <option value='Bifocal'>Bifocal</option>
            <option value='Progressive'>Progressive</option>
          </select>
        </div>

        {/* Submit Button */}
        <div>
          <button
            type='submit'
            className='w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700'
          >
            {prescriptionId ? 'Update' : 'Add'} Prescription
          </button>
        </div>
      </form>
    </div>
  );
}
