import { useState, useEffect, useContext } from 'react';
import { FaPlus, FaTrash, FaEdit } from 'react-icons/fa';
import AddPurchaseDetails from '../components/AddPurchaseDetails';
import AuthContext from '../AuthContext';
import { toast, ToastContainer } from 'react-toastify';
import { HiSearch } from 'react-icons/hi';
import Pagination from '../components/Pagination';
import { BASE_URL } from '../config';
import EditPurchaseDetails from '../components/EditPurchaseDetails';

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
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState(null);

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
      const userRole = authContext.user.role;
      const allowedCategories = ['frame', 'glass', 'sunglasses'];

      // Start building the base URL for the purchase data
      let baseUrl = `${BASE_URL}/purchase?page=${currentPage}&limit=${limit}&fieldName=date&searchTerm=${searchTerm}`;

      if (userRole === 'receptionist') {
        // If category is selected and allowed, add it
        if (category && allowedCategories.includes(category)) {
          baseUrl += `&category=${category}`;
        } else {
          // If no specific valid category selected, include all allowed categories
          const categoryFilter = allowedCategories.join(','); // Join the allowed categories into a comma-separated string
          baseUrl += `&category=${categoryFilter}`;
        }
      } else if (userRole === 'admin') {
        // Admin can add any category or skip to see all
        if (category) {
          baseUrl += `&category=${category}`;
        }
      }

      const response = await fetch(baseUrl, {
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
    // Determine the URL based on the user's role
    const url =
      authContext.user.role === 'admin'
        ? `${BASE_URL}/inventory/product`
        : authContext.user.role === 'receptionist'
        ? `${BASE_URL}/glasses`
        : null;

    if (!url) {
      throw new Error('Invalid user role. Cannot fetch products.');
    }

    try {
      const response = await fetch(url, {
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

  const editModalSetting = () => {
    setShowEditModal(!showEditModal);
    if (showEditModal) {
      setSelectedPurchase(null);
    }
  };

  const handleDelete = async (purchaseId) => {
    if (window.confirm('Are you sure you want to delete this purchase?')) {
      try {
        const response = await fetch(`${BASE_URL}/purchase/${purchaseId}`, {
          method: 'DELETE',
          credentials: 'include',
        });
        if (!response.ok) {
          let errorMessage = 'Failed to delete the purchase.';

          // Attempt to extract the error message from the server response
          try {
            const errorResponse = await response.json();
            errorMessage = errorResponse.message || errorMessage;
          } catch (jsonError) {
            errorMessage = (await response.text()) || errorMessage;
          }
          throw new Error(errorMessage);
        }
        fetchPurchaseData(); // Refresh the purchase list
      } catch (err) {
        setError(err.message || 'Failed to delete purchase. Please try again.');
        toast.error(err.message || 'Error deleting purchase:');
      }
    }
  };

  const handleEdit = (purchase) => {
    setSelectedPurchase(purchase);
    setShowEditModal(true);
  };

  const handlePurchaseSuccess = () => {
    toast.success('Purchase added successfully!');
    fetchPurchaseData(); // refresh list
  };

  return (
    <div className='min-h-screen px-4 sm:px-6 py-6'>
      <div className='max-w-7xl mx-auto'>
        <ToastContainer />
        <h2 className='text-xl sm:text-2xl font-semibold text-gray-800 mb-6'>
          Purchase List
        </h2>

        {showPurchaseModal && (
          <AddPurchaseDetails
            addSaleModalSetting={addSaleModalSetting}
            handlePageUpdate={handlePurchaseSuccess}
            authContext={authContext}
          />
        )}

        {showEditModal && selectedPurchase && (
          <EditPurchaseDetails
            editModalSetting={editModalSetting}
            purchase={selectedPurchase}
            handlePageUpdate={fetchPurchaseData}
          />
        )}

        <div className='bg-white overflow-hidden border rounded-lg shadow-sm'>
          {/* Filters and Actions Section */}
          <div className='p-4 sm:p-6 flex flex-col sm:flex-row justify-between gap-4'>
            <div className='w-full sm:w-auto'>
              <label
                htmlFor='date-search'
                className='block text-sm font-medium text-gray-700 mb-1'
              >
                Search by Date
              </label>
              <div className='relative'>
                <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                  <HiSearch className='text-gray-400' size={20} />
                </div>
                <input
                  id='date-search'
                  type='date'
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className='pl-10 pr-4 py-2 h-10 border border-gray-300 rounded-md w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-blue-500'
                />
              </div>
            </div>

            <div className='flex flex-col sm:flex-row items-start sm:items-end gap-4'>
              <div className='w-full sm:w-auto'>
                <label
                  htmlFor='category'
                  className='block text-sm font-medium text-gray-700 mb-1'
                >
                  Filter by Category
                </label>
                <select
                  id='category'
                  name='category'
                  value={category}
                  onChange={handleCategoryChange}
                  className='block w-full sm:w-48 h-10 pl-3 pr-10 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                >
                  <option value=''>All Categories</option>
                  {authContext.user.role === 'admin' && (
                    <option value='drug'>Drug</option>
                  )}
                  <option value='sunglasses'>Sunglasses</option>
                  <option value='glass'>Glass</option>
                  <option value='frame'>Frame</option>
                </select>
              </div>

              <button
                className='w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 h-10 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors'
                onClick={addSaleModalSetting}
              >
                <FaPlus className='mr-2' />
                Add Purchase
              </button>
            </div>
          </div>

          {/* Table Section with Horizontal Scrolling */}
          <div className='overflow-x-auto'>
            {isLoading ? (
              <div className='flex justify-center items-center py-10'>
                <div className='animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500'></div>
                <p className='ml-3 text-gray-600'>Loading...</p>
              </div>
            ) : error ? (
              <div className='text-center py-6 text-red-600'>{error}</div>
            ) : (
              <div className='inline-block min-w-full align-middle'>
                <table className='min-w-full divide-y divide-gray-200'>
                  <thead className='bg-gray-50'>
                    <tr>
                      <th
                        scope='col'
                        className='px-4 sm:px-6 py-3 text-xs font-medium text-gray-700 uppercase tracking-wider text-left'
                      >
                        Name
                      </th>
                      <th
                        scope='col'
                        className='px-4 sm:px-6 py-3 text-xs font-medium text-gray-700 uppercase tracking-wider text-left'
                      >
                        Quantity
                      </th>
                      <th
                        scope='col'
                        className='px-4 sm:px-6 py-3 text-xs font-medium text-gray-700 uppercase tracking-wider text-left'
                      >
                        Category
                      </th>
                      <th
                        scope='col'
                        className='px-4 sm:px-6 py-3 text-xs font-medium text-gray-700 uppercase tracking-wider text-left'
                      >
                        Purchase Date
                      </th>
                      {purchases?.expiryDate && (
                        <th
                          scope='col'
                          className='px-4 sm:px-6 py-3 text-xs font-medium text-gray-700 uppercase tracking-wider text-left'
                        >
                          Expiry Date
                        </th>
                      )}
                      <th
                        scope='col'
                        className='px-4 sm:px-6 py-3 text-xs font-medium text-gray-700 uppercase tracking-wider text-left'
                      >
                        Unit Price
                      </th>
                      <th
                        scope='col'
                        className='px-4 sm:px-6 py-3 text-xs font-medium text-gray-700 uppercase tracking-wider text-left'
                      >
                        Total Price
                      </th>
                      <th
                        scope='col'
                        className='px-4 sm:px-6 py-3 text-xs font-medium text-gray-700 uppercase tracking-wider text-center'
                      >
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className='bg-white divide-y divide-gray-200'>
                    {purchases.length > 0 ? (
                      purchases.map((element) => (
                        <tr
                          key={element._id}
                          className='hover:bg-gray-50 transition-colors'
                        >
                          <td className='px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900'>
                            {element.ProductID?.name || 'N/A'}
                          </td>
                          <td className='px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                            {element.originalQuantity || 'N/A'}
                          </td>
                          <td className='px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                            {element.category || 'N/A'}
                          </td>
                          <td className='px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                            {element.date
                              ? new Date(element.date).toLocaleDateString() ===
                                new Date().toLocaleDateString()
                                ? 'Today'
                                : element.date.split('T')[0]
                              : 'N/A'}
                          </td>
                          {purchases?.expiryDate && (
                            <td className='px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                              {element.expiryDate
                                ? new Date(
                                    element.expiryDate
                                  ).toLocaleDateString() ===
                                  new Date().toLocaleDateString()
                                  ? 'Today'
                                  : element.expiryDate.split('T')[0]
                                : 'N/A'}
                            </td>
                          )}
                          <td className='px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                            {element.UnitPurchaseAmount !== undefined
                              ? `${element.UnitPurchaseAmount.toFixed(2)}`
                              : 'N/A'}
                          </td>
                          <td className='px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                            {element.TotalPurchaseAmount !== undefined
                              ? `${element.TotalPurchaseAmount.toFixed(2)}`
                              : 'N/A'}
                          </td>

                          <td className='px-4 sm:px-6 py-4 whitespace-nowrap text-center'>
                            <div className='flex justify-center space-x-3'>
                              <button
                                onClick={() => handleEdit(element)}
                                className='text-blue-600 hover:bg-blue-50 p-1.5 rounded transition-colors'
                                aria-label='Edit purchase'
                              >
                                <FaEdit className='w-4 h-4' />
                              </button>
                              <button
                                onClick={() => handleDelete(element._id)}
                                className='text-red-600 hover:bg-red-50 p-1.5 rounded transition-colors'
                                aria-label='Delete purchase'
                              >
                                <FaTrash className='w-4 h-4' />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={8}
                          className='px-4 sm:px-6 py-4 text-center text-sm text-gray-500'
                        >
                          No purchase records found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* Responsive indicator - only visible on small screens */}
            <div className='block sm:hidden text-center text-xs text-gray-500 mt-2 px-4 pb-2'>
              <p>Swipe horizontally to see more data</p>
            </div>
          </div>
        </div>

        <div className='mt-4'>
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
    </div>
  );
}

export default PurchaseDetails;
