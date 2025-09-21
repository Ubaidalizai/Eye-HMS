/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import FormModal from "../components/FormModal.jsx";
import DataTable from "../components/DataTable.jsx";
import { FaPlus } from 'react-icons/fa';
import Pagination from "./Pagination.jsx";
import { BASE_URL } from '../config';
import IncomeChart from './IncomeChart.jsx';

function Perimetry() {
  const [id, setId] = useState('');
  const [patientId, setPatientId] = useState('');
  const [typesData, setTypesData] = useState([]);
  const [perimetryType, setPerimetryType] = useState('');
  const [time, setTime] = useState('');
  const [date, setDate] = useState('');
  const [doctor, setDoctor] = useState('');
  const [perimetryDoctors, setPerimetryDoctors] = useState([]);
  const [discount, setDiscount] = useState(0);
  const [submittedData, setSubmittedData] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedDate, setSelectedDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
    fetchTypes();
    fetchPerimetryDoctors();
  }, [currentPage, limit, selectedDate]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      let url = `${BASE_URL}/perimetry?page=${currentPage}&limit=${limit}&serialToday=true`;

      // Add date filter if selected
      if (selectedDate) {
        url += `&searchTerm=${selectedDate}&fieldName=date`;
      }

      const response = await fetch(url, { credentials: 'include' });
      if (!response.ok) throw new Error('Failed to fetch perimetry data');
      const data = await response.json();

      setSubmittedData(data.data.results || data.data || []);
      setTotalPages(
        data.totalPages ||
          Math.ceil((data.results || data.data?.length || 0) / limit)
      );
    } catch (error) {
      console.error('Error fetching perimetry data:', error);
      setError('Failed to load perimetry data. Please try again.');
      setSubmittedData([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchTypes = async () => {
    try {
      const response = await fetch(
        `${BASE_URL}/operation-types?type=perimetry&all=true`,
        {
          method: 'GET',
          credentials: 'include',
        }
      );
      if (!response.ok) throw new Error('Failed to fetch perimetry types');
      const data = await response.json();
      setTypesData(data.data || []);
    } catch (error) {
      console.error('Error fetching perimetry types:', error);
      setTypesData([]);
    }
  };

  const fetchPerimetryDoctors = async () => {
    try {
      const response = await fetch(`${BASE_URL}/perimetry/perimetry-doctors`, {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to fetch perimetry doctors');
      const data = await response.json();

      setPerimetryDoctors(data.data || []);
    } catch (error) {
      console.error('Error fetching perimetry doctors:', error);
      setPerimetryDoctors([]);
    }
  };

  const handleSearchChange = async (patientId) => {
    if (!patientId.trim()) {
      // If search term is empty, fetch all data
      fetchData();
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`${BASE_URL}/perimetry/search/${patientId}`, {
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
      setError('Search failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
    setCurrentPage(1); // Reset to first page when date changes
  };

  // Calculate correct total for printing (original price - discount, without doctor percentage)
  const calculatePrintTotal = (record) => {
    const originalPrice = record.price || 0;
    const discount = record.discount || 0;
    return originalPrice - discount;
  };

  const handleCancel = () => {
    clearForm();
    setIsOpen(false);
  };

  const clearForm = () => {
    setPatientId('');
    setPerimetryType('');
    setTime('');
    setDate('');
    setDoctor('');
    setDiscount(0);
    setEditMode(false);
    setEditIndex(null);
    setError(null);
  };

  const handleEdit = (index) => {
    const recordToEdit = submittedData[index];
    setId(recordToEdit._id || '');
    setFieldValues({
      patientId: recordToEdit.patientId || '',
      perimetryType: recordToEdit.perimetryType || recordToEdit.type || '',
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
    if (
      !window.confirm('Are you sure you want to delete this perimetry record?')
    )
      return;
    try {
      setLoading(true);
      const { _id } = submittedData[index];
      const response = await fetch(`${BASE_URL}/perimetry/${_id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to delete perimetry record');

      const updatedData = submittedData.filter((_, i) => i !== index);
      setSubmittedData(updatedData);
    } catch (error) {
      console.error('Error deleting perimetry record:', error);
      setError('Failed to delete record. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { label: 'Patient', type: 'text', name: 'patientId' },
    {
      label: 'Type',
      type: 'select',
      options: Array.isArray(typesData)
        ? typesData.map((perType) => ({
            label: perType.name,
            value: perType._id,
          }))
        : [],
      name: 'perimetryType',
    },
    { label: 'Time', type: 'time', name: 'time' },
    { label: 'Date', type: 'date', name: 'date' },
    {
      label: 'Doctor',
      type: 'select',
      options: Array.isArray(perimetryDoctors)
        ? perimetryDoctors.map((doctor) => ({
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
    { label: 'Dr. Percentage', type: 'text', name: 'percentage' },
    { label: 'Total Amount', type: 'number', name: 'totalAmount' },
  ];
  const AllFields = [...fields, ...dataTableFields];

  const fieldValues = {
    patientId,
    perimetryType,
    time,
    date,
    doctor,
    discount,
  };

  const setFieldValues = ({
    patientId,
    perimetryType,
    time,
    date,
    doctor,
    discount,
  }) => {
    setPatientId(patientId);
    setPerimetryType(perimetryType || '');
    setTime(time);
    setDate(date);
    setDoctor(doctor);
    setDiscount(discount);
  };

  return (
    <div className='p-4 sm:p-6 min-h-screen w-full'>
      {/* Responsive header with title and add button */}
      <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6'>
        <h2 className='font-semibold text-xl mb-4 sm:mb-0'>Perimetry</h2>
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

      {/* Error message */}
      {error && (
        <div className='mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded'>
          {error}
        </div>
      )}

      <FormModal
        title={editMode ? 'Edit Perimetry Record' : 'Perimetry Record'}
        isOpen={isOpen}
        handleCancel={handleCancel}
        fields={fields}
        fieldValues={fieldValues}
        setFieldValues={setFieldValues}
        url={
          editMode ? `${BASE_URL}/perimetry/${id}` : `${BASE_URL}/perimetry/`
        }
        method={editMode ? 'PATCH' : 'POST'}
        withCredentials={true}
        fetchData={fetchData}
      />

      {/* Responsive search and date filter */}
      <div className='mb-4 flex flex-col sm:flex-row gap-4'>
        <input
          type='text'
          placeholder='Search by Patient ID...'
          onChange={(e) => handleSearchChange(e.target.value)}
          className='border border-gray-300 rounded w-full sm:w-64 focus:outline-none focus:ring-1 focus:ring-blue-500 h-10 px-3'
        />
        <div className='flex flex-col sm:flex-row items-start sm:items-center gap-2'>
          <label className='text-sm font-medium text-gray-700 whitespace-nowrap'>
            Filter by Date:
          </label>
          <input
            type='date'
            value={selectedDate}
            onChange={(e) => handleDateChange(e.target.value)}
            className='border border-gray-300 rounded w-full sm:w-auto focus:outline-none focus:ring-1 focus:ring-blue-500 h-10 px-3'
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

      {/* Loading indicator */}
      {loading && (
        <div className='flex justify-center items-center py-8'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600'></div>
          <span className='ml-2 text-gray-600'>Loading...</span>
        </div>
      )}

      {/* DataTable with horizontal scrolling */}
      <div className='overflow-x-auto'>
        <DataTable
          title={'Perimetry'}
          submittedData={submittedData}
          fields={AllFields}
          handleEdit={handleEdit}
          handleRemove={handleRemove}
          calculatePrintTotal={calculatePrintTotal}
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

      {/* Perimetry Income Chart */}
      <div className='mt-10 mb-8'>
        <IncomeChart
          category="perimetry"
          title="Perimetry Service Income Analysis"
          showFilters={true}
          className="bg-white rounded-lg shadow-sm"
        />
      </div>
    </div>
  );
}

export default Perimetry;
