import React, { useState, useEffect } from 'react';
import FormModal from '../components/FormModal';
import DataTable from '../components/DataTable';
import { FaPlus } from 'react-icons/fa';
import Pagination from './Pagination';
import { BASE_URL } from '../config';

function Bedroom() {
  const [patientId, setPatientId] = useState('');
  const [time, setTime] = useState('');
  const [date, setDate] = useState('');
  const [doctor, setDoctor] = useState('');
  const [bedroomDoctors, setBedroomDoctors] = useState('');
  const [discount, setDiscount] = useState(0);
  const [submittedData, setSubmittedData] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchData();
    fetchBedroomDoctors();
  }, [currentPage, limit]);

  const fetchData = async () => {
    try {
      const response = await fetch(
        `${BASE_URL}/bedroom?page=${currentPage}&limit=${limit}`,
        {
          credentials: 'include',
        }
      );
      if (!response.ok) throw new Error('Failed to fetch data');
      const data = await response.json();
      setSubmittedData(data.data.results);
      setTotalPages(data.totalPages || Math.ceil(data.results / limit));
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const fetchBedroomDoctors = async () => {
    try {
      const response = await fetch(`${BASE_URL}/bedroom/bedroom-doctors`, {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to fetch data');
      const data = await response.json();
      setBedroomDoctors(data.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleSearchChange = async (patientId) => {
    if (!patientId.trim()) {
      // If search term is empty, fetch all data
      fetchData();
      return;
    }

    try {
      const res = await fetch(`${BASE_URL}/bedroom/search/${patientId}`, {
        method: 'GET',
        credentials: 'include',
      });

      if (!res.ok) {
        throw new Error('Failed to fetch search results');
      }

      const result = await res.json();
      setSubmittedData(result?.data?.records || []);
    } catch (error) {
      console.error('Error fetching search results:', error);
    }
  };

  const handleCancel = () => {
    clearForm();
    setIsOpen(false);
  };

  const clearForm = () => {
    setPatientId('');
    setTime('');
    setDate('');
    setDoctor('');
    setDiscount(0);
    setEditMode(false);
    setEditIndex(null);
  };

  const handleEdit = (index) => {
    const recordToEdit = submittedData[index];
    setFieldValues({
      patientId: recordToEdit.patientId || '',
      time: recordToEdit.time || '',
      date: recordToEdit.date || '',
      doctor: recordToEdit.doctor || '',
      discount: recordToEdit.discount || 0,
    });
    setEditMode(true);
    setEditIndex(index);
    setIsOpen(true);
  };

  const handleRemove = async (index) => {
    if (!window.confirm('Are you sure you want to delete this record?')) return;
    try {
      const { _id } = submittedData[index];
      const response = await fetch(`${BASE_URL}/bedroom/${_id}`, {
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
    { label: 'Patient ID', type: 'text', name: 'patientId' },
    { label: 'Time', type: 'time', name: 'time' },
    { label: 'Date', type: 'date', name: 'date' },
    {
      label: 'Doctor',
      type: 'select',
      options: Array.isArray(bedroomDoctors)
        ? bedroomDoctors.map((doctor) => ({
            label: `${doctor.doctorName}`,
            value: doctor.doctorId,
          }))
        : [],
      name: 'doctor',
    },
    { label: 'Discount', type: 'number', name: 'discount' },
  ];

  const dataTableFields = [
    { label: 'Rent', type: 'number', name: 'rent' },
    { label: 'Percentage', type: 'number', name: 'percentage' },
    { label: 'Total Amount', type: 'number', name: 'totalAmount' },
  ];
  const AllFields = [...fields, ...dataTableFields];

  const fieldValues = { patientId, time, date, doctor, discount };
  const setFieldValues = ({ patientId, time, date, doctor, discount }) => {
    setPatientId(patientId);
    setTime(time);
    setDate(date);
    setDoctor(doctor);
    setDiscount(discount);
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
          editMode ? `${BASE_URL}/bedroom/${patientId}` : `${BASE_URL}/bedroom/`
        }
        method={editMode ? 'PATCH' : 'POST'}
        fetchData={fetchData}
      />

      <input
        type='text'
        placeholder='Search ...'
        onChange={(e) => handleSearchChange(e.target.value)}
        className='border border-gray-300 mt-8 rounded w-64 focus:outline-none focus:ring-1 focus:ring-blue-500 h-9 mb-5'
      />

      <DataTable
        title={'Bedroom'}
        submittedData={Array.isArray(submittedData) ? submittedData : []}
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

export default Bedroom;
