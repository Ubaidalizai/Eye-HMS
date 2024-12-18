import React, { useState, useEffect } from 'react';
import FormModal from '../components/FormModal';
import DataTable from '../components/DataTable';
import { FaPlus } from 'react-icons/fa';

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
      patientId: recordToEdit.patientId || '',
      patientName: recordToEdit.patientName || '',
      date: recordToEdit.date || '',
      time: recordToEdit.time || '',
      testType: recordToEdit.testType || '',
      sampleCollected: recordToEdit.sampleCollected || '',
      results: recordToEdit.results || '',
      remarks: recordToEdit.remarks || '',
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
    { label: 'id', type: 'text', name: 'patientId' },
    { label: 'Name', type: 'text', name: 'patientName' },
    { label: 'Date', type: 'date', name: 'date' },
    { label: 'Time', type: 'time', name: 'time' },
    { label: 'Test', type: 'text', name: 'testType' },
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
    <div className='p-6 min-h-screen'>
      <h2 className='font-semibold text-xl mb-16'>Laboratory</h2>
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
        title={editMode ? 'Edit Lab Record' : 'Lab Record'}
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
