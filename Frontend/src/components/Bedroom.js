import React, { useState, useEffect } from 'react';
import FormModal from '../components/FormModal';
import DataTable from '../components/DataTable';
import { FaPlus } from 'react-icons/fa';
import Pagination from './Pagination';

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
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `http://localhost:4000/api/v1/bedroom?page=${currentPage}&limit=${limit}`
        );
        if (!response.ok) throw new Error('Failed to fetch data');
        const data = await response.json();
        setSubmittedData(data.data.results);
        setTotalPages(data.totalPages || Math.ceil(data.results / limit));
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, [currentPage, limit]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const entry = { id, name, time, date, rent, percentage };

    if (editMode) {
      try {
        const response = await fetch(
          `http://localhost:4000/api/v1/bedroom/${id}`,
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
        const response = await fetch('http://localhost:4000/api/v1/bedroom/', {
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
    setFieldValues({
      id: recordToEdit.id || '',
      name: recordToEdit.name || '',
      time: recordToEdit.time || '',
      date: recordToEdit.date || '',
      rent: recordToEdit.rent || '',
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
        `http://localhost:4000/api/v1/bedroom/${id}`,
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
    <div className='p-6 min-h-screen'>
      <h2 className='font-semibold text-xl mb-16'>Bedroom</h2>
      <div className='flex justify-end mb-[-4.4rem]'>
        <button
          onClick={() => {
            clearForm();
            setIsOpen(true);
          }}
          className='inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 mr-5 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
        >
          <FaPlus className='mr-2' /> Add Record
        </button>
      </div>

      <FormModal
        title={editMode ? 'Edit Bedroom Record' : 'Bedroom Record'}
        isOpen={isOpen}
        handleCancel={handleCancel}
        fields={fields}
        fieldValues={fieldValues}
        setFieldValues={setFieldValues}
        url={
          editMode
            ? `http://localhost:4000/api/v1/bedroom/${id}`
            : 'http://localhost:4000/api/v1/bedroom/'
        }
        method={editMode ? 'PATCH' : 'POST'}
      />

      <DataTable
        submittedData={Array.isArray(submittedData) ? submittedData : []}
        fields={fields}
        handleEdit={handleEdit}
        handleRemove={handleRemove}
      />
      <Pagination
        totalItems={submittedData.length}
        totalPagesCount={totalPages}
        itemsPerPage={limit}
        currentPage={currentPage}
        onPageChange={(page) => setCurrentPage(page)}
        onLimitChange={(limit) => setLimit(limit)}
      />
    </div>
  );
}

export default Bedroom;
