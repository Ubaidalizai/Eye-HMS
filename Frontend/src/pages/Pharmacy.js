import React, { useEffect, useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import {
  FaPills,
  FaGlasses,
  FaBoxOpen,
  FaExclamationTriangle,
  FaChevronLeft,
  FaChevronRight,
} from 'react-icons/fa';

const Pharmacy = () => {
  const movedItems = useSelector((state) => state.inventory.movedItems);
  const [drugs, setDrugs] = useState([]);
  const [totalSalePrice, setTotalSalePrice] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    fetchData();
    fetchDrugsSummary();
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    let baseUrl = `http://localhost:4000/api/v1/pharmacy?page=${currentPage}&limit=${limit}`;

    if (user.role === 'sunglassesSeller') {
      baseUrl += '&category=sunglasses,frame, glass';
    } else if (user.role === 'pharmacist') {
      baseUrl += '&category=drug';
    }

    try {
      const res = await fetch(baseUrl, {
        credentials: 'include',
        method: 'GET',
      });

      if (!res.ok) {
        throw new Error(`Error: ${res.status}`);
      }

      const data = await res.json();
      setDrugs(data.data.results);
      setTotalPages(data.totalPages || Math.ceil(data.results / limit));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [currentPage, user.role]);

  const fetchDrugsSummary = async () => {
    try {
      const response = await fetch(
        'http://localhost:4000/api/v1/pharmacy/drugs-summary',
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include', // Include cookies for authentication if required
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch drugs summary');
      }

      const data = await response.json();
      setTotalSalePrice(data.totalSalePrice);
    } catch (err) {
      console.error('Error fetching drugs summary:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className='flex items-center justify-center h-screen bg-gray-100'>
        <div className='text-2xl font-semibold text-blue-600'>
          <svg
            className='animate-spin h-8 w-8 mr-3 inline-block'
            xmlns='http://www.w3.org/2000/svg'
            fill='none'
            viewBox='0 0 24 24'
          >
            <circle
              className='opacity-25'
              cx='12'
              cy='12'
              r='10'
              stroke='currentColor'
              strokeWidth='4'
            ></circle>
            <path
              className='opacity-75'
              fill='currentColor'
              d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
            ></path>
          </svg>
          Loading...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='flex items-center justify-center h-screen bg-gray-100'>
        <div className='text-2xl text-red-600 flex items-center'>
          <FaExclamationTriangle className='mr-3' />
          Error: {error}
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8'>
      <div className='max-w-7xl mx-auto'>
        <div className='text-center'>
          <h2 className='text-3xl font-extrabold text-gray-900 sm:text-4xl'>
            {user.role === 'sunglassesSeller'
              ? 'Sunglasses Inventory'
              : 'Pharmacy Inventory'}
          </h2>
          <p className='mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4'>
            Manage your inventory with ease and efficiency
          </p>
        </div>

        <div className='mt-10'>
          <div className='bg-white shadow overflow-hidden sm:rounded-md'>
            <div className='px-4 py-5 sm:p-6'>
              <div className='grid grid-cols-1 gap-5 sm:grid-cols-3'>
                <div className='bg-blue-100 overflow-hidden shadow rounded-lg'>
                  <div className='px-4 py-5 sm:p-6'>
                    <div className='flex items-center'>
                      <div className='flex-shrink-0 bg-blue-500 rounded-md p-3'>
                        <FaBoxOpen className='h-6 w-6 text-white' />
                      </div>
                      <div className='ml-5 w-0 flex-1'>
                        <dl>
                          <dt className='text-sm font-medium text-gray-500 truncate'>
                            Total sale Price
                          </dt>
                          <dd className='text-lg font-medium text-gray-900'>
                            {totalSalePrice}
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>
                <div className='bg-blue-100 overflow-hidden shadow rounded-lg'>
                  <div className='px-4 py-5 sm:p-6'>
                    <div className='flex items-center'>
                      <div className='flex-shrink-0 bg-blue-500 rounded-md p-3'>
                        <FaBoxOpen className='h-6 w-6 text-white' />
                      </div>
                      <div className='ml-5 w-0 flex-1'>
                        <dl>
                          <dt className='text-sm font-medium text-gray-500 truncate'>
                            Total Items
                          </dt>
                          <dd className='text-lg font-medium text-gray-900'>
                            {drugs.reduce(
                              (sum, drug) => sum + drug.quantity,
                              0
                            )}
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>
                <div className='bg-green-100 overflow-hidden shadow rounded-lg'>
                  <div className='px-4 py-5 sm:p-6'>
                    <div className='flex items-center'>
                      <div className='flex-shrink-0 bg-green-500 rounded-md p-3'>
                        {user.role === 'sunglassesSeller' ? (
                          <FaGlasses className='h-6 w-6 text-white' />
                        ) : (
                          <FaPills className='h-6 w-6 text-white' />
                        )}
                      </div>
                      <div className='ml-5 w-0 flex-1'>
                        <dl>
                          <dt className='text-sm font-medium text-gray-500 truncate'>
                            {user.role === 'sunglassesSeller'
                              ? 'Total Products'
                              : 'Total Drugs'}
                          </dt>
                          <dd className='text-lg font-medium text-gray-900'>
                            {drugs.length}
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>
                <div className='bg-yellow-100 overflow-hidden shadow rounded-lg'>
                  <div className='px-4 py-5 sm:p-6'>
                    <div className='flex items-center'>
                      <div className='flex-shrink-0 bg-yellow-500 rounded-md p-3'>
                        <FaExclamationTriangle className='h-6 w-6 text-white' />
                      </div>
                      <div className='ml-5 w-0 flex-1'>
                        <dl>
                          <dt className='text-sm font-medium text-gray-500 truncate'>
                            Low Stock Items
                          </dt>
                          <dd className='text-lg font-medium text-gray-900'>
                            {drugs.filter((drug) => drug.quantity < 10).length}
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <ul className='divide-y divide-gray-200'>
              {drugs.map((drug, index) => (
                <li
                  key={index}
                  className='px-4 py-4 sm:px-6 hover:bg-gray-50 transition duration-150 ease-in-out'
                >
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center'>
                      {user.role === 'sunglassesSeller' ? (
                        <FaGlasses className='flex-shrink-0 mr-3 h-6 w-6 text-gray-400' />
                      ) : (
                        <FaPills className='flex-shrink-0 mr-3 h-6 w-6 text-gray-400' />
                      )}
                      <p className='text-sm font-medium text-indigo-600 truncate'>
                        {drug.name}
                      </p>
                    </div>
                    <div className='ml-2 flex-shrink-0 flex'>
                      <p className='px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800'>
                        Expiry Date: {drug.expiryDate}
                      </p>
                    </div>
                    <div className='ml-2 flex-shrink-0 flex'>
                      <p className='px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800'>
                        Quantity: {drug.quantity}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className='bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 mt-4'>
          <div className='flex-1 flex justify-between sm:hidden'>
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className='relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50'
            >
              Previous
            </button>
            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className='ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50'
            >
              Next
            </button>
          </div>
          <div className='hidden sm:flex-1 sm:flex sm:items-center sm:justify-between'>
            <div>
              <p className='text-sm text-gray-700'>
                Showing{' '}
                <span className='font-medium'>
                  {(currentPage - 1) * limit + 1}
                </span>{' '}
                to{' '}
                <span className='font-medium'>
                  {Math.min(currentPage * limit, drugs.length)}
                </span>{' '}
                of <span className='font-medium'>{drugs.length}</span> results
              </p>
            </div>
            <div>
              <nav
                className='relative z-0 inline-flex rounded-md shadow-sm -space-x-px'
                aria-label='Pagination'
              >
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className='relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50'
                >
                  <span className='sr-only'>Previous</span>
                  <FaChevronLeft className='h-5 w-5' aria-hidden='true' />
                </button>
                <span className='relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700'>
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className='relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50'
                >
                  <span className='sr-only'>Next</span>
                  <FaChevronRight className='h-5 w-5' aria-hidden='true' />
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pharmacy;
