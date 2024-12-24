import React, { useState } from "react";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    // Implement API call for resetting the password
    console.log("Password reset successfully:", password);
  };

  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-100'>
      <div className='bg-white p-6 rounded-lg shadow-md w-full max-w-md'>
        <h2 className='text-2xl font-bold text-center mb-4 text-gray-700'>
          Reset Password
        </h2>
        <form onSubmit={handleSubmit}>
          <div className='mb-4'>
            <label htmlFor='password' className='block text-gray-600 mb-2'>
              New Password
            </label>
            <input
              type='password'
              id='password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className='w-full px-4 py-2 border rounded-md focus:ring focus:ring-blue-300'
              required
            />
          </div>
          <div className='mb-4'>
            <label
              htmlFor='confirmPassword'
              className='block text-gray-600 mb-2'
            >
              Confirm Password
            </label>
            <input
              type='password'
              id='confirmPassword'
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className='w-full px-4 py-2 border rounded-md focus:ring focus:ring-blue-300'
              required
            />
          </div>
          <button
            type='submit'
            className='w-full bg-green-500 text-white py-2 rounded-md hover:bg-green-600 transition'
          >
            Reset Password
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
