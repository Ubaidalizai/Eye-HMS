/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { FaPlus, FaTrash, FaSearch } from 'react-icons/fa';
import AddSale from '../components/AddSale';
import { toast, ToastContainer } from 'react-toastify';
import Pagination from '../components/Pagination';
import { BASE_URL } from '../config';

export default function Sales() {
  const [showSaleModal, setShowSaleModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [sales, setSales] = useState([]);
  const [products, setAllProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [category, setCategory] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingSale, setEditingSale] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    fetchSales();
    fetchProductsData();
  }, [currentPage, category, searchTerm, limit]);

  const handleCategoryChange = (e) => {
    setCategory(e.target.value);
    setCurrentPage(1);
  };

  const addSaleModalSetting = () => {
    setShowSaleModal(!showSaleModal);
  };

  const fetchSales = async () => {
    setIsLoading(true);
    setError(null);
    try {
      let baseUrl = `${BASE_URL}/sales?page=${currentPage}&limit=${limit}`;

      if (user.role === 'sunglassesSeller') {
        baseUrl += '&category=sunglasses,frame';
      } else if (user.role === 'pharmacist') {
        baseUrl += '&category=drug';
      }

      if (category) {
        baseUrl += `&category=${category}`;
      }

      if (searchTerm) {
        baseUrl += `&fieldName=date&searchTerm=${searchTerm}`;
      }

      const response = await fetch(baseUrl, {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      setSales(data.data.results);
      setTotalPages(data.totalPages || Math.ceil(data.results / limit));
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProductsData = async () => {
    try {
      let baseUrl = `${BASE_URL}/pharmacy?checkQuantity=true`;

      if (user.role === 'sunglassesSeller') {
        baseUrl += '&category=sunglasses,frame, glass';
      } else if (user.role === 'pharmacist' || user.role === 'admin') {
        baseUrl += '&category=drug';
      }

      const response = await fetch(baseUrl, {
        credentials: 'include',
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      setAllProducts(data.data.results);
    } catch (err) {
      console.error('Error fetching products:', err);
    }
  };

  const handleDelete = async (saleId) => {
    if (window.confirm('Are you sure you want to delete this sale?')) {
      try {
        const response = await fetch(`${BASE_URL}/sales/${saleId}`, {
          method: 'DELETE',
          credentials: 'include',
        });
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
        toast.success('Sale deleted successfully');
        fetchSales();
      } catch (err) {
        toast.error('Error deleting sale: ' + err.message);
      }
    }
  };

  const handleEdit = (sale) => {
    setEditingSale(sale);
    setShowEditModal(true);
  };

  const handleEditComplete = () => {
    setShowEditModal(false);
    setEditingSale(null);
    fetchSales();
  };

  return (
    <div className='min-h-screen'>
      <div className='max-w-7xl mx-auto'>
        <ToastContainer />

        <h2 className='font-semibold text-xl mb-10'>Sales Data</h2>

        <div className='overflow-x-auto rounded-lg bg-white border '>
          <div className='flex flex-row justify-between items-end  px-5 pb-3'>
            <div>
              <FaSearch className=' translate-x-3 translate-y-7 text-gray-400' />
              <input
                type='date'
                placeholder='Search by date'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className='pl-10 pr-4 py-2 border border-gray-300 rounded w-64 focus:outline-none focus:ring-1 focus:ring-blue-500 h-9'
              />
            </div>

            <div className='flex flex-row items-center justify-center gap-3'>
              <label htmlFor='category' className='sr-only'>
                Category
              </label>
              <div>
                <select
                  id='category'
                  name='category'
                  value={category}
                  onChange={handleCategoryChange}
                  className='block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md'
                >
                  <option value=''>All Categories</option>
                  <option value='drug'>Drug</option>
                  <option value='sunglasses'>sunglasses</option>
                  <option value='glass'>Glass</option>
                  <option value='frame'>Frame</option>
                </select>
              </div>

              <button
                className='inline-flex items-center px-5 py-2 border border-transparent text-sm mr-0 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none  focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                onClick={() => addSaleModalSetting()}
              >
                <FaPlus className='mr-2' />
                Add Sale
              </button>

              {showSaleModal && (
                <AddSale
                  addSaleModalSetting={addSaleModalSetting}
                  products={products}
                  handlePageUpdate={fetchSales}
                />
              )}
            </div>
          </div>

          <div className='border-t border-gray-200'>
            {isLoading ? (
              <div className='text-center py-4'>Loading...</div>
            ) : error ? (
              <div className='text-center py-4 text-red-600'>{error}</div>
            ) : (
              <table className=' w-full text-sm text-left text-gray-500'>
                <thead className='text-xs text-gray-700 uppercase bg-gray-100'>
                  <tr>
                    <th
                      scope='col'
                      className='px-6 py-3 font-bold tracking-wider'
                    >
                      Name
                    </th>
                    <th
                      scope='col'
                      className='px-6 py-3 font-bold tracking-wider'
                    >
                      Stock Sold
                    </th>
                    <th
                      scope='col'
                      className='px-6 py-3 font-bold tracking-wider'
                    >
                      Sale Price
                    </th>
                    <th
                      scope='col'
                      className='px-6 py-3 font-bold tracking-wider'
                    >
                      Sales Date
                    </th>
                    <th
                      scope='col'
                      className='px-6 py-3 font-bold tracking-wider'
                    >
                      Sales By
                    </th>
                    <th
                      scope='col'
                      className='px-6 py-3 font-bold tracking-wider'
                    >
                      Total Sale
                    </th>
                    <th
                      scope='col'
                      className='px-6 py-3 font-bold tracking-wider'
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sales.length > 0 ? (
                    sales.map((sale) => (
                      <tr
                        key={`${sale._id}`}
                        className='bg-white border-b hover:bg-gray-50'
                      >
                        <td className='px-6 py-4 whitespace-nowrap'>
                          {sale.productRefId?.name}
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap'>
                          {sale.quantity}
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap'>
                          ${sale.productRefId?.salePrice}
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap'>
                          {sale.date.split('T')[0]}
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap'>{`${sale.userID?.firstName} ${sale.userID?.lastName}`}</td>
                        <td className='px-6 py-4 whitespace-nowrap'>
                          ${sale.income}
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap'>
                          <button
                            onClick={() => handleDelete(sale._id)}
                            className='font-medium text-red-600 hover:text-red-700'
                          >
                            <FaTrash className='w-4 h-4' />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan='7'
                        className='px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center'
                      >
                        No sales available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <Pagination
          totalItems={sales.length}
          totalPagesCount={totalPages}
          itemsPerPage={limit}
          currentPage={currentPage}
          onPageChange={(page) => setCurrentPage(page)}
          onLimitChange={(limit) => setLimit(limit)}
        />
      </div>
    </div>
  );
}
