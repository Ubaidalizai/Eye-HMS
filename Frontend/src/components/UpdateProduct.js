import { Fragment, useRef, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { PlusIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';

export default function UpdateProduct({
  updateProductData,
  updateModalSetting,
  onProductUpdate,
  setUpdatePage, // <-- This prop is passed from Inventory to update the product in the UI
}) {
  const { _id, name, manufacturer, description, category } = updateProductData;
  const [product, setProduct] = useState({
    productID: _id,
    name: name,
    manufacturer: manufacturer,
    description: description,
    category: category, // Initialize category
  });
  const [open, setOpen] = useState(true);
  const cancelButtonRef = useRef(null);

  const handleInputChange = (key, value) => {
    setProduct({ ...product, [key]: value });
  };

  const updateProduct = () => {
    if (!product || !product.productID) {
      return toast.error('Product ID is missing');
    }

    const id = product.productID;

    fetch(`http://localhost:4000/api/v1/inventory/product/${id}`, {
      method: 'PATCH',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(product),
    })
      .then((response) => {
        if (!response.ok) throw new Error('Failed to update product');
        return response.json();
      })
      .then((data) => {
        toast.success('Product Updated Successfully');
        onProductUpdate(data); // Call to update the UI in Inventory
        updateModalSetting();
        setUpdatePage((show) => !show); // Close the modal
      })
      .catch((err) => {
        console.error('Error:', err.message);
        toast.error(`Failed to update product: ${err.message}`);
      });
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
          <div className='flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0'>
            <Transition.Child
              as={Fragment}
              enter='ease-out duration-300'
              enterFrom='opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95'
              enterTo='opacity-100 translate-y-0 sm:scale-100'
              leave='ease-in duration-200'
              leaveFrom='opacity-100 translate-y-0 sm:scale-100'
              leaveTo='opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95'
            >
              <Dialog.Panel className='relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg'>
                <div className='bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4'>
                  <div className='sm:flex sm:items-start'>
                    <div className='mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10'>
                      <PlusIcon
                        className='h-6 w-6 text-blue-400'
                        aria-hidden='true'
                      />
                    </div>
                    <div className='mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left'>
                      <Dialog.Title
                        as='h3'
                        className='text-lg font-semibold leading-6 text-gray-900'
                      >
                        Update Product
                      </Dialog.Title>
                      <form action='#'>
                        <div className='grid gap-4 mb-4 sm:grid-cols-2'>
                          <div>
                            <label
                              htmlFor='name'
                              className='block mb-2 text-sm font-medium text-gray-900 dark:text-white'
                            >
                              Name
                            </label>
                            <input
                              type='text'
                              name='name'
                              id='name'
                              value={product.name}
                              onChange={(e) =>
                                handleInputChange(e.target.name, e.target.value)
                              }
                              className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5'
                              placeholder='Ex. Apple iMac 27'
                            />
                          </div>
                          <div>
                            <label
                              htmlFor='manufacturer'
                              className='block mb-2 text-sm font-medium text-gray-900'
                            >
                              Manufacturer
                            </label>
                            <input
                              type='text'
                              name='manufacturer'
                              id='manufacturer'
                              value={product.manufacturer}
                              onChange={(e) =>
                                handleInputChange(e.target.name, e.target.value)
                              }
                              className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5'
                              placeholder='Ex. Apple'
                            />
                          </div>
                          <div>
                            <label
                              htmlFor='category'
                              className='block mb-2 text-sm font-medium text-gray-900'
                            >
                              Category
                            </label>
                            <select
                              id='category'
                              name='category'
                              value={product.category}
                              onChange={(e) =>
                                handleInputChange(e.target.name, e.target.value)
                              }
                              className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5'
                            >
                              <option value=''>Select a category</option>
                              <option value='sunglasses'>sunglasses</option>
                              <option value='glass'>Glass</option>
                              <option value='frame'>Frame</option>
                              <option value='drug'>Drug</option>
                            </select>
                          </div>
                          <div className='sm:col-span-2'>
                            <label
                              htmlFor='description'
                              className='block mb-2 text-sm font-medium text-gray-900'
                            >
                              Description
                            </label>
                            <textarea
                              id='description'
                              rows='5'
                              name='description'
                              className='block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-primary-500 focus:border-primary-500'
                              placeholder='Write a description...'
                              value={product.description}
                              onChange={(e) =>
                                handleInputChange(e.target.name, e.target.value)
                              }
                            />
                          </div>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
                <div className='bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6'>
                  <button
                    type='button'
                    className='inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 sm:ml-3 sm:w-auto'
                    onClick={updateProduct}
                  >
                    Update Product
                  </button>
                  <button
                    type='button'
                    className='mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto'
                    onClick={() => updateModalSetting()}
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
