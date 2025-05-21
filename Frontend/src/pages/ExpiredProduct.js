import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../AuthContext';
import { BASE_URL } from '../config';

const ExpiredProduct = () => {
  const [expiredProducts, setExpiredProducts] = useState([]);
  const [expiredDrugs, setExpiredDrugs] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    // Fetch data based on the user's role
    if (user.role === 'admin') {
      expiredProduct(); // Admin can see both tables
      fetchExpiredDrugs();
    } else if (user.role === 'pharmacist' || user.role === 'receptionist') {
      fetchExpiredDrugs(); // Pharmacist can only see the drugs table
    }
  }, [user.role]);

  // Fetch expired products
  const expiredProduct = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/inventory/product/expire`, {
        withCredentials: true,
      });
      if (res?.data?.length > 0) {
        setExpiredProducts(res?.data?.expiringSoon);
      }
    } catch (error) {
      console.error('Error fetching expired products', error);
    }
  };

  // Fetch expired drugs
  const fetchExpiredDrugs = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/pharmacy/expire`, {
        withCredentials: true,
      });

      if (res.status === 200 && res?.data?.length > 0) {
        setExpiredDrugs(res?.data?.expiringSoon);
      }
    } catch (error) {
      console.error('Error fetching expired drugs', error);
    }
  };

  return (
    <div className='container mx-auto p-4'>
      <h3 className='text-2xl font-medium mb-8'>Expired Items</h3>
      {user.role === 'admin' && (
        <>
          <h2 className='text-lg font-medium mb-4'>Inventory Expiry</h2>
          {expiredProducts.length === 0 ? (
            <p>No expired products available.</p>
          ) : (
            <table className='min-w-full border-collapse border border-gray-300 mb-8 text-left'>
              <thead>
                <tr className='bg-gray-200'>
                  <th className='border border-gray-300 p-2'>Product</th>
                  <th className='border border-gray-300 p-2'>Manufacturer</th>
                  <th className='border border-gray-300 p-2'>Stock</th>
                  <th className='border border-gray-300 p-2'>Category</th>
                  <th className='border border-gray-300 p-2'>
                    Expiry duration
                  </th>
                  <th className='border border-gray-300 p-2'>Expiry Date</th>
                  <th className='border border-gray-300 p-2'>Description</th>
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
          )}
        </>
      )}

      {(user.role === 'admin' ||
        user.role === 'pharmacist' ||
        user.role === 'receptionist') && (
        <>
          <h2 className='text-lg font-medium mb-4'>Pharmacy Expiry</h2>
          {expiredDrugs.length === 0 ? (
            <p>No expired drugs available.</p>
          ) : (
            <table className='min-w-full border-collapse border border-gray-300'>
              <thead>
                <tr className='bg-gray-200'>
                  <th className='border border-gray-300 p-2'>Drug</th>
                  <th className='border border-gray-300 p-2'>Manufacturer</th>
                  <th className='border border-gray-300 p-2'>Stock</th>
                  <th className='border border-gray-300 p-2'>Sale Price</th>
                  <th className='border border-gray-300 p-2'>Category</th>
                  <th className='border border-gray-300 p-2'>Expiry Date</th>
                </tr>
              </thead>
              <tbody>
                {expiredDrugs.map((drug) => (
                  <tr key={drug._id} className='hover:bg-gray-100'>
                    <td className='border border-gray-300 p-2'>{drug.name}</td>
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
                      {drug.category}
                    </td>
                    <td className='border border-gray-300 p-2'>
                      {drug.expiryDate.split('T')[0]}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}
    </div>
  );
};

export default ExpiredProduct;
