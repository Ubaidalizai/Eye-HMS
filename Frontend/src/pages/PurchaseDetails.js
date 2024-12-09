import React, { useState, useEffect, useContext } from 'react';
import {
  FaPlus,
  FaChevronLeft,
  FaChevronRight,
  FaFilter,
  FaEdit,
  FaTrash,
} from 'react-icons/fa';
import AddPurchaseDetails from '../components/AddPurchaseDetails';
import EditPurchaseDetails from '../components/EditPurchaseDetails';
import AuthContext from '../AuthContext';
import { toast, ToastContainer } from 'react-toastify';
import { HiSearch } from 'react-icons/hi';
import { MdDateRange } from 'react-icons/md';

function PurchaseDetails() {
  const [showPurchaseModal, setPurchaseModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [purchases, setAllPurchasesData] = useState([]);
  const [products, setAllProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [category, setCategory] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const limit = 10;
  const authContext = useContext(AuthContext);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchPurchaseData();
    }, 500); // Debounce search query (500ms delay)
    fetchProductsData();
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, currentPage, category]);

  const handleCategoryChange = (e) => {
    setCategory(e.target.value);
    setCurrentPage(1);
  };

  const fetchPurchaseData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const baseUrl = `http://localhost:4000/api/v1/purchase?page=${currentPage}&limit=${limit}&fieldName=date&searchTerm=${searchTerm}`;
      const finalUrl = category ? `${baseUrl}&category=${category}` : baseUrl;

      const response = await fetch(finalUrl, {
        method: 'GET',
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      const data = await response.json();
      setAllPurchasesData(data.data.results);
      setTotalPages(data.totalPages || Math.ceil(data.results / limit));
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProductsData = async () => {
    try {
      const response = await fetch(
        'http://localhost:4000/api/v1/inventory/product',
        {
          method: 'GET',
          credentials: 'include',
        }
      );
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      const data = await response.json();
      setAllProducts(data.data.results);
    } catch (err) {
      toast.error('Error fetching products:', err);
    }
  };

  const addSaleModalSetting = () => {
    setPurchaseModal(!showPurchaseModal);
  };

  const handleDelete = async (purchaseId) => {
    if (window.confirm('Are you sure you want to delete this purchase?')) {
      try {
        const response = await fetch(
          `http://localhost:4000/api/v1/purchase/${purchaseId}`,
          {
            method: 'DELETE',
            credentials: 'include',
          }
        );
        if (!response.ok) {
          console.log(response);
          throw new Error(`Error: ${response.status}`);
        }
        fetchPurchaseData(); // Refresh the purchase list
      } catch (err) {
        setError('Failed to delete purchase. Please try again.');
        toast.error('Error deleting purchase:', err.message);
      }
    }
  };

  return (
    <div className='min-h-screen py-6 px-4 sm:px-6 lg:px-8'>
      <div className='max-w-7xl mx-auto'>
        <ToastContainer />
        <h2 className='font-semibold text-xl'>Purchase Records</h2>
        {/* <div className='text-center'>
          <h2 className='text-3xl font-extrabold text-gray-900 sm:text-4xl'>
            Purchase Details
          </h2>
          <p className='mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4'>
            Manage and track your purchase history
          </p>
        </div> */}

        {showPurchaseModal && (
          <AddPurchaseDetails
            addSaleModalSetting={addSaleModalSetting}
            products={products}
            handlePageUpdate={fetchPurchaseData}
            authContext={authContext}
          />
        )}

        <div className='mt-10 bg-white overflow-hidden border rounded-lg'>
          <div className=' py-5 flex justify-between items-center'>
            <div className='flex items-center justify-center z-0'>
              <HiSearch className=' translate-x-7 text-gray-400' size={20} />
              <input
                type='date'
                placeholder='Search by date '
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className='pl-10 pr-4 py-2 border border-gray-300 rounded w-64 focus:outline-none focus:ring-1 focus:ring-blue-500 h-9'
              />
            </div>
            <div className='flex  items-center gap-3 mr-5'>
              <div className='flex items-center'>
                <label htmlFor='category' className='sr-only'>
                  Category
                </label>
                <div className=''>
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
                  {/* <div className='pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700'>
                    <FaFilter className='h-4 w-4' aria-hidden='true' />
                  </div> */}
                </div>
              </div>
              <button
                className='inline-flex items-center px-5 py-2 border border-transparent text-sm mr-1  font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none  focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                onClick={addSaleModalSetting}
              >
                <FaPlus className='mr-2' />
                Add Purchase
              </button>
            </div>
          </div>
          <div className='border-t border-gray-200'>
            {isLoading ? (
              <div className='text-center py-4'>Loading...</div>
            ) : error ? (
              <div className='text-center py-4 text-red-600'>{error}</div>
            ) : (
              <table className='w-full'>
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
                      Quantity Purchased
                    </th>
                    <th
                      scope='col'
                      className='px-6 py-3  text-xs font-bold text-gray-500 uppercase tracking-wider'
                    >
                      Purchase Date
                    </th>
                    <th
                      scope='col'
                      className='px-6 py-3  text-xs font-bold text-gray-500 uppercase tracking-wider'
                    >
                      Unit Purchase
                    </th>
                    <th
                      scope='col'
                      className='px-6 py-3  text-xs font-bold text-gray-500 uppercase tracking-wider'
                    >
                      Total Purchase
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
                  {purchases.map((element) => (
                    <tr key={element._id}>
                      <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900'>
                        {element.ProductID?.name || 'N/A'}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                        {element.QuantityPurchased || 'N/A'}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                        {element.date
                          ? new Date(element.date).toLocaleDateString() ===
                            new Date().toLocaleDateString()
                            ? 'Today'
                            : element.date.split('T')[0]
                          : 'N/A'}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                        {element.UnitPurchaseAmount !== undefined
                          ? `$${element.UnitPurchaseAmount.toFixed(2)}`
                          : 'N/A'}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                        {element.TotalPurchaseAmount !== undefined
                          ? `$${element.TotalPurchaseAmount.toFixed(2)}`
                          : 'N/A'}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                        <button
                          onClick={() => handleDelete(element._id)}
                          className='text-red-600 hover:text-red-900'
                        >
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  ))}
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
                  {Math.min(currentPage * limit, purchases.length)}
                </span>{' '}
                of <span className='font-medium'>{purchases.length}</span>{' '}
                results
              </p>
            </div>
            <div>
              <nav
                className=' z-0 inline-flex rounded-md shadow-sm -space-x-px'
                aria-label='Pagination'
              >
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1 || totalPages === 0}
                  className=' inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50'
                >
                  <span className='sr-only'>Previous</span>
                  <FaChevronLeft className='h-5 w-5' aria-hidden='true' />
                </button>
                <span className=' inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700'>
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages || totalPages === 0}
                  className=' inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50'
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

export default PurchaseDetails;
