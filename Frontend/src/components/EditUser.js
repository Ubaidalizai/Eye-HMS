'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { BASE_URL } from '../config';

const EditUser = ({ user, onClose, onUserUpdated }) => {
  const [editingUser, setEditingUser] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: '',
    phoneNumber: '',
    image: null,
    percentage: '',
  });
  const [previewImage, setPreviewImage] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      setEditingUser({
        ...user,
        image: null, // Reset image since we'll handle it separately
      });
      // Set preview image if user has an existing image
      if (user.image) {
        setPreviewImage(`${BASE_URL}/public/img/users/${user.image}`);
      }
    }
  }, [user]);

  const validateForm = (userData) => {
    const errors = {};
    if (userData.firstName.trim().length < 2)
      errors.firstName = 'First name must be at least 2 characters long';
    if (userData.lastName.trim().length < 2)
      errors.lastName = 'Last name must be at least 2 characters long';
    if (!/^\S+@\S+\.\S+$/.test(userData.email))
      errors.email = 'Invalid email format';
    if (!/^\d{10}$/.test(userData.phoneNumber))
      errors.phoneNumber = 'Phone number must be 10 digits';
    if (!userData.role) errors.role = 'Please select a role';
    return errors;
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEditingUser({ ...editingUser, image: file });
      // Create a preview URL for the selected image
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditingUser({ ...editingUser, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errors = validateForm(editingUser);
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    setIsSubmitting(true);

    try {
      // Use FormData to handle file uploads
      const formData = new FormData();

      // Add all user fields except password to formData
      Object.keys(editingUser).forEach((key) => {
        if (
          key !== 'password' &&
          key !== 'image' &&
          editingUser[key] !== null
        ) {
          formData.append(key, editingUser[key]);
        }
      });

      // Only append image if a new one was selected
      if (editingUser.image) {
        formData.append('image', editingUser.image);
      }

      const response = await fetch(`${BASE_URL}/user/${editingUser._id}`, {
        method: 'PATCH',
        credentials: 'include',
        body: formData,
        // Don't set Content-Type header when using FormData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error: ${response.status}`);
      }

      toast.success('User updated successfully');
      onUserUpdated(); // Refresh user list
      onClose(); // Close the modal
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error(`Failed to update user: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className='fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50'>
      <div className='relative p-5 border w-full max-w-md shadow-lg rounded-md bg-white'>
        <h3 className='text-lg font-medium leading-6 text-gray-900 mb-4'>
          Edit User
        </h3>

        <form onSubmit={handleSubmit}>
          <div className='grid grid-cols-2 gap-3'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                First Name
              </label>
              <input
                type='text'
                name='firstName'
                placeholder='First Name'
                value={editingUser.firstName}
                onChange={handleChange}
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
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Last Name
              </label>
              <input
                type='text'
                name='lastName'
                placeholder='Last Name'
                value={editingUser.lastName}
                onChange={handleChange}
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
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Email
              </label>
              <input
                type='email'
                name='email'
                placeholder='Email'
                value={editingUser.email}
                onChange={handleChange}
                className='border p-2 rounded w-full mb-1'
                required
              />
              {validationErrors.email && (
                <p className='text-red-500 text-xs'>{validationErrors.email}</p>
              )}
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Phone Number
              </label>
              <input
                type='tel'
                name='phoneNumber'
                placeholder='Phone Number'
                value={editingUser.phoneNumber}
                onChange={handleChange}
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
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Role
              </label>
              <select
                name='role'
                value={editingUser.role}
                onChange={handleChange}
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
                <p className='text-red-500 text-xs'>{validationErrors.role}</p>
              )}
            </div>

            <div className='col-span-2'>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Profile Image
              </label>
              <div className='flex items-center space-x-4'>
                {previewImage && (
                  <div className='relative'>
                    <img
                      src={previewImage || '/placeholder.svg'}
                      alt='Profile Preview'
                      className='h-16 w-16 rounded-full object-cover border'
                    />
                  </div>
                )}
                <input
                  type='file'
                  accept='image/*'
                  onChange={handleImageChange}
                  className='border p-2 rounded flex-1'
                />
              </div>
            </div>
          </div>

          <div className='flex items-center justify-end gap-2 mt-4'>
            <button
              type='button'
              onClick={onClose}
              className='inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500'
            >
              Cancel
            </button>
            <button
              type='submit'
              className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white ${
                isSubmitting
                  ? 'bg-indigo-400 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
              }`}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Updating...' : 'Update User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditUser;
