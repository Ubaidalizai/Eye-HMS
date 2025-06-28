'use client';

import { useState } from 'react';
import { FaTrash, FaPrint } from 'react-icons/fa';
import PrintModal from "./PrintModal.jsx";

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
    <div className='bg-white border rounded-md w-full overflow-hidden'>
      {submittedData.length === 0 ? (
        <div className='text-gray-500 text-center py-8'>
          No data submitted yet.
        </div>
      ) : (
        <div className='overflow-x-auto'>
          <table className='w-full text-sm border-collapse text-gray-500 min-w-full'>
            <thead className='text-xs text-gray-700 uppercase bg-gray-100'>
              <tr className='bg-gray-100 text-left'>
                {fields.map((field, index) => (
                  <th
                    key={index}
                    className='py-2 px-2 border-b whitespace-nowrap'
                  >
                    {field.label}
                  </th>
                ))}
                <th className='py-2 border-b whitespace-nowrap px-2'>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {submittedData.map((data, index) => (
                <tr key={index} className='hover:bg-gray-50 border'>
                  {fields.map((field, idx) => (
                    <td key={idx} className='py-2 px-2 whitespace-nowrap'>
                      {formatFieldValue(field.name, data[field.name])}
                    </td>
                  ))}
                  <td className='py-2 px-2 whitespace-nowrap'>
                    <div className='flex space-x-2'>
                      <button
                        onClick={() => openPrintModal(data)}
                        className='text-blue-500 hover:text-blue-700 p-1'
                        aria-label='Print record'
                      >
                        <FaPrint className='w-4 h-4' />
                      </button>
                      <button
                        onClick={() => handleRemove(index)}
                        className='text-red-500 hover:text-red-700 p-1'
                        aria-label='Delete record'
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
  if (fieldName === 'date' && value) {
    return value.split('T')[0];
  }
  if (fieldName === 'patientId' || fieldName === 'doctor') {
    return typeof value === 'object'
      ? value?.name || `${value?.firstName} ${value?.lastName}` || 'N/A'
      : value;
  }
  if (fieldName === 'discount' || fieldName === 'percentage') {
    return `${value}%`;
  }
  return typeof value === 'object' ? value?.name || 'N/A' : value;
};

export default DataTable;
