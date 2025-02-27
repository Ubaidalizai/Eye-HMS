import React, { useState } from 'react';
import axios from 'axios';
import { BASE_URL } from '../config';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    try {
      const response = await axios.post(`${BASE_URL}/user/forgotPassword`, {
        email,
      });
      setMessage(response.data.message || 'Reset link sent successfully!');
    } catch (err) {
      setError(
        err.response?.data?.message || 'An error occurred. Please try again.'
      );
    }
  };

  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-100'>
      <div className='bg-white p-6 rounded-lg shadow-md w-full max-w-md'>
        <h2 className='text-2xl font-bold text-center mb-4 text-gray-700'>
          Forgot Password
        </h2>
        <p className='text-sm text-gray-500 text-center mb-6'>
          Enter your email to receive a password reset link.
        </p>
        <form onSubmit={handleSubmit}>
          <div className='mb-4'>
            <label htmlFor='email' className='block text-gray-600 mb-2'>
              Email
            </label>
            <input
              type='email'
              id='email'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className='w-full px-4 py-2 border rounded-md focus:ring focus:ring-blue-300'
              required
            />
          </div>
          {message && <p className='text-green-600 text-sm mb-4'>{message}</p>}
          {error && <p className='text-red-600 text-sm mb-4'>{error}</p>}
          <button
            type='submit'
            className='w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition'
          >
            Send Reset Link
          </button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
