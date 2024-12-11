import React, { useState, useEffect } from 'react';
import FormModal from '../components/FormModal';
import DataTable from '../components/DataTable';

function OPD() {
  const [patientId, setPatientId] = useState('');
  const [patientName, setPatientName] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [department, setDepartment] = useState('');
  const [doctor, setDoctor] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [prescription, setPrescription] = useState('');
  const [percentage, setPercentage] = useState('');
  const [submittedData, setSubmittedData] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editIndex, setEditIndex] = useState(null);

  // Fetch data from backend API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://127.0.0.1:4000/api/v1/opd/');
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
    const entry = {
      patientId,
      patientName,
      date,
      time,
      department,
      doctor,
      diagnosis,
      prescription,
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
        const response = await fetch('http://127.0.0.1:4000/api/v1/opd/', {
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
    setDepartment('');
    setDoctor('');
    setDiagnosis('');
    setPrescription('');
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
      department: recordToEdit.department || '',
      doctor: recordToEdit.doctor || '',
      diagnosis: recordToEdit.diagnosis || '',
      prescription: recordToEdit.prescription || '',
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
        `http://127.0.0.1:4000/api/v1/opd/${patientId}`,
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
    { label: 'patientId', type: 'text', name: 'patientId' },
    { label: 'Patient Name', type: 'text', name: 'patientName' },
    { label: 'Date', type: 'date', name: 'date' },
    { label: 'Time', type: 'time', name: 'time' },
    { label: 'Department', type: 'text', name: 'department' },
    { label: 'Doctor', type: 'text', name: 'doctor' },
    { label: 'Diagnosis', type: 'textarea', name: 'diagnosis' },
    { label: 'Prescription', type: 'textarea', name: 'prescription' },
    { label: 'Percentage', type: 'number', name: 'percentage' }, // New Field
  ];

  const fieldValues = {
    patientId,
    patientName,
    date,
    time,
    department,
    doctor,
    diagnosis,
    prescription,
    percentage,
  };

  const setFieldValues = ({
    patientId,
    patientName,
    date,
    time,
    department,
    doctor,
    diagnosis,
    prescription,
    percentage,
  }) => {
    setPatientId(patientId);
    setPatientName(patientName);
    setDate(date);
    setTime(time);
    setDepartment(department);
    setDoctor(doctor);
    setDiagnosis(diagnosis);
    setPrescription(prescription);
    setPercentage(percentage);
  };

  return (
    <div className='p-8 min-h-screen'>
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
        title={editMode ? 'Edit OCT Record' : 'Add New OCT Record'}
        isOpen={isOpen}
        handleCancel={handleCancel}
        fields={fields}
        fieldValues={fieldValues}
        setFieldValues={setFieldValues}
        url={
          editMode
            ? `http://localhost:4000/api/v1/opd/${patientId}`
            : 'http://localhost:4000/api/v1/opd/'
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

export default OPD;
