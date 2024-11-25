import React, { useState, useEffect } from 'react';
import FormModal from '../components/FormModal';
import DataTable from '../components/DataTable';

function Bedroom() {
  const [fieldValues, setFieldValues] = useState({
    id: '',
    name: '',
    time: '',
    date: '',
    rent: '',
  });
  const [submittedData, setSubmittedData] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [method, setMethod] = useState('POST'); // Default to POST for adding new records
  const [url, setUrl] = useState('http://127.0.0.1:4000/api/v1/bedroom/');

  // Fetch data from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://127.0.0.1:4000/api/v1/bedroom/');
        if (!response.ok) throw new Error('Failed to fetch data');
        const data = await response.json();
        setSubmittedData(data.data || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, []);

  const openAddModal = () => {
    setFieldValues({ id: '', name: '', time: '', date: '', rent: '' });
    setMethod('POST');
    setUrl('http://127.0.0.1:4000/api/v1/bedroom/');
    setIsOpen(true);
  };

  const openEditModal = (index) => {
    const recordToEdit = submittedData[index];
    setFieldValues(recordToEdit);
    setMethod('PATCH');
    setUrl(`http://127.0.0.1:4000/api/v1/bedroom/${recordToEdit.id}`);
    setIsOpen(true);
  };

  const handleRemove = async (index) => {
    const recordId = submittedData[index]?.id;
    try {
      const response = await fetch(
        `http://127.0.0.1:4000/api/v1/bedroom/${recordId}`,
        { method: 'DELETE' }
      );
      if (!response.ok) throw new Error('Failed to delete record');
      setSubmittedData((prevData) => prevData.filter((_, i) => i !== index));
    } catch (error) {
      console.error('Error deleting record:', error);
    }
  };

  const fields = [
    { label: 'ID', type: 'text', name: 'id' },
    { label: 'Name', type: 'text', name: 'name' },
    { label: 'Time', type: 'time', name: 'time' },
    { label: 'Date', type: 'date', name: 'date' },
    { label: 'Rent', type: 'number', name: 'rent' },
  ];

  return (
    <div className='p-8 bg-gray-100 min-h-screen'>
      <div className='mb-4 flex justify-between items-center'>
        <h1 className='text-2xl font-bold'>Bedroom Management</h1>
        <button
          onClick={openAddModal}
          className='bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg shadow-md transition'
        >
          + Add Record
        </button>
      </div>

      <FormModal
        title={
          method === 'POST' ? 'Add New Bedroom Record' : 'Edit Bedroom Record'
        }
        isOpen={isOpen}
        handleCancel={() => setIsOpen(false)}
        fields={fields}
        fieldValues={fieldValues}
        setFieldValues={setFieldValues}
        url={url}
        method={method}
      />

      <DataTable
        submittedData={submittedData}
        fields={fields}
        handleEdit={openEditModal}
        handleRemove={handleRemove}
      />
    </div>
  );
}

export default Bedroom;
