'use client';

import { useState, useEffect } from 'react';
import { FaPlus, FaRegEdit, FaTrash } from 'react-icons/fa';
import PersonInfoDropdown from './PersonInfoDropdown';
import { BASE_URL, IMAGE_BASE_URL } from '../config';
import { toast } from 'react-toastify';
import DoctorBranchAssignment from '../components/DoctorAssigenment';
import OperationTypeManagement from '../components/OperationTypeManagement';
import EditUser from '../components/EditUser';
import CategoryManagement from '../components/category-management';

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: '',
    password: '',
    phoneNumber: '',
    image: null,
  });

  const [editingUser, setEditingUser] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${BASE_URL}/user`, {
        credentials: 'include',
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || `Error: ${res.status}`);
      }

      const data = await res.json();
      if (data && data.data && Array.isArray(data.data.results)) {
        setUsers(data.data.results);
      } else {
        throw new Error('Unexpected API response structure');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error(`Failed to fetch users: ${error.message}`); // Use toast
      setUsers([]);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const validateForm = (user, isNewUser = false) => {
    const errors = {};
    if (user.firstName.trim().length < 2)
      errors.firstName = 'First name must be at least 2 characters long';
    if (user.lastName.trim().length < 2)
      errors.lastName = 'Last name must be at least 2 characters long';
    if (!/^\S+@\S+\.\S+$/.test(user.email))
      errors.email = 'Invalid email format';
    if (isNewUser && user.password.length < 6)
      errors.password = 'Password must be at least 6 characters long';
    if (!/^\d{10}$/.test(user.phoneNumber))
      errors.phoneNumber = 'Phone number must be 10 digits';
    if (!user.role) errors.role = 'Please select a role';
    return errors;
  };

  const addUser = async (e) => {
    e.preventDefault();
    setIsButtonDisabled(true);
    const errors = validateForm(newUser, true);
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      setIsButtonDisabled(false);
      return;
    }

    try {
      const formData = new FormData();
      Object.keys(newUser).forEach((key) => {
        formData.append(key, newUser[key]);
      });

      const response = await fetch(`${BASE_URL}/user/register`, {
        credentials: 'include',
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error: ${response.status}`);
      }

      await fetchUsers();
      setNewUser({
        firstName: '',
        lastName: '',
        email: '',
        role: '',
        password: '',
        phoneNumber: '',
        image: null,
      });
      setIsAddModalOpen(false);
      setValidationErrors({});
      toast.success('User added successfully'); // Use toast
    } catch (error) {
      console.error('Error adding user:', error);
      toast.error(`Failed to add user: ${error.message}`); // Use toast
    } finally {
      setIsButtonDisabled(false);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    setNewUser({ ...newUser, image: file });
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setValidationErrors({});
  };

  const handleCloseEditModal = () => {
    setEditingUser(null);
    setValidationErrors({});
  };

  const deleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      const response = await fetch(`${BASE_URL}/user/${id}`, {
        credentials: 'include',
        method: 'DELETE',
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error: ${response.status}`);
      }
      await fetchUsers();
      toast.success('User deleted successfully'); // Use toast
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error(`Failed to delete user: ${error.message}`); // Use toast
    }
  };

  return (
    <div className='container mx-auto px-4 sm:px-6 lg:px-8'>
      <h2 className='font-semibold text-xl md:text-2xl mt-4'>Admin Panel</h2>

      <div className='border pt-5 rounded-lg mt-6 md:mt-10 shadow-sm'>
        <div className='flex justify-between items-center mb-4 px-4 sm:px-6'>
          <h3 className='text-lg font-medium text-gray-700 hidden sm:block'>
            User Management
          </h3>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className='inline-flex items-center px-3 py-2 sm:px-5 sm:py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none mr-2 sm:mr-6 focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors'
          >
            <FaPlus className='mr-2' /> Add User
          </button>
        </div>

        {/* Table with horizontal scrolling for all screen sizes */}
        <div className='overflow-x-auto shadow-sm rounded-lg'>
          <div className='inline-block min-w-full align-middle'>
            <table className='min-w-full divide-y divide-gray-200'>
              <thead className='bg-gray-100'>
                <tr>
                  <th
                    scope='col'
                    className='px-4 sm:px-6 py-3 text-xs font-medium text-gray-700 uppercase tracking-wider text-left'
                  >
                    Profile
                  </th>
                  <th
                    scope='col'
                    className='px-4 sm:px-6 py-3 text-xs font-medium text-gray-700 uppercase tracking-wider text-left'
                  >
                    Name
                  </th>
                  <th
                    scope='col'
                    className='px-4 sm:px-6 py-3 text-xs font-medium text-gray-700 uppercase tracking-wider text-left'
                  >
                    Email
                  </th>
                  <th
                    scope='col'
                    className='px-4 sm:px-6 py-3 text-xs font-medium text-gray-700 uppercase tracking-wider text-left'
                  >
                    Role
                  </th>
                  <th
                    scope='col'
                    className='px-4 sm:px-6 py-3 text-xs font-medium text-gray-700 uppercase tracking-wider text-left'
                  >
                    Phone
                  </th>
                  <th
                    scope='col'
                    className='px-4 sm:px-6 py-3 text-xs font-medium text-gray-700 uppercase tracking-wider text-center'
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className='bg-white divide-y divide-gray-200'>
                {users.map((user) => (
                  <tr
                    key={user?._id}
                    className='hover:bg-gray-50 transition-colors'
                  >
                    <td className='px-4 sm:px-6 py-4 whitespace-nowrap'>
                      <img
                        src={`${IMAGE_BASE_URL}/users/${user?.image}`}
                        alt={`${user?.firstName} ${user?.lastName}`}
                        className='h-10 w-10 rounded-full object-cover'
                      />
                    </td>
                    <td className='px-4 sm:px-6 py-4 whitespace-nowrap font-medium text-gray-900'>
                      {`${user?.firstName} ${user?.lastName}`}
                    </td>
                    <td className='px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                      {user?.email}
                    </td>
                    <td className='px-4 sm:px-6 py-4 whitespace-nowrap text-sm'>
                      {user?.role === 'admin' ? (
                        <span className='inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800'>
                          {user?.role}
                        </span>
                      ) : (
                        <span className='text-gray-500'>{user?.role}</span>
                      )}
                    </td>
                    <td className='px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                      {user?.phoneNumber}
                    </td>
                    <td className='px-4 sm:px-6 py-4 whitespace-nowrap text-center'>
                      <div className='flex justify-center space-x-2'>
                        <button
                          onClick={() => handleEdit(user)}
                          className='text-indigo-600 hover:text-indigo-900 p-1.5 rounded hover:bg-indigo-50 transition-colors'
                          aria-label='Edit user'
                        >
                          <FaRegEdit className='w-5 h-5' />
                        </button>
                        <button
                          onClick={() => deleteUser(user?._id)}
                          className='text-red-600 hover:text-red-700 p-1.5 rounded hover:bg-red-50 transition-colors'
                          aria-label='Delete user'
                        >
                          <FaTrash className='w-4 h-4' />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Responsive indicator - only visible on small screens */}
        <div className='block sm:hidden text-center text-xs text-gray-500 mt-2 px-4'>
          <p>Swipe horizontally to see more data</p>
        </div>
      </div>

      {/* Add User Modal */}
      {isAddModalOpen && (
        <div className='fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center p-4 z-50'>
          <div className='relative p-4 sm:p-5 border w-full max-w-md shadow-lg rounded-md bg-white'>
            <div className='flex justify-between items-center mb-4'>
              <h3 className='text-lg font-medium leading-6 text-gray-900'>
                Add New User
              </h3>
              <button
                type='button'
                onClick={() => {
                  setIsAddModalOpen(false);
                  setValidationErrors({});
                }}
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

            <form onSubmit={addUser}>
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                <div>
                  <label
                    htmlFor='firstName'
                    className='block text-sm font-medium text-gray-700 mb-1'
                  >
                    First Name
                  </label>
                  <input
                    id='firstName'
                    type='text'
                    placeholder='First Name'
                    value={newUser.firstName}
                    onChange={(e) =>
                      setNewUser({ ...newUser, firstName: e.target.value })
                    }
                    className='border p-2 rounded w-full mb-1'
                    required
                    minLength={2}
                  />
                  {validationErrors.firstName && (
                    <p className='text-red-500 text-xs'>
                      {validationErrors.firstName}
                    </p>
                  )}
                </div>
                <div>
                  <label
                    htmlFor='lastName'
                    className='block text-sm font-medium text-gray-700 mb-1'
                  >
                    Last Name
                  </label>
                  <input
                    id='lastName'
                    type='text'
                    placeholder='Last Name'
                    value={newUser.lastName}
                    onChange={(e) =>
                      setNewUser({ ...newUser, lastName: e.target.value })
                    }
                    className='border p-2 rounded w-full mb-1'
                    required
                    minLength={2}
                  />
                  {validationErrors.lastName && (
                    <p className='text-red-500 text-xs'>
                      {validationErrors.lastName}
                    </p>
                  )}
                </div>
                <div>
                  <label
                    htmlFor='phoneNumber'
                    className='block text-sm font-medium text-gray-700 mb-1'
                  >
                    Phone Number
                  </label>
                  <input
                    id='phoneNumber'
                    type='tel'
                    placeholder='Phone Number'
                    value={newUser.phoneNumber}
                    onChange={(e) =>
                      setNewUser({ ...newUser, phoneNumber: e.target.value })
                    }
                    className='border p-2 rounded w-full mb-1'
                    required
                    pattern='\d{10}'
                  />
                  {validationErrors.phoneNumber && (
                    <p className='text-red-500 text-xs'>
                      {validationErrors.phoneNumber}
                    </p>
                  )}
                </div>
                <div>
                  <label
                    htmlFor='email'
                    className='block text-sm font-medium text-gray-700 mb-1'
                  >
                    Email
                  </label>
                  <input
                    id='email'
                    type='email'
                    placeholder='Email'
                    value={newUser.email}
                    onChange={(e) =>
                      setNewUser({ ...newUser, email: e.target.value })
                    }
                    className='border p-2 rounded w-full mb-1'
                    required
                  />
                  {validationErrors.email && (
                    <p className='text-red-500 text-xs'>
                      {validationErrors.email}
                    </p>
                  )}
                </div>
                <div>
                  <label
                    htmlFor='password'
                    className='block text-sm font-medium text-gray-700 mb-1'
                  >
                    Password
                  </label>
                  <input
                    id='password'
                    type='password'
                    placeholder='Password'
                    value={newUser.password}
                    onChange={(e) =>
                      setNewUser({ ...newUser, password: e.target.value })
                    }
                    className='border p-2 rounded w-full mb-1'
                    required
                    minLength={6}
                  />
                  {validationErrors.password && (
                    <p className='text-red-500 text-xs'>
                      {validationErrors.password}
                    </p>
                  )}
                </div>
                <div>
                  <label
                    htmlFor='role'
                    className='block text-sm font-medium text-gray-700 mb-1'
                  >
                    Role
                  </label>
                  <select
                    id='role'
                    value={newUser.role}
                    onChange={(e) =>
                      setNewUser({ ...newUser, role: e.target.value })
                    }
                    className='border p-2 rounded w-full mb-1'
                    required
                  >
                    <option value=''>Select Role</option>
                    <option value='pharmacist'>Pharmacist</option>
                    <option value='admin'>Admin</option>
                    <option value='receptionist'>Receptionist</option>
                    <option value='doctor'>Doctor</option>
                  </select>
                  {validationErrors.role && (
                    <p className='text-red-500 text-xs'>
                      {validationErrors.role}
                    </p>
                  )}
                </div>
                <div className='sm:col-span-2'>
                  <label
                    htmlFor='image'
                    className='block text-sm font-medium text-gray-700 mb-1'
                  >
                    Profile Image
                  </label>
                  <input
                    id='image'
                    type='file'
                    accept='image/*'
                    onChange={handleImageUpload}
                    className='border p-2 rounded w-full mb-1'
                  />
                </div>
              </div>
              <div className='flex items-center justify-end gap-2 mt-5 border-t pt-4'>
                <button
                  type='button'
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setValidationErrors({});
                  }}
                  className='inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors'
                >
                  Cancel
                </button>
                <button
                  type='submit'
                  className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white shadow-sm ${
                    isButtonDisabled
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                  } transition-colors`}
                  disabled={isButtonDisabled}
                >
                  {isButtonDisabled ? 'Adding...' : 'Add User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Component */}
      {editingUser && (
        <EditUser
          user={editingUser}
          onClose={handleCloseEditModal}
          onUserUpdated={fetchUsers}
        />
      )}

      <PersonInfoDropdown />
      <DoctorBranchAssignment />
      <OperationTypeManagement />
      <CategoryManagement />
    </div>
  );
};

export default UserList;
