import React, { useState, useEffect } from "react";
import FormModal from "../components/FormModal";
import DataTable from "../components/DataTable";

function Operation() {
  const [id, setId] = useState("");
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [time, setTime] = useState("");
  const [date, setDate] = useState("");
  const [doctor, setDoctor] = useState("");
  const [submittedData, setSubmittedData] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editIndex, setEditIndex] = useState(null); // To keep track of the index of the record being edited

  useEffect(() => {
    const storedData = localStorage.getItem("operationSubmittedData");
    if (storedData) {
      setSubmittedData(JSON.parse(storedData));
    }
  }, []);

  const handleSubmit = (event) => {
    event.preventDefault();
    const entry = { id, name, price, time, date, doctor };

    if (editMode) {
      const updatedData = [...submittedData];
      updatedData[editIndex] = entry; // Update the existing record
      setSubmittedData(updatedData);
      localStorage.setItem(
        "operationSubmittedData",
        JSON.stringify(updatedData)
      );
    } else {
      const newSubmittedData = [...submittedData, entry];
      setSubmittedData(newSubmittedData);
      localStorage.setItem(
        "operationSubmittedData",
        JSON.stringify(newSubmittedData)
      );
    }

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
    setPrice("");
    setTime("");
    setDate("");
    setDoctor("");
    setEditMode(false); // Reset edit mode when form is cleared
  };

  const handleEdit = (index) => {
    const recordToEdit = submittedData[index];
    setId(recordToEdit.id);
    setName(recordToEdit.name);
    setPrice(recordToEdit.price);
    setTime(recordToEdit.time);
    setDate(recordToEdit.date);
    setDoctor(recordToEdit.doctor);
    setEditMode(true); // Switch to edit mode
    setEditIndex(index); // Store the index of the record being edited
    setIsOpen(true);
  };

  const fields = [
    { label: "ID", type: "text", name: "id" },
    { label: "Name", type: "text", name: "name" },
    { label: "Price", type: "text", name: "price" },
    { label: "Time", type: "time", name: "time" },
    { label: "Date", type: "date", name: "date" },
    { label: "Doctor", type: "text", name: "doctor" },
  ];

  const fieldValues = { id, name, price, time, date, doctor };
  const setFieldValues = ({ id, name, price, time, date, doctor }) => {
    setId(id);
    setName(name);
    setPrice(price);
    setTime(time);
    setDate(date);
    setDoctor(doctor);
  };

  return (
    <div className='p-8 bg-gray-100 min-h-screen'>
      <div className='mb-4 flex justify-between items-center'>
        <h1 className='text-2xl font-bold'>Operation Management</h1>
        <button
          onClick={() => {
            clearForm(); // Clear the form before adding a new record
            setIsOpen(true);
          }}
          className='bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg shadow-md transition'
        >
          + Add Record
        </button>
      </div>

      <FormModal
        title={editMode ? "Edit Operation Record" : "Add New Operation Record"}
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
        handleEdit={handleEdit} // Pass the handleEdit function to DataTable
        handleRemove={(index) => {
          const updatedData = submittedData.filter((_, i) => i !== index);
          setSubmittedData(updatedData);
          localStorage.setItem(
            "operationSubmittedData",
            JSON.stringify(updatedData)
          );
        }}
      />
    </div>
  );
}

export default Operation;
