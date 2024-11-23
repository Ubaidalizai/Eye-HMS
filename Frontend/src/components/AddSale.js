import { Fragment, useRef, useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { PlusIcon } from '@heroicons/react/24/outline';

export default function AddSale({
  addSaleModalSetting,
  products,
  handlePageUpdate,
}) {
  const [sales, setSales] = useState([
    {
      productRefId: '',
      quantity: 0,
      date: new Date().toISOString().split('T')[0], // Today's date
      category: '', // Default empty category
    },
  ]);

  const [open, setOpen] = useState(true);
  const cancelButtonRef = useRef(null);
  const [showBill, setShowBill] = useState(false);
  const [soldItems, setSoldItems] = useState({
    date: '',
    totalIncome: 0,
    soldItems: [],
  }); // To store the sold items for the bill

  const user = JSON.parse(localStorage.getItem('user'));

  // Set the category based on user role
  useEffect(() => {
    if (user.role === 'pharmacist' || user.role === 'admin') {
      setSales((prevSales) =>
        prevSales.map((sale) => ({ ...sale, category: 'drug' }))
      );
    } else if (user.role === 'sunglassesSeller') {
      setSales((prevSales) =>
        prevSales.map((sale) => ({ ...sale, category: 'sunglasses' }))
      );
    }
  }, [user.role]);

  // Handle Input Change
  const handleInputChange = (index, name, value) => {
    setSales((prevSales) =>
      prevSales.map((sale, i) =>
        i === index ? { ...sale, [name]: value } : sale
      )
    );
  };

  const isSaleValid = () => !sales.productRefId || sales.quantity <= 0;

  const validateSales = () => {
    return sales.every((sale) => sale.productRefId && sale.quantity > 0);
  };

  const sendSalesToBackend = async (sales) => {
    const response = await fetch('http://localhost:4000/api/v1/sales', {
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
  // POST Data
  const addSales = async () => {
    // Step 1: Validate sales
    if (!validateSales()) {
      alert('Please fill all product and quantity fields correctly.');
      return;
    }

    try {
      // Step 2: Send valid sales data to the backend
      const data = await sendSalesToBackend(sales);

      console.log(data.data.receipt);
      setSoldItems({
        date: new Date().toISOString().split('T')[0],
        totalIncome: data.data.receipt.totalIncome || 0,
        soldItems: data.data.receipt.soldItems || [],
      }); // Store the sold items from backend response

      setShowBill(true); // Show the bill modal

      // addSaleModalSetting(); // Close the modal

      handlePageUpdate(); // Refresh the page or state
    } catch (err) {
      // Step 4: Handle errors
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
        category: prevSales[0]?.category || '', // Preserve the category of existing entries
      },
    ]);
  };

  return (
    <>
      {/* Add Sale Modal */}
      <Transition.Root show={open} as={Fragment}>
        <Dialog
          as='div'
          className='relative z-10'
          initialFocus={cancelButtonRef}
          onClose={() => setOpen(false)} // Close Add Sale Modal
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
                  {/* Add Sale Content */}
                  <div className='bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4'>
                    {/* Form */}
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
                        isSaleValid
                          ? 'bg-blue-600 text-white hover:bg-blue-500'
                          : 'bg-gray-300 text-gray-500'
                      }`}
                      disabled={!isSaleValid}
                      onClick={addSales}
                    >
                      Add Sale
                    </button>
                    <button
                      type='button'
                      className='mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto'
                      onClick={() => setOpen(false)}
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

      {/* Bill Print Modal */}
      <Transition.Root show={showBill} as={Fragment}>
        <Dialog
          as='div'
          className='relative z-20'
          onClose={() => setShowBill(false)}
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

          <div className='fixed inset-0 z-30 flex items-center justify-center'>
            <Transition.Child
              as='div'
              enter='ease-out duration-300'
              enterFrom='opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95'
              enterTo='opacity-100 translate-y-0 sm:scale-100'
              leave='ease-in duration-200'
              leaveFrom='opacity-100 translate-y-0 sm:scale-100'
              leaveTo='opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95'
            >
              {showBill && soldItems && soldItems.soldItems.length > 0 && (
                <Dialog.Panel className='bg-white p-4 rounded-md shadow-md'>
                  <h2 className='text-lg font-bold mb-4'>Sold Items Bill</h2>
                  <p className='mb-2'>
                    <strong>Date:</strong>{' '}
                    {soldItems.date || new Date().toISOString().split('T')[0]}
                  </p>
                  <p className='mb-4'>
                    <strong>Total Income:</strong> $
                    {soldItems.totalIncome?.toFixed(2) || '0.00'}
                  </p>
                  <ul className='mb-4'>
                    {soldItems.soldItems.map((item, index) => (
                      <li key={index} className='mb-2'>
                        <strong>Product:</strong>{' '}
                        {item.productName || 'Unknown'}
                        <br />
                        <strong>Quantity:</strong> {item.quantity}
                        <br />
                        <strong>Income:</strong> $
                        {item.income?.toFixed(2) || '0.00'}
                      </li>
                    ))}
                  </ul>
                  <button
                    className='bg-blue-600 text-white px-3 py-2 rounded-md mr-2'
                    onClick={() => window.print()}
                  >
                    Print Bill
                  </button>
                  <button
                    className='bg-gray-300 text-gray-900 px-3 py-2 rounded-md'
                    onClick={() => setShowBill(false)}
                  >
                    Close
                  </button>
                </Dialog.Panel>
              )}
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>
    </>
  );
}
