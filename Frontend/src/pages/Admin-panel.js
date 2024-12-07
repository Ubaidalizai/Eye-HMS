import React, { useState, useEffect } from 'react';
import { Pencil, Trash2, Plus } from 'lucide-react';
import { FaPlus } from 'react-icons/fa';

export default function AdminPanel() {
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

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch('http://localhost:4000/api/v1/user', {
        credentials: 'include',
      });
      if (!res.ok) throw new Error(`Error: ${res.status}`);

      const data = await res.json();
      setUsers(data.users);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const addUser = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    Object.keys(newUser).forEach((key) => {
      formData.append(key, newUser[key]);
    });
    try {
      const response = await fetch(
        'http://localhost:4000/api/v1/user/register',
        { credentials: 'include', method: 'POST', body: formData }
      );
      if (!response.ok) throw new Error(`Error: ${response.status}`);
      const data = await response.json();
      setUsers([...users, data.user]);
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
    } catch (error) {
      console.error('Error adding user:', error);
    }
  };

  const updateUser = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(
        `http://localhost:4000/api/v1/user/${editingUser._id}`,
        {
          credentials: 'include',
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(editingUser), // Send JSON instead
        }
      );
      if (!response.ok) throw new Error(`Error: ${response.status}`);
      const data = await response.json();
      fetchUsers();
      setEditingUser(null);
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const deleteUser = async (id) => {
    try {
      await fetch(`http://localhost:4000/api/v1/user/${id}`, {
        credentials: 'include',
        method: 'DELETE',
      });
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    setNewUser({ ...newUser, image: file });
  };

  return (
    <div className='container mx-auto p-6'>
      <h2 className='font-semibold text-xl'>Admin Panel</h2>

      <div className='border pt-5 rounded-lg mt-10'>
        <div className='flex justify-end mb-4'>
          <button className='inline-flex items-center px-5 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none mr-10 focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'>
            <FaPlus className='mr-2' /> Add User
          </button>
        </div>

        {/* User Table */}
        <div className='bg-white rounded-sm shadow overflow-x-auto'>
          <table className='w-full'>
            <thead className='bg-gray-50'>
              <tr>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Profile
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Full Name
                </th>

                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Email
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Role
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Password
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Phone Number
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className='bg-white divide-y divide-gray-200'>
              {users.map((user) => (
                <tr key={user._id}>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <img
                      src={`http://localhost:4000/public/img/users/${user?.image}`}
                      alt={`${user.firstName} ${user.lastName}`}
                      className='h-10 w-10 rounded-full'
                    />
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    {`${user.firstName} ${user.lastName}`}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap'>{user.email}</td>
                  <td
                    className={`px-6 py-4 whitespace-nowrap ${
                      user.role === 'admin' ? 'text-blue-600 font-semibold' : ''
                    }`}
                  >
                    {user.role === 'admin' ? (
                      <span className='inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800'>
                        {user.role}
                      </span>
                    ) : (
                      user.role
                    )}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    {user.password ? '********' : 'N/A'}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    {user.phoneNumber}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm font-medium'>
                    <button
                      onClick={() => setEditingUser(user)}
                      className='text-indigo-600 hover:text-indigo-900 mr-4'
                    >
                      <Pencil className='inline-block h-5 w-5' />
                    </button>
                    <button
                      onClick={() => deleteUser(user._id)}
                      className='text-red-600 hover:text-red-900'
                    >
                      <Trash2 className='inline-block h-5 w-5' />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      {isAddModalOpen && (
        <div className='fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center'>
          <div className='relative p-5 border w-96 shadow-lg rounded-md bg-white'>
            <h3 className='text-lg font-medium leading-6 text-gray-900 mb-4'>
              Add New User
            </h3>
            <form onSubmit={addUser}>
              <input
                type='text'
                placeholder='First Name'
                value={newUser.firstName}
                onChange={(e) =>
                  setNewUser({ ...newUser, firstName: e.target.value })
                }
                className='border p-2 rounded w-full mb-2'
                required
              />
              <input
                type='text'
                placeholder='Last Name'
                value={newUser.lastName}
                onChange={(e) =>
                  setNewUser({ ...newUser, lastName: e.target.value })
                }
                className='border p-2 rounded w-full mb-2'
                required
              />
              <input
                type='password'
                placeholder='Password'
                value={newUser.password}
                onChange={(e) =>
                  setNewUser({ ...newUser, password: e.target.value })
                }
                className='border p-2 rounded w-full mb-2'
                required
              />
              <input
                type='tel'
                placeholder='Phone Number'
                value={newUser.phoneNumber}
                onChange={(e) =>
                  setNewUser({ ...newUser, phoneNumber: e.target.value })
                }
                className='border p-2 rounded w-full mb-2'
                required
              />
              <input
                type='email'
                placeholder='Email'
                value={newUser.email}
                onChange={(e) =>
                  setNewUser({ ...newUser, email: e.target.value })
                }
                className='border p-2 rounded w-full mb-2'
                required
              />
              <select
                value={newUser.role}
                onChange={(e) =>
                  setNewUser({ ...newUser, role: e.target.value })
                }
                className='border p-2 rounded w-full mb-2'
                required
              >
                <option value=''>Select Role</option>
                <option value='pharmacist'>Pharmacist</option>
                <option value='admin'>Admin</option>
                <option value='nurse'>Nurse</option>
                <option value='doctor'>Doctor</option>
              </select>
              <input
                type='file'
                accept='image/*'
                onChange={handleImageUpload}
                className='border p-2 rounded w-full mb-4'
              />
              <div className='flex justify-end'>
                <button
                  type='button'
                  onClick={() => setIsAddModalOpen(false)}
                  className='bg-gray-300 text-gray-800 px-4 py-2 rounded mr-2 hover:bg-gray-400'
                >
                  Cancel
                </button>
                <button
                  type='submit'
                  className='bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600'
                >
                  Add User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <div className='fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center'>
          <div className='relative p-5 border w-96 shadow-lg rounded-md bg-white'>
            <h3 className='text-lg font-medium leading-6 text-gray-900 mb-4'>
              Edit User
            </h3>
            <form onSubmit={updateUser}>
              <input
                type='text'
                placeholder='First Name'
                value={editingUser.firstName}
                onChange={(e) =>
                  setEditingUser({ ...editingUser, firstName: e.target.value })
                }
                className='border p-2 rounded w-full mb-2'
                required
              />
              <input
                type='text'
                placeholder='Last Name'
                value={editingUser.lastName}
                onChange={(e) =>
                  setEditingUser({ ...editingUser, lastName: e.target.value })
                }
                className='border p-2 rounded w-full mb-2'
                required
              />
              <input
                type='email'
                placeholder='Email'
                value={editingUser.email}
                onChange={(e) =>
                  setEditingUser({ ...editingUser, email: e.target.value })
                }
                className='border p-2 rounded w-full mb-2'
                required
              />
              <input
                type='password'
                placeholder='New Password (leave blank to keep current)'
                value={editingUser.password || ''}
                onChange={(e) =>
                  setEditingUser({ ...editingUser, password: e.target.value })
                }
                className='border p-2 rounded w-full mb-2'
              />
              <input
                type='tel'
                placeholder='Phone Number'
                value={editingUser.phoneNumber}
                onChange={(e) =>
                  setEditingUser({
                    ...editingUser,
                    phoneNumber: e.target.value,
                  })
                }
                className='border p-2 rounded w-full mb-2'
                required
              />
              <select
                value={editingUser.role}
                onChange={(e) =>
                  setEditingUser({ ...editingUser, role: e.target.value })
                }
                className='border p-2 rounded w-full mb-4'
                required
              >
                <option value=''>Role</option>
                <option value='pharmacist'>Pharmacist</option>
                <option value='admin'>Admin</option>
                <option value='nurse'>Nurse</option>
                <option value='doctor'>Doctor</option>
              </select>
              <div className='flex justify-end'>
                <button
                  type='button'
                  onClick={() => setEditingUser(null)}
                  className='bg-gray-300 text-gray-800 px-4 py-2 rounded mr-2 hover:bg-gray-400'
                >
                  Cancel
                </button>
                <button
                  type='submit'
                  className='bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600'
                >
                  Update User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
