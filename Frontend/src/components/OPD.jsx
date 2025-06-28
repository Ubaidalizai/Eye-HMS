import React, { useState, useEffect } from 'react';
import FormModal from "../components/FormModal.jsx";
import DataTable from "../components/DataTable.jsx";
import { FaPlus } from 'react-icons/fa';
import Pagination from "./Pagination.jsx";
import { useAuth } from "../AuthContext.jsx";
import { BASE_URL } from '../config';

function OPD() {
  const [patientId, setPatientId] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [doctor, setDoctor] = useState('');
  const [opdDoctors, setOpdDoctors] = useState([]);
  const [discount, setDiscount] = useState(0);
  const [submittedData, setSubmittedData] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  // Fetch data from backend API
  useEffect(() => {
    fetchData();
    fetchOpdDoctors();
  }, [currentPage, limit]);

  const fetchData = async () => {
    try {
      const response = await fetch(
        `${BASE_URL}/opd?page=${currentPage}&limit=${limit}`,
        { credentials: 'include' }
      );
      if (!response.ok) throw new Error('Failed to fetch data');
      const data = await response.json();
      setSubmittedData(data.data.results);
      setTotalPages(data.totalPages || Math.ceil(data.results / limit));
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const fetchOpdDoctors = async () => {
    try {
      const response = await fetch(`${BASE_URL}/opd/opd-doctors`, {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to fetch opd doctors');
      const data = await response.json();
      setOpdDoctors(data.data);
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
      const res = await fetch(`${BASE_URL}/opd/search/${patientId}`, {
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
    setDate('');
    setTime('');
    setDoctor('');
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
      const response = await fetch(`${BASE_URL}/opd/${_id}`, {
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
    { label: 'Time', type: 'time', name: 'time' },
    { label: 'Date', type: 'date', name: 'date' },
    {
      label: 'Doctor',
      type: 'select',
      options: Array.isArray(opdDoctors)
        ? opdDoctors.map((doctor) => ({
            label: doctor.doctorName,
            value: doctor.doctorId,
          }))
        : [],
      name: 'doctor',
    },
    { label: 'Discount', type: 'number', name: 'discount' },
  ];

  const dataTableFields = [
    { label: 'Price', type: 'number', name: 'price' },
    { label: 'Percentage', type: 'text', name: 'percentage' },
    { label: 'Total Amount', type: 'number', name: 'totalAmount' },
  ];
  const AllFields = [...fields, ...dataTableFields];

  const fieldValues = {
    patientId,
    date,
    time,
    doctor,
    discount,
  };

  const setFieldValues = ({ patientId, date, time, doctor, discount }) => {
    setPatientId(patientId);
    setDate(date);
    setTime(time);
    setDoctor(doctor);
    setDiscount(discount);
  };

  return (
    <div className='p-4 sm:p-6 min-h-screen w-full'>
      {/* Responsive header with title and add button */}
      <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6'>
        <h2 className='font-semibold text-xl mb-4 sm:mb-0'>OPD</h2>
        <button
          onClick={() => {
            clearForm();
            setIsOpen(true);
          }}
          className='inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 w-full sm:w-auto'
        >
          <FaPlus className='mr-2' /> Add Record
        </button>
      </div>

      <FormModal
        title={editMode ? 'Edit OPD Record' : 'OPD Record'}
        isOpen={isOpen}
        handleCancel={handleCancel}
        fields={fields}
        fieldValues={fieldValues}
        setFieldValues={setFieldValues}
        url={editMode ? `${BASE_URL}/opd/${patientId}` : `${BASE_URL}/opd/`}
        method={editMode ? 'PATCH' : 'POST'}
        withCredentials={true}
        fetchData={fetchData}
      />

      {/* Responsive search input */}
      <div className='mb-4'>
        <input
          type='text'
          placeholder='Search by Patient ID...'
          onChange={(e) => handleSearchChange(e.target.value)}
          className='border border-gray-300 rounded w-full sm:w-64 focus:outline-none focus:ring-1 focus:ring-blue-500 h-10 px-3'
        />
      </div>

      {/* DataTable with horizontal scrolling */}
      <div className='overflow-x-auto'>
        <DataTable
          title={'OPD'}
          submittedData={submittedData}
          fields={AllFields}
          handleEdit={handleEdit}
          handleRemove={handleRemove}
        />
      </div>

      {/* Responsive pagination */}
      <div className='mt-4'>
        <Pagination
          totalItems={submittedData.length}
          totalPagesCount={totalPages}
          itemsPerPage={limit}
          currentPage={currentPage}
          onPageChange={(page) => setCurrentPage(page)}
          onLimitChange={(limit) => setLimit(limit)}
        />
      </div>
    </div>
  );
}

export default OPD;
