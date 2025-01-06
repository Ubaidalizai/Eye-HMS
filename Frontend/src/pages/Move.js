import React, { useState, useEffect, useContext } from 'react';
import { useDispatch } from 'react-redux';
import { moveItemAPI } from '../redux/inventorySlice'; // Ensure this is correct
import AuthContext from '../AuthContext';
import { Dialog, Transition } from '@headlessui/react'; // Modal
import { BASE_URL } from '../config';

const Move = () => {
  const dispatch = useDispatch();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isOpen, setIsOpen] = useState(false); // For modal
  const [selectedItem, setSelectedItem] = useState(null); // Current item for modal
  const [quantity, setQuantity] = useState(1); // Modal quantity input
  const [salePrice, setSalePrice] = useState(''); // Modal sale price input
  const authContext = useContext(AuthContext);
  const limit = 10;

  useEffect(() => {
    const fetchProductsData = async () => {
      try {
        const response = await fetch(
          `${BASE_URL}/inventory/product?page=${currentPage}&limit=${limit}`,
          { credentials: 'include' }
        );
        const data = await response.json();
        console.log(data.data.results);
        setProducts(data.data.results);
        setTotalPages(data.totalPages || Math.ceil(data.results / limit));
      } catch (error) {
        setError('Failed to fetch products.');
      } finally {
        setLoading(false);
      }
    };

    fetchProductsData();
  }, [currentPage]);

  const openModal = (item) => {
    setSelectedItem(item);
    setQuantity(1);
    setSalePrice(item.salePrice || '');
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
  };

  const handleMoveItem = () => {
    const quantityNum = parseInt(quantity, 10);
    const salePriceNum = parseFloat(salePrice);

    if (
      isNaN(quantityNum) ||
      quantityNum <= 0 ||
      quantityNum > selectedItem.stock
    ) {
      alert('Please enter a valid quantity.');
      return;
    }
    if (isNaN(salePriceNum) || salePriceNum <= 0) {
      alert('Please enter a valid sale price.');
      return;
    }

    dispatch(
      moveItemAPI({
        item: {
          name: selectedItem.name,
          salePrice: salePriceNum,
          expiryDate: selectedItem.expiryDate,
        },
        quantity: quantityNum,
      })
    );
    closeModal();
  };

  if (loading)
    return (
      <p className='text-center text-gray-600 animate-pulse'>Loading...</p>
    );
  if (error)
    return <p className='text-center text-red-600 font-bold'>Error: {error}</p>;

  return (
    <div className='p-8 sm:p-16 bg-gray-50 min-h-screen'>
      <h2 className='text-4xl font-bold text-gray-800 mb-10 text-center'>
        Move Drugs To Pharmacy
      </h2>
      <ul className='space-y-6 max-w-4xl mx-auto'>
        {products.map((item) => (
          <li
            key={item._id}
            className='flex justify-between items-center bg-white p-6 shadow-lg rounded-lg border border-gray-200 hover:shadow-xl transition-shadow duration-300'
          >
            <div>
              <h3 className='text-2xl font-semibold text-gray-900'>
                {item.name}
              </h3>
              <p className='text-gray-600 mt-2'>Stock: {item.stock}</p>
              <p className='text-gray-600 mt-2 capitalize'>
                Category: {item.category}
              </p>
              <p className='text-gray-600 mt-2 capitalize'>
                ExpiryDate: {item.expiryDate}
              </p>
            </div>
            <button
              onClick={() => openModal(item)}
              className='bg-indigo-600 text-white px-6 py-2 rounded-full hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-300 focus:outline-none transition duration-300 transform hover:scale-105'
            >
              Move
            </button>
          </li>
        ))}
      </ul>

      {/* Pagination Controls */}
      <div className='flex justify-between items-center mt-8 max-w-4xl mx-auto'>
        <button
          className='px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 disabled:opacity-50 transition'
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1 || totalPages === 0}
        >
          Previous
        </button>

        <span className='flex items-center text-gray-700 font-medium'>
          Page {currentPage} of {totalPages}
        </span>

        <button
          className='px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 disabled:opacity-50 transition'
          onClick={() =>
            setCurrentPage((prev) => Math.min(prev + 1, totalPages))
          }
          disabled={currentPage === totalPages || totalPages === 0}
        >
          Next
        </button>
      </div>

      {/* Modal */}
      <Transition appear show={isOpen} as={React.Fragment}>
        <Dialog as='div' className='relative z-10' onClose={closeModal}>
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
                      <input
                        type='number'
                        className='border border-gray-300 p-2 rounded w-full'
                        placeholder='Quantity'
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                      />
                    </div>
                    <div className='mt-4'>
                      <input
                        type='text'
                        className='border border-gray-300 p-2 rounded w-full'
                        placeholder='Sale Price'
                        value={salePrice}
                        onChange={(e) => setSalePrice(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className='mt-6 flex justify-end space-x-4'>
                    <button
                      type='button'
                      className='px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400'
                      onClick={closeModal}
                    >
                      Cancel
                    </button>
                    <button
                      type='button'
                      className='px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700'
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
    </div>
  );
};

export default Move;
