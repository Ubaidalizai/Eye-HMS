import React, { useRef, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { BillPrintModal } from './BillPrintModal';
import { BASE_URL } from '../config';

export default function AddSale({
  addSaleModalSetting,
  products,
  handlePageUpdate,
}) {
  const [sales, setSales] = useState([
    {
      productRefId: '',
      quantity: 0,
      date: new Date().toISOString().split('T')[0],
      category: '',
    },
  ]);

  const [showBill, setShowBill] = useState(false);
  const [open, setOpen] = useState(true);
  const [soldItems, setSoldItems] = useState({
    date: '',
    totalIncome: 0,
    soldItems: [],
  });

  const cancelButtonRef = useRef(null);

  const handleInputChange = (index, name, value) => {
    setSales((prevSales) =>
      prevSales.map((sale, i) =>
        i === index
          ? {
              ...sale,
              [name]: value,
              category:
                name === 'productRefId'
                  ? products.find((product) => product._id === value)
                      ?.category || ''
                  : sale.category,
            }
          : sale
      )
    );
  };

  const isSaleValid = () => {
    return sales.every((sale) => sale.productRefId && sale.quantity > 0);
  };

  const sendSalesToBackend = async (sales) => {
    const response = await fetch(`${BASE_URL}/sales`, {
      method: 'POST',
      headers: {
        'Content-type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ soldItems: sales }),
    });

    if (!response.ok) {
      throw new Error('Failed to add sales');
    }

    return response.json();
  };

  const addSales = async () => {
    if (!isSaleValid()) {
      alert('Please fill all product and quantity fields correctly.');
      return;
    }

    try {
      const data = await sendSalesToBackend(sales);

      setSoldItems({
        date: new Date().toISOString().split('T')[0],
        totalIncome: data.data.receipt.totalIncome || 0,
        soldItems: data.data.receipt.soldItems || [],
      });

      addSaleModalSetting(); // Close AddSale modal
      setShowBill(true); // Open BillPrintModal
      handlePageUpdate();
    } catch (err) {
      console.error('Error adding sales:', err);
      alert(err.message || 'Something went wrong while adding sales.');
    }
  };

  const addNewProduct = () => {
    setSales((prevSales) => [
      ...prevSales,
      {
        productRefId: '',
        quantity: 0,
        date: new Date().toISOString().split('T')[0],
        category: prevSales[0]?.category || '',
      },
    ]);
  };

  return (
    <>
      <Transition.Root show={open} as='div'>
        <Dialog
          as='div'
          className='relative z-10'
          initialFocus={cancelButtonRef}
          onClose={setOpen}
        >
          <Transition.Child
            as='div'
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
                as='div'
                enter='ease-out duration-300'
                enterFrom='opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95'
                enterTo='opacity-100 translate-y-0 sm:scale-100'
                leave='ease-in duration-200'
                leaveFrom='opacity-100 translate-y-0 sm:scale-100'
                leaveTo='opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95'
              >
                <Dialog.Panel className='relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg'>
                  <div className='bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4'>
                    <form>
                      {Array.isArray(sales) &&
                        sales.map((sale, index) => (
                          <div
                            key={index}
                            className='grid gap-4 mb-4 sm:grid-cols-2'
                          >
                            <div>
                              <label
                                htmlFor={`productRefId-${index}`}
                                className='block mb-2 text-sm font-medium text-gray-900'
                              >
                                Product Name
                              </label>
                              <select
                                id={`productRefId-${index}`}
                                name='productRefId'
                                className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg'
                                value={sale.productRefId}
                                onChange={(e) =>
                                  handleInputChange(
                                    index,
                                    'productRefId',
                                    e.target.value
                                  )
                                }
                              >
                                <option>Select Product</option>
                                {products.map((product) => (
                                  <option key={product._id} value={product._id}>
                                    {product.name}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label
                                htmlFor={`quantity-${index}`}
                                className='block mb-2 text-sm font-medium text-gray-900'
                              >
                                Quantity
                              </label>
                              <input
                                type='number'
                                name='quantity'
                                id={`quantity-${index}`}
                                className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg'
                                value={sale.quantity}
                                onChange={(e) =>
                                  handleInputChange(
                                    index,
                                    'quantity',
                                    parseInt(e.target.value)
                                  )
                                }
                              />
                            </div>
                          </div>
                        ))}
                      <button
                        type='button'
                        onClick={addNewProduct}
                        className='mt-3 bg-blue-600 text-white px-3 py-2 rounded-md'
                      >
                        Add Another Product
                      </button>
                    </form>
                  </div>
                  <div className='bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6'>
                    <button
                      type='button'
                      className={`inline-flex justify-center rounded-md px-3 py-2 text-sm font-semibold shadow-sm ml-1 ${
                        isSaleValid()
                          ? 'bg-blue-600 text-white hover:bg-blue-500'
                          : 'bg-gray-300 text-gray-500'
                      }`}
                      disabled={!isSaleValid()}
                      onClick={addSales}
                    >
                      Add Sale
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>

      {/* Render BillPrintModal outside AddSale modal */}
      <BillPrintModal
        showBill={showBill}
        setShowBill={setShowBill}
        soldItems={soldItems}
      />
    </>
  );
}
