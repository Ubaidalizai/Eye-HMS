'use client';

import { useState, useEffect } from 'react';
import { FaTrash, FaEdit } from 'react-icons/fa';
import { BASE_URL } from '../config';
import { useAuth } from '../AuthContext';

// Custom Button Component
const Button = ({ children, onClick, className, disabled }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`inline-flex items-center px-5 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none mr-6 focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${className}`}
  >
    {children}
  </button>
);

//Custom Modal/Dialog Component
const Modal = ({ open, onClose, children }) => {
  if (!open) return null;
  return (
    <div className='fixed inset-0 flex items-center justify-center bg-black bg-opacity-50'>
      <div className='bg-white p-6 rounded shadow-md'>
        {children}
        <button
          onClick={onClose}
          className='mt-4 bg-red-500 text-white px-3 py-1 rounded '
        >
          Close
        </button>
      </div>
    </div>
  );
};

//Custom Table Component
const Table = ({ headers, data, onDelete, onEdit }) => (
  <table className='min-w-full border-collapse border border-gray-300 mt-4 text-center'>
    <thead className='bg-gray-100 text-gray-600'>
      <tr>
        {headers?.map((header) => (
          <th key={header} className='border px-4 py-2'>
            {header}
          </th>
        ))}
      </tr>
    </thead>
    <tbody>
      {data?.map((row, index) => (
        <tr key={index} className='border-t'>
          <td className='border px-4 py-2'>
            <img
              src={`http://localhost:4000/public/img/users/${row?.image}`}
              alt='doctor'
              className='w-12 h-12 rounded-full object-cover'
            />
          </td>
          <td className='border px-4 py-2'>{row?.doctorName}</td>
          <td className='border px-4 py-2'>{row?.branch}</td>
          <td className='border px-4 py-2'>{row?.percentage}%</td>
          <td className='border px-4 py-2'>{row?.price}</td>
          <td className='border px-4 py-2'>
            <button
              onClick={() => onEdit(row)}
              className='text-blue-500 px-2 py-1 rounded'
            >
              <FaEdit />
            </button>
            <button
              onClick={() => onDelete(row?.id)}
              className='text-red-500 px-2 py-1 rounded'
            >
              <FaTrash />
            </button>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
);

const DoctorBranchAssignment = () => {
  const [assignments, setAssignments] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('');
  const [percentage, setPercentage] = useState(0);
  const [price, setPrice] = useState(0);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState(null);
  const [category, setCategory] = useState('');
  const [error, setError] = useState('');
  const [isAssignButtonDisabled, setIsAssignButtonDisabled] = useState(false);

  const { perDoctors } = useAuth();

  useEffect(() => {
    fetchAssignments();
  }, [category]);

  const fetchAssignments = async () => {
    const response = await fetch(
      `${BASE_URL}/doctor-branch?doctorId=${category}`,
      {
        method: 'GET',
        credentials: 'include',
      }
    );
    const data = await response.json();
    setAssignments(data.data);
  };

  const handleAssign = async () => {
    setIsAssignButtonDisabled(true);
    try {
      const response = await fetch(`${BASE_URL}/doctor-branch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          doctorId: selectedDoctor,
          branchModel: selectedBranch,
          percentage,
          price,
        }),
      });

      if (!response.ok) {
        let errorMessage = 'Failed to assign doctor to branch';
        try {
          const errorResponse = await response.json();
          errorMessage = errorResponse.message || errorMessage;
        } catch {
          errorMessage = await response.text();
        }
        throw new Error(errorMessage);
      }

      fetchAssignments();
      setShowAssignModal(false);
      resetForm();
    } catch (error) {
      console.error('Error assigning doctor:', error.message);
      setError(error.message);
    } finally {
      setIsAssignButtonDisabled(false);
    }
  };

  const handleEdit = (assignment) => {
    setEditingAssignment(assignment.id);
    setPercentage(assignment.percentage);
    setPrice(assignment.price);
    setShowEditModal(true);
  };

  const handleUpdate = async () => {
    try {
      const response = await fetch(
        `${BASE_URL}/doctor-branch/${editingAssignment}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            percentage,
            price,
          }),
        }
      );

      if (!response.ok) {
        let errorMessage = 'Failed to update doctor assignment';
        try {
          const errorResponse = await response.json();
          errorMessage = errorResponse.message || errorMessage;
        } catch {
          errorMessage = await response.text();
        }
        throw new Error(errorMessage);
      }

      fetchAssignments();
      setShowEditModal(false);
      resetForm();
    } catch (err) {
      console.error('Error assigning doctor:', err);
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this assignment?'))
      return;
    await fetch(`${BASE_URL}/doctor-branch/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    fetchAssignments();
  };

  const resetForm = () => {
    setSelectedDoctor('');
    setSelectedBranch('opdModule');
    setPercentage(0);
    setPrice(0);
    setEditingAssignment(null);
    setError(''); // Clear error message after reset
  };

  return (
    <div className='border pt-5 rounded-lg mt-20 mb-20'>
      <h2 className='text-2xl text-gray-600 font-semibold ml-3 mb-10'>
        Assigned Doctors List
      </h2>
      <div className='flex flex-row items-center justify-end gap-3'>
        <label htmlFor='category' className='sr-only'>
          Category
        </label>
        <div>
          <select
            id='category'
            name='category'
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className='block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md'
          >
            <option value=''>All Doctors</option>
            {perDoctors?.map((doctor) => (
              <option key={doctor._id} value={doctor?._id}>
                {doctor?.firstName} {doctor?.lastName}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Button onClick={() => setShowAssignModal(true)}>
            + Assign Doctor
          </Button>
        </div>
      </div>

      <Table
        headers={[
          'Profile',
          'Doctor',
          'Branch',
          'Percentage',
          'Price',
          'Actions',
        ]}
        data={assignments?.map((ass) => ({
          image: ass.image,
          id: ass._id,
          doctorId: ass.doctorId,
          doctorName: `${ass.doctorName}`,
          branch: ass.branch,
          percentage: ass.percentage,
          price: ass.price,
        }))}
        onDelete={handleDelete}
        onEdit={handleEdit}
      />

      {/* Assign Doctor Modal */}
      <Modal
        open={showAssignModal}
        onClose={() => {
          setShowAssignModal(false);
          resetForm();
        }}
      >
        <h3 className='text-lg font-bold text-center'>
          Assign Doctor to Branch
        </h3>
        <label className='block mt-2'>Doctor</label>
        <select
          className='border px-3 py-1 rounded w-full'
          value={selectedDoctor}
          onChange={(e) => setSelectedDoctor(e.target.value)}
        >
          <option value=''>Select Doctor</option>
          {perDoctors.map((doctor) => (
            <option key={doctor._id} value={doctor._id}>
              {doctor.firstName} {doctor.lastName}
            </option>
          ))}
        </select>
        <label className='block mt-2'>Branch</label>
        <select
          className='border px-3 py-1 rounded w-full'
          value={selectedBranch}
          onChange={(e) => setSelectedBranch(e.target.value)}
        >
          <option value=''>Select Branch</option>
          <option value='operationModule'>Operation</option>
          <option value='opdModule'>OPD</option>
          <option value='octModule'>OCT</option>
          <option value='ultraSoundModule'>Biscayne</option>
          <option value='yeglizerModel'>Yeglizer</option>
          <option value='labratoryModule'>Laboratory</option>
          <option value='bedroomModule'>Bedroom</option>
        </select>
        <label className='block mt-2'>Percentage %</label>
        <input
          type='number'
          className='border px-3 py-1 rounded w-full'
          value={percentage}
          min={0}
          max={100}
          onChange={(e) => setPercentage(e.target.value)}
        />
        <label className='block mt-2'>Price</label>
        <input
          type='number'
          className='border px-3 py-1 rounded w-full'
          value={price}
          min={0}
          onChange={(e) => setPrice(e.target.value)}
        />
        {error && <p className='text-red-600'>{error}</p>}
        <Button
          onClick={handleAssign}
          className='mt-4 w-full'
          disabled={isAssignButtonDisabled}
        >
          {isAssignButtonDisabled ? 'Assigning...' : 'Assign'}
        </Button>
      </Modal>

      {/* Edit Assignment Modal */}
      <Modal
        open={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          resetForm();
        }}
      >
        <h3 className='text-lg font-bold text-center'>Edit Assignment</h3>
        <label className='block mt-2'>Percentage %</label>
        <input
          type='number'
          className='border px-3 py-1 rounded w-full'
          value={percentage}
          min={0}
          max={100}
          onChange={(e) => setPercentage(e.target.value)}
        />
        <label className='block mt-2'>Price</label>
        <input
          type='number'
          className='border px-3 py-1 rounded w-full'
          value={price}
          min={0}
          onChange={(e) => setPrice(e.target.value)}
        />
        {error && <p className='text-red-600'>{error}</p>}
        <Button onClick={handleUpdate} className='mt-4 w-full'>
          Update
        </Button>
      </Modal>
    </div>
  );
};

export default DoctorBranchAssignment;
