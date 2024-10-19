import React, { useState, useEffect } from "react";
import { FaTimes } from "react-icons/fa";
function Bedroom() {
  const [id, setId] = useState("");
  const [name, setName] = useState("");
  const [time, setTime] = useState("");
  const [date, setDate] = useState("");
  const [rent, setRent] = useState("");
  const [submittedData, setSubmittedData] = useState([]);
  const [isOpen, setIsOpen] = useState(false); // Control form visibility

  // Load submitted data from localStorage when the component mounts
  useEffect(() => {
    const storedData = localStorage.getItem("bedroomSubmittedData");
    if (storedData) {
      setSubmittedData(JSON.parse(storedData));
    }
  }, []);

  const handleSubmit = (event) => {
    event.preventDefault();
    const entry = { id, name, time, date, rent };
    const newSubmittedData = [...submittedData, entry];
    setSubmittedData(newSubmittedData);
    localStorage.setItem(
      "bedroomSubmittedData",
      JSON.stringify(newSubmittedData)
    ); // Save to localStorage
    clearForm();
    setIsOpen(false); // Close the form after submission
  };

  const handleCancel = () => {
    clearForm();
    setIsOpen(false); // Close the form
  };

  const clearForm = () => {
    setId("");
    setName("");
    setTime("");
    setDate("");
    setRent("");
  };

  const handleRemove = (index) => {
    const updatedData = submittedData.filter((_, i) => i !== index);
    setSubmittedData(updatedData);
    localStorage.setItem("bedroomSubmittedData", JSON.stringify(updatedData)); // Update localStorage
  };

  return (
    <div className='p-8 bg-gray-100 min-h-screen'>
      <div className='mb-4 flex justify-between items-center'>
        <h1 className='text-2xl font-bold'>Bedroom Management</h1>
        <button
          onClick={() => setIsOpen(true)}
          className='bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg shadow-md'
        >
          + Add Record
        </button>
      </div>

      {/* Form Modal */}
      {isOpen && (
        <>
          <div className='fixed inset-0 bg-gray-800 bg-opacity-50 z-50 flex items-center justify-center'>
            <div className='bg-white p-6 rounded-lg shadow-lg w-full max-w-md h-full max-h-screen flex flex-col overflow-auto z-60'>
              <h2 className='text-xl font-semibold mb-6 text-center'>
                Add New Record
              </h2>

              <form onSubmit={handleSubmit} className='space-y-4 flex-1'>
                <div className='flex flex-col'>
                  <label className='font-medium text-gray-700'>ID:</label>
                  <input
                    type='text'
                    className='border border-gray-300 p-3 rounded focus:outline-none focus:ring focus:ring-blue-300 transition'
                    value={id}
                    onChange={(e) => setId(e.target.value)}
                  />
                </div>
                <div className='flex flex-col'>
                  <label className='font-medium text-gray-700'>Name:</label>
                  <input
                    type='text'
                    className='border border-gray-300 p-3 rounded focus:outline-none focus:ring focus:ring-blue-300 transition'
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className='flex flex-col'>
                  <label className='font-medium text-gray-700'>Time:</label>
                  <input
                    type='time'
                    className='border border-gray-300 p-3 rounded focus:outline-none focus:ring focus:ring-blue-300 transition'
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                  />
                </div>
                <div className='flex flex-col'>
                  <label className='font-medium text-gray-700'>Date:</label>
                  <input
                    type='date'
                    className='border border-gray-300 p-3 rounded focus:outline-none focus:ring focus:ring-blue-300 transition'
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </div>
                <div className='flex flex-col'>
                  <label className='font-medium text-gray-700'>Rent:</label>
                  <input
                    type='text'
                    className='border border-gray-300 p-3 rounded focus:outline-none focus:ring focus:ring-blue-300 transition'
                    value={rent}
                    onChange={(e) => setRent(e.target.value)}
                  />
                </div>

                {/* Buttons */}
                <div className='flex justify-end space-x-4 mt-6'>
                  <button
                    type='button'
                    onClick={handleCancel}
                    className='bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition'
                  >
                    Cancel
                  </button>
                  <button
                    type='submit'
                    className='bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition'
                  >
                    Submit
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}

      {/* Submitted Data Table */}
      {submittedData.length > 0 ? (
        <div className='bg-white shadow-lg rounded-lg p-6'>
          <h3 className='text-lg font-semibold mb-4'>Submitted Data</h3>
          <table className='min-w-full bg-white border border-gray-200'>
            <thead>
              <tr className='bg-gray-100 text-left'>
                <th className='py-2 px-4 border-b'>ID</th>
                <th className='py-2 px-4 border-b'>Name</th>
                <th className='py-2 px-4 border-b'>Time</th>
                <th className='py-2 px-4 border-b'>Date</th>
                <th className='py-2 px-4 border-b'>Rent</th>
                <th className='py-2 px-4 border-b'>Actions</th>
              </tr>
            </thead>
            <tbody>
              {submittedData.map((data, index) => (
                <tr key={index} className='hover:bg-gray-50'>
                  <td className='py-2 px-4 border-b'>{data.id}</td>
                  <td className='py-2 px-4 border-b'>{data.name}</td>
                  <td className='py-2 px-4 border-b'>{data.time}</td>
                  <td className='py-2 px-4 border-b'>{data.date}</td>
                  <td className='py-2 px-4 border-b'>{data.rent}</td>
                  <td className='py-2 px-4 border-b'>
                    <button
                      onClick={() => handleRemove(index)}
                      className='bg-red-500 text-white px-4 py-1 rounded-md shadow-sm hover:bg-red-600'
                    >
                      <FaTimes />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className='text-gray-500 text-center mt-10'>
          No data submitted yet.
        </div>
      )}
    </div>
  );
}

export default Bedroom;
