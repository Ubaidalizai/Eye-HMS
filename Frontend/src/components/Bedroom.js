import React, { useState, useEffect } from "react";

function Bedroom() {
  const [id, setId] = useState("");
  const [name, setName] = useState("");
  const [time, setTime] = useState("");
  const [date, setDate] = useState("");
  const [rent, setRent] = useState("");
  const [submittedData, setSubmittedData] = useState([]);
  const [isOpen, setIsOpen] = useState(true); // State to control form visibility

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
    <>
      {isOpen && (
        <>
          <div className="overlay" />
          <form className="form-container" onSubmit={handleSubmit}>
            <div className="grid-container">
              <div className="mb-4">
                <label className="block mb-2 text-sm font-medium">ID:</label>
                <input
                  type="text"
                  className="input-field"
                  value={id}
                  onChange={(e) => setId(e.target.value)}
                />
              </div>

              <div className="mb-4">
                <label className="block mb-2 text-sm font-medium">Name:</label>
                <input
                  type="text"
                  className="input-field"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="mb-4">
                <label className="block mb-2 text-sm font-medium">Time:</label>
                <input
                  type="time"
                  className="input-field"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                />
              </div>

              <div className="mb-4">
                <label className="block mb-2 text-sm font-medium">Date:</label>
                <input
                  type="date"
                  className="input-field"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>

              <div className="mb-4">
                <label className="block mb-2 text-sm font-medium">Rent:</label>
                <input
                  type="text"
                  className="input-field"
                  value={rent}
                  onChange={(e) => setRent(e.target.value)}
                />
              </div>
            </div>

            <div className="button-container flex justify-end space-x-2">
              <button
                type="button"
                onClick={handleCancel}
                className="cancel-button"
              >
                Cancel
              </button>
              <button type="submit" className="submit-button">
                Register
              </button>
            </div>
          </form>
        </>
      )}

      {submittedData.length > 0 && (
        <div className="submitted-data mt-4">
          <h3>Submitted Data:</h3>
          <table className="min-w-full bg-white border border-gray-300 mt-2">
            <thead>
              <tr>
                <th className="border border-gray-300 px-4 py-2">ID</th>
                <th className="border border-gray-300 px-4 py-2">Name</th>
                <th className="border border-gray-300 px-4 py-2">Time</th>
                <th className="border border-gray-300 px-4 py-2">Date</th>
                <th className="border border-gray-300 px-4 py-2">Rent</th>
              </tr>
            </thead>
            <tbody>
              {submittedData.map((data, index) => (
                <tr key={index}>
                  <td className="border border-gray-300 px-4 py-2">
                    {data.id}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {data.name}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {data.time}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {data.date}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {data.rent}
                  </td>

                  <button
                    onClick={() => handleRemove(index)}
                    className="close-button"
                  >
                    ❌
                  </button>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

export default Bedroom;
