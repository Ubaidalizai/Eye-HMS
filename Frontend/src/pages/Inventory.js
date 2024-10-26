import React, { useState, useEffect, useContext } from 'react';
import { useDispatch } from 'react-redux';
import { Dialog, Transition } from '@headlessui/react';
import {
  FaEdit,
  FaTrash,
  FaBoxOpen,
  FaWarehouse,
  FaExchangeAlt,
  FaPlus,
  FaChevronLeft,
  FaChevronRight,
  FaSearch,
} from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AuthContext from '../AuthContext';
import { moveItemAPI } from '../redux/inventorySlice';
import UpdateProduct from '.././components/UpdateProduct';

function Inventory() {
  const [showProductModal, setShowProductModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updateProduct, setUpdateProduct] = useState(null);
  const [products, setAllProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [updatePage, setUpdatePage] = useState(true);
  const [stores, setAllStores] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [category, setCategory] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [salePrice, setSalePrice] = useState('');
  const [newProduct, setNewProduct] = useState({
    name: '',
    manufacturer: '',
    stock: 0,
    category: '',
  });
  const dispatch = useDispatch();
  const authContext = useContext(AuthContext);
  const limit = 10;

  const [url, setUrl] = useState(
    `http://localhost:4000/api/v1/inventory/product`
  );

  useEffect(() => {
    fetchProductsData();
    fetchSalesData();
    constructUrl(currentPage, category, searchTerm);
  }, [updatePage, url, currentPage, category, searchTerm]);

  const constructUrl = (page, selectedCategory, searchTerm) => {
    let baseUrl = `http://localhost:4000/api/v1/inventory/product?page=${page}&limit=${limit}`;

    if (selectedCategory) {
      baseUrl += `&category=${selectedCategory}`;
    }

    if (searchTerm) {
      baseUrl += `&searchTerm=${searchTerm}`; // Add search term to the URL
    }
    console.log(baseUrl);
    setUrl(baseUrl);
  };

  const fetchProductsData = async () => {
    try {
      const response = await fetch(url, {
        method: 'GET',
        credentials: 'include',
      });
      const data = await response.json();
      setAllProducts(data.data.results);
      setTotalPages(data.totalPages || Math.ceil(data.results / limit));
    } catch (err) {
      console.log(err);
      toast.error('Failed to fetch products');
    }
  };

  const fetchSalesData = () => {
    fetch(`http://localhost:4000/api/store/get/${authContext.user}`)
      .then((response) => response.json())
      .then((data) => {
        setAllStores(data);
      })
      .catch((error) => {
        console.error('Error fetching sales data:', error);
        toast.error('Failed to fetch sales data');
      });
  };

  const openMoveModal = (item) => {
    setSelectedItem(item);
    setQuantity(1);
    setSalePrice(item.salePrice || '');
    setIsOpen(true);
  };

  const closeMoveModal = () => {
    setIsOpen(false);
  };

  const handleMoveItem = () => {
    const quantityNum = parseInt(quantity, 10);
    const salePriceNum = parseFloat(salePrice);

    if (
      isNaN(quantityNum) ||
      quantityNum <= 0 ||
      quantityNum > selectedItem.stock
    ) {
      toast.error('Please enter a valid quantity.');
      return;
    }
    if (isNaN(salePriceNum) || salePriceNum <= 0) {
      toast.error('Please enter a valid sale price.');
      return;
    }

    dispatch(
      moveItemAPI({
        item: { name: selectedItem.name, salePrice: salePriceNum },
        quantity: quantityNum,
      })
    );
    closeMoveModal();
    toast.success('Item moved successfully');
  };

  const handleEdit = (product) => {
    setUpdateProduct(product);
    setShowUpdateModal(true);
  };

  const handleDelete = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        const response = await fetch(
          `http://localhost:4000/api/v1/inventory/product/${productId}`,
          {
            method: 'DELETE',
            credentials: 'include',
          }
        );
        if (response.ok) {
          setUpdatePage(!updatePage);
          toast.success('Product deleted successfully');
        } else {
          toast.error('Failed to delete the product');
        }
      } catch (err) {
        console.log(err);
        toast.error('An error occurred while deleting the product');
      }
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(
        'http://localhost:4000/api/v1/inventory/product',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newProduct),
          credentials: 'include',
        }
      );

      if (response.ok) {
        setShowProductModal(false);
        setNewProduct({ name: '', manufacturer: '', stock: 0, category: '' });
        setUpdatePage(!updatePage);
        toast.success('Product added successfully');
      } else {
        toast.error('Failed to add product');
      }
    } catch (error) {
      console.error('Error adding product:', error);
      toast.error('An error occurred while adding the product');
    }
  };

  return (
    <div className="col-span-12 lg:col-span-10 flex justify-center">
      <div className="flex flex-col gap-5 w-11/12">
        <ToastContainer />
        <div className="bg-white rounded p-3">
          <span className="font-semibold px-4 text-xl">
            Inventory Dashboard
          </span>
          <div className="flex flex-wrap justify-around items-center mt-4">
            <div className="flex items-center p-4">
              <FaBoxOpen className="text-3xl text-blue-500 mr-3" />
              <div>
                <p className="text-sm text-gray-500">Total Products</p>
                <p className="text-xl font-semibold">{products.length}</p>
              </div>
            </div>
            <div className="flex items-center p-4">
              <FaWarehouse className="text-3xl text-green-500 mr-3" />
              <div>
                <p className="text-sm text-gray-500">Total Stock</p>
                <p className="text-xl font-semibold">
                  {products.reduce((sum, product) => sum + product.stock, 0)}
                </p>
              </div>
            </div>
            <div className="flex items-center p-4">
              <FaExchangeAlt className="text-3xl text-yellow-500 mr-3" />
              <div>
                <p className="text-sm text-gray-500">Low Stock Items</p>
                <p className="text-xl font-semibold">
                  {products.filter((product) => product.stock < 10).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        <button
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 flex items-center"
          onClick={() => setShowProductModal(true)}
        >
          <FaPlus className="mr-2" /> Add Product
        </button>

        {showProductModal && (
          <div
            className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full"
            id="my-modal"
          >
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3 text-center">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Add New Product
                </h3>
                <form onSubmit={handleAddProduct} className="mt-2 text-left">
                  <input
                    type="text"
                    placeholder="Product Name"
                    value={newProduct.name}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, name: e.target.value })
                    }
                    className="mt-2 p-2 w-full border rounded"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Manufacturer"
                    value={newProduct.manufacturer}
                    onChange={(e) =>
                      setNewProduct({
                        ...newProduct,
                        manufacturer: e.target.value,
                      })
                    }
                    className="mt-2 p-2 w-full border rounded"
                    required
                  />
                  <input
                    type="number"
                    placeholder="Stock"
                    value={newProduct.stock}
                    onChange={(e) =>
                      setNewProduct({
                        ...newProduct,
                        stock: parseInt(e.target.value),
                      })
                    }
                    className="mt-2 p-2 w-full border rounded"
                    required
                  />
                  <select
                    value={newProduct.category}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, category: e.target.value })
                    }
                    className="mt-2 p-2 w-full border rounded"
                    required
                  >
                    <option value="">Select a category</option>
                    <option value="drug">Drug</option>
                    <option value="sunglasses">Sunglasses</option>
                    <option value="frame">Frame</option>
                  </select>
                  <div className="items-center px-4 py-3">
                    <button
                      id="ok-btn"
                      type="submit"
                      className="px-4 py-2 bg-green-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-300"
                    >
                      Add Product
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowProductModal(false)}
                      className="mt-2 px-4 py-2 bg-red-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-300"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {showUpdateModal && (
          <UpdateProduct
            updateProductData={updateProduct}
            updateModalSetting={() => setShowUpdateModal(!showUpdateModal)}
          />
        )}

        <div className="overflow-x-auto rounded-lg border bg-white border-gray-200">
          <div className="flex justify-between pt-5 pb-3 px-3">
            <div className="flex items-center justify-center">
              <FaSearch className=" translate-x-8 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-full w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <table className="min-w-full divide-y-2 divide-gray-200 text-sm">
            <thead>
              <tr>
                <th className="whitespace-nowrap px-4 py-2 text-left font-medium text-gray-900">
                  Products
                </th>
                <th className="whitespace-nowrap px-4 py-2 text-left font-medium text-gray-900">
                  Manufacturer
                </th>
                <th className="whitespace-nowrap px-4 py-2 text-left font-medium text-gray-900">
                  Stock
                </th>
                <th className="whitespace-nowrap px-4 py-2 text-left font-medium text-gray-900">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {products.map((item) => (
                <tr key={item._id}>
                  <td className="whitespace-nowrap px-4 py-2 text-gray-900">
                    {item.name}
                  </td>
                  <td className="whitespace-nowrap px-4 py-2 text-gray-700">
                    {item.manufacturer}
                  </td>
                  <td className="whitespace-nowrap px-4 py-2 text-gray-700">
                    {item.stock}
                  </td>
                  <td className="whitespace-nowrap px-4 py-2 text-gray-700">
                    <button
                      className="text-indigo-600 hover:text-indigo-900 mr-2"
                      onClick={() => openMoveModal(item)}
                    >
                      <FaExchangeAlt />
                    </button>
                    <button
                      className="text-yellow-500 hover:text-yellow-700 mr-2"
                      onClick={() => handleEdit(item)}
                    >
                      <FaEdit />
                    </button>
                    <button
                      className="text-red-500 hover:text-red-700"
                      onClick={() => handleDelete(item._id)}
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Transition appear show={isOpen} as={React.Fragment}>
          <Dialog as="div" className="relative z-10" onClose={closeMoveModal}>
            <Transition.Child
              as={React.Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <div className="fixed inset-0 bg-black bg-opacity-25" />
            </Transition.Child>

            <div className="fixed inset-0 overflow-y-auto">
              <div className="flex items-center justify-center min-h-full p-4 text-center">
                <Transition.Child
                  as={React.Fragment}
                  enter="ease-out duration-300"
                  enterFrom="opacity-0 scale-95"
                  enterTo="opacity-100 scale-100"
                  leave="ease-in duration-200"
                  leaveFrom="opacity-100 scale-100"
                  leaveTo="opacity-0 scale-95"
                >
                  <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                    <Dialog.Title
                      as="h3"
                      className="text-lg font-medium leading-6 text-gray-900"
                    >
                      Move {selectedItem?.name}
                    </Dialog.Title>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Enter the quantity and sale price to move this item.
                      </p>
                      <div className="mt-4">
                        <input
                          type="number"
                          className="border border-gray-300 p-2 rounded w-full"
                          placeholder="Quantity"
                          value={quantity}
                          onChange={(e) => setQuantity(e.target.value)}
                        />
                      </div>
                      <div className="mt-4">
                        <input
                          type="text"
                          className="border border-gray-300 p-2 rounded w-full"
                          placeholder="Sale Price"
                          value={salePrice}
                          onChange={(e) => setSalePrice(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="mt-6 flex justify-end space-x-4">
                      <button
                        type="button"
                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                        onClick={closeMoveModal}
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                        onClick={handleMoveItem}
                      >
                        Move
                      </button>
                    </div>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </Dialog>
        </Transition>

        <div className="flex justify-between mt-4">
          <button
            className="px-4 py-2 text-gray-700 rounded disabled:opacity-50 flex items-center"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1 || totalPages === 0}
          >
            <FaChevronLeft className="mr-2" /> Previous
          </button>

          <span className="flex items-center text-gray-700">
            Page {currentPage} of {totalPages}
          </span>

          <button
            className="px-4 py-2 text-gray-700 rounded disabled:opacity-50 flex items-center"
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages || totalPages === 0}
          >
            Next <FaChevronRight className="ml-2" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default Inventory;
