import React from 'react';

function SelectInput({ id, options, value, onChange, maxHeight = "200px" }) {
  return (
    <select
      id={id}
      className='w-full h-10 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none bg-white scrollable-select transition-all'
      style={{
        maxHeight: options.length > 10 ? maxHeight : 'auto',
        overflowY: options.length > 10 ? 'auto' : 'visible'
      }}
      value={value}
      onChange={onChange}
      onFocus={(e) => {
        e.currentTarget.style.borderColor = '#F5276C';
        e.currentTarget.style.boxShadow = '0 0 0 2px rgba(245, 39, 108, 0.2)';
      }}
      onBlur={(e) => {
        e.currentTarget.style.borderColor = '';
        e.currentTarget.style.boxShadow = '';
      }}
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
