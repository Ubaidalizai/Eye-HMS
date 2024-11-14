import React, { useState } from 'react';
import { Pencil, Trash2, Plus } from 'lucide-react';
import { HiSearch } from 'react-icons/hi';

export default function AdminPanel() {
  const [users, setUsers] = useState([
    { id: 1, firstName: 'John', lastName: 'Doe', email: 'john@example.com', role: 'Admin' },
    { id: 2, firstName: 'Jane', lastName: 'Smith', email: 'jane@example.com', role: 'Nurse' },
    { id: 3, firstName: 'Bob', lastName: 'Johnson', email: 'bob@example.com', role: 'Doctor' },
  ]);

  const [newUser, setNewUser] = useState({ firstName: '', lastName: '', email: '', role: '', password: '', phoneNumber: '', imageAttachment: null });
  const [editingUser, setEditingUser] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const addUser = (e) => {
    e.preventDefault();
    setUsers([...users, { ...newUser, id: users.length + 1 }]);
    setNewUser({ firstName: '', lastName: '', email: '', role: '', password: '', phoneNumber: '', imageAttachment: null });
    setIsAddModalOpen(false);
  };

  const updateUser = (e) => {
    e.preventDefault();
    if (editingUser) {
      setUsers(users.map(user => (user.id === editingUser.id ? editingUser : user)));
      setEditingUser(null);
    }
  };

  const deleteUser = (id) => {
    setUsers(users.filter(user => user.id !== id));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    setNewUser({ ...newUser, imageAttachment: file });
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Admin Panel</h1>

      <div className="flex justify-between items-center mb-4">
        <div className='relative'>
          <HiSearch className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400' size={20} />
          <input
            type='text'
            placeholder='Search User...'
            className='pl-10 pr-4 py-2 border border-gray-300 rounded-full w-72 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm transition'
          />
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          <Plus className="inline-block mr-2 h-5 w-5" />
          Add User
        </button>
      </div>

      {/* User Table */}
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">First Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap">{user.firstName}</td>
                <td className="px-6 py-4 whitespace-nowrap">{user.lastName}</td>
                <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                <td className="px-6 py-4 whitespace-nowrap">{user.role}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button onClick={() => setEditingUser(user)} className="text-indigo-600 hover:text-indigo-900 mr-4">
                    <Pencil className="inline-block h-5 w-5" />
                  </button>
                  <button onClick={() => deleteUser(user.id)} className="text-red-600 hover:text-red-900">
                    <Trash2 className="inline-block h-5 w-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add User Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
          <div className="relative p-5 border w-96 shadow-lg rounded-md bg-white">
            <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Add New User</h3>
            <form onSubmit={addUser}>
              <input
                type="text"
                placeholder="First Name"
                value={newUser.firstName}
                onChange={(e) => setNewUser({ ...newUser, firstName: e.target.value })}
                className="border p-2 rounded w-full mb-2"
                required
              />
              <input
                type="text"
                placeholder="Last Name"
                value={newUser.lastName}
                onChange={(e) => setNewUser({ ...newUser, lastName: e.target.value })}
                className="border p-2 rounded w-full mb-2"
                required
              />
              <input
                type="password"
                placeholder="Password"
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                className="border p-2 rounded w-full mb-2"
                required
              />
              <input
                type="tel"
                placeholder="Phone Number"
                value={newUser.phoneNumber}
                onChange={(e) => setNewUser({ ...newUser, phoneNumber: e.target.value })}
                className="border p-2 rounded w-full mb-2"
                required
              />
              <input
                type="email"
                placeholder="Email"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                className="border p-2 rounded w-full mb-2"
                required
              />
              <select
                value={newUser.role}
                onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                className="border p-2 rounded w-full mb-2"
                required
              >
                <option value="">Select Role</option>
                <option value="Pharmacist">Pharmacist</option>
                <option value="Admin">Admin</option>
                <option value="Nurse">Nurse</option>
                <option value="Doctor">Doctor</option>
              </select>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="border p-2 rounded w-full mb-4"
              />
              <div className="flex justify-end">
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="bg-gray-300 text-gray-800 px-4 py-2 rounded mr-2 hover:bg-gray-400">
                  Cancel
                </button>
                <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                  Add User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
          <div className="relative p-5 border w-96 shadow-lg rounded-md bg-white">
            <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Edit User</h3>
            <form onSubmit={updateUser}>
              <input
                type="text"
                placeholder="First Name"
                value={editingUser.firstName}
                onChange={(e) => setEditingUser({ ...editingUser, firstName: e.target.value })}
                className="border p-2 rounded w-full mb-2"
                required
              />
              <input
                type="text"
                placeholder="Last Name"
                value={editingUser.lastName}
                onChange={(e) => setEditingUser({ ...editingUser, lastName: e.target.value })}
                className="border p-2 rounded w-full mb-2"
                required
              />
              <input
                type="email"
                placeholder="Email"
                value={editingUser.email}
                onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                className="border p-2 rounded w-full mb-2"
                required
              />
              <select
                value={editingUser.role}
                onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                className="border p-2 rounded w-full mb-4"
                required
              >
                <option value="Pharmacist">Pharmacist</option>
                <option value="Admin">Admin</option>
                <option value="Nurse">Nurse</option>
                <option value="Doctor">Doctor</option>
              </select>
              <div className="flex justify-end">
                <button type="button" onClick={() => setEditingUser(null)} className="bg-gray-300 text-gray-800 px-4 py-2 rounded mr-2 hover:bg-gray-400">
                  Cancel
                </button>
                <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
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