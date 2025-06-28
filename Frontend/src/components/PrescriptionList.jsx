import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import { BASE_URL } from '../config';

export function PrescriptionList() {
  const { patientId } = useParams();
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true); // Optional loading state
  const [error, setError] = useState(null); // Optional error state

  useEffect(() => {
    // Fetch prescriptions from the backend for the given patient ID
    const fetchPrescriptions = async () => {
      try {
        const response = await axios.get(
          `${BASE_URL}/prescriptions/patients/name/${patientId}/prescriptions`
        );
        // console.log(response.data.data);
        setPrescriptions(response.data.data); // Assuming `data` contains an array of prescriptions
      } catch (err) {
        console.error('Error fetching prescriptions:', err);
        setError('Failed to load prescriptions.');
      } finally {
        setLoading(false);
      }
    };

    fetchPrescriptions();
  }, [patientId]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <h1 className='text-2xl font-semibold mb-4'>
        Prescriptions for Patient {patientId}
      </h1>
      <Link
        to={`/prescriptions/${patientId}`}
        className='inline-block bg-indigo-600 text-white px-4 py-2 rounded mb-4'
      >
        Add New Prescription
      </Link>
      <ul className='divide-y divide-gray-200'>
        {prescriptions.map((prescription) => (
          <li key={prescription.id} className='py-4'>
            {/* <Link
              to={`/prescription/${prescription._id}`}
              className="block hover:bg-gray-50"
            > */}
            <Link
              to={`/patients/${patientId}/prescriptions/${prescription._id}`}
              className='block hover:bg-gray-50'
            >
              <div className='flex items-center space-x-4'>
                <div className='flex-1 min-w-0'>
                  <p className='text-sm font-medium text-gray-900 truncate'>
                    Date: {prescription.date}
                  </p>
                  <p className='text-sm text-gray-500 truncate'>
                    Doctor: {prescription.doctor}
                  </p>
                </div>
                <div>
                  <svg
                    className='h-5 w-5 text-gray-400'
                    fill='currentColor'
                    viewBox='0 0 20 20'
                  >
                    <path
                      fillRule='evenodd'
                      d='M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z'
                      clipRule='evenodd'
                    />
                  </svg>
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
