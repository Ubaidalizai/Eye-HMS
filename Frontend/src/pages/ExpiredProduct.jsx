import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../AuthContext.jsx';
import { BASE_URL } from '../config';
import Pagination from '../components/Pagination.jsx';

const ExpiredProduct = () => {
  const [expiredProducts, setExpiredProducts] = useState([]);
  const [expiredDrugs, setExpiredDrugs] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [lowStockGlasses, setLowStockGlasses] = useState([]);
  const [lowStockDrugs, setLowStockDrugs] = useState([]);
  const [activeTab, setActiveTab] = useState('expired');
  const { user } = useAuth();
  const [loading, setLoading] = useState({
    expired: false,
    lowStock: false,
  });
  const [error, setError] = useState({
    expired: null,
    lowStock: null,
  });

  // Filter states for low stock tables
  const [lowStockFilter, setLowStockFilter] = useState('all'); // 'all', 'critical', 'low'

  // Pagination states for each table
  const [pagination, setPagination] = useState({
    expiredProducts: { currentPage: 1, totalPages: 1, limit: 10, totalItems: 0 },
    expiredDrugs: { currentPage: 1, totalPages: 1, limit: 10, totalItems: 0 },
    lowStockProducts: { currentPage: 1, totalPages: 1, limit: 10, totalItems: 0 },
    lowStockGlasses: { currentPage: 1, totalPages: 1, limit: 10, totalItems: 0 },
    lowStockDrugs: { currentPage: 1, totalPages: 1, limit: 10, totalItems: 0 },
  });

  useEffect(() => {
    // Fetch data based on the user's role and active tab
    if (activeTab === 'expired') {
      if (user.role === 'admin') {
        fetchExpiredProducts();
        fetchExpiredDrugs();
      } else if (user.role === 'pharmacist') {
        fetchExpiredDrugs();
      }
    } else if (activeTab === 'lowStock') {
      if (user.role === 'admin') {
        fetchLowStockProducts();
        fetchLowStockGlasses();
        fetchLowStockDrugs();
      } else if (user.role === 'pharmacist') {
        fetchLowStockDrugs();
      } else if (user.role === 'receptionist') {
        fetchLowStockGlasses();
      }
    }
  }, [
    user.role,
    activeTab,
    pagination.expiredProducts.currentPage,
    pagination.expiredProducts.limit,
    pagination.expiredDrugs.currentPage,
    pagination.expiredDrugs.limit,
    pagination.lowStockProducts.currentPage,
    pagination.lowStockProducts.limit,
    pagination.lowStockGlasses.currentPage,
    pagination.lowStockGlasses.limit,
    pagination.lowStockDrugs.currentPage,
    pagination.lowStockDrugs.limit,
  ]);

  // Fetch expired products
  const fetchExpiredProducts = async () => {
    setLoading((prev) => ({ ...prev, expired: true }));
    setError((prev) => ({ ...prev, expired: null }));
    try {
      const { currentPage, limit } = pagination.expiredProducts;
      const res = await axios.get(
        `${BASE_URL}/inventory/product/expire?page=${currentPage}&limit=${limit}`,
        {
          withCredentials: true,
        }
      );

      if (res?.data?.expiringSoon) {
        setExpiredProducts(res.data.expiringSoon);
        setPagination(prev => ({
          ...prev,
          expiredProducts: {
            ...prev.expiredProducts,
            totalPages: res.data.totalPages || 1,
            totalItems: res.data.results || 0,
          }
        }));
      } else {
        setExpiredProducts([]);
        setPagination(prev => ({
          ...prev,
          expiredProducts: {
            ...prev.expiredProducts,
            totalPages: 1,
            totalItems: 0,
          }
        }));
      }
    } catch (error) {
      console.error('Error fetching expired products', error);
      setError((prev) => ({
        ...prev,
        expired: 'Failed to fetch expired products',
      }));
      setExpiredProducts([]);
    } finally {
      setLoading((prev) => ({ ...prev, expired: false }));
    }
  };

  // Fetch expired drugs
  const fetchExpiredDrugs = async () => {
    setLoading((prev) => ({ ...prev, expired: true }));
    setError((prev) => ({ ...prev, expired: null }));
    try {
      const { currentPage, limit } = pagination.expiredDrugs;
      const res = await axios.get(
        `${BASE_URL}/pharmacy/expire?page=${currentPage}&limit=${limit}`,
        {
          withCredentials: true,
        }
      );

      if (res.status === 200 && res?.data?.expiringSoon) {
        setExpiredDrugs(res.data.expiringSoon);
        setPagination(prev => ({
          ...prev,
          expiredDrugs: {
            ...prev.expiredDrugs,
            totalPages: res.data.totalPages || 1,
            totalItems: res.data.results || 0,
          }
        }));
      } else {
        setExpiredDrugs([]);
        setPagination(prev => ({
          ...prev,
          expiredDrugs: {
            ...prev.expiredDrugs,
            totalPages: 1,
            totalItems: 0,
          }
        }));
      }
    } catch (error) {
      console.error('Error fetching expired drugs', error);
      setError((prev) => ({
        ...prev,
        expired: 'Failed to fetch expired drugs',
      }));
      setExpiredDrugs([]);
    } finally {
      setLoading((prev) => ({ ...prev, expired: false }));
    }
  };

  // Fetch low stock products
  const fetchLowStockProducts = async () => {
    setLoading((prev) => ({ ...prev, lowStock: true }));
    setError((prev) => ({ ...prev, lowStock: null }));
    try {
      const { currentPage, limit } = pagination.lowStockProducts;
      const res = await axios.get(
        `${BASE_URL}/inventory/product/low-stock?page=${currentPage}&limit=${limit}`,
        {
          withCredentials: true,
        }
      );
      if (res.status === 200) {
        setLowStockProducts(res.data.data.lowStockProducts || []);
        setPagination(prev => ({
          ...prev,
          lowStockProducts: {
            ...prev.lowStockProducts,
            totalPages: res.data.totalPages || 1,
            totalItems: res.data.results || 0,
          }
        }));
      } else {
        setLowStockProducts([]);
        setPagination(prev => ({
          ...prev,
          lowStockProducts: {
            ...prev.lowStockProducts,
            totalPages: 1,
            totalItems: 0,
          }
        }));
      }
    } catch (error) {
      console.error('Error fetching low stock products', error);
      setError((prev) => ({
        ...prev,
        lowStock: 'Failed to fetch low stock products',
      }));
      setLowStockProducts([]);
    } finally {
      setLoading((prev) => ({ ...prev, lowStock: false }));
    }
  };

  // Fetch low stock glasses
  const fetchLowStockGlasses = async () => {
    setLoading((prev) => ({ ...prev, lowStock: true }));
    setError((prev) => ({ ...prev, lowStock: null }));
    try {
      const { currentPage, limit } = pagination.lowStockGlasses;
      const res = await axios.get(
        `${BASE_URL}/glasses/low-stock?page=${currentPage}&limit=${limit}`,
        {
          withCredentials: true,
        }
      );
      if (res.status === 200) {
        setLowStockGlasses(res.data.data.lowStockGlasses || []);
        setPagination(prev => ({
          ...prev,
          lowStockGlasses: {
            ...prev.lowStockGlasses,
            totalPages: res.data.totalPages || 1,
            totalItems: res.data.results || 0,
          }
        }));
      } else {
        setLowStockGlasses([]);
        setPagination(prev => ({
          ...prev,
          lowStockGlasses: {
            ...prev.lowStockGlasses,
            totalPages: 1,
            totalItems: 0,
          }
        }));
      }
    } catch (error) {
      console.error('Error fetching low stock glasses', error);
      setError((prev) => ({
        ...prev,
        lowStock: 'Failed to fetch low stock glasses',
      }));
      setLowStockGlasses([]);
    } finally {
      setLoading((prev) => ({ ...prev, lowStock: false }));
    }
  };

  // Fetch low stock drugs
  const fetchLowStockDrugs = async () => {
    setLoading((prev) => ({ ...prev, lowStock: true }));
    setError((prev) => ({ ...prev, lowStock: null }));
    try {
      const { currentPage, limit } = pagination.lowStockDrugs;
      const res = await axios.get(
        `${BASE_URL}/pharmacy/low-stock?page=${currentPage}&limit=${limit}`,
        {
          withCredentials: true,
        }
      );
      if (res.status === 200) {
        setLowStockDrugs(res.data.data.lowStockDrugs || []);
        setPagination(prev => ({
          ...prev,
          lowStockDrugs: {
            ...prev.lowStockDrugs,
            totalPages: res.data.totalPages || 1,
            totalItems: res.data.results || 0,
          }
        }));
      } else {
        setLowStockDrugs([]);
        setPagination(prev => ({
          ...prev,
          lowStockDrugs: {
            ...prev.lowStockDrugs,
            totalPages: 1,
            totalItems: 0,
          }
        }));
      }
    } catch (error) {
      console.error('Error fetching low stock drugs', error);
      setError((prev) => ({
        ...prev,
        lowStock: 'Failed to fetch low stock drugs',
      }));
      setLowStockDrugs([]);
    } finally {
      setLoading((prev) => ({ ...prev, lowStock: false }));
    }
  };

  // Pagination handlers
  const handlePageChange = (tableType, page) => {
    setPagination(prev => ({
      ...prev,
      [tableType]: {
        ...prev[tableType],
        currentPage: page,
      }
    }));
  };

  const handleLimitChange = (tableType, limit) => {
    setPagination(prev => ({
      ...prev,
      [tableType]: {
        ...prev[tableType],
        limit: limit,
        currentPage: 1, // Reset to first page when changing limit
      }
    }));
  };

  // Filter functions for low stock items
  const filterLowStockItems = (items) => {
    if (lowStockFilter === 'critical') {
      return items.filter(item => {
        const stockValue = item.stock !== undefined ? item.stock : item.quantity;
        return stockValue === 0;
      });
    } else if (lowStockFilter === 'low') {
      return items.filter(item => {
        const stockValue = item.stock !== undefined ? item.stock : item.quantity;
        return stockValue > 0;
      });
    }
    return items; // 'all' - return all items
  };

  const getFilteredLowStockProducts = () => filterLowStockItems(lowStockProducts);
  const getFilteredLowStockGlasses = () => filterLowStockItems(lowStockGlasses);
  const getFilteredLowStockDrugs = () => filterLowStockItems(lowStockDrugs);

  return (
    <div className='container mx-auto p-4'>
      <h3 className='text-2xl font-medium mb-4'>Inventory Monitoring</h3>

      {/* Tab Navigation */}
      <div className='flex border-b border-gray-200 mb-6'>
        <button
          className={`py-2 px-4 font-medium ${
            activeTab === 'expired'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('expired')}
        >
          Expired Items
        </button>
        <button
          className={`py-2 px-4 font-medium ${
            activeTab === 'lowStock'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('lowStock')}
        >
          Low Stock Items
        </button>
      </div>

      {/* Loading and Error Messages */}
      {loading.expired && activeTab === 'expired' && (
        <p className='text-gray-600'>Loading expired items...</p>
      )}
      {error.expired && activeTab === 'expired' && (
        <p className='text-red-500'>{error.expired}</p>
      )}
      {loading.lowStock && activeTab === 'lowStock' && (
        <p className='text-gray-600'>Loading low stock items...</p>
      )}
      {error.lowStock && activeTab === 'lowStock' && (
        <p className='text-red-500'>{error.lowStock}</p>
      )}

      {/* Expired Items Tab Content */}
      {activeTab === 'expired' && (
        <div>
          {user.role === 'admin' && (
            <>
              <h2 className='text-lg font-medium mb-4'>Inventory Expiry</h2>
              {expiredProducts.length === 0 ? (
                <p>No expired products available.</p>
              ) : (
                <div className='overflow-x-auto'>
                  <table className='min-w-full border-collapse border border-gray-300 mb-8 text-left'>
                    <thead>
                      <tr className='bg-gray-200'>
                        <th className='border border-gray-300 p-2'>Product</th>
                        <th className='border border-gray-300 p-2'>
                          Manufacturer
                        </th>
                        <th className='border border-gray-300 p-2'>Stock</th>
                        <th className='border border-gray-300 p-2'>Category</th>
                        <th className='border border-gray-300 p-2'>
                          Expiry duration
                        </th>
                        <th className='border border-gray-300 p-2'>
                          Expiry Date
                        </th>
                        <th className='border border-gray-300 p-2'>
                          Status
                        </th>
                        <th className='border border-gray-300 p-2'>
                          Description
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {expiredProducts.map((product) => (
                        <tr key={product._id} className='hover:bg-gray-100'>
                          <td className='border border-gray-300 p-2'>
                            {product.name}
                          </td>
                          <td className='border border-gray-300 p-2'>
                            {product.manufacturer}
                          </td>
                          <td className='border border-gray-300 p-2'>
                            {product.stock}
                          </td>
                          <td className='border border-gray-300 p-2'>
                            {product.category}
                          </td>
                          <td className='border border-gray-300 p-2'>
                            {product.expireNotifyDuration} days
                          </td>
                          <td className='border border-gray-300 p-2'>
                            {product.expiryDate.split('T')[0]}
                          </td>
                          <td className='border border-gray-300 p-2'>
                            {(() => {
                              const expiryDate = new Date(product.expiryDate);
                              const currentDate = new Date();
                              const isExpired = expiryDate < currentDate;
                              const daysUntilExpiry = Math.ceil((expiryDate - currentDate) / (1000 * 60 * 60 * 24));

                              if (isExpired) {
                                return (
                                  <span className='px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800'>
                                    Expired ({Math.abs(daysUntilExpiry)} days ago)
                                  </span>
                                );
                              } else {
                                return (
                                  <span className='px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800'>
                                    Expires in {daysUntilExpiry} days
                                  </span>
                                );
                              }
                            })()}
                          </td>
                          <td className='border border-gray-300 p-2'>
                            {product.description}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Pagination for Expired Products */}
              {expiredProducts.length > 0 && (
                <Pagination
                  totalItems={pagination.expiredProducts.totalItems}
                  totalPagesCount={pagination.expiredProducts.totalPages}
                  itemsPerPage={pagination.expiredProducts.limit}
                  currentPage={pagination.expiredProducts.currentPage}
                  onPageChange={(page) => handlePageChange('expiredProducts', page)}
                  onLimitChange={(limit) => handleLimitChange('expiredProducts', limit)}
                />
              )}
            </>
          )}

          {(user.role === 'admin' ||
            user.role === 'pharmacist') && (
            <>
              <h2 className='text-lg font-medium mb-4'>Pharmacy Expiry</h2>
              {expiredDrugs.length === 0 ? (
                <p>No expired drugs available.</p>
              ) : (
                <div className='overflow-x-auto'>
                  <table className='min-w-full border-collapse border border-gray-300 text-left'>
                    <thead>
                      <tr className='bg-gray-200'>
                        <th className='border border-gray-300 p-2'>Drug</th>
                        <th className='border border-gray-300 p-2'>
                          Manufacturer
                        </th>
                        <th className='border border-gray-300 p-2'>Stock</th>
                        <th className='border border-gray-300 p-2'>
                          Sale Price
                        </th>
                        <th className='border border-gray-300 p-2'>
                          Expiry Duration
                        </th>
                        <th className='border border-gray-300 p-2'>
                          Expiry Date
                        </th>
                        <th className='border border-gray-300 p-2'>
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {expiredDrugs.map((drug) => (
                        <tr key={drug._id} className='hover:bg-gray-100'>
                          <td className='border border-gray-300 p-2'>
                            {drug.name}
                          </td>
                          <td className='border border-gray-300 p-2'>
                            {drug.manufacturer}
                          </td>
                          <td className='border border-gray-300 p-2'>
                            {drug.quantity}
                          </td>
                          <td className='border border-gray-300 p-2'>
                            {drug.salePrice}
                          </td>
                          <td className='border border-gray-300 p-2'>
                            {drug.expireNotifyDuration || 0} days
                          </td>
                          <td className='border border-gray-300 p-2'>
                            {drug.expiryDate.split('T')[0]}
                          </td>
                          <td className='border border-gray-300 p-2'>
                            {(() => {
                              const expiryDate = new Date(drug.expiryDate);
                              const currentDate = new Date();
                              const isExpired = expiryDate < currentDate;
                              const daysUntilExpiry = Math.ceil((expiryDate - currentDate) / (1000 * 60 * 60 * 24));

                              if (isExpired) {
                                return (
                                  <span className='px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800'>
                                    Expired ({Math.abs(daysUntilExpiry)} days ago)
                                  </span>
                                );
                              } else {
                                return (
                                  <span className='px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800'>
                                    Expires in {daysUntilExpiry} days
                                  </span>
                                );
                              }
                            })()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Pagination for Expired Drugs */}
              {expiredDrugs.length > 0 && (
                <Pagination
                  totalItems={pagination.expiredDrugs.totalItems}
                  totalPagesCount={pagination.expiredDrugs.totalPages}
                  itemsPerPage={pagination.expiredDrugs.limit}
                  currentPage={pagination.expiredDrugs.currentPage}
                  onPageChange={(page) => handlePageChange('expiredDrugs', page)}
                  onLimitChange={(limit) => handleLimitChange('expiredDrugs', limit)}
                />
              )}
            </>
          )}
        </div>
      )}

      {/* Low Stock Items Tab Content */}
      {activeTab === 'lowStock' && (
        <div>
          {/* Filter Controls */}
          <div className='mb-6 bg-gray-50 p-4 rounded-lg'>
            <h3 className='text-lg font-medium mb-3'>Filter Low Stock Items</h3>
            <div className='flex flex-wrap gap-2'>
              <button
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  lowStockFilter === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
                onClick={() => setLowStockFilter('all')}
              >
                All Items
              </button>
              <button
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  lowStockFilter === 'critical'
                    ? 'bg-red-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
                onClick={() => setLowStockFilter('critical')}
              >
                Out of Stock
              </button>
              <button
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  lowStockFilter === 'low'
                    ? 'bg-yellow-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
                onClick={() => setLowStockFilter('low')}
              >
                Low Stock
              </button>
            </div>
          </div>
          {/* Low Stock Products Table (Admin only) */}
          {user.role === 'admin' && (
            <>
              <h2 className='text-lg font-medium mb-4'>Low Stock Products</h2>
              {getFilteredLowStockProducts().length === 0 ? (
                <p>No low stock products available for the selected filter.</p>
              ) : (
                <div className='overflow-x-auto mb-8'>
                  <table className='min-w-full border-collapse border border-gray-300 text-left'>
                    <thead>
                      <tr className='bg-gray-200'>
                        <th className='border border-gray-300 p-2'>Product</th>
                        <th className='border border-gray-300 p-2'>
                          Manufacturer
                        </th>
                        <th className='border border-gray-300 p-2'>
                          Current Stock
                        </th>
                        <th className='border border-gray-300 p-2'>
                          Min Level
                        </th>
                        <th className='border border-gray-300 p-2'>
                          Sale Price
                        </th>
                        <th className='border border-gray-300 p-2'>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {getFilteredLowStockProducts().map((product) => (
                        <tr key={product._id} className='hover:bg-gray-100'>
                          <td className='border border-gray-300 p-2'>
                            {product.name}
                          </td>
                          <td className='border border-gray-300 p-2'>
                            {product.manufacturer}
                          </td>
                          <td className='border border-gray-300 p-2'>
                            {product.stock}
                          </td>
                          <td className='border border-gray-300 p-2'>
                            {product.minLevel}
                          </td>
                          <td className='border border-gray-300 p-2'>
                            {product.salePrice}
                          </td>
                          <td className='border border-gray-300 p-2'>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                product.stock === 0
                                  ? 'bg-red-100 text-red-800'
                                  : product.stock <= product.minLevel * 0.5
                                  ? 'bg-orange-100 text-orange-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}
                            >
                              {product.stock === 0
                                ? 'Out of Stock'
                                : product.stock <= product.minLevel * 0.5
                                ? 'Critical'
                                : 'Low'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Pagination for Low Stock Products */}
              {getFilteredLowStockProducts().length > 0 && (
                <Pagination
                  totalItems={pagination.lowStockProducts.totalItems}
                  totalPagesCount={pagination.lowStockProducts.totalPages}
                  itemsPerPage={pagination.lowStockProducts.limit}
                  currentPage={pagination.lowStockProducts.currentPage}
                  onPageChange={(page) => handlePageChange('lowStockProducts', page)}
                  onLimitChange={(limit) => handleLimitChange('lowStockProducts', limit)}
                />
              )}
            </>
          )}

          {/* Low Stock Glasses Table (Admin and Receptionist) */}
          {(user.role === 'admin' || user.role === 'receptionist') && (
            <>
              <h2 className='text-lg font-medium mb-4'>Low Stock Glasses</h2>
              {getFilteredLowStockGlasses().length === 0 ? (
                <p>No low stock glasses available for the selected filter.</p>
              ) : (
                <div className='overflow-x-auto mb-8'>
                  <table className='min-w-full border-collapse border border-gray-300 text-left'>
                    <thead>
                      <tr className='bg-gray-200'>
                        <th className='border border-gray-300 p-2'>Name</th>
                        <th className='border border-gray-300 p-2'>
                          Manufacturer
                        </th>
                        <th className='border border-gray-300 p-2'>Category</th>
                        <th className='border border-gray-300 p-2'>
                          Current Stock
                        </th>
                        <th className='border border-gray-300 p-2'>
                          Min Level
                        </th>
                        <th className='border border-gray-300 p-2'>
                          Sale Price
                        </th>
                        <th className='border border-gray-300 p-2'>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {getFilteredLowStockGlasses().map((glass) => (
                        <tr key={glass._id} className='hover:bg-gray-100'>
                          <td className='border border-gray-300 p-2'>
                            {glass.name}
                          </td>
                          <td className='border border-gray-300 p-2'>
                            {glass.manufacturer}
                          </td>
                          <td className='border border-gray-300 p-2'>
                            {glass.category}
                          </td>
                          <td className='border border-gray-300 p-2'>
                            {glass.quantity}
                          </td>
                          <td className='border border-gray-300 p-2'>
                            {glass.minLevel}
                          </td>
                          <td className='border border-gray-300 p-2'>
                            {glass.salePrice}
                          </td>
                          <td className='border border-gray-300 p-2'>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                glass.quantity === 0
                                  ? 'bg-red-100 text-red-800'
                                  : glass.quantity <= glass.minLevel * 0.5
                                  ? 'bg-orange-100 text-orange-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}
                            >
                              {glass.quantity === 0
                                ? 'Out of Stock'
                                : glass.quantity <= glass.minLevel * 0.5
                                ? 'Critical'
                                : 'Low'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Pagination for Low Stock Glasses */}
              {getFilteredLowStockGlasses().length > 0 && (
                <Pagination
                  totalItems={pagination.lowStockGlasses.totalItems}
                  totalPagesCount={pagination.lowStockGlasses.totalPages}
                  itemsPerPage={pagination.lowStockGlasses.limit}
                  currentPage={pagination.lowStockGlasses.currentPage}
                  onPageChange={(page) => handlePageChange('lowStockGlasses', page)}
                  onLimitChange={(limit) => handleLimitChange('lowStockGlasses', limit)}
                />
              )}
            </>
          )}

          {/* Low Stock Drugs Table (Admin, Pharmacist, and Receptionist) */}
          {(user.role === 'admin' ||
            user.role === 'pharmacist' ||
            user.role === 'receptionist') && (
            <>
              <h2 className='text-lg font-medium mb-4'>
                Low Stock Pharmacy Items
              </h2>
              {getFilteredLowStockDrugs().length === 0 ? (
                <p>No low stock pharmacy items available for the selected filter.</p>
              ) : (
                <div className='overflow-x-auto'>
                  <table className='min-w-full border-collapse border border-gray-300 text-left'>
                    <thead>
                      <tr className='bg-gray-200'>
                        <th className='border border-gray-300 p-2'>Name</th>
                        <th className='border border-gray-300 p-2'>
                          Manufacturer
                        </th>
                        <th className='border border-gray-300 p-2'>
                          Current Stock
                        </th>
                        <th className='border border-gray-300 p-2'>
                          Min Level
                        </th>
                        <th className='border border-gray-300 p-2'>
                          Sale Price
                        </th>
                        <th className='border border-gray-300 p-2'>
                          Expiry Date
                        </th>
                        <th className='border border-gray-300 p-2'>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {getFilteredLowStockDrugs().map((drug) => (
                        <tr key={drug._id} className='hover:bg-gray-100'>
                          <td className='border border-gray-300 p-2'>
                            {drug.name}
                          </td>
                          <td className='border border-gray-300 p-2'>
                            {drug.manufacturer}
                          </td>
                          <td className='border border-gray-300 p-2'>
                            {drug.quantity}
                          </td>
                          <td className='border border-gray-300 p-2'>
                            {drug.minLevel}
                          </td>
                          <td className='border border-gray-300 p-2'>
                            {drug.salePrice}
                          </td>
                          <td className='border border-gray-300 p-2'>
                            {drug.expiryDate.split('T')[0]}
                          </td>
                          <td className='border border-gray-300 p-2'>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                drug.quantity === 0
                                  ? 'bg-red-100 text-red-800'
                                  : drug.quantity <= drug.minLevel * 0.5
                                  ? 'bg-orange-100 text-orange-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}
                            >
                              {drug.quantity === 0
                                ? 'Out of Stock'
                                : drug.quantity <= drug.minLevel * 0.5
                                ? 'Critical'
                                : 'Low'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Pagination for Low Stock Drugs */}
              {getFilteredLowStockDrugs().length > 0 && (
                <Pagination
                  totalItems={pagination.lowStockDrugs.totalItems}
                  totalPagesCount={pagination.lowStockDrugs.totalPages}
                  itemsPerPage={pagination.lowStockDrugs.limit}
                  currentPage={pagination.lowStockDrugs.currentPage}
                  onPageChange={(page) => handlePageChange('lowStockDrugs', page)}
                  onLimitChange={(limit) => handleLimitChange('lowStockDrugs', limit)}
                />
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ExpiredProduct;
