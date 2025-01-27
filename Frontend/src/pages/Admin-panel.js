import React, { useState, useEffect } from "react";
import { FaPlus, FaRegEdit, FaTrash } from "react-icons/fa";
import PersonInfoDropdown from "./PersonInfoDropdown";
import { BASE_URL } from "../config";

const UserList = () => {
  const [users, setUsers] = useState([]);
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
  const [validationErrors, setValidationErrors] = useState({});
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${BASE_URL}/user`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error(`Error: ${res.status}`);

      const data = await res.json();
      if (data && data.data && Array.isArray(data.data.results)) {
        setUsers(data.data.results);
      } else {
        console.error("Unexpected API response structure:", data);
        setUsers([]);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      setUsers([]);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const validateForm = (user, isNewUser = false) => {
    const errors = {};
    if (user.firstName.trim().length < 2)
      errors.firstName = "First name must be at least 2 characters long";
    if (user.lastName.trim().length < 2)
      errors.lastName = "Last name must be at least 2 characters long";
    if (!/^\S+@\S+\.\S+$/.test(user.email))
      errors.email = "Invalid email format";
    if (isNewUser && user.password.length < 6)
      errors.password = "Password must be at least 6 characters long";
    if (!/^\d{10}$/.test(user.phoneNumber))
      errors.phoneNumber = "Phone number must be 10 digits";
    if (isNaN(user.percentage) || user.percentage < 0 || user.percentage > 100)
      errors.percentage = "Percentage must be between 0 and 100";
    if (!user.role) errors.role = "Please select a role";
    return errors;
  };

  const addUser = async (e) => {
    e.preventDefault();
    setIsButtonDisabled(true); // Disable the button
    const errors = validateForm(newUser, true);
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      setIsButtonDisabled(false); // Re-enable the button on validation error
      return;
    }

    try {
      const formData = new FormData();
      Object.keys(newUser).forEach((key) => {
        formData.append(key, newUser[key]);
      });

      const response = await fetch(`${BASE_URL}/user/register`, {
        credentials: "include",
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error(`Error: ${response.status}`);

      fetchUsers();
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
      setValidationErrors({});
    } catch (error) {
      console.error("Error adding user:", error);
    } finally {
      setIsButtonDisabled(false); // Re-enable the button after the operation
    }
  };

  const updateUser = async (e) => {
    e.preventDefault();
    const errors = validateForm(editingUser);
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }
    try {
      const { password, ...userDataWithoutPassword } = editingUser;
      const response = await fetch(`${BASE_URL}/user/${editingUser._id}`, {
        credentials: "include",
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userDataWithoutPassword),
      });
      if (!response.ok) throw new Error(`Error: ${response.status}`);
      const data = await response.json();

      fetchUsers();
      setEditingUser(null);
      setValidationErrors({});
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  const deleteUser = async (id) => {
    try {
      await fetch(`${BASE_URL}/user/${id}`, {
        credentials: "include",
        method: "DELETE",
      });
      fetchUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
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

  const handleCancel = () => {
    setEditingUser(null);
    setValidationErrors({});
  };

  return (
    <div className='container mx-auto'>
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
                  key={user?._id}
                  className='bg-white border-b hover:bg-gray-50'
                >
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <img
                      src={`http://localhost:4000/public/img/users/${user?.image}`}
                      alt={`${user?.firstName} ${user?.lastName}`}
                      className='h-10 w-10 rounded-full'
                    />
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap font-medium text-gray-900'>
                    {`${user?.firstName} ${user?.lastName}`}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap'>{user?.email}</td>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    {user?.role === "admin" ? (
                      <span className='inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800'>
                        {user?.role}
                      </span>
                    ) : (
                      user?.role
                    )}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    {user?.percentage > 0 ? (
                      <span className='inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-blue-800'>
                        {user?.percentage + "%"}
                      </span>
                    ) : (
                      user?.percentage + "%"
                    )}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    {user?.phoneNumber}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <div className='flex space-x-2'>
                      <button
                        onClick={() => handleEdit(user)}
                        className='font-medium text-indigo-600 hover:text-indigo-900'
                      >
                        <FaRegEdit className='w-5 h-5' />
                      </button>
                      <button
                        onClick={() => deleteUser(user?._id)}
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
              <div className='grid grid-cols-2 gap-2'>
                <div>
                  <input
                    type='text'
                    placeholder='First Name'
                    value={newUser.firstName}
                    onChange={(e) =>
                      setNewUser({ ...newUser, firstName: e.target.value })
                    }
                    className='border p-2 rounded w-full mb-2'
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
                  <input
                    type='text'
                    placeholder='Last Name'
                    value={newUser.lastName}
                    onChange={(e) =>
                      setNewUser({ ...newUser, lastName: e.target.value })
                    }
                    className='border p-2 rounded w-full mb-2'
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
                  <input
                    type='number'
                    placeholder='Percentage'
                    value={newUser.percentage}
                    onChange={(e) =>
                      setNewUser({ ...newUser, percentage: e.target.value })
                    }
                    className='border p-2 rounded w-full mb-2'
                    required
                    min={0}
                    max={100}
                  />
                  {validationErrors.percentage && (
                    <p className='text-red-500 text-xs'>
                      {validationErrors.percentage}
                    </p>
                  )}
                </div>
                <div>
                  <input
                    type='tel'
                    placeholder='Phone Number'
                    value={newUser.phoneNumber}
                    onChange={(e) =>
                      setNewUser({ ...newUser, phoneNumber: e.target.value })
                    }
                    className='border p-2 rounded w-full mb-2'
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
                  {validationErrors.email && (
                    <p className='text-red-500 text-xs'>
                      {validationErrors.email}
                    </p>
                  )}
                </div>
                <div>
                  <input
                    type='password'
                    placeholder='Password'
                    value={newUser.password}
                    onChange={(e) =>
                      setNewUser({ ...newUser, password: e.target.value })
                    }
                    className='border p-2 rounded w-full mb-2'
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
                    <option value='sunglassesSeller'>Sunglasses seller</option>
                    <option value='doctor'>Doctor</option>
                  </select>
                  {validationErrors.role && (
                    <p className='text-red-500 text-xs'>
                      {validationErrors.role}
                    </p>
                  )}
                </div>
                <div>
                  <input
                    type='file'
                    accept='image/*'
                    onChange={handleImageUpload}
                    className='border p-2 rounded w-full mb-4'
                  />
                </div>
              </div>
              <div className='flex items-center justify-end gap-2'>
                <button
                  type='button'
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setValidationErrors({});
                  }}
                  className='inline-flex items-center px-3 py-1 border border-transparent text-sm mr-0 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none  focus:ring-2 focus:ring-offset-2 focus:ring-red-500'
                >
                  Cancel
                </button>
                <button
                  type='submit'
                  className={`inline-flex items-center px-2 py-1 border border-transparent text-sm mr-0 font-medium rounded-md text-white ${
                    isButtonDisabled
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-indigo-600 hover:bg-indigo-700"
                  }`}
                  disabled={isButtonDisabled} // Disable button based on state
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
              <div>
                <input
                  type='text'
                  placeholder='First Name'
                  value={editingUser.firstName}
                  onChange={(e) =>
                    setEditingUser({
                      ...editingUser,
                      firstName: e.target.value,
                    })
                  }
                  className='border p-2 rounded w-full mb-2'
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
                <input
                  type='text'
                  placeholder='Last Name'
                  value={editingUser.lastName}
                  onChange={(e) =>
                    setEditingUser({ ...editingUser, lastName: e.target.value })
                  }
                  className='border p-2 rounded w-full mb-2'
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
                {validationErrors.email && (
                  <p className='text-red-500 text-xs'>
                    {validationErrors.email}
                  </p>
                )}
              </div>
              <div>
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
                  pattern='\d{10}'
                />
                {validationErrors.phoneNumber && (
                  <p className='text-red-500 text-xs'>
                    {validationErrors.phoneNumber}
                  </p>
                )}
              </div>
              <div>
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
                  min={0}
                  max={100}
                />
                {validationErrors.percentage && (
                  <p className='text-red-500 text-xs'>
                    {validationErrors.percentage}
                  </p>
                )}
              </div>
              <div>
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
                  <option value='sunglassesSeller'>
                    Sunglasses <s></s>eller
                  </option>
                  <option value='doctor'>Doctor</option>
                </select>
                {validationErrors.role && (
                  <p className='text-red-500 text-xs'>
                    {validationErrors.role}
                  </p>
                )}
              </div>
              <div className='flex items-center justify-end gap-2'>
                <button
                  type='button'
                  onClick={handleCancel}
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
};

export default UserList;
