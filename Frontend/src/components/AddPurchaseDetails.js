import { Fragment, useEffect, useRef, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import Select from 'react-select';
import { BASE_URL } from '../config';

export default function AddPurchaseDetails({
  addSaleModalSetting,
  handlePageUpdate,
  authContext,
}) {
  const [products, setAllProducts] = useState([]);
  const [productCatagory, setProductCatagory] = useState('');
  const [isAddButtonDisabled, setIsAddButtonDisabled] = useState(false);

  const [purchase, setPurchase] = useState({
    productID: '',
    QuantityPurchased: '',
    date: '',
    unitPurchaseAmount: '',
    expiryDate: '',
    category: '',
  });
  const [errors, setErrors] = useState({});
  const [open, setOpen] = useState(true);
  const cancelButtonRef = useRef(null);

  const fetchProductsData = (productCatagory) => {
    // Determine the URL based on the user's role
    let url =
      authContext.user.role === 'admin'
        ? `${BASE_URL}/inventory/product`
        : authContext.user.role === 'receptionist'
        ? `${BASE_URL}/glasses`
        : null;

    if (!url) {
      throw new Error('Invalid user role. Cannot fetch products.');
    }
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
    if (!purchase.date) formErrors.date = 'Purchase date is required';
    if (authContext.user.role === 'admin') {
      if (!purchase.expiryDate)
        formErrors.expiryDate = 'Expiry date is required';
    }
    setErrors(formErrors);
    return Object.keys(formErrors).length === 0;
  };

  const addSale = async () => {
    if (!validateForm()) {
      alert('Please fill in all required fields correctly.');
      return;
    }
    setIsAddButtonDisabled(true); // Disable the button

    const selectedProduct = products.find((p) => p._id === purchase.productID);
    const category = selectedProduct?.category || 'unknown';

    fetch(`${BASE_URL}/purchase`, {
      credentials: 'include',
      method: 'POST',
      headers: {
        'Content-type': 'application/json',
      },
      body: JSON.stringify({ ...purchase, category }),
    })
      .then(async (result) => {
        if (!result.ok) {
          // Attempt to parse error from backend response
          let errorMessage = 'Failed to add purchase.';
          try {
            const errorResponse = await result.json();
            errorMessage = errorResponse.message || errorMessage;
          } catch {
            errorMessage = await result.text(); // Fallback to plain text
          }
          throw new Error(errorMessage);
        }

        return result.json(); // Parse success response
      })
      .then((data) => {
        handlePageUpdate(); // Refresh the list or page data
        addSaleModalSetting(); // Close the modal
      })
      .catch((err) => {
        console.error('Error adding purchase:', err.message);
        alert(err.message || 'Something went wrong while adding the purchase.');
      })
      .finally(() => {
        setIsAddButtonDisabled(false); // Re-enable the button after operation
      });
  };

  // Convert product list to react-select options
  const productOptions = products.map((product) => ({
    value: product._id,
    label: product.name,
  }));

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog
        as='div'
        className='relative z-[9999]'
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
          <div className='fixed inset-0 bg-gray-900 bg-opacity-50 transition-opacity' />
        </Transition.Child>

        <div className='fixed inset-0 z-[9999] overflow-y-auto'>
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
              <Dialog.Panel className='relative transform rounded-lg pt-5 bg-white shadow-2xl border border-gray-200 transition-all px-10'>
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
                              htmlFor='productID'
                              className='block mb-2 text-sm font-medium text-gray-900'
                            >
                              Product Name
                            </label>

                            <div className='w-[12rem]'>
                              <Select
                                id='productID'
                                name='productID'
                                options={productOptions}
                                value={productOptions.find(
                                  (option) =>
                                    option.value === purchase.productID
                                )}
                                onChange={(selectedOption) =>
                                  handleInputChange(
                                    'productID',
                                    selectedOption ? selectedOption.value : ''
                                  )
                                }
                                isClearable
                                placeholder='Select Product...'
                              />
                            </div>

                            {errors.productID && (
                              <p className='text-red-500 text-xs mt-1'>
                                {errors.productID}
                              </p>
                            )}
                          </div>

                          <div className='flex items-start flex-col'>
                            <label
                              htmlFor='category'
                              className='block mb-2 text-sm font-medium text-gray-900'
                            >
                              Category (!Optional)
                            </label>
                            <select
                              id='category'
                              name='category'
                              onChange={(e) => {
                                handleInputChange('category', e.target.value);
                                setProductCatagory(e.target.value);
                                fetchProductsData(e.target.value);
                              }}
                              className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5'
                            >
                              <option value=''>Filter by Category</option>
                              <option value='sunglasses'>sunglasses</option>
                              <option value='glass'>Glass</option>
                              <option value='frame'>frame</option>
                            </select>
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
                              placeholder='20'
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
                          {authContext.user.role === 'admin' && (
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
                                  handleInputChange(
                                    e.target.name,
                                    e.target.value
                                  )
                                }
                              />
                            </div>
                          )}
                        </div>
                        <div className='flex  justify-end gap-2 pb-5 mt-8'>
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
                            disabled={isAddButtonDisabled} // Bind the disabled state
                            className={`inline-flex items-center px-2 py-1 border border-transparent text-sm mr-0 font-medium rounded-md text-white ${
                              isAddButtonDisabled
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-indigo-600 hover:bg-indigo-700'
                            }`}
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
