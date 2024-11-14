import React, { useState } from 'react';
import { FaTimes, FaEdit } from 'react-icons/fa';

const DataTable = ({ submittedData, fields, handleRemove, handleEdit }) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Filter data based on search term
  const filteredData = submittedData.filter((data) =>
    fields.some((field) =>
      data[field.name]
        .toString()
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    )
  );

  return (
    <div className='bg-white shadow-lg rounded-lg p-6 mt-8'>
      <h3 className='text-lg font-semibold mb-4'>Submitted Data</h3>

      {/* Search Bar */}
      <input
        type='text'
        placeholder='Search...'
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className='border border-gray-300 rounded-lg p-2 mb-4 w-full focus:outline-none focus:ring focus:ring-blue-300'
      />

      {filteredData.length === 0 ? (
        <div className='text-gray-500 text-center mt-10'>
          No data submitted yet.
        </div>
      ) : (
        <table className='min-w-full bg-white border border-gray-200'>
          <thead>
            <tr className='bg-gray-100 text-left'>
              {fields.map((field, index) => (
                <th key={index} className='py-2 px-4 border-b'>
                  {field.label}
                </th>
              ))}
              <th className='py-2 px-4 border-b'>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((data, index) => (
              <tr key={index} className='hover:bg-gray-50'>
                {fields.map((field, idx) => (
                  <td key={idx} className='py-2 px-4 border-b'>
                    {data[field.name]}
                  </td>
                ))}
                <td className='py-2 px-4 border-b flex space-x-2'>
                  <button
                    onClick={() => handleEdit(index, data)}
                    className='text-blue-500 hover:text-blue-700'
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleRemove(index)}
                    className='text-red-500 hover:text-red-700'
                  >
                    <FaTimes />
                  </button>
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
