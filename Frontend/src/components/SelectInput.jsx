import React from 'react';

function SelectInput({ id, options, value, onChange, maxHeight = "200px" }) {
  return (
    <select
      id={id}
      className='w-full h-10 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white scrollable-select'
      style={{
        maxHeight: options.length > 10 ? maxHeight : 'auto',
        overflowY: options.length > 10 ? 'auto' : 'visible'
      }}
      value={value}
      onChange={onChange}
    >
      {options.map((option, index) => (
        <option key={index} value={option.value} className="py-2 px-3">
          {option.label}
        </option>
      ))}
    </select>
  );
}

// Set default props
SelectInput.defaultProps = {
  id: '',
};

export default SelectInput;
