import React, { useState } from 'react';
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
  const [openAddSale, setOpenAddSale] = useState(true); // Controls AddSaleModal
  const [isAddButtonDisabled, setIsAddButtonDisabled] = useState(false);

  const [soldItems, setSoldItems] = useState({
    date: '',
    totalIncome: 0,
    soldItems: [],
  });

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
    try {
      const response = await fetch(`${BASE_URL}/sales`, {
        method: 'POST',
        headers: {
          'Content-type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ soldItems: sales }),
      });

      if (!response.ok) {
        // Attempt to parse error message from backend
        let errorMessage = 'Failed to add sales.';
        try {
          const errorResponse = await response.json();
          errorMessage = errorResponse.message || errorMessage;
        } catch {
          errorMessage = await response.text(); // Fallback to plain text
        }
        throw new Error(errorMessage);
      }

      return await response.json();
    } catch (error) {
      console.error('Error in sendSalesToBackend:', error.message);
      throw error; // Re-throw the error to be handled by the calling function
    }
  };

  const addSales = async () => {
    if (!isSaleValid()) {
      alert('Please fill all product and quantity fields correctly.');
      return;
    }

    setIsAddButtonDisabled(true); // Disable the button

    try {
      const data = await sendSalesToBackend(sales);

      setSoldItems({
        date: new Date().toISOString().split('T')[0],
        totalIncome: data.data.receipt.totalIncome || 0,
        soldItems: data.data.receipt.soldItems || [],
      });

      setOpenAddSale(false); // Close AddSale modal
      setTimeout(() => setShowBill(true), 300); // Open BillPrintModal after delay
      handlePageUpdate();
    } catch (err) {
      console.error('Error adding sales:', err.message);
      alert(err.message || 'Something went wrong while adding sales.');
    } finally {
      setIsAddButtonDisabled(false); // Re-enable the button
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
      {/* Add Sale Modal */}
      <Transition.Root show={openAddSale} as='div'>
        <Dialog as='div' className='relative z-10' onClose={setOpenAddSale}>
          <div className='fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity' />
          <div className='fixed inset-0 z-10 overflow-y-auto'>
            <div className='flex min-h-full items-center justify-center p-4'>
              <Dialog.Panel className='relative bg-white rounded-lg shadow-xl sm:max-w-lg sm:w-full'>
                <div className='px-4 py-5 sm:p-6'>
                  <form>
                    {sales.map((sale, index) => (
                      <div
                        key={index}
                        className='grid gap-4 mb-4 sm:grid-cols-2'
                      >
                        <div>
                          <label className='block text-sm font-medium'>
                            Product Name
                          </label>
                          <select
                            className='bg-gray-50 border rounded-lg text-sm'
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
                          <label className='block text-sm font-medium'>
                            Quantity
                          </label>
                          <input
                            type='number'
                            className='bg-gray-50 border rounded-lg text-sm'
                            value={sale.quantity}
                            onChange={(e) =>
                              handleInputChange(
                                index,
                                'quantity',
                                parseInt(e.target.value, 10)
                              )
                            }
                          />
                        </div>
                      </div>
                    ))}
                    <button
                      type='button'
                      className='mt-3 bg-blue-600 text-white px-3 py-2 rounded-md'
                      onClick={addNewProduct}
                    >
                      Add Another Product
                    </button>
                  </form>
                </div>
                <div className='px-4 py-3 bg-gray-50 sm:flex sm:flex-row-reverse'>
                  <button
                    type='button'
                    className={`inline-flex justify-center px-4 py-2 text-white rounded-md ${
                      isAddButtonDisabled
                        ? 'bg-gray-400 cursor-not-allowed'
                        : isSaleValid()
                        ? 'bg-blue-600 hover:bg-blue-500'
                        : 'bg-gray-300'
                    }`}
                    disabled={isAddButtonDisabled || !isSaleValid()} // Disable if already disabled or invalid form
                    onClick={addSales}
                  >
                    Add Sale
                  </button>
                </div>
              </Dialog.Panel>
            </div>
          </div>
        </Dialog>
      </Transition.Root>

      {/* Bill Print Modal */}
      <BillPrintModal
        showBill={showBill}
        setShowBill={setShowBill}
        soldItems={soldItems}
      />
    </>
  );
}
