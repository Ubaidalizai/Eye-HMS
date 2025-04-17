import React, { useState, useEffect } from 'react';
import FormModal from '../components/FormModal';
import DataTable from '../components/DataTable';
import { FaPlus } from 'react-icons/fa';
import Pagination from './Pagination';
import { BASE_URL } from '../config';

function Ultrasound() {
  const [fieldValues, setFieldValues] = useState({
    id: '',
    type: '',
    time: '',
    date: '',
    discount: 0,
  });
  const [types, setTypes] = useState([]);
  const [submittedData, setSubmittedData] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchData();
    fetchAtrasoundTypes();
  }, [currentPage, limit]);

  const fetchAtrasoundTypes = async () => {
    try {
      const response = await fetch(
        `${BASE_URL}/operation-types?type=biscayne`,
        {
          credentials: 'include',
        }
      );
      const data = await response.json();
      setTypes(data.data);
    } catch (error) {
      console.error('Error fetching biscayne types:', error);
    }
  };

  const fetchData = async () => {
    const response = await fetch(
      `${BASE_URL}/ultrasound?page=${currentPage}&limit=${limit}`,
      { credentials: 'include' }
    );
    const data = await response.json();

    setSubmittedData(data.data.results);
    setTotalPages(data.totalPages || Math.ceil(data.results / limit));
  };

  const handleCancel = () => {
    setFieldValues({
      id: '',
      type: '',
      time: '',
      date: '',
      discount: 0,
    });
    setIsOpen(false);
    setEditMode(false);
    setEditIndex(null);
  };

  const handleEdit = (index) => {
    const record = submittedData[index];
    setFieldValues({
      id: record.id,
      type: record.type,
      time: record.time,
      date: record.date,
      discount: record.discount,
    });
    setEditMode(true);
    setEditIndex(index);
    setIsOpen(true);
  };

  const handleRemove = async (index) => {
    if (!window.confirm('Are you sure you want to delete this record?')) return;
    const { _id } = submittedData[index];
    await fetch(`${BASE_URL}/ultrasound/${_id}`, {
      method: 'DELETE',
      credentials: 'include', // Added credentials here
    });
    setSubmittedData(submittedData.filter((_, i) => i !== index));
  };

  const handleSearchChange = async (patientId) => {
    if (!patientId.trim()) {
      // If search term is empty, fetch all data
      fetchData();
      return;
    }

    try {
      const res = await fetch(`${BASE_URL}/ultrasound/search/${patientId}`, {
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

  const handleFormSubmit = async () => {
    const formData = new FormData();
    Object.keys(fieldValues).forEach((key) => {
      if (fieldValues[key] !== null) {
        formData.append(key, fieldValues[key]);
      }
    });

    const response = await fetch(
      editMode
        ? `${BASE_URL}/ultrasound/${fieldValues.id}`
        : `${BASE_URL}/ultrasound/`,
      { credentials: 'include' },
      {
        method: editMode ? 'PATCH' : 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      console.error('Failed to save data.');
      return;
    }

    const result = await response.json();

    if (editMode) {
      // Update existing record
      const updatedData = [...submittedData];
      updatedData[editIndex] = result;
      setSubmittedData(updatedData);
    } else {
      // Add new record
      setSubmittedData(result);
      fetchData();
    }

    handleCancel();
  };

  const fields = [
    { label: 'Patient ID', type: 'text', name: 'patientId' },
    { label: 'Time', type: 'time', name: 'time' },
    { label: 'Date', type: 'date', name: 'date' },
    {
      label: 'Type',
      type: 'select',
      options: Array.isArray(types)
        ? types.map((type) => ({
            label: `${type.name}`,
            value: type._id,
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

  return (
    <div className='p-6  min-h-screen'>
      <h2 className='font-semibold text-xl mb-16'>Biscayne</h2>
      <div className='flex justify-end mb-[-4.4rem]'>
        <button
          onClick={() => {
            setFieldValues({
              id: '',
              type: '',
              time: '',
              date: '',
              discount: 0,
            });
            setIsOpen(true);
            setEditMode(false);
            setEditIndex(null);
          }}
          className='inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 mr-5 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
        >
          <FaPlus className='mr-2' /> Add Record
        </button>
      </div>

      <FormModal
        title={editMode ? 'Edit Biscayne Record' : 'Biscayne Record'}
        isOpen={isOpen}
        handleCancel={handleCancel}
        fields={fields} // Exclude image in edit mode
        fieldValues={fieldValues}
        setFieldValues={setFieldValues}
        url={
          editMode
            ? `${BASE_URL}/ultrasound/${fieldValues.id}`
            : `${BASE_URL}/ultrasound/`
        }
        method={editMode ? 'PATCH' : 'POST'}
        onSubmit={handleFormSubmit}
        fetchData={fetchData}
      />
      <input
        type='text'
        placeholder='Search ...'
        onChange={(e) => handleSearchChange(e.target.value)}
        className='border border-gray-300 mt-8 rounded w-64 focus:outline-none focus:ring-1 focus:ring-blue-500 h-9 mb-5'
      />
      <DataTable
        title={'Biscayne'}
        submittedData={submittedData}
        fields={AllFields}
        handleEdit={handleEdit}
        handleRemove={handleRemove}
        setSearchTerm={setSearchTerm}
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

export default Ultrasound;
