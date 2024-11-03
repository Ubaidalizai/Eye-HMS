import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

export function PrescriptionDetail() {
  const { prescriptionId, patientId } = useParams();
  const navigate = useNavigate();
  const [prescription, setPrescription] = useState(null);

  useEffect(() => {
    // Fetch prescription details from the backend
    const fetchPrescription = async () => {
      try {
        const response = await axios.get(
          `http://127.0.0.1:4000/api/v1/prescriptions/prescription/${prescriptionId}`
        );
        console.log(response.data.data);
        setPrescription(response.data.data);
      } catch (error) {
        console.error('Error fetching prescription:', error);
      }
    };

    fetchPrescription();
  }, [prescriptionId]);

  const handleDelete = async () => {
    try {
      await axios.delete(
        `http://127.0.0.1:4000/api/v1/prescriptions/prescription/${prescriptionId}`
      );
      console.log('Prescription deleted successfully');
      navigate('/patients/1/prescriptions'); // Redirect to prescription list
    } catch (error) {
      console.error('Error deleting prescription:', error);
    }
  };

  const handleUpdate = async (updatedData) => {
    try {
      const response = await axios.patch(
        `http://127.0.0.1:4000/api/v1/prescriptions/prescription/${prescriptionId}`,
        updatedData
      );
      setPrescription(response.data.data); // Update state with new prescription data
      console.log('Prescription updated successfully');
    } catch (error) {
      console.error('Error updating prescription:', error);
    }
  };

  if (!prescription) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1 className='text-2xl font-semibold mb-4'>Prescription Details</h1>
      <div className='bg-white shadow overflow-hidden sm:rounded-lg'>
        <div className='px-4 py-5 sm:px-6'>
          <h3 className='text-lg leading-6 font-medium text-gray-900'>
            Prescription Information
          </h3>
          <p className='mt-1 max-w-2xl text-sm text-gray-500'>
            Details and measurements.
          </p>
        </div>
        <div className='border-t border-gray-200 px-4 py-5 sm:p-0'>
          <dl className='sm:divide-y sm:divide-gray-200'>
            <div className='py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6'>
              <dt className='text-sm font-medium text-gray-500'>Date</dt>
              <dd className='mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2'>
                {prescription.date}
              </dd>
            </div>
            <div className='py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6'>
              <dt className='text-sm font-medium text-gray-500'>Doctor</dt>
              <dd className='mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2'>
                {prescription.doctor}
              </dd>
            </div>
            <div className='py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6'>
              <dt className='text-sm font-medium text-gray-500'>Right Eye</dt>
              <dd className='mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2'>
                Sphere: {prescription.rightEye.sphere}, Cylinder:{' '}
                {prescription.rightEye.cylinder}, Axis:{' '}
                {prescription.rightEye.axis}
              </dd>
            </div>
            <div className='py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6'>
              <dt className='text-sm font-medium text-gray-500'>Left Eye</dt>
              <dd className='mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2'>
                Sphere: {prescription.leftEye.sphere}, Cylinder:{' '}
                {prescription.leftEye.cylinder}, Axis:{' '}
                {prescription.leftEye.axis}
              </dd>
            </div>
            <div className='py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6'>
              <dt className='text-sm font-medium text-gray-500'>PD Distance</dt>
              <dd className='mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2'>
                {prescription.pdDistance}
              </dd>
            </div>
            <div className='py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6'>
              <dt className='text-sm font-medium text-gray-500'>PD Near</dt>
              <dd className='mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2'>
                {prescription.pdNear}
              </dd>
            </div>
            <div className='py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6'>
              <dt className='text-sm font-medium text-gray-500'>Add Power</dt>
              <dd className='mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2'>
                {prescription.pdPower}
              </dd>
            </div>
            <div className='py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6'>
              <dt className='text-sm font-medium text-gray-500'>Lens Type</dt>
              <dd className='mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2'>
                {prescription.lensType}
              </dd>
            </div>
          </dl>
        </div>
      </div>
      <div className='mt-4 flex space-x-4'>
        <Link
          to={`/patients/${patientId}/prescriptions/${prescriptionId}/edit`}
          className='inline-block bg-indigo-600 text-white px-4 py-2 rounded'
        >
          Edit
        </Link>
        <button
          onClick={handleDelete}
          className='bg-red-600 text-white px-4 py-2 rounded'
        >
          Delete
        </button>
      </div>
    </div>
  );
}
