import { Fragment, useEffect, useRef, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { PlusIcon } from "@heroicons/react/24/outline";

export default function AddPurchaseDetails({
  addSaleModalSetting,
  handlePageUpdate,
}) {
  const [products, setAllProducts] = useState([]);
  const [productCatagory, setProductCatagory] = useState("");
  const [purchase, setPurchase] = useState({
    productID: "",
    QuantityPurchased: 0,
    date: "",
    unitPurchaseAmount: "",
    category: "", // New category field
  });
  const [open, setOpen] = useState(true);
  const cancelButtonRef = useRef(null);

  const fetchProductsData = (productCatagory) => {
    let url = "http://localhost:4000/api/v1/inventory/product";
    if (productCatagory) {
      url += `?category=${productCatagory}`;
    }

    fetch(url, {
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => {
        setAllProducts(data.data.results);
      })
      .catch((err) => console.log(err));
  };

  useEffect(() => {
    fetchProductsData("");
  }, []);
  // Handling Input Change for input fields
  const handleInputChange = (key, value) => {
    setPurchase({ ...purchase, [key]: value });
  };

  // POST Data
  const addSale = () => {
    fetch("http://localhost:4000/api/v1/purchase", {
      credentials: "include",
      method: "POST",
      headers: {
        "Content-type": "application/json",
      },
      body: JSON.stringify(purchase),
    })
      .then((result) => {
        alert("Purchase ADDED");
        handlePageUpdate();
        addSaleModalSetting();
      })
      .catch((err) => console.log(err));
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
              <Dialog.Panel className='relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg overflow-y-scroll'>
                <div className='bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4'>
                  <div className='sm:flex sm:items-start'>
                    <div className='mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10'>
                      <PlusIcon
                        className='h-6 w-6 text-blue-400'
                        aria-hidden='true'
                      />
                    </div>
                    <div className='mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left '>
                      <Dialog.Title
                        as='h3'
                        className='text-lg py-4 font-semibold leading-6 text-gray-900 '
                      >
                        Purchase Details
                      </Dialog.Title>
                      <form action='#'>
                        <div className='grid gap-4 mb-4 sm:grid-cols-2'>
                          <div>
                            <label
                              htmlFor='category'
                              className='block mb-2 text-sm font-medium text-gray-900 dark:text-white'
                            >
                              Category
                            </label>
                            <select
                              id='category'
                              name='category'
                              value={purchase.category}
                              onChange={(e) => {
                                handleInputChange("category", e.target.value);
                                setProductCatagory(e.target.value);
                                fetchProductsData(e.target.value);
                              }}
                              className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5'
                            >
                              <option value=''>Select Category</option>
                              <option value='drug'>Drug</option>
                              <option value='sunglasses'>Sunglasses</option>
                              <option value='frame'>frame</option>
                            </select>
                          </div>

                          <div>
                            <label
                              htmlFor='productID'
                              className='block mb-2 text-sm font-medium text-gray-900 dark:text-white'
                            >
                              Product Name
                            </label>
                            <select
                              id='productID'
                              className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500'
                              name='productID'
                              onChange={(e) =>
                                handleInputChange(e.target.name, e.target.value)
                              }
                            >
                              <option selected=''>Select Products</option>
                              {products.map((element) => (
                                <option key={element._id} value={element._id}>
                                  {element.name}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label
                              htmlFor='QuantityPurchased'
                              className='block mb-2 text-sm font-medium text-gray-900 dark:text-white'
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
                              className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500'
                              placeholder='0 - 999'
                            />
                          </div>

                          <div>
                            <label
                              htmlFor='totalPurchaseAmount'
                              className='block mb-2 text-sm font-medium text-gray-900 dark:text-white'
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
                              className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500'
                              placeholder='$20'
                            />
                          </div>

                          <div className='h-fit w-fit'>
                            <label
                              className='block mb-2 text-sm font-medium text-gray-900 dark:text-white'
                              htmlFor='date'
                            >
                              Purchase Date
                            </label>
                            <input
                              className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500'
                              type='date'
                              id='date'
                              name='date'
                              value={purchase.date}
                              onChange={(e) =>
                                handleInputChange(e.target.name, e.target.value)
                              }
                            />
                          </div>
                        </div>
                        <div className='flex items-center space-x-4'></div>
                      </form>
                    </div>
                  </div>
                </div>
                <div className='bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6'>
                  <button
                    type='button'
                    className='inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 sm:ml-3 sm:w-auto'
                    onClick={addSale}
                  >
                    Add
                  </button>
                  <button
                    type='button'
                    className='mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto'
                    onClick={() => addSaleModalSetting()}
                    ref={cancelButtonRef}
                  >
                    Cancel
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
