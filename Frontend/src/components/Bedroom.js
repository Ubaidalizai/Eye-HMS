import React, { useState, useEffect } from "react";
import FormModal from "../components/FormModal";
import DataTable from "../components/DataTable";

function Bedroom() {
  const [id, setId] = useState("");
  const [name, setName] = useState("");
  const [time, setTime] = useState("");
  const [date, setDate] = useState("");
  const [rent, setRent] = useState("");
  const [submittedData, setSubmittedData] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

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
    );
    clearForm();
    setIsOpen(false);
  };

  const handleCancel = () => {
    clearForm();
    setIsOpen(false);
  };

  const clearForm = () => {
    setId("");
    setName("");
    setTime("");
    setDate("");
    setRent("");
  };

  const fields = [
    { label: "ID", type: "text", name: "id" },
    { label: "Name", type: "text", name: "name" },
    { label: "Time", type: "time", name: "time" },
    { label: "Date", type: "date", name: "date" },
    { label: "Rent", type: "text", name: "rent" },
  ];

  const fieldValues = { id, name, time, date, rent };
  const setFieldValues = ({ id, name, time, date, rent }) => {
    setId(id);
    setName(name);
    setTime(time);
    setDate(date);
    setRent(rent);
  };

  return (
    <div className='p-8 bg-gray-100 min-h-screen'>
      <div className='mb-4 flex justify-between items-center'>
        <h1 className='text-2xl font-bold'>Bedroom Management</h1>
        <button
          onClick={() => setIsOpen(true)}
          className='bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg shadow-md transition'
        >
          + Add Record
        </button>
      </div>

      <FormModal
        title='Add New Bedroom Record'
        isOpen={isOpen}
        handleSubmit={handleSubmit}
        handleCancel={handleCancel}
        fields={fields}
        fieldValues={fieldValues}
        setFieldValues={setFieldValues}
      />

      <DataTable
        submittedData={submittedData}
        fields={fields}
        handleRemove={(index) => {
          const updatedData = submittedData.filter((_, i) => i !== index);
          setSubmittedData(updatedData);
          localStorage.setItem(
            "bedroomSubmittedData",
            JSON.stringify(updatedData)
          );
        }}
      />
    </div>
  );
}

export default Bedroom;
