import React, { useState, useEffect } from 'react';
import FormModal from "../components/FormModal.jsx";
import DataTable from "../components/DataTable.jsx";
import { FaPlus } from 'react-icons/fa';
import Pagination from "./Pagination.jsx";
import { useAuth } from "../AuthContext.jsx";
import { BASE_URL } from '../config';
import IncomeChart from './IncomeChart.jsx';

function Laboratory() {
  const [patientId, setPatientId] = useState('');
  const [typesData, setTypesData] = useState([]);
  const [type, setType] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [discount, setDiscount] = useState('');
  const [doctor, setDoctor] = useState('');
  const [labDoctors, setLabDoctors] = useState([]);
  const [submittedData, setSubmittedData] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedDate, setSelectedDate] = useState('');

  useEffect(() => {
    fetchData();
    fetchTypes();
    fetchDoctors();
  }, [currentPage, limit, selectedDate]);

  const fetchData = async () => {
    try {
      let url = `${BASE_URL}/labratory?page=${currentPage}&limit=${limit}`;

      // Add date filter if selected
      if (selectedDate) {
        url += `&searchTerm=${selectedDate}&fieldName=date`;
      }

      const response = await fetch(url, { credentials: 'include' });
      if (!response.ok) throw new Error('Failed to fetch data');
      const data = await response.json();
      setSubmittedData(data.data.results);
      setTotalPages(data.totalPages || Math.ceil(data.results / limit));
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const fetchTypes = async () => {
      try {
        const response = await fetch(
          `${BASE_URL}/operation-types?type=laboratory&all=true`,
          {
            method: 'GET',
            credentials: 'include',
          }
        );
        if (!response.ok) throw new Error('Failed to fetch data');
        const data = await response.json();
        setTypesData(data.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

  const fetchDoctors = async () => {
    try {
      const response = await fetch(`${BASE_URL}/labratory/labratory-doctors`, {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to fetch data');
      const data = await response.json();
      setLabDoctors(data.data);
    } catch (error) {
      console.error('Error fetching lab doctors:', error);
    }
  };

  const handleSearchChange = async (patientId) => {
    if (!patientId.trim()) {
      // If search term is empty, fetch all data
      fetchData();
      return;
    }

    try {
      const res = await fetch(`${BASE_URL}/labratory/search/${patientId}`, {
        method: 'GET',
        credentials: 'include',
      });

      if (!res.ok) {
        throw new Error('Failed to fetch search results');
      }

      const result = await res.json();
      setSubmittedData(result?.data?.records || []);
      setTotalPages(result.data.totalPages || Math.ceil(result.data.results / limit));
    } catch (error) {
      console.error('Error fetching search results:', error);
    }
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
    setCurrentPage(1); // Reset to first page when date changes
  };

  const handleCancel = () => {
    clearForm();
    setIsOpen(false);
  };

  const clearForm = () => {
    setPatientId('');
    setDate('');
    setTime('');
    setType('');
    setDoctor('');
    setDiscount(0);
    setEditMode(false);
    setEditIndex(null);
  };

  const handleEdit = (index) => {
    const recordToEdit = submittedData[index];
    setFieldValues({
      patientId: recordToEdit.patientId || '',
      type: recordToEdit.type || '',
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
      const response = await fetch(`${BASE_URL}/labratory/${_id}`, {
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
    {
      label: 'Type',
      type: 'select',
      options: Array.isArray(typesData)
        ? typesData.map((opType) => ({
            label: opType.name,
            value: opType._id,
          }))
        : [],
      name: 'type',
    },
    { label: 'Time', type: 'time', name: 'time' },
    { label: 'Date', type: 'date', name: 'date' },
    {
      label: 'Doctor',
      type: 'select',
      options: Array.isArray(labDoctors)
        ? labDoctors.map((doctor) => ({
            label: `${doctor.doctorName}`,
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
    type,
    date,
    time,
    doctor,
    discount,
  };

  const setFieldValues = ({ patientId, type, date, time, doctor, discount }) => {
    setPatientId(patientId);
    setType(type);
    setDate(date);
    setTime(time);
    setDoctor(doctor);
    setDiscount(discount);
  };

  return (
    <div className='p-6 min-h-screen'>
      <h2 className='font-semibold text-xl mb-6'>Laboratory</h2>

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
            ? `${BASE_URL}/labratory/${patientId}`
            : `${BASE_URL}/labratory/`
        }
        method={editMode ? 'PATCH' : 'POST'}
        withCredentials={true}
        fetchData={fetchData}
      />

      {/* Search and date filter */}
      <div className='mt-8 mb-5 flex flex-col sm:flex-row gap-4'>
        <input
          type='text'
          placeholder='Search by Patient ID...'
          onChange={(e) => handleSearchChange(e.target.value)}
          className='border border-gray-300 rounded w-full sm:w-64 focus:outline-none focus:ring-1 focus:ring-blue-500 h-9 px-3'
        />
        <div className='flex flex-col sm:flex-row items-start sm:items-center gap-2'>
          <label className='text-sm font-medium text-gray-700 whitespace-nowrap'>
            Filter by Date:
          </label>
          <input
            type='date'
            value={selectedDate}
            onChange={(e) => handleDateChange(e.target.value)}
            className='border border-gray-300 rounded w-full sm:w-auto focus:outline-none focus:ring-1 focus:ring-blue-500 h-9 px-3'
          />
          {selectedDate && (
            <button
              onClick={() => handleDateChange('')}
              className='text-sm text-blue-600 hover:text-blue-800 whitespace-nowrap'
            >
              Clear Date
            </button>
          )}
        </div>
      </div>

      <DataTable
        title={'Laboratory'}
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


      {/* Laboratory Income Chart */}
      <div className='mt-10 mb-8'>
        <IncomeChart
          category="laboratory"
          title="Laboratory Income Analysis"
          showFilters={true}
          className="bg-white rounded-lg shadow-sm"
        />
      </div>
    </div>
  );
}

export default Laboratory;
