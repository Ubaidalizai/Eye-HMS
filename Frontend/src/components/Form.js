import React from "react";

const Form = ({ fields, values, setValues, onSubmit }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <form onSubmit={onSubmit} className='space-y-4'>
      {fields.map(({ label, type, name }) => (
        <div key={name} className='flex flex-col'>
          <label className='mb-1 font-medium'>{label}</label>
          <input
            type={type}
            name={name}
            value={values[name] || ""}
            onChange={handleChange}
            className='border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
            required
          />
        </div>
      ))}
      <button
        type='submit'
        className='w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg shadow-md transition'
      >
        Submit
      </button>
    </form>
  );
};

export default Form;
