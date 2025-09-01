import { useState, useEffect, useContext } from 'react';
import { FaPlus, FaTrash, FaSearch, FaPrint } from 'react-icons/fa';
import AddSale from '../components/AddSale.jsx';
import { toast, ToastContainer } from 'react-toastify';
import Pagination from '../components/Pagination.jsx';
import { BASE_URL } from '../config';
import { BillPrintModal } from '../components/BillPrintModal.jsx';
import AuthContext from '../AuthContext.jsx';

export default function Sales() {
  const [showSaleModal, setShowSaleModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [sales, setSales] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [category, setCategory] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingSale, setEditingSale] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showBillModal, setShowBillModal] = useState(false);
  const [selectedSale, setSelectedSale] = useState(null);

  const authContext = useContext(AuthContext);

  useEffect(() => {
    fetchSales();
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

      if (authContext.user.role === 'receptionist') {
        baseUrl += '&category=sunglasses,frame,glass';
      } else if (authContext.user.role === 'pharmacist') {
        baseUrl += '&category=drug';
      } else if (authContext.user.role === 'admin') {
        baseUrl += '&category=drug,sunglasses,glass,frame';
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

  const handlePrintSale = (sale) => {
    setSelectedSale({
      date: sale.date,
      soldItems: [
        {
          productName: sale.productRefId?.name,
          quantity: sale.quantity,
          income: sale.income,
        },
      ],
      totalIncome: sale.income,
      discount: sale.discount,
    });
    setShowBillModal(true);
  };

  return (
    <div className='min-h-screen px-4 sm:px-6 py-6'>
      <div className='max-w-7xl mx-auto'>
        <ToastContainer />

        <h2 className='text-xl sm:text-2xl font-semibold text-gray-800 mb-6'>
          Sales List
        </h2>

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
                  <FaSearch className='text-gray-400' />
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
              {authContext.user.role !== 'pharmacist' && (
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
              )}
              <button
                className='w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 h-10 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors'
                onClick={() => addSaleModalSetting()}
              >
                <FaPlus className='mr-2' />
                Add Sale
              </button>
            </div>
          </div>

          {/* Table Section with Horizontal Scrolling */}
          <div className='border-t border-gray-200'>
            {isLoading ? (
              <div className='flex justify-center items-center py-10'>
                <div className='animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500'></div>
                <p className='ml-3 text-gray-600'>Loading...</p>
              </div>
            ) : error ? (
              <div className='text-center py-6 text-red-600'>{error}</div>
            ) : (
              <div className='overflow-x-auto'>
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
                          Stock Sold
                        </th>
                        <th
                          scope='col'
                          className='px-4 sm:px-6 py-3 text-xs font-medium text-gray-700 uppercase tracking-wider text-left'
                        >
                          Sale Price
                        </th>
                        {authContext.user.role !== 'pharmacist' && (
                          <th
                            scope='col'
                            className='px-4 sm:px-6 py-3 text-xs font-medium text-gray-700 uppercase tracking-wider text-left'
                          >
                            Category
                          </th>
                        )}
                        <th
                          scope='col'
                          className='px-4 sm:px-6 py-3 text-xs font-medium text-gray-700 uppercase tracking-wider text-left'
                        >
                          Sales Date
                        </th>
                        <th
                          scope='col'
                          className='px-4 sm:px-6 py-3 text-xs font-medium text-gray-700 uppercase tracking-wider text-left'
                        >
                          Sales By
                        </th>
                        <th
                          scope='col'
                          className='px-4 sm:px-6 py-3 text-xs font-medium text-gray-700 uppercase tracking-wider text-left'
                        >
                          Total Sale
                        </th>
                        {authContext.user.role === 'receptionist' || authContext.user.role === 'admin' && (
                          <>
                            <th className='px-4 sm:px-6 py-3 text-xs font-medium text-gray-700 uppercase tracking-wider text-left'>
                              Discount
                            </th>
                            <th className='px-4 sm:px-6 py-3 text-xs font-medium text-gray-700 uppercase tracking-wider text-left'>
                              Final Total Sale
                            </th>
                          </>
                        )}
                        <th
                          scope='col'
                          className='px-4 sm:px-6 py-3 text-xs font-medium text-gray-700 uppercase tracking-wider text-center'
                        >
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className='bg-white divide-y divide-gray-200'>
                      {sales.length > 0 ? (
                        sales.map((sale) => (
                          <tr
                            key={`${sale._id}`}
                            className='hover:bg-gray-50 transition-colors'
                          >
                            <td className='px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900'>
                              {sale.productRefId?.name}
                            </td>
                            <td className='px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                              {sale.quantity}
                            </td>
                            <td className='px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                              {sale.productRefId?.salePrice}
                            </td>
                            {authContext.user.role !== 'pharmacist' && (
                              <td className='px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                                {sale.category}
                              </td>
                            )}
                            <td className='px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                              {sale.date.split('T')[0]}
                            </td>
                            <td className='px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                              {`${sale.userID?.firstName} ${sale.userID?.lastName}`}
                            </td>
                            <td className='px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                              {sale.income}
                            </td>
                            {authContext.user.role === 'receptionist' || authContext.user.role === 'admin' && (
                              <>
                                <td className='px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                                  {sale.discount.toFixed(2)}
                                </td>
                                <td className='px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                                  {sale.finalPrice.toFixed(2)}
                                </td>
                              </>
                            )}
                            <td className='px-4 sm:px-6 py-4 whitespace-nowrap text-center'>
                              <div className='flex justify-center space-x-3'>
                                <button
                                  onClick={() => handlePrintSale(sale)}
                                  className='text-blue-600 hover:bg-blue-50 p-1.5 rounded transition-colors'
                                  aria-label='Print sale receipt'
                                >
                                  <FaPrint className='w-4 h-4' />
                                </button>
                                <button
                                  onClick={() => handleDelete(sale._id)}
                                  className='text-red-600 hover:bg-red-50 p-1.5 rounded transition-colors'
                                  aria-label='Delete sale'
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
                            colSpan='8'
                            className='px-4 sm:px-6 py-4 text-center text-sm text-gray-500'
                          >
                            No sales available
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Responsive indicator - only visible on small screens */}
                <div className='block sm:hidden text-center text-xs text-gray-500 mt-2 px-4 pb-2'>
                  <p>Swipe horizontally to see more data</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className='mt-4'>
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

      {showSaleModal && (
        <AddSale
          addSaleModalSetting={addSaleModalSetting}
          handlePageUpdate={fetchSales}
        />
      )}

      <BillPrintModal
        showBill={showBillModal}
        setShowBill={setShowBillModal}
        soldItems={selectedSale}
      />
    </div>
  );
}
