import React, { useState, useEffect } from 'react';
import {
  FaPlus,
  FaChevronLeft,
  FaChevronRight,
  FaFilter,
  FaEdit,
  FaTrash,
} from 'react-icons/fa';
import AddSale from '../components/AddSale';
// import EditSale from "./EditSale";
import { toast } from 'react-toastify';

export default function Sales() {
  const [showSaleModal, setShowSaleModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [sales, setSales] = useState([]);
  const [products, setAllProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [category, setCategory] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingSale, setEditingSale] = useState(null);

  const limit = 10;
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    fetchSales();
    fetchProductsData();
  }, [currentPage, category]);

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
        baseUrl += '&category=sunglasses,frame';
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
    <div className='min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8'>
      <div className='max-w-7xl mx-auto'>
        <div className='text-center'>
          <h2 className='text-3xl font-extrabold text-gray-900 sm:text-4xl'>
            Sales Management
          </h2>
          <p className='mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4'>
            Track and manage your sales data efficiently
          </p>
        </div>

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

        <div className='mt-10 bg-white shadow overflow-hidden sm:rounded-lg'>
          <div className='px-4 py-5 sm:px-6 flex justify-between items-center'>
            <h3 className='text-lg leading-6 font-medium text-gray-900'>
              Sales Data
            </h3>
            <div className='flex items-center space-x-4'>
              {user.role === 'admin' && (
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
                      <option value='sunglasses'>Sunglasses</option>
                      <option value='frame'>Frame</option>
                    </select>
                    <div className='pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700'>
                      <FaFilter className='h-4 w-4' aria-hidden='true' />
                    </div>
                  </div>
                </div>
              )}
              <button
                className='inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                onClick={() => setShowSaleModal(true)}
              >
                <FaPlus className='mr-2 -ml-1 h-5 w-5' aria-hidden='true' />
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
                      className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                    >
                      Product Name
                    </th>
                    <th
                      scope='col'
                      className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                    >
                      Stock Sold
                    </th>
                    <th
                      scope='col'
                      className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                    >
                      Sale Price
                    </th>
                    <th
                      scope='col'
                      className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                    >
                      Sales Date
                    </th>
                    <th
                      scope='col'
                      className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                    >
                      Sales By
                    </th>
                    <th
                      scope='col'
                      className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                    >
                      Total Sale Amount
                    </th>
                    <th
                      scope='col'
                      className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
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
                          {new Date(sale.date).toLocaleDateString()}
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>{`${sale.userID?.firstName} ${sale.userID?.lastName}`}</td>
                        <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                          ${sale.income}
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                          <button
                            // onClick={() => handleEdit(sale)}
                            className='text-indigo-600 hover:text-indigo-900 mr-2'
                          >
                            <FaEdit />
                          </button>
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

        <div className='bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 mt-4'>
          <div className='flex-1 flex justify-between sm:hidden'>
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1 || totalPages === 0}
              className='relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50'
            >
              Previous
            </button>
            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages || totalPages === 0}
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
                  {Math.min(currentPage * limit, sales.length)}
                </span>{' '}
                of <span className='font-medium'>{sales.length}</span> results
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
                  disabled={currentPage === 1 || totalPages === 0}
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
                  disabled={currentPage === totalPages || totalPages === 0}
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
}
