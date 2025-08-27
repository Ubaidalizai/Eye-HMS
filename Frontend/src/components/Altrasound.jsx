import React, { useState, useEffect } from 'react';
import FormModal from "../components/FormModal.jsx";
import DataTable from "../components/DataTable.jsx";
import { FaPlus } from 'react-icons/fa';
import Pagination from "./Pagination.jsx";
import { BASE_URL } from '../config';
import IncomeChart from './IncomeChart.jsx';

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
  const [selectedDate, setSelectedDate] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchData();
    fetchAtrasoundTypes();
  }, [currentPage, limit, selectedDate]);

  const fetchAtrasoundTypes = async () => {
    try {
      const response = await fetch(
        `${BASE_URL}/operation-types?type=biscayne&all=true`,
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
    try {
      let url = `${BASE_URL}/ultrasound?page=${currentPage}&limit=${limit}`;

      // Add date filter if selected
      if (selectedDate) {
        url += `&searchTerm=${selectedDate}&fieldName=date`;
      }

      const response = await fetch(url, { credentials: 'include' });
      const data = await response.json();

      setSubmittedData(data.data.results);
      setTotalPages(data.totalPages || Math.ceil(data.results / limit));
    } catch (error) {
      console.error('Error fetching data:', error);
    }
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
      setTotalPages(result.data.totalPages || Math.ceil(result.data.results / limit));
    } catch (error) {
      console.error('Error fetching search results:', error);
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
    { label: 'Patient', type: 'text', name: 'patientId' },
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
    <div className='p-4 sm:p-6 min-h-screen w-full'>
      {/* Responsive header with title and add button */}
      <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6'>
        <h2 className='font-semibold text-xl mb-4 sm:mb-0'>Biscayne</h2>
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
          className='inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 w-full sm:w-auto'
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

      {/* DataTable with horizontal scrolling */}
      <div className='overflow-x-auto'>
        <DataTable
          title={'Biscayne'}
          submittedData={submittedData}
          fields={AllFields}
          handleEdit={handleEdit}
          handleRemove={handleRemove}
          setSearchTerm={setSearchTerm}
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


      {/* Ultrasound Income Chart */}
      <div className='mt-10 mb-8'>
        <IncomeChart
          category="ultrasound"
          title="Ultrasound Service Income Analysis"
          showFilters={true}
          className="bg-white rounded-lg shadow-sm"
        />
      </div>
    </div>
  );
}

export default Ultrasound;
