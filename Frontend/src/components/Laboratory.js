import React, { useState, useEffect } from 'react';
import FormModal from '../components/FormModal';
import DataTable from '../components/DataTable';

function Laboratory() {
  const [patientId, setId] = useState('');
  const [patientName, setPatientName] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [percentage, setPercentage] = useState('');
  const [testType, setTestType] = useState('');
  const [sampleCollected, setSampleCollected] = useState('');
  const [results, setResults] = useState('');
  const [remarks, setRemarks] = useState('');
  const [submittedData, setSubmittedData] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editIndex, setEditIndex] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://127.0.0.1:4000/api/v1/labratory/');
        if (!response.ok) throw new Error('Failed to fetch data');
        const data = await response.json();
        setSubmittedData(data.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const entry = {
      patientId,
      patientName,
      date,
      time,
      testType,
      sampleCollected,
      results,
      remarks,
      percentage,
    };

    if (editMode) {
      try {
        const response = await fetch(
          `http://127.0.0.1:4000/api/v1/labratory/${patientId}`,
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
          'http://127.0.0.1:4000/api/v1/labratory/',
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
    setPatientName('');
    setDate('');
    setTime('');
    setTestType('');
    setSampleCollected('');
    setResults('');
    setRemarks('');
    setPercentage('');
    setEditMode(false);
    setEditIndex(null);
  };

  const handleEdit = (index) => {
    const recordToEdit = submittedData[index];
    setFieldValues({
      id: recordToEdit.id || '',
      patientName: recordToEdit.patientName || '',
      date: recordToEdit.date || '',
      time: recordToEdit.time || '',
      testType: recordToEdit.testType || '',
      sampleCollected: recordToEdit.sampleCollected || '',
      results: recordToEdit.results || '',
      remarks: recordToEdit.remarks || '',
    });
    setEditMode(true);
    setEditIndex(index);
    setIsOpen(true);
  };

  const handleRemove = async (index) => {
    try {
      const { patientId } = submittedData[index];
      const response = await fetch(
        `http://127.0.0.1:4000/api/v1/labratory/${patientId}`,
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
    { label: 'ID', type: 'text', name: 'patientId' },
    { label: 'Patient Name', type: 'text', name: 'patientName' },
    { label: 'Date', type: 'date', name: 'date' },
    { label: 'Time', type: 'time', name: 'time' },
    { label: 'Test Type', type: 'text', name: 'testType' },
    { label: 'Sample Collected', type: 'text', name: 'sampleCollected' },
    { label: 'Results', type: 'textarea', name: 'results' },
    { label: 'Remarks', type: 'textarea', name: 'remarks' },
    { label: 'Percentage', type: 'number', name: 'percentage' },
  ];

  const fieldValues = {
    patientId,
    patientName,
    date,
    time,
    testType,
    sampleCollected,
    results,
    remarks,
    percentage,
  };

  const setFieldValues = ({
    patientId,
    patientName,
    date,
    time,
    testType,
    sampleCollected,
    results,
    remarks,
    percentage,
  }) => {
    setId(patientId);
    setPatientName(patientName);
    setDate(date);
    setTime(time);
    setTestType(testType);
    setSampleCollected(sampleCollected);
    setResults(results);
    setRemarks(remarks);
    setPercentage(percentage);
  };

  return (
    <div className='p-8 min-h-screen'>
      <div className='mb-4 flex justify-between items-center'>
        <h1 className='text-2xl font-bold'>Laboratory Management</h1>
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
        title={editMode ? 'Edit Lab Record' : 'Add New Lab Record'}
        isOpen={isOpen}
        handleCancel={handleCancel}
        fields={fields}
        fieldValues={fieldValues}
        setFieldValues={setFieldValues}
        url={
          editMode
            ? `http://localhost:4000/api/v1/labratory/${patientId}`
            : 'http://localhost:4000/api/v1/labratory/'
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

export default Laboratory;
