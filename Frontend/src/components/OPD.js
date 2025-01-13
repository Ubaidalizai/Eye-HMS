import React, { useState, useEffect } from 'react';
import FormModal from '../components/FormModal';
import DataTable from '../components/DataTable';
import { FaPlus } from 'react-icons/fa';
import Pagination from './Pagination';
import { useAuth } from '../AuthContext';

function OPD() {
  const [patientId, setPatientId] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [doctor, setDoctor] = useState('');
  const [discount, setDiscount] = useState(0);
  const [price, setPrice] = useState(0);
  const [submittedData, setSubmittedData] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const { perDoctors } = useAuth();

  // Fetch data from backend API
  useEffect(() => {
    fetchData();
  }, [currentPage, limit]);

  const fetchData = async () => {
    try {
      const response = await fetch(
        `http://localhost:4000/api/v1/opd?page=${currentPage}&limit=${limit}`,
        { credentials: 'include' }
      );
      if (!response.ok) throw new Error('Failed to fetch data');
      const data = await response.json();
      console.log(data);
      setSubmittedData(data.data.results);
      setTotalPages(data.totalPages || Math.ceil(data.results / limit));
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const entry = {
      patientId,
      date,
      time,
      doctor,
      price,
      discount,
    };

    if (editMode) {
      try {
        const response = await fetch(
          `http://localhost:4000/api/v1/oct/${patientId}`,
          {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
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
        const response = await fetch('http://localhost:4000/api/v1/opd/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(entry),
          credentials: 'iclude',
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
    setDate('');
    setTime('');
    setDoctor('');
    setPrice(0);
    setDiscount(0);
    setEditMode(false);
    setEditIndex(null);
  };

  const handleEdit = (index) => {
    const recordToEdit = submittedData[index];
    setFieldValues({
      patientId: recordToEdit.patientId || '',
      date: recordToEdit.date || '',
      time: recordToEdit.time || '',
      doctor: recordToEdit.doctor || '',
      price: recordToEdit.price || 0,
      discount: recordToEdit.discount || 0,
    });
    setEditMode(true);
    setEditIndex(index);
    setIsOpen(true);
  };

  const handleRemove = async (index) => {
    try {
      const { _id } = submittedData[index];
      const response = await fetch(`http://localhost:4000/api/v1/opd/${_id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to delete data');

      const updatedData = submittedData.filter((_, i) => i !== index);
      setSubmittedData(updatedData);
    } catch (error) {
      console.error('Error deleting data:', error);
    }
  };

  const fields = [
    { label: 'Patient', type: 'text', name: 'patientId' },
    { label: 'Price', type: 'number', name: 'price' },
    { label: 'Time', type: 'time', name: 'time' },
    { label: 'Date', type: 'date', name: 'date' },
    {
      label: 'Doctor',
      type: 'select',
      options: perDoctors?.map((doctor) => ({
        label: doctor.firstName + ' ' + doctor.lastName, // Combine first and last name
        value: doctor._id, // Use unique doctor ID as value
      })),
      name: 'doctor',
    },
    { label: 'Discount', type: 'number', name: 'discount' },
  ];

  const dataTableFields = [
    { label: 'Percentage', type: 'text', name: 'percentage' },
    { label: 'Total Amount', type: 'number', name: 'totalAmount' },
  ];
  const AllFields = [...fields, ...dataTableFields];

  const fieldValues = {
    patientId,
    date,
    time,
    doctor,
    price,
    discount,
  };

  const setFieldValues = ({
    patientId,
    date,
    time,
    doctor,
    price,
    discount,
  }) => {
    setPatientId(patientId);
    setDate(date);
    setTime(time);
    setDoctor(doctor);
    setPrice(price);
    setDiscount(discount);
  };

  return (
    <div className='p-6 min-h-screen'>
      <h2 className='font-semibold text-xl mb-16'>OPD</h2>
      <div className='flex justify-end mb-[-4.3rem]'>
        {' '}
        <button
          onClick={() => {
            clearForm();
            setIsOpen(true);
          }}
          className='inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 mr-5 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
        >
          <FaPlus className='mr-2' /> Add OPD Record
        </button>
      </div>

      <FormModal
        title={editMode ? 'Edit OCT Record' : 'OPD Record'}
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
        withCredentials={true}
      />
      <DataTable
        submittedData={submittedData}
        fields={AllFields}
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

export default OPD;
