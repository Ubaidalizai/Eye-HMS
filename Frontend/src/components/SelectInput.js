import React from 'react';

function SelectInput({ options, value, onChange }) {
  return (
    <select
      className='w-52 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300'
      value={value}
      onChange={onChange}
    >
      {options.map((option, index) => (
        <option key={index} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

export default SelectInput;
