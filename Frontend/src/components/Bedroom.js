import React, { useState, useEffect } from "react";
import FormModal from "../components/FormModal";
import DataTable from "../components/DataTable";

function Bedroom() {
  const [fieldValues, setFieldValues] = useState({
    id: "",
    name: "",
    time: "",
    date: "",
    rent: "",
  });
  const [submittedData, setSubmittedData] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editIndex, setEditIndex] = useState(null);

  useEffect(() => {
    const storedData = localStorage.getItem("bedroomSubmittedData");
    if (storedData) {
      setSubmittedData(JSON.parse(storedData));
    }
  }, []);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (editMode) {
      const updatedData = [...submittedData];
      updatedData[editIndex] = fieldValues; // Update the existing record
      setSubmittedData(updatedData);
      localStorage.setItem("bedroomSubmittedData", JSON.stringify(updatedData));
    } else {
      const newSubmittedData = [...submittedData, fieldValues];
      setSubmittedData(newSubmittedData);
      localStorage.setItem(
        "bedroomSubmittedData",
        JSON.stringify(newSubmittedData)
      );
    }
    clearForm();
    setIsOpen(false);
  };

  const handleEdit = (index) => {
    const recordToEdit = submittedData[index];
    setFieldValues(recordToEdit);
    setEditMode(true); // Set to edit mode
    setEditIndex(index); // Store index for editing
    setIsOpen(true); // Open modal
  };

  const clearForm = () => {
    setFieldValues({
      id: "",
      name: "",
      time: "",
      date: "",
      rent: "",
    });
    setEditMode(false); // Reset edit mode
  };

  const fields = [
    { label: "ID", type: "text", name: "id" },
    { label: "Name", type: "text", name: "name" },
    { label: "Time", type: "time", name: "time" },
    { label: "Date", type: "date", name: "date" },
    { label: "Rent", type: "text", name: "rent" },
  ];

  return (
    <div className='p-8 bg-gray-100 min-h-screen'>
      <div className='mb-4 flex justify-between items-center'>
        <h1 className='text-2xl font-bold'>Bedroom Management</h1>
        <button
          onClick={() => {
            clearForm(); // Clear form before adding a new record
            setIsOpen(true);
          }}
          className='bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg shadow-md transition'
        >
          + Add Record
        </button>
      </div>

      <FormModal
        title={editMode ? "Edit Bedroom Record" : "Add New Bedroom Record"}
        isOpen={isOpen}
        handleSubmit={handleSubmit}
        handleCancel={() => setIsOpen(false)}
        fields={fields}
        fieldValues={fieldValues}
        setFieldValues={setFieldValues}
      />

      <DataTable
        submittedData={submittedData}
        fields={fields}
        handleEdit={handleEdit} // Handle edit action for each row
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
