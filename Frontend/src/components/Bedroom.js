import React, { useState, useEffect } from 'react';
import FormModal from '../components/FormModal';
import DataTable from '../components/DataTable';

function Bedroom() {
  const [id, setId] = useState('');
  const [name, setName] = useState('');
  const [time, setTime] = useState('');
  const [date, setDate] = useState('');
  const [rent, setRent] = useState('');
  const [percentage, setPercentage] = useState('');

  const [submittedData, setSubmittedData] = useState([]);

  const [isOpen, setIsOpen] = useState(false);

  const [editMode, setEditMode] = useState(false);

  const [editIndex, setEditIndex] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://127.0.0.1:4000/api/v1/bedroom/');
        if (!response.ok) throw new Error('Failed to fetch data');
        const data = await response.json();
        setSubmittedData(data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, []);
  const handleSubmit = async (event) => {
    event.preventDefault();
    const entry = { id, name, time, date, rent, percentage };

    if (editMode) {
      try {
        const response = await fetch(
          `http://127.0.0.1:4000/api/v1/bedroom/${id}`,
          {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(entry),
          }
        );
        if (!response.ok) throw new Error('Failed to update data');

        const updatedData = [...submittedData];
        updatedData[editIndex] = entry;
        setSubmittedData(updatedData);
      } catch (error) {
        console.error('Error updating data:', error);
      }
    } else {
      try {
        const response = await fetch('http://127.0.0.1:4000/api/v1/bedroom/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(entry),
        });
        if (!response.ok) throw new Error('Failed to add data');

        const newEntry = await response.json();
        setSubmittedData([...submittedData, newEntry]);
      } catch (error) {
        console.error('Error adding data:', error);
      }
    }

    clearForm();
    setIsOpen(false);
  };

  const handleCancel = () => {
    clearForm();
    setIsOpen(false);
  };

  const clearForm = () => {
    setId('');
    setName('');
    setTime('');
    setDate('');
    setRent('');
    setPercentage('');
    setEditMode(false);
    setEditIndex(null);
  };

  const handleEdit = (index) => {
    const recordToEdit = submittedData[index];
    setId(recordToEdit.id);
    setName(recordToEdit.name);
    setTime(recordToEdit.time);
    setDate(recordToEdit.date);
    setRent(recordToEdit.rent);
    setPercentage(recordToEdit.percentage);

    setEditMode(true);
    setEditIndex(index);
    setIsOpen(true);
  };

  const handleRemove = async (index) => {
    try {
      const { id } = submittedData[index];
      const response = await fetch(
        `http://127.0.0.1:4000/api/v1/bedroom/${id}`,
        {
          method: 'DELETE',
        }
      );
      if (!response.ok) throw new Error('Failed to delete data');

      const updatedData = submittedData.filter((_, i) => i !== index);
      setSubmittedData(updatedData);
    } catch (error) {
      console.error('Error deleting data:', error);
    }
  };

  const fields = [
    { label: 'ID', type: 'text', name: 'id' },
    { label: 'Name', type: 'text', name: 'name' },
    { label: 'Time', type: 'time', name: 'time' },
    { label: 'Date', type: 'date', name: 'date' },
    { label: 'Rent', type: 'text', name: 'rent' },
    { label: 'Percentage', type: 'number', name: 'percentage' },
  ];

  const fieldValues = { id, name, time, date, rent, percentage };
  const setFieldValues = ({ id, name, time, date, rent, percentage }) => {
    setId(id);
    setName(name);
    setTime(time);
    setDate(date);
    setRent(rent);
    setPercentage(percentage);
  };

  return (
    <div className='p-8 bg-gray-100 min-h-screen'>
      <div className='mb-4 flex justify-between items-center'>
        <h1 className='text-2xl font-bold'>Bedroom Management</h1>
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

      {/* Form Modal for adding/editing record */}
      <FormModal
        title={editMode ? 'Edit Bedroom Record' : 'Add New Bedroom Record'}
        isOpen={isOpen}
        handleCancel={handleCancel}
        handleSubmit={handleSubmit}
        fields={fields}
        fieldValues={fieldValues}
        setFieldValues={setFieldValues}
        url={
          editMode
            ? `http://127.0.0.1:4000/api/v1/bedroom/${id}`
            : 'http://127.0.0.1:4000/api/v1/bedroom/'
        }
        method={editMode ? 'PATCH' : 'POST'}
      />

      {}
      <DataTable
        submittedData={submittedData}
        fields={fields}
        handleEdit={handleEdit}
        handleRemove={handleRemove}
      />
    </div>
  );
}

export default Bedroom;
