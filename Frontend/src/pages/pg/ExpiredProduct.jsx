import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../AuthContext.jsx';
import { BASE_URL } from '../config';

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
  }, [user.role, activeTab]);

  // Fetch expired products
  const fetchExpiredProducts = async () => {
    setLoading((prev) => ({ ...prev, expired: true }));
    setError((prev) => ({ ...prev, expired: null }));
    try {
      const res = await axios.get(`${BASE_URL}/inventory/product/expire`, {
        withCredentials: true,
      });
      if (res?.data?.length > 0) {
        setExpiredProducts(res?.data?.expiringSoon);
      } else {
        setExpiredProducts([]);
      }
    } catch (error) {
      console.error('Error fetching expired products', error);
      setError((prev) => ({
        ...prev,
        expired: 'Failed to fetch expired products',
      }));
    } finally {
      setLoading((prev) => ({ ...prev, expired: false }));
    }
  };

  // Fetch expired drugs
  const fetchExpiredDrugs = async () => {
    setLoading((prev) => ({ ...prev, expired: true }));
    setError((prev) => ({ ...prev, expired: null }));
    try {
      const res = await axios.get(`${BASE_URL}/pharmacy/expire`, {
        withCredentials: true,
      });

      if (res.status === 200 && res?.data?.length > 0) {
        setExpiredDrugs(res?.data?.expiringSoon);
      } else {
        setExpiredDrugs([]);
      }
    } catch (error) {
      console.error('Error fetching expired drugs', error);
      setError((prev) => ({
        ...prev,
        expired: 'Failed to fetch expired drugs',
      }));
    } finally {
      setLoading((prev) => ({ ...prev, expired: false }));
    }
  };

  // Fetch low stock products
  const fetchLowStockProducts = async () => {
    setLoading((prev) => ({ ...prev, lowStock: true }));
    setError((prev) => ({ ...prev, lowStock: null }));
    try {
      const res = await axios.get(`${BASE_URL}/inventory/product/low-stock`, {
        withCredentials: true,
      });
      if (res.status === 200) {
        setLowStockProducts(res.data.data.lowStockProducts || []);
      } else {
        setLowStockProducts([]);
      }
    } catch (error) {
      console.error('Error fetching low stock products', error);
      setError((prev) => ({
        ...prev,
        lowStock: 'Failed to fetch low stock products',
      }));
    } finally {
      setLoading((prev) => ({ ...prev, lowStock: false }));
    }
  };

  // Fetch low stock glasses
  const fetchLowStockGlasses = async () => {
    setLoading((prev) => ({ ...prev, lowStock: true }));
    setError((prev) => ({ ...prev, lowStock: null }));
    try {
      const res = await axios.get(`${BASE_URL}/glasses/low-stock`, {
        withCredentials: true,
      });
      if (res.status === 200) {
        setLowStockGlasses(res.data.data.lowStockGlasses || []);
      } else {
        setLowStockGlasses([]);
      }
    } catch (error) {
      console.error('Error fetching low stock glasses', error);
      setError((prev) => ({
        ...prev,
        lowStock: 'Failed to fetch low stock glasses',
      }));
    } finally {
      setLoading((prev) => ({ ...prev, lowStock: false }));
    }
  };

  // Fetch low stock drugs
  const fetchLowStockDrugs = async () => {
    setLoading((prev) => ({ ...prev, lowStock: true }));
    setError((prev) => ({ ...prev, lowStock: null }));
    try {
      const res = await axios.get(`${BASE_URL}/pharmacy/low-stock`, {
        withCredentials: true,
      });
      if (res.status === 200) {
        setLowStockDrugs(res.data.data.lowStockDrugs || []);
      } else {
        setLowStockDrugs([]);
      }
    } catch (error) {
      console.error('Error fetching low stock drugs', error);
      setError((prev) => ({
        ...prev,
        lowStock: 'Failed to fetch low stock drugs',
      }));
    } finally {
      setLoading((prev) => ({ ...prev, lowStock: false }));
    }
  };

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
                            {product.description}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
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
                          Expiry Date
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
                            {drug.expiryDate.split('T')[0]}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Low Stock Items Tab Content */}
      {activeTab === 'lowStock' && (
        <div>
          {/* Low Stock Products Table (Admin only) */}
          {user.role === 'admin' && (
            <>
              <h2 className='text-lg font-medium mb-4'>Low Stock Products</h2>
              {lowStockProducts.length === 0 ? (
                <p>No low stock products available.</p>
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
                      {lowStockProducts.map((product) => (
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
                                product.stock <= product.minLevel * 0.5
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}
                            >
                              {product.stock <= product.minLevel * 0.5
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
            </>
          )}

          {/* Low Stock Glasses Table (Admin and Receptionist) */}
          {(user.role === 'admin' || user.role === 'receptionist') && (
            <>
              <h2 className='text-lg font-medium mb-4'>Low Stock Glasses</h2>
              {lowStockGlasses.length === 0 ? (
                <p>No low stock glasses available.</p>
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
                      {lowStockGlasses.map((glass) => (
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
                                glass.quantity <= glass.minLevel * 0.5
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}
                            >
                              {glass.quantity <= glass.minLevel * 0.5
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
              {lowStockDrugs.length === 0 ? (
                <p>No low stock pharmacy items available.</p>
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
                      {lowStockDrugs.map((drug) => (
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
                                drug.quantity <= drug.minLevel * 0.5
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}
                            >
                              {drug.quantity <= drug.minLevel * 0.5
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
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ExpiredProduct;
