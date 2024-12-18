import React, { useState, useEffect } from 'react';
import FormModal from '../components/FormModal';
import DataTable from '../components/DataTable';
import { FaPlus } from 'react-icons/fa';
import Pagination from './Pagination';

function OCT() {
  const [patientId, setPatientId] = useState('');
  const [patientName, setPatientName] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [eyeExamined, setEyeExamined] = useState('');
  const [scanType, setScanType] = useState('');
  const [results, setResults] = useState('');
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
          `http://127.0.0.1:4000/api/v1/oct?page=${currentPage}&limit=${limit}`
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
    const entry = {
      patientId,
      patientName,
      date,
      time,
      eyeExamined,
      scanType,
      results,
      percentage,
    };

    if (editMode) {
      try {
        const response = await fetch(
          `http://127.0.0.1:4000/api/v1/oct/${patientId}`,
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
        const response = await fetch('http://127.0.0.1:4000/api/v1/oct/', {
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
    setPatientId('');
    setPatientName('');
    setDate('');
    setTime('');
    setEyeExamined('');
    setScanType('');
    setResults('');
    setPercentage('');
    setEditMode(false);
    setEditIndex(null);
  };

  const handleEdit = (index) => {
    const recordToEdit = submittedData[index];
    setFieldValues({
      patientId: recordToEdit.patientId || '',
      patientName: recordToEdit.patientName || '',
      date: recordToEdit.date || '',
      time: recordToEdit.time || '',
      eyeExamined: recordToEdit.eyeExamined || '',
      scanType: recordToEdit.scanType || '',
      results: recordToEdit.results || '',
      percentage: recordToEdit.percentage || '',
    });
    setEditMode(true);
    setEditIndex(index);
    setIsOpen(true);
  };

  const handleRemove = async (index) => {
    try {
      const { patientId } = submittedData[index];
      const response = await fetch(
        `http://127.0.0.1:4000/api/v1/oct/${patientId}`,
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
    { label: 'Id', type: 'text', name: 'patientId' },
    { label: 'Name', type: 'text', name: 'patientName' },
    { label: 'Date', type: 'date', name: 'date' },
    { label: 'Time', type: 'time', name: 'time' },
    {
      label: 'Eye Examined',
      type: 'select',
      name: 'eyeExamined',
      options: ['Left', 'Right', 'Both'],
    },
    { label: 'Scan Type', type: 'text', name: 'scanType' },
    { label: 'Results', type: 'textarea', name: 'results' },
    { label: 'Percentage', type: 'number', name: 'percentage' },
  ];

  const fieldValues = {
    patientId,
    patientName,
    date,
    time,
    eyeExamined,
    scanType,
    results,
    percentage,
  };

  const setFieldValues = ({
    patientId,
    patientName,
    date,
    time,
    eyeExamined,
    scanType,
    results,
    percentage,
  }) => {
    setPatientId(patientId);
    setPatientName(patientName);
    setDate(date);
    setTime(time);
    setEyeExamined(eyeExamined);
    setScanType(scanType);
    setResults(results);
    setPercentage(percentage);
  };

  return (
    <div className='p-6 min-h-screen'>
      <h2 className='font-semibold text-xl mb-16'>OCT</h2>
      <div className='flex justify-end mb-[-4.3rem]'>
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
        title={editMode ? 'Edit OCT Record' : 'OCT Record'}
        isOpen={isOpen}
        handleCancel={handleCancel}
        fields={fields}
        fieldValues={fieldValues}
        setFieldValues={setFieldValues}
        url={
          editMode
            ? `http://localhost:4000/api/v1/oct/${patientId}`
            : 'http://localhost:4000/api/v1/oct/'
        }
        method={editMode ? 'PATCH' : 'POST'}
      />

      <DataTable
        submittedData={submittedData}
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

export default OCT;
