'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useTable } from 'react-table';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ErrorBoundary from "../components/ErrorBoundary.jsx";
import { useDoctorData } from '../components/useDoctorData';
import Pagination from "../components/Pagination.jsx";
import { BASE_URL } from '../config';

function PersonInfoDropdown() {
  const [selectedDoctorId, setSelectedDoctorId] = useState(null);
  const [viewType, setViewType] = useState('income');
  const [newOutcome, setNewOutcome] = useState({ date: '', amount: 0 });
  const [limit, setLimit] = useState(10);
  const [pageState, setPageState] = useState(1);

  const {
    doctors,
    records,
    khataSummary,
    loading,
    fetchRecords,
    fetchDocKhataSummary,
    totalItems,
    totalPages,
    currentPage,
    handlePageChange,
    handleItemsPerPageChange,
  } = useDoctorData(selectedDoctorId, viewType, pageState, limit);

  useEffect(() => {
    if (currentPage !== pageState) {
      setPageState(currentPage);
    }
  }, [currentPage, pageState]);

  const handleDoctorSelect = useCallback(
    (event) => {
      const doctorId = event.target.value;
      setSelectedDoctorId(doctorId);
      if (doctorId) {
        fetchDocKhataSummary(doctorId);
      }
    },
    [fetchDocKhataSummary]
  );

  const columns = React.useMemo(
    () => [
      { Header: 'Date', accessor: 'date' },
      {
        Header: viewType === 'outcome' ? 'Outcome' : 'Income',
        accessor: 'amount',
      },
      {
        Header: 'Branch',
        accessor: 'branchModel',
        Cell: ({ value }) => value || 'N/A',
      },
    ],
    [viewType]
  );

  const data = React.useMemo(() => {
    // Ensure records is always an array
    return Array.isArray(records) ? records : [];
  }, [records]);
  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    useTable({ columns, data });

  const handleAddOutcome = async () => {
    if (!newOutcome.date || !newOutcome.amount) {
      const fillToastId = 'outcome-fill-fields';
      if (!toast.isActive(fillToastId)) toast.error('Please fill in all fields!', { toastId: fillToastId });
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}/khata/doctor-khata`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          doctorId: selectedDoctorId,
          date: newOutcome.date,
          amount: Number.parseFloat(newOutcome.amount),
          amountType: 'outcome',
        }),
      });

      if (!response.ok) {
        let errorMessage = 'Failed to add Outcome';
        try {
          const errorResponse = await response.json();
          errorMessage = errorResponse.message || errorMessage;
        } catch {
          errorMessage = await response.text();
        }
        throw new Error(errorMessage);
      }
  const successToastId = 'outcome-success';
  if (!toast.isActive(successToastId)) toast.success('Outcome added successfully!', { toastId: successToastId });
      fetchRecords(selectedDoctorId);
      fetchDocKhataSummary(selectedDoctorId);
      setNewOutcome({ date: '', amount: '' });
    } catch (error) {
      console.error('Error adding outcome:', error.message);
  const errToastId = 'outcome-error';
  if (!toast.isActive(errToastId)) toast.error(error.message, { toastId: errToastId });
    }
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setNewOutcome({ ...newOutcome, [name]: value });
  };

  const onPageChangeHandler = (page) => {
    setPageState(page); // Update local state first
    handlePageChange(page); // Then call the hook's handler
  };

  return (
    <ErrorBoundary>
      <div className='w-full border pt-5 rounded-lg mt-10 md:mt-20 shadow-sm'>
        {/* ToastContainer is provided at app root. Do not render per-page containers to avoid duplicate toasts and clsx toggle errors. */}
        <h1 className='text-xl md:text-2xl font-semibold px-4 sm:px-6 mb-6 md:mb-10 text-gray-700'>
          Doctor Khata List
        </h1>

        <div className='px-4 sm:px-6'>
          <select
            onChange={handleDoctorSelect}
            className='w-full h-12 mb-6 text-base md:text-lg border border-gray-300 rounded-md px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
          >
            <option value=''>Select a doctor</option>
            {doctors.map((doctor) => (
              <option key={doctor._id} value={doctor._id}>
                {`${doctor.firstName} ${doctor.lastName}`}
              </option>
            ))}
          </select>
        </div>

        {loading && (
          <div className='flex justify-center items-center py-10'>
            <div className='animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500'></div>
            <p className='ml-3 text-base md:text-lg text-gray-600'>
              Loading data...
            </p>
          </div>
        )}

        {selectedDoctorId && !loading && (
          <div className='px-4 sm:px-6'>
            {/* Summary Cards */}
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6'>
              <div className='bg-white rounded-lg shadow-sm p-4 border-l-4 border-green-500'>
                <div className='text-sm text-gray-500 mb-1'>Dr. Will Get</div>
                <div className='text-xl md:text-2xl font-bold text-green-600'>
                  ${khataSummary.youWillGet || 0}
                </div>
              </div>
              <div className='bg-white rounded-lg shadow-sm p-4 border-l-4 border-red-500'>
                <div className='text-sm text-gray-500 mb-1'>Dr. Will Give</div>
                <div className='text-xl md:text-2xl font-bold text-red-600'>
                  ${khataSummary.youWillGive || 0}
                </div>
              </div>
            </div>

            {/* Add New Outcome Form */}
            <div className='mb-6 p-4 bg-white border border-gray-200 rounded-lg shadow-sm'>
              <h3 className='text-lg md:text-xl font-semibold mb-4 text-gray-700'>
                Add New Outcome
              </h3>
              <div className='flex flex-col sm:flex-row gap-3'>
                <input
                  type='date'
                  name='date'
                  value={newOutcome.date}
                  onChange={handleInputChange}
                  className='p-2 border rounded-md flex-1'
                />
                <input
                  type='number'
                  name='amount'
                  value={newOutcome.amount}
                  onChange={handleInputChange}
                  placeholder='Outcome Amount'
                  className='p-2 border rounded-md flex-1'
                />
                <button
                  onClick={handleAddOutcome}
                  className='px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors'
                >
                  Add Outcome
                </button>
              </div>
            </div>

            {/* View Type Buttons */}
            <div className='mb-6 flex flex-wrap gap-3'>
              <button
                onClick={() => setViewType('income')}
                className={`px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-colors ${
                  viewType === 'income'
                    ? 'bg-blue-500 text-white hover:bg-blue-600 focus:ring-blue-500'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300 focus:ring-gray-400'
                }`}
              >
                Show Income
              </button>
              <button
                onClick={() => setViewType('outcome')}
                className={`px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-colors ${
                  viewType === 'outcome'
                    ? 'bg-blue-500 text-white hover:bg-blue-600 focus:ring-blue-500'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300 focus:ring-gray-400'
                }`}
              >
                Show Outcome
              </button>
            </div>

            {/* Table with horizontal scrolling for all screen sizes */}
            <div className='overflow-x-auto shadow-sm rounded-lg'>
              <div className='inline-block min-w-full align-middle'>
                <table
                  {...getTableProps()}
                  className='min-w-full divide-y divide-gray-200 bg-white rounded-lg'
                >
                  <thead className='bg-gray-100'>
                    {headerGroups.map((headerGroup) => (
                      <tr
                        key={headerGroup.id}
                        {...headerGroup.getHeaderGroupProps()}
                      >
                        {headerGroup.headers.map((column) => (
                          <th
                            key={column.id}
                            {...column.getHeaderProps()}
                            className='px-4 sm:px-6 py-3 text-xs font-medium text-gray-700 uppercase tracking-wider text-left'
                          >
                            {column.render('Header')}
                          </th>
                        ))}
                      </tr>
                    ))}
                  </thead>
                  <tbody
                    {...getTableBodyProps()}
                    className='bg-white divide-y divide-gray-200'
                  >
                    {rows.length > 0 ? (
                      rows.map((row) => {
                        prepareRow(row);
                        return (
                          <tr
                            key={row.id}
                            {...row.getRowProps()}
                            className='hover:bg-gray-50 transition-colors'
                          >
                            {row.cells.map((cell) => (
                              <td
                                key={cell.id}
                                {...cell.getCellProps()}
                                className='px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500'
                              >
                                {cell.column.id === 'date' &&
                                typeof cell.value === 'string'
                                  ? cell.value.split('T')[0] // Extract only the date part
                                  : cell.render('Cell')}
                              </td>
                            ))}
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td
                          colSpan={3}
                          className='px-4 sm:px-6 py-4 text-center text-gray-500'
                        >
                          No records found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Responsive indicator - only visible on small screens */}
            <div className='block sm:hidden text-center text-xs text-gray-500 mt-2 px-4'>
              <p>Swipe horizontally to see more data</p>
            </div>

            <div className='mt-6'>
              <Pagination
                totalItems={totalItems}
                totalPagesCount={totalPages}
                itemsPerPage={limit}
                currentPage={pageState}
                onPageChange={onPageChangeHandler}
                onLimitChange={(newLimit) => {
                  setLimit(newLimit);
                  handleItemsPerPageChange(newLimit);
                }}
              />
            </div>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
}

export default PersonInfoDropdown;
