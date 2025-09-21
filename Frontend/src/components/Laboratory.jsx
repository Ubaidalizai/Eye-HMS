import React, { useState, useEffect } from 'react';
import FormModal from "../components/FormModal.jsx";
import MultipleRecordModal from "../components/MultipleRecordModal.jsx";
import DataTable from "../components/DataTable.jsx";
import { FaPlus, FaPrint, FaTimes, FaLayerGroup } from 'react-icons/fa';
import PrintModal from "../components/PrintModal.jsx";
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
  const [selectedRecords, setSelectedRecords] = useState([]);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [isMultipleMode, setIsMultipleMode] = useState(false);
  const [newlyCreatedRecords, setNewlyCreatedRecords] = useState([]);

  useEffect(() => {
    fetchData();
    fetchTypes();
    fetchDoctors();
  }, [currentPage, limit, selectedDate]);

  const fetchData = async () => {
    try {
      let url = `${BASE_URL}/labratory?page=${currentPage}&limit=${limit}&serialToday=true`;

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

  const handleRecordSelection = (record, isSelected) => {
    if (isSelected) {
      setSelectedRecords(prev => [...prev, record]);
    } else {
      setSelectedRecords(prev => prev.filter(r => r._id !== record._id));
    }
  };

  const handleSelectAll = (records, isSelected) => {
    if (isSelected) {
      setSelectedRecords(prev => {
        const newRecords = records.filter(record =>
          !prev.some(selected => selected._id === record._id)
        );
        return [...prev, ...newRecords];
      });
    } else {
      setSelectedRecords(prev =>
        prev.filter(selected =>
          !records.some(record => record._id === selected._id)
        )
      );
    }
  };

  const handlePrintSelected = () => {
    if (selectedRecords.length > 0) {
      setShowPrintModal(true);
    }
  };

  const closePrintModal = () => {
    setShowPrintModal(false);
  };

  const clearSelection = () => {
    setSelectedRecords([]);
  };

  // Calculate correct total for printing (original price - discount, without doctor percentage)
  const calculatePrintTotal = (record) => {
    const originalPrice = record.price || 0;
    const discount = record.discount || 0;
    return originalPrice - discount;
  };

  // Calculate total for all selected records for printing
  const calculateSelectedRecordsPrintTotal = () => {
    return selectedRecords.reduce((sum, record) => sum + calculatePrintTotal(record), 0);
  };

  // Handle multiple type selection
  const handleTypeSelection = (typeId, isSelected) => {
    if (isSelected) {
      setSelectedTypes(prev => [...prev, typeId]);
    } else {
      setSelectedTypes(prev => prev.filter(id => id !== typeId));
    }
  };

  // Calculate total amount for selected types
  const calculateTotalAmount = () => {
    return selectedTypes.reduce((total, typeId) => {
      const type = typesData.find(t => t._id === typeId);
      return total + (type?.price || 0);
    }, 0);
  };

  // Submit multiple records
  const handleMultipleSubmit = async () => {
    if (selectedTypes.length === 0) {
      alert('Please select at least one type');
      return;
    }

    if (!patientId || !date || !time || !doctor) {
      alert('Please fill all required fields');
      return;
    }

    // Show confirmation with discount distribution info
    const totalAmount = calculateTotalAmount();
    const discountAmount = parseFloat(discount) || 0;

    if (discountAmount > 0) {
      const confirmMessage = `You are creating ${selectedTypes.length} records with a total amount of ${totalAmount}.\n\nThe discount of ${discountAmount} will be distributed proportionally across all records.\n\nDo you want to continue?`;
      if (!window.confirm(confirmMessage)) {
        return;
      }
    }

    try {
      // Prepare records array for the new backend endpoint
      const records = selectedTypes.map(typeId => ({
        patientId,
        type: typeId,
        date,
        time,
        doctor,
        discount: discount || 0
      }));

      // Call the new multiple records endpoint
      const response = await fetch(`${BASE_URL}/labratory/multiple`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ records }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch (e) {
          errorData = { message: errorText };
        }
        throw new Error(errorData.message || `HTTP ${response.status}: Failed to create multiple records`);
      }

      const result = await response.json();
      const createdRecords = result.data;

      if (createdRecords && createdRecords.length > 0) {
        // Close modal first
        setIsOpen(false);
        clearForm();

        // Refresh data
        await fetchData();

        // Then set the records and show print modal
        setNewlyCreatedRecords(createdRecords);
        setShowPrintModal(true);
      } else {
        throw new Error('No records returned from backend');
      }

    } catch (error) {
      console.error('Error creating multiple records:', error);
      alert(`Error creating records: ${error.message}`);
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
    setDoctor('');
    setDiscount(0);
    setEditMode(false);
    setEditIndex(null);
    setSelectedTypes([]);
    setIsMultipleMode(false);
    setNewlyCreatedRecords([]);
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

      <div className='flex flex-col sm:flex-row justify-end items-stretch sm:items-center mb-4 gap-2 sm:gap-3'>
        <button
          onClick={() => {
            clearForm();
            setIsMultipleMode(true);
            setIsOpen(true);
          }}
          className='inline-flex items-center justify-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 whitespace-nowrap'
        >
          <FaLayerGroup className='mr-2 flex-shrink-0' />
          <span className='hidden sm:inline'>Add Multiple Records</span>
          <span className='sm:hidden'>Multiple</span>
        </button>
        <button
          onClick={() => {
            clearForm();
            setIsOpen(true);
          }}
          className='inline-flex items-center justify-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 whitespace-nowrap'
        >
          <FaPlus className='mr-2 flex-shrink-0' />
          <span className='hidden sm:inline'>Add Single Record</span>
          <span className='sm:hidden'>Single</span>
        </button>
      </div>

      {!isMultipleMode ? (
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
      ) : (
        <MultipleRecordModal
          isOpen={isOpen}
          onClose={handleCancel}
          fields={fields}
          fieldValues={fieldValues}
          setFieldValues={setFieldValues}
          typesData={typesData}
          selectedTypes={selectedTypes}
          onTypeSelection={handleTypeSelection}
          onSubmit={handleMultipleSubmit}
          title="Add Multiple Laboratory Records"
        />
      )}

      {/* Search and date filter */}
      <div className='mt-6 mb-5 flex flex-col sm:flex-row gap-4'>
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

      {/* Selection Actions */}
      {selectedRecords.length > 0 && (
        <div className='mb-4 flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200'>
          <span className='text-sm text-gray-700 font-medium'>
            {selectedRecords.length} record{selectedRecords.length !== 1 ? 's' : ''} selected
          </span>
          <button
            onClick={handlePrintSelected}
            className='inline-flex items-center px-3 py-2 text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500'
          >
            <FaPrint className='mr-2' /> Print Selected
          </button>
          <button
            onClick={clearSelection}
            className='inline-flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-600 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500'
          >
            <FaTimes className='mr-2' /> Clear Selection
          </button>
        </div>
      )}

      <DataTable
        title={'Laboratory'}
        submittedData={submittedData}
        fields={AllFields}
        handleEdit={handleEdit}
        handleRemove={handleRemove}
        selectedRecords={selectedRecords}
        onRecordSelection={handleRecordSelection}
        onSelectAll={handleSelectAll}
        showCheckboxes={true}
        calculatePrintTotal={calculatePrintTotal}
      />
      <Pagination
        totalItems={submittedData.length}
        totalPagesCount={totalPages}
        itemsPerPage={limit}
        currentPage={currentPage}
        onPageChange={(page) => setCurrentPage(page)}
        onLimitChange={(limit) => setLimit(limit)}
      />


      {/* Print Modal for Selected Records */}
      {showPrintModal && selectedRecords.length > 0 && (
        <PrintModal
          title="Laboratory Records"
          selectedRecord={{
            records: selectedRecords,
            totalAmount: calculateSelectedRecordsPrintTotal(),
            patientName: selectedRecords[0]?.patientId?.name || 'Multiple Patients',
            recordCount: selectedRecords.length
          }}
          fields={AllFields}
          onClose={closePrintModal}
          isMultipleRecords={true}
          calculatePrintTotal={calculatePrintTotal}
        />
      )}

      {/* Print Modal for Newly Created Records */}
      {showPrintModal && newlyCreatedRecords.length > 0 && selectedRecords.length === 0 && (
        <PrintModal
          title="Laboratory Records"
          selectedRecord={{
            records: newlyCreatedRecords,
            totalAmount: newlyCreatedRecords.reduce((sum, record) => sum + calculatePrintTotal(record), 0),
            patientName: newlyCreatedRecords[0]?.patientId?.name || 'Patient',
            recordCount: newlyCreatedRecords.length
          }}
          fields={AllFields}
          onClose={() => {
            setShowPrintModal(false);
            setNewlyCreatedRecords([]);
          }}
          isMultipleRecords={true}
          calculatePrintTotal={calculatePrintTotal}
        />
      )}

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
