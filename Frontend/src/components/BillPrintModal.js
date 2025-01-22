import React from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, PrinterIcon } from '@heroicons/react/24/outline';

export function BillPrintModal({ showBill, setShowBill, soldItems }) {
  return (
    <Transition.Root show={showBill} as='div'>
      <Dialog
        as='div'
        className='relative z-50'
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

        <div className='fixed inset-0 z-50 overflow-y-auto'>
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
              {showBill && soldItems && soldItems.soldItems.length > 0 && (
                <Dialog.Panel className='relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg'>
                  <div className='bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4'>
                    <div className='sm:flex sm:items-start'>
                      <div className='mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full'>
                        <Dialog.Title
                          as='h3'
                          className='text-2xl font-semibold leading-6 text-gray-900 mb-4'
                        >
                          Sale Receipt
                        </Dialog.Title>
                        <div className='mt-2'>
                          <p className='text-sm text-gray-500 mb-4'>
                            <span className='font-medium'>Date:</span>{' '}
                            {soldItems.date ||
                              new Date().toISOString().split('T')[0]}
                          </p>
                          <div className='border-t border-gray-200 py-4'>
                            <h4 className='text-lg font-medium text-gray-900 mb-2'>
                              Items Sold
                            </h4>
                            <ul className='divide-y divide-gray-200'>
                              {soldItems.soldItems.map((item, index) => (
                                <li
                                  key={index}
                                  className='py-3 flex justify-between items-center'
                                >
                                  <div>
                                    <p className='text-sm font-medium text-gray-900'>
                                      {item.productName || 'Unknown'}
                                    </p>
                                    <p className='text-sm text-gray-500'>
                                      Quantity: {item.quantity}
                                    </p>
                                  </div>
                                  <p className='text-sm font-medium text-gray-900'>
                                    {item.income?.toFixed(2) || '0.00'}
                                  </p>
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div className='border-t border-gray-200 pt-4 mt-4'>
                            <div className='flex justify-between items-center'>
                              <p className='text-lg font-semibold text-gray-900'>
                                Total:
                              </p>
                              <p className='text-lg font-semibold text-gray-900'>
                                {soldItems.totalIncome?.toFixed(2) || '0.00'}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className='bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6'>
                    <button
                      type='button'
                      className='inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 sm:ml-3 sm:w-auto'
                      onClick={() => window.print()}
                    >
                      <PrinterIcon className='h-5 w-5 mr-2' />
                      Print Receipt
                    </button>
                    <button
                      type='button'
                      className='mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto'
                      onClick={() => setShowBill(false)}
                    >
                      <XMarkIcon className='h-5 w-5 mr-2' />
                      Close
                    </button>
                  </div>
                </Dialog.Panel>
              )}
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
