import React, { useState, useEffect } from 'react';
import { FaPlus, FaFilter, FaTrash } from 'react-icons/fa';
import AddSale from '../components/AddSale';
import { toast, ToastContainer } from 'react-toastify';
import { HiSearch } from 'react-icons/hi';
import Pagination from '../components/Pagination';

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

  const fetchSales = async () => {
    setIsLoading(true);
    setError(null);
    try {
      let baseUrl = `http://localhost:4000/api/v1/sales?page=${currentPage}&limit=${limit}`;

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
      let baseUrl = `http://localhost:4000/api/v1/pharmacy?checkQuantity=true`;

      if (user.role === 'sunglassesSeller') {
        baseUrl += '&category=sunglasses,frame, glass';
      } else if (user.role === 'pharmacist') {
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
        const response = await fetch(
          `http://localhost:4000/api/v1/sales/${saleId}`,
          {
            method: 'DELETE',
            credentials: 'include',
          }
        );
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

        <h2 className='font-semibold text-xl'>Sales Data</h2>

        {showSaleModal && (
          <AddSale
            addSaleModalSetting={() => setShowSaleModal(false)}
            products={products}
            handlePageUpdate={fetchSales}
          />
        )}

        {/* {showEditModal && (
          // <EditSale
          //   sale={editingSale}
          //   onClose={handleEditComplete}
          //   products={products}
          // />
        )} */}

        <div className='mt-10 bg-white border overflow-hidden sm:rounded-lg'>
          <div className=' py-5 flex justify-between items-center'>
            <div className='flex items-center justify-center z-0'>
              <HiSearch className=' translate-x-7 text-gray-400' size={20} />
              <input
                type='date'
                placeholder='Search by date'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className='pl-10 pr-4 py-2 border border-gray-300 rounded w-64 focus:outline-none focus:ring-1 focus:ring-blue-500 h-9'
              />
            </div>
            <div className='flex items-center space-x-4'>
              <div className='flex items-center'>
                <label htmlFor='category' className='sr-only'>
                  Category
                </label>
                <div className='relative'>
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
                  <div className='pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700'>
                    <FaFilter className='h-4 w-4' aria-hidden='true' />
                  </div>
                </div>
              </div>
              <button
                className='inline-flex items-center px-5 py-2 border border-transparent text-sm mr-8 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none  focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                onClick={() => setShowSaleModal(true)}
              >
                <FaPlus className='mr-2' />
                Add Sale
              </button>
            </div>
          </div>
          <div className='border-t border-gray-200'>
            {isLoading ? (
              <div className='text-center py-4'>Loading...</div>
            ) : error ? (
              <div className='text-center py-4 text-red-600'>{error}</div>
            ) : (
              <table className='min-w-full divide-y divide-gray-200'>
                <thead className='bg-gray-50'>
                  <tr>
                    <th
                      scope='col'
                      className='px-6 py-3  text-xs font-bold text-gray-500 uppercase tracking-wider'
                    >
                      Name
                    </th>
                    <th
                      scope='col'
                      className='px-6 py-3  text-xs font-bold text-gray-500 uppercase tracking-wider'
                    >
                      Stock Sold
                    </th>
                    <th
                      scope='col'
                      className='px-6 py-3  text-xs font-bold text-gray-500 uppercase tracking-wider'
                    >
                      Sale Price
                    </th>
                    <th
                      scope='col'
                      className='px-6 py-3  text-xs font-bold text-gray-500 uppercase tracking-wider'
                    >
                      Sales Date
                    </th>
                    <th
                      scope='col'
                      className='px-6 py-3  text-xs font-bold text-gray-500 uppercase tracking-wider'
                    >
                      Sales By
                    </th>
                    <th
                      scope='col'
                      className='px-6 py-3  text-xs font-bold text-gray-500 uppercase tracking-wider'
                    >
                      Total Sale
                    </th>
                    <th
                      scope='col'
                      className='px-6 py-3  text-xs font-bold text-gray-500 uppercase tracking-wider'
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className='bg-white divide-y divide-gray-200'>
                  {sales.length > 0 ? (
                    sales.map((sale) => (
                      <tr key={`${sale._id}`}>
                        <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900'>
                          {sale.productRefId?.name}
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                          {sale.quantity}
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                          ${sale.productRefId?.salePrice}
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                          {sale.date.split('T')[0]}
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>{`${sale.userID?.firstName} ${sale.userID?.lastName}`}</td>
                        <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                          ${sale.income}
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                          <button
                            onClick={() => handleDelete(sale._id)}
                            className='text-red-600 hover:text-red-900'
                          >
                            <FaTrash />
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
