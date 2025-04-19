import React, { useState, useEffect } from 'react';
import FormModal from '../components/FormModal';
import DataTable from '../components/DataTable';
import { FaPlus } from 'react-icons/fa';
import Pagination from './Pagination';
import { BASE_URL } from '../config';

function OCT() {
  const [patientId, setPatientId] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [octTypes, setOctTypes] = useState('');
  const [type, setType] = useState('');
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
    fetchOctTypes();
  }, [currentPage, limit]);

  const fetchOctTypes = async () => {
    try {
      const response = await fetch(`${BASE_URL}/operation-types?type=oct`, {
        credentials: 'include',
      });
      const data = await response.json();
      console.log(data.data);
      setOctTypes(data.data);
    } catch (error) {
      console.error('Error fetching biscayne types:', error);
    }
  };

  const fetchData = async () => {
    try {
      const response = await fetch(
        `${BASE_URL}/oct?page=${currentPage}&limit=${limit}`,
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

  const handleSearchChange = async (patientId) => {
    if (!patientId.trim()) {
      // If search term is empty, fetch all data
      fetchData();
      return;
    }

    try {
      const res = await fetch(`${BASE_URL}/oct/search/${patientId}`, {
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
    setType('');
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
      type: recordToEdit.type || '',
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
      const response = await fetch(`${BASE_URL}/oct/${_id}`, {
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
      label: 'Type',
      type: 'select',
      options: Array.isArray(octTypes)
        ? octTypes.map((octType) => ({
            label: octType.name,
            value: octType._id,
          }))
        : [],
      name: 'type',
    },
    { label: 'Discount', type: 'number', name: 'discount' },
  ];

  const dataTableFields = [
    { label: 'Price', type: 'number', name: 'price' },
    { label: 'Total Amount', type: 'number', name: 'totalAmount' },
  ];
  const AllFields = [...fields, ...dataTableFields];

  const fieldValues = {
    patientId,
    date,
    time,
    type,
    discount,
  };

  const setFieldValues = ({ patientId, date, time, type, discount }) => {
    setPatientId(patientId);
    setDate(date);
    setTime(time);
    setType(type);
    setDiscount(discount);
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
        url={editMode ? `${BASE_URL}/oct/${patientId}` : `${BASE_URL}/oct/`}
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
        title={'OCT'}
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

export default OCT;
