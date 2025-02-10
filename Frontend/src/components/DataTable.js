import React, { useState } from 'react';
import { FaTrash, FaRegEdit, FaPrint } from 'react-icons/fa';

const DataTable = ({ submittedData, fields, handleRemove }) => {
  const [selectedRecord, setSelectedRecord] = useState(null); // Holds the record to be printed
  const [showModal, setShowModal] = useState(false); // Controls modal visibility

  const handlePrint = () => {
    window.print();
  };

  const openPrintModal = (data) => {
    setSelectedRecord(data);
    setShowModal(true);
  };

  const closePrintModal = () => {
    setSelectedRecord(null);
    setShowModal(false);
  };

  return (
    <div className='bg-white border rounded-md'>
      {submittedData.length === 0 ? (
        <div className='text-gray-500 text-center mt-10'>
          No data submitted yet.
        </div>
      ) : (
        <table className='w-full text-sm border-collapse text-gray-500'>
          <thead className='text-xs text-gray-700 uppercase bg-gray-100'>
            <tr className='bg-gray-100 text-left'>
              {fields.map((field, index) => (
                <th key={index} className='py-2 px-2 border-b'>
                  {field.label}
                </th>
              ))}
              <th className='py-2 border-b'>Actions</th>
            </tr>
          </thead>
          <tbody>
            {submittedData.map((data, index) => (
              <tr key={index} className='hover:bg-gray-50 border'>
                {fields.map((field, idx) => (
                  <td key={idx} className='py-2 px-2'>
                    {field.name === 'date'
                      ? data[field.name]?.split('T')[0]
                      : field.name === 'patientId'
                      ? typeof data[field.name] === 'object'
                        ? data[field.name]?.name || 'N/A'
                        : data[field.name]
                      : field.name === 'doctor'
                      ? typeof data[field.name] === 'object'
                        ? `${data[field.name]?.firstName} ${
                            data[field.name]?.lastName
                          }`
                        : data[field.name]
                      : field.name === 'discount' || field.name === 'percentage' // Add % for discount and percentage
                      ? `${data[field.name]}%`
                      : data[field.name]}
                  </td>
                ))}
                <td className='py-2 px-4 flex space-x-2'>
                  <button
                    onClick={() => openPrintModal(data)}
                    className='text-blue-500 hover:text-blue-700'
                  >
                    <FaPrint className='w-4 h-4' />
                  </button>
                  <button
                    onClick={() => handleRemove(index)}
                    className='text-red-500 hover:text-red-700'
                  >
                    <FaTrash className='w-4 h-4' />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Modal for Print */}
      {showModal && selectedRecord && (
        <div
          className='fixed inset-0 z-50 flex items-center justify-center bg-gray-500 bg-opacity-75'
          onClick={closePrintModal}
        >
          <div
            className='bg-white rounded-md shadow-lg p-6 w-1/4'
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className='text-lg font-bold mb-4'>Record Details</h2>
            <table className='w-full text-sm border-collapse'>
              <tbody>
                {fields.map(
                  (field, idx) =>
                    field.name !== 'percentage' &&
                    field.name !== 'totalAmount' && ( // Exclude percentage and totalAmount
                      <tr key={idx}>
                        <th className='text-left px-2 py-1'>{field.label}</th>
                        <td className='px-2 py-1'>
                          {field.name === 'date'
                            ? selectedRecord[field.name]?.split('T')[0]
                            : field.name === 'patientId'
                            ? typeof selectedRecord[field.name] === 'object'
                              ? selectedRecord[field.name]?.name || 'N/A'
                              : selectedRecord[field.name]
                            : field.name === 'doctor'
                            ? typeof selectedRecord[field.name] === 'object'
                              ? `${selectedRecord[field.name]?.firstName} ${
                                  selectedRecord[field.name]?.lastName
                                }`
                              : selectedRecord[field.name]
                            : field.name === 'discount' // Add % for discount in modal
                            ? `${selectedRecord[field.name]}%`
                            : selectedRecord[field.name]}
                        </td>
                      </tr>
                    )
                )}
              </tbody>
            </table>
            <div className='flex justify-end mt-4'>
              <button
                onClick={closePrintModal}
                className='bg-gray-300 text-gray-700 px-4 py-2 rounded-md mr-2'
              >
                Close
              </button>
              <button
                onClick={handlePrint}
                className='bg-blue-600 text-white px-4 py-2 rounded-md'
              >
                Print
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;
