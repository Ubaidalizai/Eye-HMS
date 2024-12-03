import React, { useState, useEffect } from 'react';
import FormModal from '../components/FormModal';
import DataTable from '../components/DataTable';

function Ultrasound() {
  const [fieldValues, setFieldValues] = useState({
    id: '',
    name: '',
    time: '',
    date: '',
    percentage: '',
    image: null,
  });
  const [submittedData, setSubmittedData] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editIndex, setEditIndex] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch('http://127.0.0.1:4000/api/v1/ultrasound/');
      const data = await response.json();
      setSubmittedData(data);
    };
    fetchData();
  }, []);

  const handleCancel = () => {
    setFieldValues({
      id: '',
      name: '',
      time: '',
      date: '',
      percentage: '',
      image: null,
    });
    setIsOpen(false);
    setEditMode(false);
    setEditIndex(null);
  };

  const handleEdit = (index) => {
    const record = submittedData[index];
    // Exclude `image` from being prefilled
    setFieldValues({
      id: record.id,
      name: record.name,
      time: record.time,
      date: record.date,
      percentage: record.percentage,
      image: null, // File input cannot have a value
    });
    setEditMode(true);
    setEditIndex(index);
    setIsOpen(true);
  };

  const handleRemove = async (index) => {
    const recordId = submittedData[index].id;
    await fetch(`http://127.0.0.1:4000/api/v1/ultrasound/${recordId}`, {
      method: 'DELETE',
    });
    setSubmittedData(submittedData.filter((_, i) => i !== index));
  };

  const handleFormSubmit = async () => {
    const formData = new FormData();
    Object.keys(fieldValues).forEach((key) => {
      if (fieldValues[key] !== null) {
        formData.append(key, fieldValues[key]);
      }
    });

    const response = await fetch(
      editMode
        ? `http://127.0.0.1:4000/api/v1/ultrasound/${fieldValues.id}`
        : 'http://127.0.0.1:4000/api/v1/ultrasound/',
      {
        method: editMode ? 'PATCH' : 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      console.error('Failed to save data.');
      return;
    }

    const result = await response.json();

    if (editMode) {
      // Update existing record
      const updatedData = [...submittedData];
      updatedData[editIndex] = result;
      setSubmittedData(updatedData);
    } else {
      // Add new record
      setSubmittedData([...submittedData, result]);
    }

    handleCancel();
  };

  const fields = [
    { label: 'ID', type: 'text', name: 'id' },
    { label: 'Name', type: 'text', name: 'name' },
    { label: 'Time', type: 'time', name: 'time' },
    { label: 'Date', type: 'date', name: 'date' },
    { label: 'Percentage', type: 'number', name: 'percentage' },
    { label: 'Image', type: 'file', name: 'image' }, // Handled separately
  ];

  return (
    <div className='p-8  min-h-screen'>
      <div className='mb-4 flex justify-between items-center'>
        <h1 className='text-2xl font-bold'>Ultrasound Management</h1>
        <button
          onClick={() => {
            setFieldValues({
              id: '',
              name: '',
              time: '',
              date: '',
              percentage: '',
              image: null,
            });
            setIsOpen(true);
            setEditMode(false);
            setEditIndex(null);
          }}
          className='bg-blue-500 text-white py-2 px-4 rounded-lg'
        >
          + Add Record
        </button>
      </div>

      <FormModal
        title={editMode ? 'Edit Ultrasound Record' : 'Add Ultrasound Record'}
        isOpen={isOpen}
        handleCancel={handleCancel}
        fields={fields.filter((field) => field.name !== 'image' || !editMode)} // Exclude image in edit mode
        fieldValues={fieldValues}
        setFieldValues={setFieldValues}
        url={
          editMode
            ? `http://127.0.0.1:4000/api/v1/ultrasound/${fieldValues.id}`
            : 'http://127.0.0.1:4000/api/v1/ultrasound/'
        }
        method={editMode ? 'PATCH' : 'POST'}
        onSubmit={handleFormSubmit}
      />

      <DataTable
        submittedData={submittedData}
        fields={fields.filter((field) => field.name !== 'image')}
        handleEdit={handleEdit}
        handleRemove={handleRemove}
      />
    </div>
  );
}

export default Ultrasound;
