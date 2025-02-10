import React, { useState, useEffect, useContext } from 'react';
import { FaPlus, FaTrash } from 'react-icons/fa';
import AddPurchaseDetails from '../components/AddPurchaseDetails';
import AuthContext from '../AuthContext';
import { toast, ToastContainer } from 'react-toastify';
import { HiSearch } from 'react-icons/hi';
import Pagination from '../components/Pagination';
import { BASE_URL } from '../config';

function PurchaseDetails() {
  const [showPurchaseModal, setPurchaseModal] = useState(false);
  const [purchases, setAllPurchasesData] = useState([]);
  const [products, setAllProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [category, setCategory] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const authContext = useContext(AuthContext);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchPurchaseData();
    }, 500); // Debounce search query (500ms delay)
    fetchProductsData();
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, currentPage, category, limit]);

  const handleCategoryChange = (e) => {
    setCategory(e.target.value);
    setCurrentPage(1);
  };

  const fetchPurchaseData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const baseUrl = `${BASE_URL}/purchase?page=${currentPage}&limit=${limit}&fieldName=date&searchTerm=${searchTerm}`;
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
      const response = await fetch(`${BASE_URL}/inventory/product`, {
        method: 'GET',
        credentials: 'include',
      });
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
        const response = await fetch(`${BASE_URL}/purchase/${purchaseId}`, {
          method: 'DELETE',
          credentials: 'include',
        });
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
    <div className='min-h-screen'>
      <div className='max-w-7xl mx-auto'>
        <ToastContainer />
        <h2 className='font-semibold text-xl'>Purchase List</h2>

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
          <div>
            {isLoading ? (
              <div className='text-center py-4'>Loading...</div>
            ) : error ? (
              <div className='text-center py-4 text-red-600'>{error}</div>
            ) : (
              <table className='w-full text-sm text-left text-gray-500'>
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
                          ? `${element.UnitPurchaseAmount.toFixed(2)}`
                          : 'N/A'}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                        {element.TotalPurchaseAmount !== undefined
                          ? `${element.TotalPurchaseAmount.toFixed(2)}`
                          : 'N/A'}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                        <button
                          onClick={() => handleDelete(element._id)}
                          className='font-medium text-red-600 hover:text-red-700'
                        >
                          <FaTrash className='w-4 h-4' />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <Pagination
          totalItems={purchases.length}
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

export default PurchaseDetails;
