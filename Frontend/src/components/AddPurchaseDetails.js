import { Fragment, useEffect, useRef, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { BASE_URL } from '../config';

export default function AddPurchaseDetails({
  addSaleModalSetting,
  handlePageUpdate,
}) {
  const [products, setAllProducts] = useState([]);
  const [productCatagory, setProductCatagory] = useState('');
  const [purchase, setPurchase] = useState({
    productID: '',
    QuantityPurchased: '',
    date: '',
    unitPurchaseAmount: '',
    salePrice: '',
    category: '',
    expiryDate: '',
  });
  const [errors, setErrors] = useState({});
  const [open, setOpen] = useState(true);
  const cancelButtonRef = useRef(null);

  const fetchProductsData = (productCatagory) => {
    let url = `${BASE_URL}/inventory/product`;
    if (productCatagory) {
      url += `?category=${productCatagory}`;
    }

    fetch(url, {
      credentials: 'include',
    })
      .then((response) => response.json())
      .then((data) => {
        setAllProducts(data.data.results);
      })
      .catch((err) => console.log(err));
  };

  useEffect(() => {
    fetchProductsData(productCatagory);
  }, []);

  const handleInputChange = (key, value) => {
    setPurchase({ ...purchase, [key]: value });
    // Clear error when user starts typing
    if (errors[key]) {
      setErrors({ ...errors, [key]: '' });
    }
  };

  const validateForm = () => {
    let formErrors = {};
    if (!purchase.productID) formErrors.productID = 'Product is required';
    if (!purchase.QuantityPurchased)
      formErrors.QuantityPurchased = 'Quantity is required';
    if (purchase.QuantityPurchased && parseInt(purchase.QuantityPurchased) <= 0)
      formErrors.QuantityPurchased = 'Quantity must be positive';
    if (!purchase.unitPurchaseAmount)
      formErrors.unitPurchaseAmount = 'Unit purchase amount is required';
    if (
      purchase.unitPurchaseAmount &&
      parseFloat(purchase.unitPurchaseAmount) <= 0
    )
      formErrors.unitPurchaseAmount = 'Unit purchase amount must be positive';
    if (!purchase.salePrice) formErrors.salePrice = 'Sale price is required';
    if (purchase.salePrice && parseFloat(purchase.salePrice) <= 0)
      formErrors.salePrice = 'Sale price must be positive';
    if (!purchase.date) formErrors.date = 'Purchase date is required';
    setErrors(formErrors);
    return Object.keys(formErrors).length === 0;
  };

  const addSale = () => {
    if (validateForm()) {
      fetch(`${BASE_URL}/purchase`, {
        credentials: 'include',
        method: 'POST',
        headers: {
          'Content-type': 'application/json',
        },
        body: JSON.stringify(purchase),
      })
        .then((result) => {
          alert('Purchase ADDED');
          handlePageUpdate();
          addSaleModalSetting();
        })
        .catch((err) => console.log(err));
    }
  };

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog
        as='div'
        className='relative z-10'
        initialFocus={cancelButtonRef}
        onClose={setOpen}
      >
        <Transition.Child
          as={Fragment}
          enter='ease-out duration-300'
          enterFrom='opacity-0'
          enterTo='opacity-100'
          leave='ease-in duration-200'
          leaveFrom='opacity-100'
          leaveTo='opacity-0'
        >
          <div className='fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity' />
        </Transition.Child>

        <div className='fixed inset-0 z-10 overflow-y-auto'>
          <div className='flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0 '>
            <Transition.Child
              as={Fragment}
              enter='ease-out duration-300'
              enterFrom='opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95'
              enterTo='opacity-100 translate-y-0 sm:scale-100'
              leave='ease-in duration-200'
              leaveFrom='opacity-100 translate-y-0 sm:scale-100'
              leaveTo='opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95'
            >
              <Dialog.Panel className='relative transform rounded-md pt-5 bg-white shadow-xl transition-all px-10 '>
                <div className='flex flex-col justify-center items-center'>
                  <div className=''>
                    <div className='  '>
                      <Dialog.Title
                        as='h3'
                        className='text-lg font-semibold text-left leading-6 text-gray-900 '
                      >
                        Purchase Details
                      </Dialog.Title>
                      <form action='#'>
                        <div className='grid gap-4 mt-6 sm:grid-cols-2'>
                          <div className='flex items-start flex-col'>
                            <label
                              htmlFor='category'
                              className='block mb-2 text-sm font-medium text-gray-900'
                            >
                              Category
                            </label>
                            <select
                              id='category'
                              name='category'
                              value={purchase.category}
                              onChange={(e) => {
                                handleInputChange('category', e.target.value);
                                setProductCatagory(e.target.value);
                                fetchProductsData(e.target.value);
                              }}
                              className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5'
                            >
                              <option value=''>Select a category</option>
                              <option value='drug'>Drug</option>
                              <option value='sunglasses'>sunglasses</option>
                              <option value='glass'>Glass</option>
                              <option value='frame'>frame</option>
                            </select>
                          </div>

                          <div className='flex items-start flex-col'>
                            <label
                              htmlFor='productID'
                              className='block mb-2 text-sm font-medium text-gray-900'
                            >
                              Product Name
                            </label>
                            <select
                              id='productID'
                              className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-[12rem] p-2.5 dark:focus:ring-primary-500 dark:focus:border-primary-500'
                              name='productID'
                              value={purchase.productID}
                              onChange={(e) =>
                                handleInputChange(e.target.name, e.target.value)
                              }
                            >
                              <option value=''>Select Products</option>
                              {products.map((element) => (
                                <option key={element._id} value={element._id}>
                                  {element.name}
                                </option>
                              ))}
                            </select>
                            {errors.productID && (
                              <p className='text-red-500 text-xs mt-1'>
                                {errors.productID}
                              </p>
                            )}
                          </div>

                          <div className='flex items-start flex-col'>
                            <label
                              htmlFor='QuantityPurchased'
                              className='block mb-2 text-sm font-medium text-gray-900'
                            >
                              Quantity Purchased
                            </label>
                            <input
                              type='number'
                              name='QuantityPurchased'
                              id='QuantityPurchased'
                              value={purchase.QuantityPurchased}
                              onChange={(e) =>
                                handleInputChange(e.target.name, e.target.value)
                              }
                              className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-[12rem] p-2.5 dark:focus:ring-primary-500 dark:focus:border-primary-500'
                              placeholder='1 - 999'
                              min='1'
                            />
                            {errors.QuantityPurchased && (
                              <p className='text-red-500 text-xs mt-1'>
                                {errors.QuantityPurchased}
                              </p>
                            )}
                          </div>

                          <div className='flex items-start flex-col'>
                            <label
                              htmlFor='unitPurchaseAmount'
                              className='block mb-2 text-sm font-medium text-gray-90'
                            >
                              Unit Purchase Amount
                            </label>
                            <input
                              type='number'
                              name='unitPurchaseAmount'
                              id='unitPurchaseAmount'
                              value={purchase.unitPurchaseAmount}
                              onChange={(e) =>
                                handleInputChange(e.target.name, e.target.value)
                              }
                              className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-[12rem] p-2.5  dark:focus:ring-primary-500 dark:focus:border-primary-500'
                              placeholder='$20'
                              min='1'
                            />
                            {errors.unitPurchaseAmount && (
                              <p className='text-red-500 text-xs mt-1'>
                                {errors.unitPurchaseAmount}
                              </p>
                            )}
                          </div>

                          <div className='flex items-start flex-col'>
                            <label
                              htmlFor='salePrice'
                              className='block mb-2 text-sm font-medium text-gray-900'
                            >
                              Unit Sale Price
                            </label>
                            <input
                              type='number'
                              name='salePrice'
                              id='salePrice'
                              value={purchase.salePrice}
                              onChange={(e) =>
                                handleInputChange(e.target.name, e.target.value)
                              }
                              className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-[12rem] p-2.5   dark:focus:ring-primary-500 dark:focus:border-primary-500'
                              placeholder='20'
                              min='0.01'
                              step='0.01'
                            />
                            {errors.salePrice && (
                              <p className='text-red-500 text-xs mt-1'>
                                {errors.salePrice}
                              </p>
                            )}
                          </div>

                          <div className='flex items-start flex-col'>
                            <label
                              className='block mb-2 text-sm font-medium text-gray-900'
                              htmlFor='date'
                            >
                              Purchase Date
                            </label>
                            <input
                              className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-[12rem] p-2.5 dark:focus:ring-primary-500 dark:focus:border-primary-500'
                              type='date'
                              id='date'
                              name='date'
                              value={purchase.date}
                              onChange={(e) =>
                                handleInputChange(e.target.name, e.target.value)
                              }
                            />
                            {errors.date && (
                              <p className='text-red-500 text-xs mt-1'>
                                {errors.date}
                              </p>
                            )}
                          </div>
                          <div className='flex items-start flex-col'>
                            <label
                              className='block mb-2 text-sm font-medium text-gray-900'
                              htmlFor='expiryDate'
                            >
                              Product Expiry Date
                            </label>
                            <input
                              className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-[12rem] p-2.5   dark:focus:ring-primary-500 dark:focus:border-primary-500'
                              type='date'
                              id='expiryDate'
                              name='expiryDate'
                              value={purchase.expiryDate}
                              onChange={(e) =>
                                handleInputChange(e.target.name, e.target.value)
                              }
                            />
                          </div>
                        </div>
                        <div className='flex  justify-end gap-2 pb-5'>
                          <button
                            type='button'
                            className='inline-flex items-center px-3 py-1 border border-transparent text-sm mr-0 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none  focus:ring-2 focus:ring-offset-2 focus:ring-red-500'
                            onClick={() => addSaleModalSetting()}
                            ref={cancelButtonRef}
                          >
                            Cancel
                          </button>
                          <button
                            type='button'
                            className='inline-flex items-center px-2 py-1 border border-transparent text-sm mr-0 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                            onClick={addSale}
                          >
                            Add purchase
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
