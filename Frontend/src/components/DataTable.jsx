'use client';

import { useState } from 'react';
import { FaTrash, FaPrint } from 'react-icons/fa';
import PrintModal from './PrintModal.jsx';

const DataTable = ({ title, submittedData, fields, handleRemove }) => {
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const openPrintModal = (data) => {
    setSelectedRecord(data);
    setShowModal(true);
  };

  const closePrintModal = () => {
    setSelectedRecord(null);
    setShowModal(false);
  };

  return (
    <div className='bg-white border border-gray-200 rounded-lg shadow-sm w-full overflow-hidden'>
      {submittedData.length === 0 ? (
        <div className='text-gray-500 text-center py-12'>
          <div className='text-gray-400 mb-2'>
            <svg
              className='w-12 h-12 mx-auto mb-3'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={1.5}
                d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
              />
            </svg>
          </div>
          <p className='text-base font-medium'>No data submitted yet.</p>
          <p className='text-sm text-gray-400 mt-1'>
            Records will appear here once you add them.
          </p>
        </div>
      ) : (
        <div className='overflow-x-auto'>
          <table className='w-full border-collapse min-w-full'>
            <thead className='bg-gray-50 border-b border-gray-200'>
              <tr>
                {fields.map((field, index) => (
                  <th
                    key={index}
                    className='py-4 px-3 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap'
                  >
                    {field.label}
                  </th>
                ))}
                <th className='py-4 px-3 text-center text-sm font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap'>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className='bg-white divide-y divide-gray-200'>
              {submittedData.map((data, index) => (
                <tr
                  key={index}
                  className='hover:bg-gray-50 transition-colors duration-150 ease-in-out'
                >
                  {fields.map((field, idx) => (
                    <td key={idx} className='py-4 px-3 whitespace-nowrap'>
                      <div className='text-sm font-medium text-gray-900'>
                        {formatFieldValue(field.name, data[field.name])}
                      </div>
                    </td>
                  ))}
                  <td className='py-4 px-3 whitespace-nowrap text-center'>
                    <div className='flex justify-center space-x-3'>
                      <button
                        onClick={() => openPrintModal(data)}
                        className='inline-flex items-center justify-center w-8 h-8 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-full transition-colors duration-150 ease-in-out'
                        aria-label='Print record'
                        title='Print Record'
                      >
                        <FaPrint className='w-4 h-4' />
                      </button>
                      <button
                        onClick={() => handleRemove(index)}
                        className='inline-flex items-center justify-center w-8 h-8 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-full transition-colors duration-150 ease-in-out'
                        aria-label='Delete record'
                        title='Delete Record'
                      >
                        <FaTrash className='w-4 h-4' />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && selectedRecord && (
        <PrintModal
          title={title}
          selectedRecord={selectedRecord}
          fields={fields}
          onClose={closePrintModal}
        />
      )}
    </div>
  );
};

const formatFieldValue = (fieldName, value) => {
  // Handle null/undefined values
  if (value === null || value === undefined || value === '') {
    return <span className='text-gray-400 italic'>N/A</span>;
  }

  // Format date fields
  if (fieldName === 'date' && value) {
    const date = new Date(value);
    return (
      <span className='text-gray-700'>
        {date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        })}
      </span>
    );
  }

  // Format patient and doctor fields
  if (fieldName === 'patientId' || fieldName === 'doctor') {
    const displayValue =
      typeof value === 'object'
        ? value?.name ||
          `${value?.firstName || ''} ${value?.lastName || ''}`.trim() ||
          'N/A'
        : value;
    return <span className='text-gray-800 font-medium'>{displayValue}</span>;
  }

  // Format percentage fields
  if (fieldName === 'discount' || fieldName === 'percentage') {
    return (
      <span className='inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800'>
        {value}%
      </span>
    );
  }

  // Format price/amount fields
  if (
    fieldName === 'totalAmount'
  ) {
    const numericValue = typeof value === 'number' ? value : parseFloat(value);
    const formattedValue = isNaN(numericValue)
      ? value
      : numericValue.toFixed(2);
    return (
      <span className='text-gray-800 font-semibold'>${formattedValue}</span>
    );
  }

  // Format status fields
  if (fieldName === 'status') {
    const statusColors = {
      completed: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      cancelled: 'bg-red-100 text-red-800',
      active: 'bg-blue-100 text-blue-800',
      inactive: 'bg-gray-100 text-gray-800',
    };
    const colorClass =
      statusColors[value?.toLowerCase()] || 'bg-gray-100 text-gray-800';
    return (
      <span
        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${colorClass}`}
      >
        {value}
      </span>
    );
  }

  // Format type fields
  if (fieldName === 'type' || fieldName === 'category') {
    return (
      <span className='inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800'>
        {typeof value === 'object' ? value?.name || 'N/A' : value}
      </span>
    );
  }

  // Default formatting
  const displayValue = typeof value === 'object' ? value?.name || 'N/A' : value;
  return <span className='text-gray-700'>{displayValue}</span>;
};

export default DataTable;
