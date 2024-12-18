import React, { useState, useEffect } from 'react';
import FormModal from '../components/FormModal';
import DataTable from '../components/DataTable';
import { FaPlus } from 'react-icons/fa';
import Pagination from './Pagination';

function Ultrasound() {
  const [fieldValues, setFieldValues] = useState({
    id: '',
    name: '',
    time: '',
    date: '',
    percentage: '',
    image: null,
  });

  const [submittedData, setSubmittedData] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch(
        `http://127.0.0.1:4000/api/v1/ultrasound?page=${currentPage}&limit=${limit}`
      );
      const data = await response.json();
      console.log(data);
      setSubmittedData(data.data.results);
      setTotalPages(data.totalPages || Math.ceil(data.results / limit));
    };
    fetchData();
  }, [currentPage, limit]);

  const handleCancel = () => {
    setFieldValues({
      id: '',
      name: '',
      time: '',
      date: '',
      percentage: '',
      image: null,
    });
    setIsOpen(false);
    setEditMode(false);
    setEditIndex(null);
  };

  const handleEdit = (index) => {
    const record = submittedData[index];
    // Exclude `image` from being prefilled
    setFieldValues({
      id: record.id,
      name: record.name,
      time: record.time,
      date: record.date,
      percentage: record.percentage,
      image: null, // File input cannot have a value
    });
    setEditMode(true);
    setEditIndex(index);
    setIsOpen(true);
  };

  const handleRemove = async (index) => {
    const recordId = submittedData[index].id;
    await fetch(`http://127.0.0.1:4000/api/v1/ultrasound/${recordId}`, {
      method: 'DELETE',
    });
    setSubmittedData(submittedData.filter((_, i) => i !== index));
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
        ? `http://127.0.0.1:4000/api/v1/ultrasound/${fieldValues.id}`
        : 'http://127.0.0.1:4000/api/v1/ultrasound/',
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
      setSubmittedData([...submittedData, result]);
    }

    handleCancel();
  };

  const fields = [
    { label: 'ID', type: 'text', name: 'id' },
    { label: 'Name', type: 'text', name: 'name' },
    { label: 'Time', type: 'time', name: 'time' },
    { label: 'Date', type: 'date', name: 'date' },
    { label: 'Percentage', type: 'number', name: 'percentage' },
    { label: 'Image', type: 'file', name: 'image' }, // Handled separately
  ];

  return (
    <div className='p-6  min-h-screen'>
      <h2 className='font-semibold text-xl mb-16'>Ultrasound</h2>
      <div className='flex justify-end mb-[-4.4rem]'>
        <button
          onClick={() => {
            setFieldValues({
              id: '',
              name: '',
              time: '',
              date: '',
              percentage: '',
              image: null,
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
        title={editMode ? 'Edit Ultrasound Record' : 'Ultrasound Record'}
        isOpen={isOpen}
        handleCancel={handleCancel}
        fields={fields.filter((field) => field.name !== 'image' || !editMode)} // Exclude image in edit mode
        fieldValues={fieldValues}
        setFieldValues={setFieldValues}
        url={
          editMode
            ? `http://127.0.0.1:4000/api/v1/ultrasound/${fieldValues.id}`
            : 'http://127.0.0.1:4000/api/v1/ultrasound/'
        }
        method={editMode ? 'PATCH' : 'POST'}
        onSubmit={handleFormSubmit}
      />

      <DataTable
        submittedData={submittedData}
        fields={fields.filter((field) => field.name !== 'image')}
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

export default Ultrasound;
