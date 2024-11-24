import React, { useState, useEffect } from "react";
import FormModal from "../components/FormModal";
import DataTable from "../components/DataTable";

function Yeglizer() {
  const [fieldValues, setFieldValues] = useState({
    id: "",
    patientName: "",
    appointmentTime: "",
    appointmentDate: "",
    eyePower: "",
    prescription: "",
  });
  const [submittedData, setSubmittedData] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editIndex, setEditIndex] = useState(null);

  useEffect(() => {
    const storedData = localStorage.getItem("yeglizerSubmittedData");
    if (storedData) {
      setSubmittedData(JSON.parse(storedData));
    }
  }, []);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (editMode) {
      const updatedData = [...submittedData];
      updatedData[editIndex] = fieldValues;
      setSubmittedData(updatedData);
      localStorage.setItem(
        "yeglizerSubmittedData",
        JSON.stringify(updatedData)
      );
    } else {
      const newSubmittedData = [...submittedData, fieldValues];
      setSubmittedData(newSubmittedData);
      localStorage.setItem(
        "yeglizerSubmittedData",
        JSON.stringify(newSubmittedData)
      );
    }
    clearForm();
    setIsOpen(false);
  };

  const handleEdit = (index) => {
    const recordToEdit = submittedData[index];
    setFieldValues(recordToEdit);
    setEditMode(true);
    setEditIndex(index);
    setIsOpen(true);
  };

  const clearForm = () => {
    setFieldValues({
      id: "",
      patientName: "",
      appointmentTime: "",
      appointmentDate: "",
      eyePower: "",
      prescription: "",
    });
    setEditMode(false);
  };

  const fields = [
    { label: "Patient ID", type: "text", name: "id" },
    { label: "Patient Name", type: "text", name: "patientName" },
    { label: "Appointment Time", type: "time", name: "appointmentTime" },
    { label: "Appointment Date", type: "date", name: "appointmentDate" },
    { label: "Eye Power", type: "text", name: "eyePower" },
    { label: "Prescription", type: "text", name: "prescription" },
  ];

  return (
    <div className='p-8 bg-gray-100 min-h-screen'>
      <div className='mb-4 flex justify-between items-center'>
        <h1 className='text-2xl font-bold'>Yeglizer Management</h1>
        <button
          onClick={() => {
            clearForm();
            setIsOpen(true);
          }}
          className='bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg shadow-md transition'
        >
          + Add Record
        </button>
      </div>

      <FormModal
        title={editMode ? "Edit Yeglizer Record" : "Add New Yeglizer Record"}
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
        handleEdit={handleEdit}
        handleRemove={(index) => {
          const updatedData = submittedData.filter((_, i) => i !== index);
          setSubmittedData(updatedData);
          localStorage.setItem(
            "yeglizerSubmittedData",
            JSON.stringify(updatedData)
          );
        }}
      />
    </div>
  );
}

export default Yeglizer;
