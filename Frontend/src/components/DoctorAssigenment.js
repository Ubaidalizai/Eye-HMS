import { useState, useEffect, useCallback } from 'react';
import { FaTrash, FaEdit } from 'react-icons/fa';
import { BASE_URL, IMAGE_BASE_URL } from '../config';
import { useAuth } from '../AuthContext';
import Pagination from './Pagination';

// Custom Button Component
const Button = ({ children, onClick, className, disabled }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`inline-flex items-center px-3 py-2 sm:px-5 sm:py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none mr-2 sm:mr-6 focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors ${className}`}
  >
    {children}
  </button>
);

//Custom Modal/Dialog Component
const Modal = ({ open, onClose, children }) => {
  if (!open) return null;
  return (
    <div className='fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 p-4 z-50'>
      <div className='bg-white p-4 sm:p-6 rounded-lg shadow-lg w-full max-w-md'>
        <div className='flex justify-between items-center mb-4'>
          <div className='text-lg font-medium text-gray-900'>
            {children[0]} {/* Assuming first child is the title */}
          </div>
          <button
            onClick={onClose}
            className='text-gray-400 hover:text-gray-500 focus:outline-none'
          >
            <svg
              className='h-6 w-6'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M6 18L18 6M6 6l12 12'
              />
            </svg>
          </button>
        </div>
        <div className='space-y-4'>
          {children.slice(1)} {/* All children except the first one (title) */}
        </div>
      </div>
    </div>
  );
};

//Custom Table Component with horizontal scrolling
const Table = ({ headers, data, onDelete, onEdit }) => (
  <div className='overflow-x-auto shadow-sm rounded-lg'>
    <div className='inline-block min-w-full align-middle'>
      <table className='min-w-full divide-y divide-gray-200 mt-4'>
        <thead className='bg-gray-100'>
          <tr>
            {headers?.map((header) => (
              <th
                key={header}
                className='px-4 sm:px-6 py-3 text-xs font-medium text-gray-700 uppercase tracking-wider text-left'
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className='bg-white divide-y divide-gray-200'>
          {data?.map((row, index) => (
            <tr key={index} className='hover:bg-gray-50 transition-colors'>
              <td className='px-4 sm:px-6 py-4 whitespace-nowrap'>
                <img
                  src={`${IMAGE_BASE_URL}/users/${row?.image}`}
                  alt='doctor'
                  className='w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover'
                />
              </td>
              <td className='px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900'>
                {row?.doctorName}
              </td>
              <td className='px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                {row?.branch}
              </td>
              <td className='px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                {row?.percentage}%
              </td>
              <td className='px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                {row?.price}
              </td>
              <td className='px-4 sm:px-6 py-4 whitespace-nowrap text-center'>
                <div className='flex justify-center space-x-2'>
                  <button
                    onClick={() => onEdit(row)}
                    className='text-blue-500 hover:bg-blue-50 p-1.5 rounded transition-colors'
                    aria-label='Edit assignment'
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => onDelete(row?.id)}
                    className='text-red-500 hover:bg-red-50 p-1.5 rounded transition-colors'
                    aria-label='Delete assignment'
                  >
                    <FaTrash />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
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
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);

  const { perDoctors } = useAuth();

  const fetchAssignments = useCallback(async () => {
    try {
      const response = await fetch(
        `${BASE_URL}/doctor-branch?doctorId=${category}&page=${currentPage}&limit=${limit}`,
        {
          method: 'GET',
          credentials: 'include',
        }
      );
      const data = await response.json();
      setAssignments(data.data);
      setTotalPages(data.totalPages || Math.ceil(data.totalResults / limit));
    } catch (error) {
      console.error('Error fetching assignments:', error);
      setError('Failed to fetch assignments');
    }
  }, [category, currentPage, limit]);

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments, currentPage, limit]);

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
    <div className='border pt-5 rounded-lg mt-10 md:mt-20 mb-10 md:mb-20 shadow-sm'>
      <h2 className='text-xl md:text-2xl text-gray-600 font-semibold px-4 sm:px-6 mb-6 md:mb-10'>
        Assigned Doctors List
      </h2>

      <div className='px-4 sm:px-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4'>
        <div className='w-full sm:w-auto mb-3 sm:mb-0'>
          <label
            htmlFor='category'
            className='block text-sm font-medium text-gray-700 mb-1'
          >
            Filter by Doctor
          </label>
          <select
            id='category'
            name='category'
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className='block w-full pl-3 pr-10 py-2 text-sm border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md'
          >
            <option value=''>All Doctors</option>
            {perDoctors?.map((doctor) => (
              <option key={doctor._id} value={doctor?._id}>
                {doctor?.firstName} {doctor?.lastName}
              </option>
            ))}
          </select>
        </div>
        <Button onClick={() => setShowAssignModal(true)}>
          + Assign Doctor
        </Button>
      </div>

      {/* Table with horizontal scrolling for all screen sizes */}
      <div className='px-4 sm:px-6'>
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

        {/* Responsive indicator - only visible on small screens */}
        <div className='block sm:hidden text-center text-xs text-gray-500 mt-2'>
          <p>Swipe horizontally to see more data</p>
        </div>
      </div>
      {/* Pagination */}
      <div className='mt-4'>
        <Pagination
          totalItems={assignments.length}
          totalPagesCount={totalPages}
          itemsPerPage={limit}
          currentPage={currentPage}
          onPageChange={(page) => setCurrentPage(page)}
          onLimitChange={(limit) => setLimit(limit)}
        />
      </div>

      {/* Assign Doctor Modal */}
      <Modal
        open={showAssignModal}
        onClose={() => {
          setShowAssignModal(false);
          resetForm();
        }}
      >
        <h3 className='text-lg font-bold'>Assign Doctor to Branch</h3>

        <div>
          <label
            htmlFor='doctor'
            className='block text-sm font-medium text-gray-700 mb-1'
          >
            Doctor
          </label>
          <select
            id='doctor'
            className='border px-3 py-2 rounded-md w-full focus:ring-indigo-500 focus:border-indigo-500'
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
        </div>

        <div>
          <label
            htmlFor='branch'
            className='block text-sm font-medium text-gray-700 mb-1'
          >
            Branch
          </label>
          <select
            id='branch'
            className='border px-3 py-2 rounded-md w-full focus:ring-indigo-500 focus:border-indigo-500'
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
          >
            <option value=''>Select Branch</option>
            <option value='operationModule'>Operation</option>
            <option value='opdModule'>OPD</option>
            <option value='yeglizerModel'>Yeglizer</option>
            <option value='laboratoryModule'>Laboratory</option>
            <option value='bedroomModule'>Bedroom</option>
            <option value='perimetryModel'>Perimetry</option>
            <option value='FAModel'>FA</option>
            <option value='PRPModel'>PRP</option>
          </select>
        </div>

        <div>
          <label
            htmlFor='percentage'
            className='block text-sm font-medium text-gray-700 mb-1'
          >
            Percentage %
          </label>
          <input
            id='percentage'
            type='number'
            className='border px-3 py-2 rounded-md w-full focus:ring-indigo-500 focus:border-indigo-500'
            value={percentage}
            min={0}
            max={100}
            onChange={(e) => setPercentage(e.target.value)}
          />
        </div>

        <div>
          <label
            htmlFor='price'
            className='block text-sm font-medium text-gray-700 mb-1'
          >
            Price
          </label>
          <input
            id='price'
            type='number'
            className='border px-3 py-2 rounded-md w-full focus:ring-indigo-500 focus:border-indigo-500'
            value={price}
            min={0}
            onChange={(e) => setPrice(e.target.value)}
          />
        </div>

        {error && <p className='text-red-600 mt-2 text-sm'>{error}</p>}

        <div className='mt-5 flex justify-end space-x-3'>
          <button
            type='button'
            onClick={() => {
              setShowAssignModal(false);
              resetForm();
            }}
            className='px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors'
          >
            Cancel
          </button>
          <button
            onClick={handleAssign}
            disabled={isAssignButtonDisabled}
            className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
              isAssignButtonDisabled
                ? 'bg-indigo-400 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
            } transition-colors`}
          >
            {isAssignButtonDisabled ? 'Assigning...' : 'Assign'}
          </button>
        </div>
      </Modal>

      {/* Edit Assignment Modal */}
      <Modal
        open={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          resetForm();
        }}
      >
        <h3 className='text-lg font-bold'>Edit Assignment</h3>

        <div>
          <label
            htmlFor='edit-percentage'
            className='block text-sm font-medium text-gray-700 mb-1'
          >
            Percentage %
          </label>
          <input
            id='edit-percentage'
            type='number'
            className='border px-3 py-2 rounded-md w-full focus:ring-indigo-500 focus:border-indigo-500'
            value={percentage}
            min={0}
            max={100}
            onChange={(e) => setPercentage(e.target.value)}
          />
        </div>

        <div>
          <label
            htmlFor='edit-price'
            className='block text-sm font-medium text-gray-700 mb-1'
          >
            Price
          </label>
          <input
            id='edit-price'
            type='number'
            className='border px-3 py-2 rounded-md w-full focus:ring-indigo-500 focus:border-indigo-500'
            value={price}
            min={0}
            onChange={(e) => setPrice(e.target.value)}
          />
        </div>

        {error && <p className='text-red-600 mt-2 text-sm'>{error}</p>}

        <div className='mt-5 flex justify-end space-x-3'>
          <button
            type='button'
            onClick={() => {
              setShowEditModal(false);
              resetForm();
            }}
            className='px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors'
          >
            Cancel
          </button>
          <button
            onClick={handleUpdate}
            className='px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors'
          >
            Update
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default DoctorBranchAssignment;
