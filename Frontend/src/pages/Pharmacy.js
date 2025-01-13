import React, { useEffect, useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import {
  FaPills,
  FaGlasses,
  FaBoxOpen,
  FaExclamationTriangle,
  FaTrash,
} from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FcSalesPerformance } from 'react-icons/fc';
import Pagination from '../components/Pagination';
import { BASE_URL } from '../config';

const Pharmacy = () => {
  const movedItems = useSelector((state) => state.inventory.movedItems);
  const [drugs, setDrugs] = useState([]);
  const [totalSalePrice, setTotalSalePrice] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalPages, setTotalPages] = useState(1);
  const [updatePage, setUpdatePage] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    fetchData();
    fetchDrugsSummary();
  }, [updatePage, currentPage, limit]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    let baseUrl = `${BASE_URL}/pharmacy?page=${currentPage}&limit=${limit}`;

    if (user.role === 'sunglassesSeller') {
      baseUrl += '&category=sunglasses,frame, glass';
    } else if (user.role === 'pharmacist' || user.role === 'admin') {
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
      const response = await fetch(`${BASE_URL}/pharmacy/drugs-summary`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for authentication if required
      });

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

  const handleDelete = async (drugId) => {
    if (window.confirm('Are you sure you want to delete this drug?')) {
      try {
        const response = await fetch(`${BASE_URL}/pharmacy/${drugId}`, {
          method: 'DELETE',
          credentials: 'include',
        });
        if (response.ok) {
          setUpdatePage(!updatePage);
          toast.success('Product deleted successfully');
        } else {
          toast.error('Failed to delete the product');
        }
      } catch (err) {
        console.log(err);
        toast.error('An error occurred while deleting the product');
      }
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
    <div className='min-h-screen '>
      <div className='max-w-7xl mx-auto'>
        <ToastContainer />
        <h2 className='font-semibold text-xl'>
          {user.role === 'sunglassesSeller'
            ? 'Sunglasses Inventory'
            : 'Pharmacy Inventory'}
        </h2>
        <div className='mt-10'>
          <div className='bg-white shadow overflow-hidden sm:rounded-md'>
            <div className='px-4 py-5 sm:p-6'>
              <div className='grid grid-cols-1 gap-5 sm:grid-cols-3'>
                <div className='bg-blue-100 overflow-hidden shadow rounded-lg'>
                  <div className='px-4 py-5 sm:p-6'>
                    <div className='flex items-center'>
                      <div className='flex-shrink-0 bg-blue-500 rounded-md p-3'>
                        <FcSalesPerformance />
                      </div>
                      <div className='ml-5 w-0 flex-1'>
                        <dl>
                          <dt className='text-sm font-medium text-gray-500 truncate'>
                            sales Price
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
                            Items
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
                              ? 'Products'
                              : 'Drugs'}
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
            <div className='overflow-x-auto rounded-lg shadow-md'>
              <table className='w-full text-sm text-left text-gray-500'>
                <thead className='text-xs text-gray-700 uppercase bg-gray-50'>
                  <tr>
                    <th
                      scope='col'
                      className='px-5 py-3 font-bold tracking-wider'
                    >
                      Icon
                    </th>
                    <th
                      scope='col'
                      className='px-5 py-3 font-bold tracking-wider'
                    >
                      Drug Name
                    </th>
                    <th
                      scope='col'
                      className='px-5 py-3 font-bold tracking-wider'
                    >
                      Manufacturer
                    </th>
                    {user.role === 'sunglassesSeller' ? (
                      <th
                        scope='col'
                        className='px-5 py-3 font-bold tracking-wider'
                      >
                        Category
                      </th>
                    ) : null}

                    <th
                      scope='col'
                      className='px-5 py-3 font-bold tracking-wider'
                    >
                      Expiry Date
                    </th>
                    <th
                      scope='col'
                      className='px-5 py-3 font-bold tracking-wider'
                    >
                      Sale price
                    </th>
                    <th
                      scope='col'
                      className='px-5 py-3 font-bold tracking-wider'
                    >
                      Quantity
                    </th>

                    <th
                      scope='col'
                      className='px-5 py-3 font-bold tracking-wider'
                    >
                      Status
                    </th>
                    <th
                      scope='col'
                      className='px-5 py-3 font-bold tracking-wider'
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-gray-200'>
                  {drugs.map((drug, index) => (
                    <tr
                      key={index}
                      className='hover:bg-gray-50 transition duration-150 ease-in-out'
                    >
                      <td className='px-6 py-4 whitespace-nowrap text-center'>
                        {user.role === 'sunglassesSeller' ? (
                          <FaGlasses className='h-6 w-6 text-gray-400' />
                        ) : (
                          <FaPills className='h-6 w-6 text-gray-400' />
                        )}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900'>
                        {drug.name}
                      </td>

                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-600'>
                        {drug.manufacturer}
                      </td>

                      {drug.category !== 'drug' ? (
                        <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-600'>
                          {drug.category}
                        </td>
                      ) : null}

                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-600'>
                        {drug.expiryDate?.split('T')[0]}
                      </td>

                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-600'>
                        {drug.salePrice}
                      </td>

                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-600'>
                        {drug.quantity}
                      </td>

                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-600'>
                        {
                          <span
                            className={`text-xs font-medium ${
                              drug.quantity === 0
                                ? 'text-red-500'
                                : drug.quantity <= 10
                                ? 'text-yellow-500'
                                : 'text-green-500'
                            }`}
                          >
                            {drug.quantity === 0
                              ? 'Out of quantity'
                              : drug.quantity <= 10
                              ? 'Low'
                              : 'Available'}
                          </span>
                        }
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <button
                          onClick={() => handleDelete(drug._id)}
                          className='font-medium text-red-600 hover:text-red-700'
                        >
                          <FaTrash className='w-4 h-4' />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <Pagination
          totalItems={drugs.length}
          totalPagesCount={totalPages}
          itemsPerPage={limit}
          currentPage={currentPage}
          onPageChange={(page) => setCurrentPage(page)}
          onLimitChange={(limit) => setLimit(limit)}
        />
      </div>
    </div>
  );
};

export default Pharmacy;
