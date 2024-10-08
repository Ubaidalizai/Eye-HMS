import React, { useState, useEffect, useContext } from 'react';
import AddSale from '../components/AddSale';
import AuthContext from '../AuthContext';

function Sales() {
  const [showSaleModal, setShowSaleModal] = useState(false);
  const [sales, setSales] = useState([]);
  const [products, setAllProducts] = useState([]);
  const [stores, setAllStores] = useState([]);
  const [updatePage, setUpdatePage] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10; // Number of items per page
  const [category, setCategory] = useState('');

  const authContext = useContext(AuthContext);
  const user = JSON.parse(localStorage.getItem('user'));

  // Determine initial URL based on role
  useEffect(() => {
    fetchSales();
    fetchProductsData();
  }, [currentPage, category]);

  // Handle category change (only for admin)
  const handleCategoryChange = (e) => {
    setCategory(e.target.value);
    setCurrentPage(1); // Reset to page 1 when category changes
  };

  // Fetch paginated sales data from the backend
  const fetchSales = async () => {
    try {
      let baseUrl = `http://localhost:4000/api/v1/sales?page=${currentPage}&limit=${limit}`;

      if (user.role === 'sunglassesSeller') {
        baseUrl += '&category=sunglasses';
      } else if (user.role === 'pharmacist') {
        baseUrl += '&category=drug';
      }

      // If admin selected a category
      if (category) {
        baseUrl += `&category=${category}`;
      }

      const response = await fetch(baseUrl, {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      setSales(data.data.results);
      setTotalPages(
        data.totalPages || Math.ceil(Math.ceil(data.results / limit))
      );
    } catch (err) {
      console.log(err);
    }
  };

  // Fetching Data of All Products
  const fetchProductsData = () => {
    let baseUrl = `http://localhost:4000/api/v1/pharmacy`;

    if (user.role === 'sunglassesSeller') {
      baseUrl += `?category=sunglasses&checkQuantity=true`;
    } else if (user.role === 'pharmacist') {
      baseUrl += `?category=drug&checkQuantity=true`;
    }

    fetch(baseUrl, {
      credentials: 'include',
      method: 'GET',
    })
      .then((response) => response.json())
      .then((data) => {
        setAllProducts(data.data.results);
      })
      .catch((err) => console.log(err));
  };

  // Modal for Sale Add
  const addSaleModalSetting = () => {
    setShowSaleModal(!showSaleModal);
  };

  // Handle Page Update
  const handlePageUpdate = () => {
    setUpdatePage(!updatePage);
  };

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

            {/* Category Dropdown for Admin */}
            {user.role === 'admin' && (
              <div className="flex items-center">
                <label
                  htmlFor="category"
                  className="mb-2 font-bold text-gray-900 dark:text-white mr-2"
                >
                  Category
                </label>
                <select
                  id="category"
                  name="category"
                  value={category}
                  onChange={handleCategoryChange}
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full pt-2 pb-2"
                >
                  <option value="">Select Category</option>
                  <option value="drug">Drug</option>
                  <option value="sunglasses">Sunglasses</option>
                </select>
              </div>
            )}

            <div className="flex gap-4">
              <button
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold p-2 text-xs rounded"
                onClick={addSaleModalSetting}
              >
                Add Sales
              </button>
            </div>
          </div>

          {/* Table for Sales */}
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
              {sales.length > 0 ? (
                sales.map((sale) =>
                  sale.soldDetails.map((item) => (
                    <tr key={`${sale._id}-${item._id}`}>
                      <td className="whitespace-nowrap px-4 py-2 text-gray-900">
                        {item.productRefId?.name}
                      </td>
                      <td className="whitespace-nowrap px-4 py-2 text-gray-700">
                        {item.quantity}
                      </td>
                      <td className="whitespace-nowrap px-4 py-2 text-gray-700">
                        ${item.productRefId?.salePrice}
                      </td>
                      <td className="whitespace-nowrap px-4 py-2 text-gray-700">
                        {new Date(sale.date).toLocaleDateString()}
                      </td>
                      <td className="whitespace-nowrap px-4 py-2 text-gray-700">
                        {sale.userID?.firstName} {sale.userID?.lastName}
                      </td>
                      <td className="whitespace-nowrap px-4 py-2 text-gray-700">
                        ${item.income}
                      </td>
                    </tr>
                  ))
                )
              ) : (
                <tr>
                  <td colSpan="6">No sales available</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

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
    </div>
  );
}

export default Sales;
