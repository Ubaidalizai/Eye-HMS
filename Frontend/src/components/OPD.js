import React, { useState, useEffect } from "react";
import FormModal from "../components/FormModal";
import DataTable from "../components/DataTable";

function OPD() {
  const [fieldValues, setFieldValues] = useState({
    patientId: "",
    patientName: "",
    date: "",
    time: "",
    department: "",
    doctor: "",
    diagnosis: "",
    prescription: "",
  });
  const [submittedData, setSubmittedData] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editIndex, setEditIndex] = useState(null);

  useEffect(() => {
    const storedData = localStorage.getItem("opdSubmittedData");
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
      localStorage.setItem("opdSubmittedData", JSON.stringify(updatedData));
    } else {
      const newSubmittedData = [...submittedData, fieldValues];
      setSubmittedData(newSubmittedData);
      localStorage.setItem(
        "opdSubmittedData",
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
      patientId: "",
      patientName: "",
      date: "",
      time: "",
      department: "",
      doctor: "",
      diagnosis: "",
      prescription: "",
    });
    setEditMode(false);
  };

  const fields = [
    { label: "Patient ID", type: "text", name: "patientId" },
    { label: "Patient Name", type: "text", name: "patientName" },
    { label: "Date", type: "date", name: "date" },
    { label: "Time", type: "time", name: "time" },
    { label: "Department", type: "text", name: "department" },
    { label: "Doctor", type: "text", name: "doctor" },
    { label: "Diagnosis", type: "textarea", name: "diagnosis" },
    { label: "Prescription", type: "textarea", name: "prescription" },
  ];

  return (
    <div className='p-8 bg-gray-100 min-h-screen'>
      <div className='mb-4 flex justify-between items-center'>
        <h1 className='text-2xl font-bold'>OPD Management</h1>
        <button
          onClick={() => {
            clearForm();
            setIsOpen(true);
          }}
          className='bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg shadow-md transition'
        >
          + Add OPD Record
        </button>
      </div>

      <FormModal
        title={editMode ? "Edit OPD Record" : "Add New OPD Record"}
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
          localStorage.setItem("opdSubmittedData", JSON.stringify(updatedData));
        }}
      />
    </div>
  );
}

export default OPD;
