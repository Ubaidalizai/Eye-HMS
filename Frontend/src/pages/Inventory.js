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
  FaFilter,
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
  const [summary, setSummary] = useState({});
  const [products, setAllProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [updatePage, setUpdatePage] = useState(true);
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
    description: '',
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
    fetchInventorySummary();
    fetchProductsData();
    constructUrl(currentPage, category, searchTerm);
  }, [updatePage, url, currentPage, category, searchTerm]);

  const constructUrl = (page, selectedCategory, searchTerm) => {
    let baseUrl = `http://localhost:4000/api/v1/inventory/product?page=${page}&limit=${limit}`;

    if (selectedCategory) {
      baseUrl += `&category=${selectedCategory}`;
    }

    if (searchTerm) {
      baseUrl += `&fieldName=name&searchTerm=${searchTerm}`; // Add search term to the URL
    }
    setUrl(baseUrl);
  };

  // Fetch the inventory summary from the backend
  const fetchInventorySummary = async () => {
    try {
      const response = await fetch(
        'http://localhost:4000/api/v1/inventory/product/summary',
        {
          method: 'GET',
          credentials: 'include',
        }
      );
      const data = await response.json();
      setSummary(data.data);
    } catch (err) {
      console.log(err);
      toast.error('Failed to fetch inventory summary');
    }
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

    // Add the additional properties from selectedItem
    dispatch(
      moveItemAPI({
        item: {
          name: selectedItem.name,
          manufacturer: selectedItem.manufacturer,
          category: selectedItem.category,
          salePrice: salePriceNum,
          expiryDate: selectedItem.expiryDate,
        },
        quantity: quantityNum,
      })
    );
    closeMoveModal();
    toast.success('Item moved successfully');
    setUpdatePage((show) => !show);
  };
  const handleProductUpdate = (updatedProduct) => {
    setAllProducts((prevProducts) =>
      prevProducts.map((product) =>
        product._id === updatedProduct._id ? updatedProduct : product
      )
    );
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
    <div className=' flex justify-center'>
      <div className='flex flex-col gap-5  w-full px-6'>
        <ToastContainer />
        <div className='bg-white rounded'>
          <h2 className='font-semibold text-xl '>Inventory Dashboard</h2>
          <div className='flex flex-wrap justify-between items-center mb-10 mt-12'>
            <div className='flex items-center'>
              <FaBoxOpen className='text-3xl text-blue-500 mr-3' />
              <div>
                <p className='text-sm text-gray-500'>Total Products</p>
                <p className='text-xl font-semibold'>
                  {summary.totalProductsCount}
                </p>
              </div>
            </div>
            <div className='flex items-center'>
              <FaWarehouse className='text-3xl text-green-500 mr-3' />
              <div>
                <p className='text-sm text-gray-500'>Total Stock</p>
                <p className='text-xl font-semibold'>{summary.totalStock}</p>
              </div>
            </div>
            <div className='flex items-center'>
              <FaExchangeAlt className='text-3xl text-yellow-500 mr-3' />
              <div>
                <p className='text-sm text-gray-500'>Low Stock Items</p>
                <p className='text-xl font-semibold'>{summary.lowStockCount}</p>
              </div>
            </div>
          </div>
        </div>

        {showProductModal && (
          <div
            className='fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full'
            id='my-modal'
          >
            <div className='relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white'>
              <div className='mt-3 text-center'>
                <h3 className='text-lg leading-6 font-medium text-gray-900'>
                  Add New Product
                </h3>
                <form onSubmit={handleAddProduct} className='mt-2 text-left'>
                  <input
                    type='text'
                    placeholder='Product Name'
                    value={newProduct.name}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, name: e.target.value })
                    }
                    className='mt-2 p-2 w-full border rounded'
                    required
                  />
                  <input
                    type='text'
                    placeholder='Manufacturer'
                    value={newProduct.manufacturer}
                    onChange={(e) =>
                      setNewProduct({
                        ...newProduct,
                        manufacturer: e.target.value,
                      })
                    }
                    className='mt-2 p-2 w-full border rounded'
                    required
                  />
                  <input
                    type='text'
                    placeholder='Description'
                    value={newProduct.description}
                    onChange={(e) =>
                      setNewProduct({
                        ...newProduct,
                        description: e.target.value,
                      })
                    }
                    className='mt-2 p-2 w-full border rounded'
                    required
                  />
                  <select
                    value={newProduct.category}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, category: e.target.value })
                    }
                    className='mt-2 p-2 w-full border rounded'
                    required
                  >
                    <option value=''>Select a category</option>
                    <option value='drug'>Drug</option>
                    <option value='sunglasses'>sunglasses</option>
                    <option value='glass'>glass</option>
                    <option value='frame'>Frame</option>
                  </select>
                  <div className='items-center px-4 py-3'>
                    <button
                      id='ok-btn'
                      type='submit'
                      className='px-4 py-2 bg-green-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-300'
                    >
                      Add Product
                    </button>
                    <button
                      type='button'
                      onClick={() => setShowProductModal(false)}
                      className='mt-2 px-4 py-2 bg-red-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-300'
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
            onProductUpdate={handleProductUpdate}
            setUpdatePage={setUpdatePage} // Pass it here
          />
        )}

        <div className='overflow-x-auto rounded-lg bg-white border '>
          <div className='flex flex-row justify-between items-end  px-5 pb-3'>
            <div className=''>
              <FaSearch className=' translate-x-3 translate-y-7 text-gray-400' />
              <input
                type='text'
                placeholder='Search products...'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className='pl-10 pr-4 py-2 border border-gray-300 rounded w-64 focus:outline-none focus:ring-1 focus:ring-blue-500 h-9'
              />
            </div>

            <div className='flex flex-row items-center justify-center gap-3'>
              <label htmlFor='category' className='sr-only'>
                Category
              </label>

              <div className='relative'>
                <select
                  id='category'
                  name='category'
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className='block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md'
                >
                  <option value=''>All Categories</option>
                  <option value='drug'>Drug</option>
                  <option value='sunglasses'>sunglasses</option>
                  <option value='glass'>Glass</option>
                  <option value='frame'>Frame</option>
                </select>
                <div className='pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700'>
                  <FaFilter className='h-4 w-4' aria-hidden='true' />
                </div>
              </div>

              <button
                className='inline-flex items-center px-5 py-2 border border-transparent text-sm mr-0 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none  focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                onClick={() => setShowProductModal(true)}
              >
                <FaPlus className='mr-2' /> Add Product
              </button>
            </div>
          </div>

          {/* <div className='bg-white rounded-sm shadow overflow-x-auto'>
            <table className='w-full'>
              <thead className='bg-gray-50'>
                <tr>
                  <th
                    scope='col'
                    className='px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider'
                  >
                    Products
                  </th>
                  <th
                    scope='col'
                    className='px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider'
                  >
                    Manufacturer
                  </th>
                  <th
                    scope='col'
                    className='px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider'
                  >
                    Purchase
                  </th>
                  <th
                    scope='col'
                    className='px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider'
                  >
                    Sale
                  </th>
                  <th
                    scope='col'
                    className='px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider'
                  >
                    Category
                  </th>
                  <th
                    scope='col'
                    className='px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider'
                  >
                    Stock
                  </th>
                  <th
                    scope='col'
                    className='px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider'
                  >
                    Status
                  </th>
                  <th
                    scope='col'
                    className='px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider'
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className='bg-white divide-y divide-gray-200'>
                {products.map((item) => (
                  <tr key={item._id}>
                    <td className='whitespace-nowrap px-6 py-3  text-gray-900'>
                      {item.name}
                    </td>
                    <td className='whitespace-nowrap px-6 py-3  text-gray-700'>
                      {item.manufacturer}
                    </td>
                    <td className='whitespace-nowrap px-6 py-3 text-gray-700'>
                      {item.purchasePrice}
                    </td>
                    <td className='whitespace-nowrap px-6 py-3 text-gray-700'>
                      {item.salePrice}
                    </td>
                    <td className='whitespace-nowrap px-6 py-3  text-gray-700'>
                      {item.category}
                    </td>
                    <td className='whitespace-nowrap px-6 py-3   text-gray-700'>
                      {item.stock}
                    </td>
                    <td
                      className={`whitespace-nowrap px-6 py-3  text-xs font-medium ${
                        item.stock === 0
                          ? 'text-red-500'
                          : item.stock <= 10
                          ? 'text-yellow-500'
                          : 'text-green-500'
                      }`}
                    >
                      {item.stock === 0
                        ? 'Out of stock'
                        : item.stock <= 10
                        ? 'Low'
                        : 'Available'}
                    </td>
                    <td className='whitespace-nowrap px-4 py-2 text-gray-700'>
                      <button
                        className='text-indigo-600 hover:text-indigo-900 mr-2'
                        onClick={() => openMoveModal(item)}
                      >
                        <FaExchangeAlt />
                      </button>
                      <button
                        className='text-yellow-500 hover:text-yellow-700 mr-2'
                        onClick={() => handleEdit(item)}
                      >
                        <FaEdit />
                      </button>
                      <button
                        className='text-red-500 hover:text-red-700'
                        onClick={() => handleDelete(item._id)}
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div> */}

          <div className='px-4 sm:px-6 lg:px-0'>
            <div className='overflow-x-auto shadow-md sm:rounded-lg'>
              <table className='w-full text-sm text-left text-gray-500'>
                <thead className='text-xs text-gray-700 uppercase bg-gray-50'>
                  <tr>
                    <th
                      scope='col'
                      className='px-5 py-3 font-bold tracking-wider'
                    >
                      Products
                    </th>
                    <th
                      scope='col'
                      className='px-5 py-3 font-bold tracking-wider'
                    >
                      Manufacturer
                    </th>
                    <th
                      scope='col'
                      className='px-5 py-3 font-bold tracking-wider'
                    >
                      Purchase
                    </th>
                    <th
                      scope='col'
                      className='px-5 py-3 font-bold tracking-wider'
                    >
                      Sale
                    </th>
                    <th
                      scope='col'
                      className='px-5 py-3 font-bold tracking-wider'
                    >
                      Category
                    </th>
                    <th
                      scope='col'
                      className='px-5 py-3 font-bold tracking-wider'
                    >
                      Stock
                    </th>
                    <th
                      scope='col'
                      className='px-5 py-3 font-bold tracking-wider'
                    >
                      Status
                    </th>
                    <th
                      scope='col'
                      className='px-5 py-3 font-bold tracking-wider'
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className='bg-white divide-y divide-gray-200'>
                  {products.map((item) => (
                    <tr key={item._id} className='hover:bg-gray-50'>
                      <td className='px-6 py-4 whitespace-nowrap text-gray-900'>
                        {item.name}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-gray-700'>
                        {item.manufacturer}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-gray-700'>
                        {item.purchasePrice}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-gray-700'>
                        {item.salePrice}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-gray-700'>
                        {item.category}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-gray-700'>
                        {item.stock}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <span
                          className={`text-xs font-medium ${
                            item.stock === 0
                              ? 'text-red-500'
                              : item.stock <= 10
                              ? 'text-yellow-500'
                              : 'text-green-500'
                          }`}
                        >
                          {item.stock === 0
                            ? 'Out of stock'
                            : item.stock <= 10
                            ? 'Low'
                            : 'Available'}
                        </span>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm font-medium'>
                        <div className='flex space-x-2'>
                          <button
                            onClick={() => openMoveModal(item)}
                            className='text-indigo-600 hover:text-indigo-900'
                          >
                            <FaExchangeAlt className='w-5 h-5' />
                          </button>
                          <button
                            onClick={() => handleEdit(item)}
                            className='text-yellow-500 hover:text-yellow-700'
                          >
                            <FaEdit className='w-5 h-5' />
                          </button>
                          <button
                            onClick={() => handleDelete(item._id)}
                            className='text-red-500 hover:text-red-700'
                          >
                            <FaTrash className='w-5 h-5' />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <Transition appear show={isOpen} as={React.Fragment}>
          <Dialog as='div' className='relative z-10' onClose={closeMoveModal}>
            <Transition.Child
              as={React.Fragment}
              enter='ease-out duration-300'
              enterFrom='opacity-0 scale-95'
              enterTo='opacity-100 scale-100'
              leave='ease-in duration-200'
              leaveFrom='opacity-100 scale-100'
              leaveTo='opacity-0 scale-95'
            >
              <div className='fixed inset-0 bg-black bg-opacity-25' />
            </Transition.Child>

            <div className='fixed inset-0 overflow-y-auto'>
              <div className='flex items-center justify-center min-h-full p-4 text-center'>
                <Transition.Child
                  as={React.Fragment}
                  enter='ease-out duration-300'
                  enterFrom='opacity-0 scale-95'
                  enterTo='opacity-100 scale-100'
                  leave='ease-in duration-200'
                  leaveFrom='opacity-100 scale-100'
                  leaveTo='opacity-0 scale-95'
                >
                  <Dialog.Panel className='w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all'>
                    <Dialog.Title
                      as='h3'
                      className='text-lg font-medium leading-6 text-gray-900'
                    >
                      Move {selectedItem?.name}
                    </Dialog.Title>
                    <div className='mt-2'>
                      <p className='text-sm text-gray-500'>
                        Enter the quantity and sale price to move this item.
                      </p>
                      <div className='mt-4'>
                        <input
                          type='number'
                          className='border border-gray-300 p-2 rounded w-full'
                          placeholder='Quantity'
                          value={quantity}
                          onChange={(e) => setQuantity(e.target.value)}
                        />
                      </div>
                      <div className='mt-4'>
                        <input
                          type='text'
                          className='border border-gray-300 p-2 rounded w-full'
                          placeholder='Sale Price'
                          value={salePrice}
                          onChange={(e) => setSalePrice(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className='mt-6 flex justify-end space-x-4'>
                      <button
                        type='button'
                        className='px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400'
                        onClick={closeMoveModal}
                      >
                        Cancel
                      </button>
                      <button
                        type='button'
                        className='px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700'
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

        <div className='flex justify-between mt-4'>
          <button
            className=' py-2 text-gray-700 rounded disabled:opacity-50 flex items-center'
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1 || totalPages === 0}
          >
            <FaChevronLeft className='mr-2' /> Previous
          </button>

          <span className='flex items-center text-gray-700'>
            Page {currentPage} of {totalPages}
          </span>

          <button
            className=' py-2 text-gray-700 rounded disabled:opacity-50 flex items-center'
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages || totalPages === 0}
          >
            Next <FaChevronRight className='ml-2' />
          </button>
        </div>
      </div>
    </div>
  );
}

export default Inventory;
