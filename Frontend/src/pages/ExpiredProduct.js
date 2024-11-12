import React from 'react';

const ExpiredProduct = () => {
  // Sample data for expired products
  const expiredProducts = [
    { id: 1, name: 'Product A', category: 'Category 1', expirationDate: '2023-10-01' },
    { id: 2, name: 'Product B', category: 'Category 2', expirationDate: '2023-09-15' },
    { id: 3, name: 'Product C', category: 'Category 3', expirationDate: '2023-08-30' },
    { id: 4, name: 'Product D', category: 'Category 1', expirationDate: '2023-11-05' },
    { id: 5, name: 'Product E', category: 'Category 2', expirationDate: '2023-07-20' },
  ];

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Expired Products</h1>
      {expiredProducts.length === 0 ? (
        <p>No expired products available.</p>
      ) : (
        <table className="min-w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-200">
              <th className="border border-gray-300 p-2">Product Name</th>
              <th className="border border-gray-300 p-2">Category</th>
              <th className="border border-gray-300 p-2">Expiration Date</th>
            </tr>
          </thead>
          <tbody>
            {expiredProducts.map((product) => (
              <tr key={product.id} className="hover:bg-gray-100">
                <td className="border border-gray-300 p-2">{product.name}</td>
                <td className="border border-gray-300 p-2">{product.category}</td>
                <td className="border border-gray-300 p-2">{product.expirationDate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ExpiredProduct;