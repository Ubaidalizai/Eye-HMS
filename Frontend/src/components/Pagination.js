import React, { useState, useEffect } from 'react';

const Pagination = ({
  totalItems,
  totalPagesCount,
  itemsPerPage,
  currentPage,
  onPageChange,
  onLimitChange,
}) => {
  const [pageInput, setPageInput] = useState(currentPage);
  const totalPages = totalPagesCount;

  useEffect(() => {
    setPageInput(currentPage);
  }, [currentPage]);

  const handlePageInputChange = (e) => {
    setPageInput(e.target.value);
  };

  const handlePageInputSubmit = (e) => {
    e.preventDefault();
    const page = Math.min(Math.max(1, parseInt(pageInput) || 1), totalPages);
    onPageChange(page);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  return (
    <div className='flex flex-col sm:flex-row items-center justify-between px-2 sm:px-4 py-3 bg-white border-t border-gray-200'>
      <div className='flex flex-col sm:flex-row sm:items-center w-full justify-between'>
        <div className='text-center sm:text-left mb-4 sm:mb-0'>
          <p className='text-xs sm:text-sm text-gray-700'>
            Showing{' '}
            <span className='font-medium'>
              {(currentPage - 1) * itemsPerPage + 1}
            </span>{' '}
            to{' '}
            <span className='font-medium'>
              {Math.min(currentPage * itemsPerPage, totalItems)}
            </span>{' '}
            of <span className='font-medium'>{totalItems}</span> results
          </p>
        </div>
        <div className='flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-4'>
          <select
            value={itemsPerPage}
            onChange={(e) => onLimitChange(Number(e.target.value))}
            className='flex items-center justify-center w-full sm:w-auto bg-white border border-gray-300 rounded-md px-4 py-1 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-xs sm:text-sm'
          >
            {[10, 20, 50, 100].map((value) => (
              <option key={value} value={value}>
                {value} per page
              </option>
            ))}
          </select>

          <div
            className='flex justify-center items-center rounded-md shadow-sm'
            aria-label='Pagination'
          >
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className='inline-flex justify-center items-center h-8 w-8 sm:w-10 text-gray-500 bg-white border border-gray-300 rounded-l-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed'
            >
              <svg
                className='w-4 h-4 sm:w-5 sm:h-5'
                xmlns='http://www.w3.org/2000/svg'
                viewBox='0 0 20 20'
                fill='currentColor'
                aria-hidden='true'
              >
                <path
                  fillRule='evenodd'
                  d='M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z'
                  clipRule='evenodd'
                />
              </svg>
            </button>
            <form
              onSubmit={handlePageInputSubmit}
              className='flex flex-row items-center justify-center mx-1 sm:mx-2'
            >
              <input
                type='number'
                min='1'
                max={totalPages}
                value={pageInput}
                onChange={handlePageInputChange}
                className='h-8 w-12 sm:w-16 text-center text-xs sm:text-sm bg-white border border-gray-300'
              />
              <span className='mx-1 sm:mx-2 text-xs sm:text-sm'>of</span>
              <span className='text-xs sm:text-sm'>{totalPages}</span>
            </form>

            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className='inline-flex justify-center font-bold items-center h-8 w-8 sm:w-10 text-gray-500 bg-white border border-gray-300 rounded-r-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed'
            >
              <svg
                className='w-4 h-4 sm:w-5 sm:h-5'
                xmlns='http://www.w3.org/2000/svg'
                viewBox='0 0 20 20'
                fill='currentColor'
                aria-hidden='true'
              >
                <path
                  fillRule='evenodd'
                  d='M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z'
                  clipRule='evenodd'
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pagination;
