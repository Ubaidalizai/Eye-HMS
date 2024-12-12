/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import FormModal from '../components/FormModal';
import DataTable from '../components/DataTable';
import { FaPlus } from 'react-icons/fa';

function Operation() {
  const [id, setId] = useState('');
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [time, setTime] = useState('');
  const [date, setDate] = useState('');
  const [doctor, setDoctor] = useState('');
  const [percentage, setPercentage] = useState('');
  const [submittedData, setSubmittedData] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editIndex, setEditIndex] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://127.0.0.1:4000/api/v1/operation/');
        if (!response.ok) throw new Error('Failed to fetch data');
        const data = await response.json();
        console.log(data);
        setSubmittedData(data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const entry = { id, name, price, time, date, doctor, percentage };

    if (editMode) {
      try {
        const response = await fetch(
          `http://127.0.0.1:4000/api/v1/operation/${id}`,
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
        const response = await fetch(
          'http://127.0.0.1:4000/api/v1/operation/',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(entry),
          }
        );
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
    setPrice('');
    setTime('');
    setDate('');
    setDoctor('');
    setPercentage('');
    setEditMode(false);
    setEditIndex(null);
  };

  const handleEdit = (index) => {
    const recordToEdit = submittedData[index];
    console.log('Editing record:', recordToEdit); // Log record to edit
    setFieldValues({
      id: recordToEdit.id || '',
      name: recordToEdit.name || '',
      price: recordToEdit.price || '',
      time: recordToEdit.time || '',
      date: recordToEdit.date || '',
      doctor: recordToEdit.doctor || '',
      percentage: recordToEdit.percentage || '',
    });
    setEditMode(true);
    setEditIndex(index);
    setIsOpen(true);
  };

  const handleRemove = async (index) => {
    try {
      const { id } = submittedData[index];
      const response = await fetch(
        `http://127.0.0.1:4000/api/v1/operation/${id}`,
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
    { label: 'Price', type: 'text', name: 'price' },
    { label: 'Time', type: 'time', name: 'time' },
    { label: 'Date', type: 'date', name: 'date' },
    { label: 'Doctor', type: 'text', name: 'doctor' },
    { label: 'Percentage', type: 'number', name: 'percentage' },
  ];

  const fieldValues = { id, name, price, time, date, doctor, percentage };
  const setFieldValues = ({
    id,
    name,
    price,
    time,
    date,
    doctor,
    percentage,
  }) => {
    setId(id);
    setName(name);
    setPrice(price);
    setTime(time);
    setDate(date);
    setDoctor(doctor);
    setPercentage(percentage);
  };

  return (
    <div className='p-6  min-h-screen'>
      <h2 className='font-semibold text-xl mb-5'>Operation</h2>

      <div className='flex justify-end'>
        <button
          onClick={() => {
            clearForm();
            setIsOpen(true);
          }}
          className='inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 mb-2 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
        >
          <FaPlus className='mr-2' /> Add Record
        </button>
      </div>

      <FormModal
        title={editMode ? 'Edit Operation Record' : 'Add New Operation Record'}
        isOpen={isOpen}
        handleCancel={handleCancel}
        fields={fields}
        fieldValues={fieldValues}
        setFieldValues={setFieldValues}
        url={
          editMode
            ? `http://127.0.0.1:4000/api/v1/operation/${id}`
            : 'http://127.0.0.1:4000/api/v1/operation/'
        }
        method={editMode ? 'PATCH' : 'POST'}
      />
      <DataTable
        submittedData={submittedData}
        fields={fields}
        handleEdit={handleEdit}
        handleRemove={handleRemove}
      />
    </div>
  );
}

export default Operation;
