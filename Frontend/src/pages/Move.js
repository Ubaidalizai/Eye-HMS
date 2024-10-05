import React, { useState, useEffect, useContext } from 'react';
import { useDispatch } from 'react-redux';
import { moveItemAPI } from '../redux/inventorySlice';
import AuthContext from '../AuthContext';

const Move = () => {
  const dispatch = useDispatch();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1); // Manage total pages from backend
  const limit = 10; // Number of items per page
  const authContext = useContext(AuthContext);

  useEffect(() => {
    const fetchProductsData = async () => {
      try {
        const response = await fetch(
          `http://localhost:4000/api/v1/inventory/product?category=drug&page=${currentPage}&limit=${limit}`,
          { credentials: 'include' }
        );
        const data = await response.json();
        setProducts(data.data.results);
        setTotalPages(
          data.totalPages || Math.ceil(Math.ceil(data.results / limit))
        );
      } catch (error) {
        setError('Failed to fetch products.');
      } finally {
        setLoading(false);
      }
    };

    fetchProductsData();
  }, [authContext.user]);

  const handleMoveItem = (item) => {
    const quantity = prompt(`How many of ${item.name} do you want to move?`, 1);
    const quantityNum = parseInt(quantity, 10);

    if (isNaN(quantityNum) || quantityNum <= 0 || quantityNum > item.stock) {
      alert('Please enter a valid quantity.');
      return;
    }

    const salePrice = prompt(
      `Enter the sale price for ${item.name}:`,
      item.salePrice
    );
    const salePriceNum = parseFloat(salePrice);

    if (isNaN(salePriceNum) || salePriceNum <= 0) {
      alert('Please enter a valid sale price.');
      return;
    }

    dispatch(
      moveItemAPI({
        item: { name: item.name, salePrice: salePriceNum },
        quantity: quantityNum,
      })
    );
  };

  if (loading) return <p className="text-center text-gray-600">Loading...</p>;
  if (error) return <p className="text-center text-red-600">Error: {error}</p>;

  return (
    <div className="p-8 w-[70vw] sm:p-16 bg-gray-50 min-h-screen">
      <h2 className="text-3xl font-extrabold text-gray-800 mb-8 text-center">
        Move Drugs To Pharmacy
      </h2>
      <ul className="space-y-6 max-w-4xl mx-auto">
        {products.map((item) => (
          <li
            key={item._id}
            className="flex justify-between items-center bg-white p-6 shadow-md rounded-lg border hover:shadow-lg transition duration-300"
          >
            <div>
              <h3 className="text-xl font-semibold text-gray-900">
                {item.name}
              </h3>
              <p className="text-gray-600 mt-2">Stock: {item.stock}</p>
            </div>
            <button
              onClick={() => handleMoveItem(item)}
              className="bg-blue-600 text-white px-5 py-2 rounded-full hover:bg-blue-700 transition duration-300 transform hover:scale-105"
            >
              Move
            </button>
          </li>
        ))}
      </ul>

      {/* Pagination Controls */}
      <div className="flex justify-between mt-4">
        <button
          className="px-4 py-2 bg-gray-300 text-gray-700 rounded disabled:opacity-50"
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1 || totalPages === 0}
        >
          Previous
        </button>

        <span className="flex items-center text-gray-700">
          Page {currentPage} of {totalPages}
        </span>

        <button
          className="px-4 py-2 bg-gray-300 text-gray-700 rounded disabled:opacity-50"
          onClick={() =>
            setCurrentPage((prev) => Math.min(prev + 1, totalPages))
          }
          disabled={currentPage === totalPages || totalPages === 0}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Move;
