import React, { useState, useEffect, useContext } from 'react';
import AddSale from '../components/AddSale';
import AuthContext from '../AuthContext';

function Sales() {
  const [showSaleModal, setShowSaleModal] = useState(false);
  const [sales, setSales] = useState([]);
  const [products, setAllProducts] = useState([]);
  const [stores, setAllStores] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [updatePage, setUpdatePage] = useState(true);

  const authContext = useContext(AuthContext);

  useEffect(() => {
    fetchSales();
    fetchProductsData();
    fetchStoresData();
  }, [updatePage]);

  // Toggle sale modal
  const addSaleModalSetting = () => setShowSaleModal(!showSaleModal);

  // Handle page update (for re-fetching data after adding a sale)
  const handlePageUpdate = () => {
    fetchSales(currentPage);
  };

  // Fetch paginated sales data from the backend
  const fetchSales = async (page) => {
    try {
      const response = await fetch(
        `http://localhost:4000/api/v1/sales?page=${page}&limit=10`, // Adjust the limit as needed
        {
          method: 'GET',
          credentials: 'include',
        }
      );
      const data = await response.json();
      setSales(data.data.sales); // Assuming `sales` is the key in the response
      setTotalPages(data.totalPages); // Assuming the backend sends `totalPages`
    } catch (err) {
      console.error('Error fetching sales:', err);
    }
  };

  // Fetching Data of All Products
  const fetchProductsData = () => {
    fetch(
      'http://localhost:4000/api/v1/pharmacy',
      { credentials: 'include' },
      { method: 'GET' }
    )
      .then((response) => response.json())
      .then((data) => {
        setAllProducts(data);
      })
      .catch((err) => console.log(err));
  };

  // Fetching Data of All Stores
  const fetchStoresData = () => {
    fetch(`http://localhost:4000/api/store/get/${authContext.user}`)
      .then((response) => response.json())
      .then((data) => {
        setAllStores(data);
      });
  };

  // Fetch sales on component mount and when currentPage changes
  useEffect(() => {
    fetchSales(currentPage);
  }, [currentPage]);

  return (
    <div className="col-span-12 lg:col-span-10 flex justify-center">
      <div className="flex flex-col gap-5 w-11/12">
        {showSaleModal && (
          <AddSale
            addSaleModalSetting={addSaleModalSetting}
            products={products}
            stores={stores}
            handlePageUpdate={handlePageUpdate}
            authContext={authContext}
          />
        )}
        {/* Sales Table */}
        <div className="overflow-x-auto rounded-lg border bg-white border-gray-200">
          <div className="flex justify-between pt-5 pb-3 px-3">
            <div className="flex gap-4 justify-center items-center">
              <span className="font-bold">Sales</span>
            </div>
            <div className="flex gap-4">
              <button
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold p-2 text-xs rounded"
                onClick={addSaleModalSetting}
              >
                Add Sales
              </button>
            </div>
          </div>
          <table className="min-w-full divide-y-2 divide-gray-200 text-sm">
            <thead>
              <tr>
                <th className="whitespace-nowrap px-4 py-2 text-left font-medium text-gray-900">
                  Product Name
                </th>
                <th className="whitespace-nowrap px-4 py-2 text-left font-medium text-gray-900">
                  Stock Sold
                </th>
                <th className="whitespace-nowrap px-4 py-2 text-left font-medium text-gray-900">
                  Sale Price
                </th>
                <th className="whitespace-nowrap px-4 py-2 text-left font-medium text-gray-900">
                  Sales Date
                </th>
                <th className="whitespace-nowrap px-4 py-2 text-left font-medium text-gray-900">
                  Sales By
                </th>
                <th className="whitespace-nowrap px-4 py-2 text-left font-medium text-gray-900">
                  Total Sale Amount
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {sales.map((sale) =>
                sale.soldItems.map((item) => (
                  <tr key={`${sale._id}-${item._id}`}>
                    <td className="whitespace-nowrap px-4 py-2 text-gray-900">
                      {item.drugId.name}
                    </td>
                    <td className="whitespace-nowrap px-4 py-2 text-gray-700">
                      {item.quantity}
                    </td>
                    <td className="whitespace-nowrap px-4 py-2 text-gray-700">
                      ${item.drugId.salePrice}
                    </td>
                    <td className="whitespace-nowrap px-4 py-2 text-gray-700">
                      {new Date(sale.date).toLocaleDateString()}
                    </td>
                    <td className="whitespace-nowrap px-4 py-2 text-gray-700">
                      {sale.soldBy.firstName} {sale.soldBy.lastName}
                    </td>
                    <td className="whitespace-nowrap px-4 py-2 text-gray-700">
                      ${item.income}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="flex justify-between mt-4">
          <button
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded disabled:opacity-50"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
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
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

export default Sales;
