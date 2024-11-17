import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ExpiredProduct = () => {
  const [expiredProducts, setExpiredProducts] = useState([]);
  const [expiredDrugs, setExpiredDrugs] = useState([]);
  const user = JSON.parse(localStorage.getItem('user')); // Get user role

  useEffect(() => {
    // Fetch data based on the user's role
    if (user.role === 'admin') {
      expiredProduct(); // Admin can see both tables
      fetchExpiredDrugs();
    } else if (user.role === 'pharmacist') {
      fetchExpiredDrugs(); // Pharmacist can only see the drugs table
    }
  }, []);

  // Fetch expired products
  const expiredProduct = async () => {
    try {
      const res = await axios.get(
        'http://localhost:4000/api/v1/inventory/product/expire',
        { withCredentials: true }
      );

      if (res.status === 200) {
        setExpiredProducts(res.data.data);
        console.log('Expired products:', res.data);
      } else {
        console.error('Failed to fetch expired products', res);
      }
    } catch (error) {
      console.error('Error fetching expired products', error);
    }
  };

  // Fetch expired drugs
  const fetchExpiredDrugs = async () => {
    try {
      const res = await axios.get(
        'http://localhost:4000/api/v1/pharmacy/expire',
        { withCredentials: true }
      );

      if (res.status === 200) {
        setExpiredDrugs(res.data.data.expireProducts);
      } else {
        console.error('Failed to fetch expired drugs', res);
      }
    } catch (error) {
      console.error('Error fetching expired drugs', error);
    }
  };

  return (
    <div className='container mx-auto p-4'>
      <h1 className='text-2xl font-bold mb-4'>Expired Products and Drugs</h1>

      {/* Conditionally render the expired products table for admin only */}
      {user.role === 'admin' && (
        <>
          <h2 className='text-xl font-bold mb-4'>Expired Products</h2>
          {expiredProducts.length === 0 ? (
            <p>No expired products available.</p>
          ) : (
            <table className='min-w-full border-collapse border border-gray-300 mb-8'>
              <thead>
                <tr className='bg-gray-200'>
                  <th className='border border-gray-300 p-2'>Product</th>
                  <th className='border border-gray-300 p-2'>Manufacturer</th>
                  <th className='border border-gray-300 p-2'>Stock</th>
                  <th className='border border-gray-300 p-2'>Category</th>
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

      {/* Conditionally render the expired drugs table for both admin and pharmacist */}
      {(user.role === 'admin' || user.role === 'pharmacist') && (
        <>
          <h2 className='text-xl font-bold mb-4'>Expired Drugs</h2>
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
