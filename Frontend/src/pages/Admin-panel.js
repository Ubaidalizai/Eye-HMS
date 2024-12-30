import React, { useState, useEffect } from "react";
import { FaPlus, FaRegEdit, FaTrash } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import PersonInfoDropdown from "./PersonInfoDropdown";
import { useNavigate } from "react-router-dom";

export default function AdminPanel() {
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();
  const [newUser, setNewUser] = useState({
    firstName: "",
    lastName: "",
    email: "",
    role: "",
    password: "",
    phoneNumber: "",
    image: null,
    percentage: "",
  });
  const [editingUser, setEditingUser] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch("http://localhost:4000/api/v1/user", {
        credentials: "include",
      });
      if (!res.ok) throw new Error(`Error: ${res.status}`);

      const data = await res.json();
      setUsers(data.data.results);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to fetch users");
    }
  };

  const validateForm = (user, isNewUser = false) => {
    if (!user.firstName || !user.lastName) {
      toast.error("First name and last name are required");
      return false;
    }
    if (!user.email || !/\S+@\S+\.\S+/.test(user.email)) {
      toast.error("Valid email is required");
      return false;
    }
    if (!user.role) {
      toast.error("Role is required");
      return false;
    }
    if (isNewUser && !user.password) {
      toast.error("Password is required for new users");
      return false;
    }
    if (!user.phoneNumber || !/^\d{10}$/.test(user.phoneNumber)) {
      toast.error("Valid 10-digit phone number is required");
      return false;
    }
    if (
      !user.percentage ||
      isNaN(user.percentage) ||
      user.percentage < 0 ||
      user.percentage > 100
    ) {
      toast.error("Percentage must be a number between 0 and 100");
      return false;
    }
    return true;
  };

  const addUser = async (e) => {
    e.preventDefault();
    if (!validateForm(newUser, true)) return;

    const formData = new FormData();
    Object.keys(newUser).forEach((key) => {
      formData.append(key, newUser[key]);
    });
    try {
      const response = await fetch(
        "http://localhost:4000/api/v1/user/register",
        { credentials: "include", method: "POST", body: formData }
      );
      if (!response.ok) throw new Error(`Error: ${response.status}`);
      const data = await response.json();
      setUsers([...users, data.user]);
      setNewUser({
        firstName: "",
        lastName: "",
        email: "",
        role: "",
        password: "",
        phoneNumber: "",
        image: null,
        percentage: "",
      });
      setIsAddModalOpen(false);
      toast.success("User added successfully");
      navigate("/Admin-panel");
    } catch (error) {
      console.error("Error adding user:", error);
      toast.error("Failed to add user");
    }
  };

  const updateUser = async (e) => {
    e.preventDefault();
    if (!validateForm(editingUser)) return;

    try {
      const response = await fetch(
        `http://localhost:4000/api/v1/user/${editingUser._id}`,
        {
          credentials: "include",
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(editingUser),
        }
      );
      if (!response.ok) throw new Error(`Error: ${response.status}`);
      await response.json();
      fetchUsers();
      setEditingUser(null);
      toast.success("User updated successfully");
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error("Failed to update user");
    }
  };

  const deleteUser = async (id) => {
    try {
      const response = await fetch(`http://localhost:4000/api/v1/user/${id}`, {
        credentials: "include",
        method: "DELETE",
      });
      if (!response.ok) throw new Error(`Error: ${response.status}`);
      fetchUsers();
      toast.success("User deleted successfully");
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Failed to delete user");
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    setNewUser({ ...newUser, image: file });
  };

  return (
    <div className='container mx-auto'>
      <ToastContainer
        position='top-right'
        autoClose={3000}
        hideProgressBar={false}
      />
      <h2 className='font-semibold text-xl'>Admin Panel</h2>

      <div className='border pt-5 rounded-lg mt-10'>
        <div className='flex justify-end items-center mb-4'>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className='inline-flex items-center px-5 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none mr-6 focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
          >
            <FaPlus className='mr-2' /> Add User
          </button>
        </div>

        {/* User Table */}
        <div className='overflow-x-auto'>
          <table className='w-full text-sm text-left text-gray-500'>
            <thead className='text-xs text-gray-700 uppercase bg-gray-100'>
              <tr>
                <th scope='col' className='px-6 py-3 font-bold tracking-wider'>
                  Profile
                </th>
                <th scope='col' className='px-6 py-3 font-bold tracking-wider'>
                  Name
                </th>
                <th scope='col' className='px-6 py-3 font-bold tracking-wider'>
                  Email
                </th>
                <th scope='col' className='px-6 py-3 font-bold tracking-wider'>
                  Role
                </th>
                <th scope='col' className='px-6 py-3 font-bold tracking-wider'>
                  Percentage
                </th>
                <th scope='col' className='px-6 py-3 font-bold tracking-wider'>
                  P.No
                </th>
                <th scope='col' className='px-6 py-3 font-bold tracking-wider'>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr
                  key={user._id}
                  className='bg-white border-b hover:bg-gray-50'
                >
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <img
                      src={`http://localhost:4000/public/img/users/${user?.image}`}
                      alt={`${user.firstName} ${user.lastName}`}
                      className='h-10 w-10 rounded-full'
                    />
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap font-medium text-gray-900'>
                    {`${user.firstName} ${user.lastName}`}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap'>{user.email}</td>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    {user.role === "admin" ? (
                      <span className='inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800'>
                        {user.role}
                      </span>
                    ) : (
                      user.role
                    )}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    {user?.percentage > 0 ? (
                      <span className='inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-blue-800'>
                        {user.percentage + "%"}
                      </span>
                    ) : (
                      user.percentage + "%"
                    )}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    {user.phoneNumber}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <div className='flex space-x-2'>
                      <button
                        onClick={() => setEditingUser(user)}
                        className='font-medium text-indigo-600 hover:text-indigo-900'
                      >
                        <FaRegEdit className='w-5 h-5' />
                      </button>
                      <button
                        onClick={() => deleteUser(user._id)}
                        className='font-medium text-red-600 hover:text-red-700'
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
                type='number'
                placeholder='Percentage'
                value={newUser.percentage}
                onChange={(e) =>
                  setNewUser({ ...newUser, percentage: e.target.value })
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
              <div className='flex items-center justify-end gap-2'>
                <button
                  type='button'
                  onClick={() => setIsAddModalOpen(false)}
                  className='inline-flex items-center px-3 py-1 border border-transparent text-sm mr-0 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none  focus:ring-2 focus:ring-offset-2 focus:ring-red-500'
                >
                  Cancel
                </button>
                <button
                  type='submit'
                  className='inline-flex items-center px-2 py-1 border border-transparent text-sm mr-0 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none  focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
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
              <input
                type='number'
                placeholder='Percentage'
                value={editingUser.percentage}
                onChange={(e) =>
                  setEditingUser({
                    ...editingUser,
                    percentage: e.target.value,
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
              <div className='flex items-center justify-end gap-2'>
                <button
                  type='button'
                  onClick={() => setEditingUser(null)}
                  className='inline-flex items-center px-3 py-1 border border-transparent text-sm mr-0 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none  focus:ring-2 focus:ring-offset-2 focus:ring-red-500'
                >
                  Cancel
                </button>
                <button
                  type='submit'
                  className='inline-flex items-center px-2 py-1 border border-transparent text-sm mr-0 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none  focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                >
                  Update User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <PersonInfoDropdown />
    </div>
  );
}
