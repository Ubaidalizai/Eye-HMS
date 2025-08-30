import React, { useRef, useContext } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, PrinterIcon } from '@heroicons/react/24/outline';
import AuthContext from '../AuthContext';

export function BillPrintModal({ showBill, setShowBill, soldItems }) {
  const authContext = useContext(AuthContext);

  const printRef = useRef(null);
  const handlePrint = () => {
    const printContent = printRef.current;

    // Create a new window for printing
    const printWindow = window.open('', '_blank');

    // Add print-specific styles
    printWindow.document.write(`
      <html>
        <head>
          <title>Sale Receipt</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 20px;
              max-width: 800px;
              margin: 0 auto;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 20px;
            }
            th, td {
              padding: 8px;
              text-align: left;
              border-bottom: 1px solid #ddd;
            }
            th {
              font-weight: bold;
            }
            .total-row {
              font-weight: bold;
              margin-top: 20px;
              display: flex;
              justify-content: space-between;
            }
            .receipt-header {
              margin-bottom: 20px;
            }
            .receipt-title {
              font-size: 24px;
              font-weight: bold;
              margin-bottom: 10px;
            }
            .date{
              display: flex;
              justify-content: flex-end;

            }
            @media print {
              body {
                print-color-adjust: exact;
                -webkit-print-color-adjust: exact;
              }
            }
          @page {
            size: auto; /* or the size you want */
            margin: 0; /* remove default margins */
          }
          /* Remove default headers and footers */
        @page {
          @top-center {
            content: none;
          }
          @bottom-center {
            content: none;
          }
        }
          /* Adjust the title font size */
        .title {
          font-size: 24px; /* or the size you want */
        }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.onafterprint = () => printWindow.close();
  };
  return (
    <Transition.Root show={showBill} as='div'>
      <Dialog
        as='div'
        className='relative z-[9999]'
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
          <div className='fixed inset-0 bg-gray-900 bg-opacity-50 transition-opacity' />
        </Transition.Child>

        <div className='fixed inset-0 z-[9999] overflow-y-auto'>
          <div className='flex min-h-full items-center justify-center p-4 sm:p-6'>
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
                <div className='relative transform overflow-hidden rounded-lg bg-white text-left shadow-2xl border border-gray-200 transition-all w-full max-w-sm sm:max-w-md md:max-w-lg'>
                  <div className='absolute top-0 right-0 pt-4 pr-4 block'>
                    <button
                      type='button'
                      className='rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500'
                      onClick={() => setShowBill(false)}
                    >
                      <span className='sr-only'>Close</span>
                      <XMarkIcon className='h-6 w-6' aria-hidden='true' />
                    </button>
                  </div>

                  <div ref={printRef} className='bg-white px-4 py-5 sm:p-6'>
                    <div className='receipt-header'>
                      <div className='receipt-title text-center mb-3'>
                        Al-Sayed Eye-Hospital
                      </div>
                      <div className='flex justify-end items-center mb-4 date'>
                        <p className='text-sm text-gray-500'>
                          <span className='font-medium'>Date:</span>{' '}
                          {new Date(soldItems.date).toLocaleDateString() ||
                            new Date().toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className='mt-2'>
                      <div className='border-t border-gray-200 py-4'>
                        <h4 className='text-base sm:text-lg font-medium text-gray-900 mb-3'>
                          Sale Details
                        </h4>
                        <div className='overflow-x-auto -mx-4 sm:mx-0'>
                          <table className='min-w-full divide-y divide-gray-200'>
                            <thead className='bg-gray-50'>
                              <tr>
                                <th
                                  scope='col'
                                  className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                                >
                                  Item
                                </th>
                                <th
                                  scope='col'
                                  className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                                >
                                  Quantity
                                </th>
                                {authContext.user.role === 'receptionist' && (
                                  <th
                                    scope='col'
                                    className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                                  >
                                    Discount
                                  </th>
                                )}
                                <th
                                  scope='col'
                                  className='px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'
                                >
                                  Price
                                </th>
                              </tr>
                            </thead>
                            <tbody className='bg-white divide-y divide-gray-200'>
                              {soldItems.soldItems.map((item, index) => (
                                <tr key={index}>
                                  <td className='px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900'>
                                    {item.productName || 'Unknown'}
                                  </td>
                                  <td className='px-4 py-3 whitespace-nowrap text-sm text-gray-500'>
                                    {item.quantity}
                                  </td>
                                  {authContext.user.role === 'receptionist' && (
                                    <td className='px-4 py-3 whitespace-nowrap text-sm text-gray-500'>
                                      {item?.proportionalDiscount?.toFixed(2) ||
                                        '0.00'}
                                    </td>
                                  )}
                                  <td className='px-4 py-3 whitespace-nowrap text-sm text-gray-900 text-right'>
                                    {item.income?.toFixed(2) || '0.00'}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {authContext.user.role=== 'receptionist' && soldItems.discount > 0 && (
                        <div className='border-t border-gray-200 pt-4 mt-4'>
                          <div className='flex justify-between total-row'>
                            <p className='text-base sm:text-lg text-gray-900'>
                              Discount:
                            </p>
                            <p className='text-base sm:text-lg font-semibold text-gray-900'>
                              {soldItems?.discount?.toFixed(2) || '0.00'}
                            </p>
                          </div>
                        </div>
                      )}

                      <div className='border-t border-gray-200 pt-4 mt-4'>
                        <div className='flex justify-between total-row'>
                          <p className='text-base sm:text-lg font-semibold text-gray-900'>
                            Total:
                          </p>
                          <p className='text-base sm:text-lg font-semibold text-gray-900'>
                            {soldItems.totalIncome?.toFixed(2) || '0.00'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className='bg-gray-50 px-4 py-3 sm:px-6 flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-3 rounded-b-lg'>
                    <button
                      type='button'
                      className='mt-3 sm:mt-0 inline-flex justify-center items-center px-1 py-1 h-10 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors'
                      onClick={() => setShowBill(false)}
                    >
                      <XMarkIcon className='h-5 w-5 mr-1' />
                      Close
                    </button>
                    <button
                      type='button'
                      className='inline-flex justify-center items-center px-2 py-2 h-10 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors'
                      onClick={handlePrint}
                    >
                      <PrinterIcon className='h-5 w-5 mr-2' />
                      Print Receipt
                    </button>
                  </div>
                </div>
              )}
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
