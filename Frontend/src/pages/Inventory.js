/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useContext } from 'react';
import { useDispatch } from 'react-redux';
import { Dialog, Transition } from '@headlessui/react';
import {
  FaDollarSign,
  FaTrash,
  FaBoxOpen,
  FaWarehouse,
  FaExchangeAlt,
  FaPlus,
  FaSearch,
  FaFilter,
  FaRegEdit,
} from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AuthContext from '../AuthContext';
import { moveItemAPI } from '../redux/inventorySlice';
import UpdateProduct from '.././components/UpdateProduct';
import Pagination from '../components/Pagination';
import { BASE_URL } from '../config';

function Inventory() {
  const [showProductModal, setShowProductModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updateProduct, setUpdateProduct] = useState(null);
  const [summary, setSummary] = useState({});
  const [products, setAllProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [updatePage, setUpdatePage] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [category, setCategory] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [salePrice, setSalePrice] = useState('');
  const [isAddButtonDisabled, setIsAddButtonDisabled] = useState(false);

  const [newProduct, setNewProduct] = useState({
    name: '',
    manufacturer: '',
    minLevel: '',
    expireNotifyDuration: '',
    stock: 0,
    category: '',
  });
  const dispatch = useDispatch();
  const authContext = useContext(AuthContext);

  useEffect(() => {
    fetchInventorySummary();
    fetchProductsData();
  }, [updatePage, currentPage, category, searchTerm, limit]);

  // Fetch the inventory summary from the backend
  const fetchInventorySummary = async () => {
    try {
      const response = await fetch(
        `${BASE_URL}/inventory/product/summary?category=${category}`,
        {
          method: 'GET',
          credentials: 'include',
        }
      );
      const data = await response.json();
      setSummary(data);
    } catch (err) {
      console.log(err);
      toast.error('Failed to fetch inventory summary');
    }
  };

  const fetchProductsData = async () => {
    try {
      const response = await fetch(
        `${BASE_URL}/inventory/product?page=${currentPage}&limit=${limit}&fieldName=name&searchTerm=${searchTerm}&category=${category}`,
        {
          method: 'GET',
          credentials: 'include',
        }
      );
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

  const handleMoveItem = async () => {
    const quantityNum = Number.parseInt(quantity, 10);
    const salePriceNum = Number.parseFloat(salePrice);

    if (
      isNaN(quantityNum) ||
      quantityNum <= 0 ||
      quantityNum > selectedItem.stock
    ) {
      console.error('Invalid quantity:', quantityNum);
      toast.error('Please enter a valid quantity.');
      return;
    }
    if (isNaN(salePriceNum) || salePriceNum <= 0) {
      console.error('Invalid sale price:', salePriceNum);
      toast.error('Please enter a valid sale price.');
      return;
    }

    await dispatch(
      moveItemAPI({
        item: {
          name: selectedItem.name,
          manufacturer: selectedItem.manufacturer,
          category: selectedItem.category,
          salePrice: salePriceNum,
          minLevel: 10,
          expireNotifyDuration: 10,
          expiryDate: selectedItem.expiryDate,
        },
        quantity: quantityNum,
      })
    );
    closeMoveModal();
    fetchProductsData();
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
          `${BASE_URL}/inventory/product/${productId}`,
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
    setIsAddButtonDisabled(true); // Disable the button

    try {
      const response = await fetch(`${BASE_URL}/inventory/product`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newProduct),
        credentials: 'include',
      });

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
    } finally {
      setIsAddButtonDisabled(false); // Re-enable the button after the operation
    }
  };

  return (
    <div className=' flex flex-col justify-center'>
      <h2 className='font-semibold text-xl '>Inventory</h2>
      <div className='flex flex-col gap-5  w-full'>
        <ToastContainer />
        <div className='bg-white rounded'>
          <div className='flex flex-wrap justify-between items-center  mt-5'>
            <div className='flex items-center'>
              <FaDollarSign className='text-3xl text-blue-500 mr-3' />
              <div>
                <p className='text-sm text-gray-500'>Total Available Value</p>
                <p className='text-xl font-semibold'>
                  {summary.totalSalePrice}
                </p>
              </div>
            </div>
            <div className='flex items-center'>
              <FaBoxOpen className='text-3xl text-blue-500 mr-3' />
              <div>
                <p className='text-sm text-gray-500'>Total Products</p>
                <p className='text-xl font-semibold'>{summary.length}</p>
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
              <div>
                <h3 className='text-lg leading-6 font-medium text-gray-900'>
                  Add New Product
                </h3>
                <form onSubmit={handleAddProduct} className='mt-2 text-left'>
                  <div className='grid grid-cols-1 gap-2'>
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
                      type='number'
                      placeholder='Min Level'
                      value={newProduct.minLevel}
                      onChange={(e) =>
                        setNewProduct({
                          ...newProduct,
                          minLevel: e.target.value,
                        })
                      }
                      className='mt-2 p-2 w-full border rounded'
                      required
                    />
                    <input
                      type='number'
                      placeholder='Expire notify duration (days)'
                      value={newProduct.expireNotifyDuration}
                      onChange={(e) =>
                        setNewProduct({
                          ...newProduct,
                          expireNotifyDuration: e.target.value,
                        })
                      }
                      className='mt-2 p-2 w-full border rounded'
                      required
                    />
                    <select
                      value={newProduct.category}
                      onChange={(e) =>
                        setNewProduct({
                          ...newProduct,
                          category: e.target.value,
                        })
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
                  </div>
                  <div className='flex items-center justify-end gap-2 mt-10'>
                    <button
                      type='button'
                      onClick={() => setShowProductModal(false)}
                      className='inline-flex items-center px-3 py-1 border border-transparent text-sm mr-0 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none  focus:ring-2 focus:ring-offset-2 focus:ring-red-500'
                    >
                      Cancel
                    </button>

                    <button
                      id='ok-btn'
                      type='submit'
                      disabled={isAddButtonDisabled} // Bind the disabled state
                      className={`inline-flex items-center px-2 py-1 border border-transparent text-sm mr-0 font-medium rounded-md text-white ${
                        isAddButtonDisabled
                          ? 'bg-gray-400 cursor-not-allowed'
                          : 'bg-indigo-600 hover:bg-indigo-700'
                      }`}
                    >
                      Add Product
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

              <div>
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
              </div>
              <button
                className='inline-flex items-center px-5 py-2 border border-transparent text-sm mr-0 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none  focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                onClick={() => setShowProductModal(true)}
              >
                <FaPlus className='mr-2' /> Add Product
              </button>
            </div>
          </div>

          <div className='px-4 sm:px-6 lg:px-0'>
            <div className='overflow-x-auto'>
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
                      Min level
                    </th>
                    <th
                      scope='col'
                      className='px-5 py-3 font-bold tracking-wider'
                    >
                      Expire Duration
                    </th>
                    <th
                      scope='col'
                      className='px-5 py-3 font-bold tracking-wider'
                    >
                      Expiry Date
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
                        {item.minLevel}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-gray-700'>
                        {item.expireNotifyDuration} days
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-gray-700'>
                        {item.expiryDate?.split('T')[0]}
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
                              : item.stock <= item.minLevel
                              ? 'text-yellow-500'
                              : 'text-green-500'
                          }`}
                        >
                          {item.stock === 0
                            ? 'Out of stock'
                            : item.stock <= item.minLevel
                            ? 'Low'
                            : 'Available'}
                        </span>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm font-medium'>
                        <div className='flex space-x-2'>
                          <button
                            onClick={() => openMoveModal(item)}
                            className='text-green-600 hover:text-green-900'
                          >
                            <FaExchangeAlt className='w-5 h-5' />
                          </button>
                          <button
                            onClick={() => handleEdit(item)}
                            className='font-medium text-indigo-600 hover:text-indigo-900'
                          >
                            <FaRegEdit className='w-5 h-5' />
                          </button>
                          <button
                            onClick={() => handleDelete(item._id)}
                            className='font-medium text-red-600 hover:text-red-700'
                          >
                            <FaTrash className='w-4 h-4' />
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
                        <label htmlFor='quality'>Quantity</label>
                        <input
                          id='quantity'
                          type='number'
                          className='border border-gray-300 p-2 rounded w-full'
                          placeholder='Quantity'
                          value={quantity}
                          onChange={(e) => setQuantity(e.target.value)}
                        />
                      </div>
                      <div className='mt-4'>
                        <label htmlFor='quality'>Sale Price</label>
                        <input
                          type='text'
                          className='border border-gray-300 p-2 rounded w-full'
                          placeholder='Sale Price'
                          value={salePrice}
                          onChange={(e) => setSalePrice(e.target.value)}
                          disabled
                        />
                      </div>
                    </div>

                    <div className='mt-6 flex justify-end space-x-4'>
                      <button
                        type='button'
                        className='inline-flex items-center px-3 py-1 border border-transparent text-sm mr-0 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none  focus:ring-2 focus:ring-offset-2 focus:ring-red-500'
                        onClick={closeMoveModal}
                      >
                        Cancel
                      </button>
                      <button
                        type='button'
                        className='inline-flex items-center px-2 py-1 border border-transparent text-sm mr-0 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none  focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
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

        <Pagination
          totalItems={products.length}
          totalPagesCount={totalPages}
          itemsPerPage={limit}
          currentPage={currentPage}
          onPageChange={(page) => setCurrentPage(page)}
          onLimitChange={(limit) => setLimit(limit)}
        />
      </div>
    </div>
  );
}

export default Inventory;
