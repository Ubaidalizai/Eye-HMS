import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";

const Pharmacy = () => {
  const movedItems = useSelector((state) => state.inventory.movedItems);
  const [drugs, setDrugs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("http://localhost:4000/api/v1/pharmacy/drugs", {
          credentials: "include",
          method: "GET",
        });

        if (!res.ok) {
          throw new Error(`Error: ${res.status}`);
        }

        const data = await res.json();
        console.log(data);
        setDrugs(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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
        Pharmacy
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
                Quantity:{" "}
                <span className="font-semibold text-gray-800">
                  {drug.quantity}
                </span>
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Pharmacy;
