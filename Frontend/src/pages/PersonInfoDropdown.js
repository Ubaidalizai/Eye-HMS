import React, { useState, useCallback } from 'react';
import { useTable } from 'react-table';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ErrorBoundary from '../components/ErrorBoundary';
import { useDoctorData } from '../components/useDoctorData';
import { BASE_URL } from '../config';

function PersonInfoDropdown() {
  const [selectedDoctorId, setSelectedDoctorId] = useState(null);
  const [viewType, setViewType] = useState('income');
  const [newOutcome, setNewOutcome] = useState({ date: '', amount: 0 });

  const {
    doctors,
    records,
    khataSummary,
    loading,
    fetchRecords,
    fetchDocKhataSummary,
  } = useDoctorData(selectedDoctorId, viewType);

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
        Header: viewType === 'outcome' ? 'Outcome ($)' : 'Income ($)',
        accessor: 'amount',
      },
    ],
    [viewType]
  );

  const data = React.useMemo(() => records, [records]);
  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    useTable({ columns, data });

  const handleAddOutcome = async () => {
    if (!newOutcome.date || !newOutcome.amount) {
      toast.error('Please fill in all fields!');
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
          amount: parseFloat(newOutcome.amount),
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
      toast.success('Outcome added successfully!');
      fetchRecords(selectedDoctorId);
      fetchDocKhataSummary(selectedDoctorId);
      setNewOutcome({ date: '', amount: '' });
    } catch (error) {
      console.error('Error adding outcome:', error.message);
      toast.error(error.message);
    }
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setNewOutcome({ ...newOutcome, [name]: value });
  };

  return (
    <ErrorBoundary>
      <div className='w-full border pt-5 rounded-lg mt-20'>
        <ToastContainer
          position='top-right'
          autoClose={3000}
          hideProgressBar={false}
        />
        <h1 className='text-2xl font-semibold ml-3 mb-10 text-gray-700'>
          Doctor Kahta List
        </h1>

        <select
          onChange={handleDoctorSelect}
          className='w-full h-12 mb-6 text-lg border border-l-0 border-r-0 border-gray-300'
        >
          <option value=''>Select a doctor</option>
          {doctors.map((doctor) => (
            <option key={doctor._id} value={doctor._id}>
              {`${doctor.firstName} ${doctor.lastName}`}
            </option>
          ))}
        </select>

        {loading && <p className='text-center text-lg'>Loading data...</p>}

        {selectedDoctorId && !loading && (
          <div>
            <div className='flex justify-around mb-6 p-4 bg-white rounded-lg'>
              <div>
                <span className='font-bold text-green-600'>You Will Get:</span>{' '}
                ${khataSummary.youWillGet || 0}
              </div>
              <div>
                <span className='font-bold text-red-600'>You Will Give:</span> $
                {khataSummary.youWillGive || 0}
              </div>
            </div>

            <div className='mb-6 p-4 bg-white border border-l-0 border-r-0 border-gray-300'>
              <h3 className='text-xl font-semibold mb-4 text-gray-700'>
                Add New Outcome
              </h3>
              <div className='flex gap-4'>
                <input
                  type='date'
                  name='date'
                  value={newOutcome.date}
                  onChange={handleInputChange}
                  className='p-2 border rounded-md'
                />
                <input
                  type='number'
                  name='amount'
                  value={newOutcome.amount}
                  onChange={handleInputChange}
                  placeholder='Outcome Amount ($)'
                  className='p-2 border rounded-md'
                />
                <button
                  onClick={handleAddOutcome}
                  className='px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600'
                >
                  Add Outcome
                </button>
              </div>
            </div>

            <div className='mb-6 flex gap-4'>
              <button
                onClick={() => setViewType('income')}
                className={`px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50 ${
                  viewType === 'income'
                    ? 'bg-blue-500 text-white hover:bg-blue-600 focus:ring-blue-500'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300 focus:ring-gray-400'
                }`}
              >
                Show Income
              </button>
              <button
                onClick={() => setViewType('outcome')}
                className={`px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50 ${
                  viewType === 'outcome'
                    ? 'bg-blue-500 text-white hover:bg-blue-600 focus:ring-blue-500'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300 focus:ring-gray-400'
                }`}
              >
                Show Outcome
              </button>
            </div>

            <div className='overflow-x-auto'>
              <table
                {...getTableProps()}
                className='w-full bg-white rounded-lg shadow-md'
              >
                <thead>
                  {headerGroups.map((headerGroup) => (
                    <tr
                      {...headerGroup.getHeaderGroupProps()}
                      className='bg-gray-100'
                    >
                      {headerGroup.headers.map((column) => (
                        <th
                          {...column.getHeaderProps()}
                          className='p-3 text-left font-semibold text-gray-600'
                        >
                          {column.render('Header')}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody {...getTableBodyProps()}>
                  {rows.map((row) => {
                    prepareRow(row);
                    return (
                      <tr
                        {...row.getRowProps()}
                        className='border-t border-gray-200'
                      >
                        {row.cells.map((cell) => (
                          <td {...cell.getCellProps()} className='p-3'>
                            {cell.render('Cell')}
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
}

export default PersonInfoDropdown;
