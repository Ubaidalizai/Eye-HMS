import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LockClosedIcon } from '@heroicons/react/24/outline';

const UnauthorizedPage = () => {
  const navigate = useNavigate();

  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-100 px-4'>
      <div className='max-w-md w-full text-center p-6 bg-white shadow-lg rounded-xl'>
        <LockClosedIcon className='h-16 w-16 text-gray-500 mx-auto' />

        <h1 className='text-2xl font-semibold text-gray-800 mt-4'>
          Access Denied
        </h1>
        <p className='text-gray-600 mt-2'>
          You don’t have permission to view this page.
        </p>

        <div className='mt-6 space-y-3'>
          <button
            onClick={() => navigate(-1)}
            className='w-full px-4 py-2.5 text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg text-sm font-medium shadow-sm transition'
          >
            Back to Previous Page
          </button>
        </div>
      </div>
    </div>
  );
};

export default UnauthorizedPage;
