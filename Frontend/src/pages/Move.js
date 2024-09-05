import React, { useState, useEffect, useContext } from "react";
import { useDispatch, useSelector } from "react-redux";
import { moveItemAPI, fetchDrugs } from "../redux/inventorySlice";
import AuthContext from "../AuthContext";

const Move = () => {
  const dispatch = useDispatch();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const authContext = useContext(AuthContext);

  useEffect(() => {
    const fetchProductsData = async () => {
      try {
        const response = await fetch(
          `http://localhost:4000/api/product/get/${authContext.user}`
        );
        const data = await response.json();
        setProducts(data);
      } catch (error) {
        setError("Failed to fetch products.");
      } finally {
        setLoading(false);
      }
    };

    fetchProductsData();
  }, [authContext.user]);
  const handleMoveItem = (item) => {
    console.log(item);
    const quantity = prompt(`How many of ${item.name} do you want to move?`, 1);
    const quantityNum = parseInt(quantity, 10);

    if (isNaN(quantityNum) || quantityNum <= 0 || quantityNum > item.stock) {
      alert("Please enter a valid quantity.");
      return;
    }

    // Assuming item has a salePrice property
    const salePrice = item.salePrice; // Adjust this based on your item structure

    dispatch(
      moveItemAPI({ item: { ...item, salePrice }, quantity: quantityNum })
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
            key={item.id}
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
