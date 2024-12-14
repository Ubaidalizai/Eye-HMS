import React, { useState, useEffect } from 'react';
import FormModal from '../components/FormModal';
import DataTable from '../components/DataTable';
import { FaPlus } from 'react-icons/fa';

function Yeglizer() {
  const [id, setId] = useState('');
  const [patientName, setPatientName] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('');
  const [appointmentDate, setAppointmentDate] = useState('');
  const [eyePower, setEyePower] = useState('');
  const [prescription, setPrescription] = useState('');
  const [percentage, setPercentage] = useState('');
  const [submittedData, setSubmittedData] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editIndex, setEditIndex] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://127.0.0.1:4000/api/v1/yeglizer/');
        if (!response.ok) throw new Error('Failed to fetch data');
        const data = await response.json();
        console.log(data);
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
      id,
      patientName,
      appointmentTime,
      appointmentDate,
      eyePower,
      prescription,
      percentage,
    };

    if (editMode) {
      try {
        const response = await fetch(
          `http://127.0.0.1:4000/api/v1/yeglizer/${id}`,
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
        const response = await fetch('http://127.0.0.1:4000/api/v1/yeglizer/', {
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
    setPatientName('');
    setAppointmentTime('');
    setAppointmentDate('');
    setEyePower('');
    setPrescription('');
    setPercentage('');
    setEditMode(false);
    setEditIndex(null);
  };

  const handleEdit = (index) => {
    const recordToEdit = submittedData[index];
    console.log('Editing record:', recordToEdit); // Log record to edit
    setFieldValues({
      id: recordToEdit.id || '',
      patientName: recordToEdit.patientName || '',
      appointmentTime: recordToEdit.appointmentTime || '',
      appointmentDate: recordToEdit.appointmentDate || '',
      eyePower: recordToEdit.eyePower || '',
      prescription: recordToEdit.prescription || '',
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
        `http://127.0.0.1:4000/api/v1/yeglizer/${id}`,
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
    { label: 'Name', type: 'text', name: 'patientName' },
    { label: 'Time', type: 'time', name: 'appointmentTime' },
    { label: 'Date', type: 'date', name: 'appointmentDate' },
    { label: 'Eye Power', type: 'text', name: 'eyePower' },
    { label: 'Prescription', type: 'text', name: 'prescription' },
    { label: 'Percentage', type: 'number', name: 'percentage' },
  ];

  const fieldValues = {
    id,
    patientName,
    appointmentTime,
    appointmentDate,
    eyePower,
    prescription,
    percentage,
  };

  const setFieldValues = ({
    id,
    patientName,
    appointmentTime,
    appointmentDate,
    eyePower,
    prescription,
    percentage,
  }) => {
    setId(id);
    setPatientName(patientName);
    setAppointmentTime(appointmentTime);
    setAppointmentDate(appointmentDate);
    setEyePower(eyePower);
    setPrescription(prescription);
    setPercentage(percentage);
  };

  return (
    <div className='p-6 min-h-screen'>
      {/* <div className='mb-4 flex justify-between items-center'> */}
      <h2 className='font-semibold text-xl mb-16'>Yeglizer</h2>
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
      {/* </div> */}

      <FormModal
        title={editMode ? 'Edit Yeglizer Record' : 'Yeglizer Record'}
        isOpen={isOpen}
        handleCancel={handleCancel}
        fields={fields}
        fieldValues={fieldValues}
        setFieldValues={setFieldValues}
        url={
          editMode
            ? `http://localhost:4000/api/v1/yeglizer/${id}`
            : 'http://localhost:4000/api/v1/yeglizer/'
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

export default Yeglizer;
