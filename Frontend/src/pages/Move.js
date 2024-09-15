import React, { useState, useEffect, useContext } from 'react';
import { useDispatch } from 'react-redux';
import { moveItemAPI } from '../redux/inventorySlice';
import AuthContext from '../AuthContext';

const Move = () => {
  const dispatch = useDispatch();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const authContext = useContext(AuthContext);

  useEffect(() => {
    const fetchProductsData = async () => {
      try {
        const response = await fetch('http://localhost:4000/api/v1/product');
        const data = await response.json();
        setProducts(data);
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

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="p-16">
      <h2 className="text-2xl font-bold mb-6">Move Products</h2>
      <ul className="space-y-4">
        {products.map((item) => (
          <li
            key={item._id}
            className="flex justify-between items-center p-4 border-b border-gray-200"
          >
            <div>
              <h3 className="text-lg font-semibold">{item.name}</h3>
              <p className="text-gray-600">Stock: {item.stock}</p>
            </div>
            <button
              onClick={() => handleMoveItem(item)}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
            >
              Move
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Move;
