import React, { useState } from 'react';
import { FaTimes, FaEdit, FaTrash, FaRegEdit } from 'react-icons/fa';

const DataTable = ({ submittedData, fields, handleRemove, handleEdit }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredData = Array.isArray(submittedData)
    ? submittedData.filter((data) =>
        fields.some(
          (field) =>
            data[field.name] &&
            data[field.name]
              .toString()
              .toLowerCase()
              .includes(searchTerm.toLowerCase())
        )
      )
    : [];

  return (
    <div className='bg-white border rounded-md'>
      {/* <h3 className='text-lg font-semibold mb-4'>Submitted Data</h3> */}

      <input
        type='text'
        placeholder='Search ...'
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className='border border-gray-300 mt-8 rounded w-64 focus:outline-none focus:ring-1 focus:ring-blue-500 h-9 mb-5 ml-5'
      />
      {filteredData.length === 0 ? (
        <div className='text-gray-500 text-center mt-10'>
          No data submitted yet.
        </div>
      ) : (
        <table className='w-full text-sm border-collapse  text-gray-500'>
          <thead className='text-xs text-gray-700 uppercase bg-gray-100'>
            <tr className='bg-gray-100  text-left'>
              {fields.map((field, index) => (
                <th key={index} className='py-2 px-2 border-b'>
                  {field.label}
                </th>
              ))}
              <th className='py-2 border-b'>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((data, index) => (
              <tr key={index} className='hover:bg-gray-50 border'>
                {fields.map((field, idx) => (
                  <td key={idx} className='py-2 px-2'>
                    {field.name === 'date'
                      ? data[field.name]?.split('T')[0] // Format 'date'
                      : field.name === 'patientId'
                      ? (typeof data[field.name] === 'object'
                          ? data[field.name]?.name
                          : data[field.name]) || 'N/A' // Handle 'patientId'
                      : field.name === 'doctor'
                      ? typeof data[field.name] === 'object'
                        ? `${data[field.name]?.firstName} ${
                            data[field.name]?.lastName
                          }` // Display only doctor's name
                        : data[field.name]
                      : field.name === 'percentage'
                      ? `${data['doctor']?.percentage || 0}%` // Display percentage from doctor object
                      : data[field.name]}{' '}
                  </td>
                ))}

                <td className='py-2 px-4 flex space-x-2'>
                  <div className='flex gap-2'>
                    {' '}
                    <button
                      onClick={() => handleEdit(index)}
                      className='text-blue-500 hover:text-blue-700'
                    >
                      <FaRegEdit className='w-4 h-4' />
                    </button>
                    <button
                      onClick={() => handleRemove(index)}
                      className='text-red-500 hover:text-red-700'
                    >
                      <FaTrash className='w-4 h-4' />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default DataTable;
