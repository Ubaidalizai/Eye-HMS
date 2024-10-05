import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

const Pharmacy = () => {
  const movedItems = useSelector((state) => state.inventory.movedItems);
  const [drugs, setDrugs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1); // Manage total pages from backend
  const limit = 10; // Number of items per page
  const user = JSON.parse(localStorage.getItem('user'));

  // Fetch paginated data from the backend
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true); // Set loading true before fetch

      let baseUrl = `http://localhost:4000/api/v1/pharmacy?page=${currentPage}&limit=${limit}`;

      if (user.role === 'sunglassesSeller') {
        baseUrl = `http://localhost:4000/api/v1/pharmacy?page=${currentPage}&limit=${limit}&category=sunglasses`;
      } else if (user.role === 'pharmacist') {
        baseUrl = `http://localhost:4000/api/v1/pharmacy?page=${currentPage}&limit=${limit}`;
      }

      try {
        const res = await fetch(baseUrl, {
          credentials: 'include',
          method: 'GET',
        });

        if (!res.ok) {
          throw new Error(`Error: ${res.status}`);
        }

        const data = await res.json();
        setDrugs(data.data.results); // Set drug data
        setTotalPages(data.totalPages || Math.ceil(data.results / limit)); // Calculate total pages if backend provides results or totalPages
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false); // Set loading to false after fetch completes
      }
    };

    fetchData();
  }, [currentPage]); // Re-fetch data when currentPage changes

  if (loading) {
    return (
      <div className="flex  items-center justify-center h-screen">
        <div className="text-lg font-semibold">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg text-red-600">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="w-[80vw] h-full mx-auto p-12 bg-gray-200 rounded-lg shadow-lg">
      <h2 className="text-4xl font-extrabold mb-6 text-center text-blue-600">
        {user.role === 'sunglassesSeller' ? 'Sunglasses' : 'Pharmacy'}
      </h2>

      <h3 className="text-3xl font-semibold mb-4 text-gray-800">
        Available Drugs
      </h3>
      <ul className="space-y-4">
        {drugs.map((drug, index) => (
          <li
            key={index}
            className="border border-gray-300 p-5 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 bg-gray-50 hover:bg-gray-100"
          >
            <div className="flex justify-between items-center">
              <span className="font-medium text-gray-800">{drug.name}</span>
              <span className="text-gray-600">
                Quantity:{' '}
                <span className="font-semibold text-gray-800">
                  {drug.quantity}
                </span>
              </span>
            </div>
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

export default Pharmacy;
