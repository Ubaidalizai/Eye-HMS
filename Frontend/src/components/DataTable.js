// components/DataTable.js
import React from "react";
import { FaTimes } from "react-icons/fa";

const DataTable = ({ submittedData, fields, handleRemove }) => {
  if (submittedData.length === 0) {
    return (
      <div className='text-gray-500 text-center mt-10'>
        No data submitted yet.
      </div>
    );
  }

  return (
    <div className='bg-white shadow-lg rounded-lg p-6 mt-8'>
      <h3 className='text-lg font-semibold mb-4'>Submitted Data</h3>
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
          {submittedData.map((data, index) => (
            <tr key={index} className='hover:bg-gray-50'>
              {fields.map((field, idx) => (
                <td key={idx} className='py-2 px-4 border-b'>
                  {data[field.name]}
                </td>
              ))}
              <td className='py-2 px-4 border-b'>
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
    </div>
  );
};

export default DataTable;
