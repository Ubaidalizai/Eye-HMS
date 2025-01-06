// import React, { useState } from "react";

// const ResetPassword = () => {
//   const [password, setPassword] = useState("");
//   const [confirmPassword, setConfirmPassword] = useState("");

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     if (password !== confirmPassword) {
//       alert("Passwords do not match!");
//       return;
//     }
//     // Implement API call for resetting the password
//     console.log("Password reset successfully:", password);
//   };

//   return (
//     <div className='min-h-screen flex items-center justify-center bg-gray-100'>
//       <div className='bg-white p-6 rounded-lg shadow-md w-full max-w-md'>
//         <h2 className='text-2xl font-bold text-center mb-4 text-gray-700'>
//           Reset Password
//         </h2>
//         <form onSubmit={handleSubmit}>
//           <div className='mb-4'>
//             <label htmlFor='password' className='block text-gray-600 mb-2'>
//               New Password
//             </label>
//             <input
//               type='password'
//               id='password'
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               className='w-full px-4 py-2 border rounded-md focus:ring focus:ring-blue-300'
//               required
//             />
//           </div>
//           <div className='mb-4'>
//             <label
//               htmlFor='confirmPassword'
//               className='block text-gray-600 mb-2'
//             >
//               Confirm Password
//             </label>
//             <input
//               type='password'
//               id='confirmPassword'
//               value={confirmPassword}
//               onChange={(e) => setConfirmPassword(e.target.value)}
//               className='w-full px-4 py-2 border rounded-md focus:ring focus:ring-blue-300'
//               required
//             />
//           </div>
//           <button
//             type='submit'
//             className='w-full bg-green-500 text-white py-2 rounded-md hover:bg-green-600 transition'
//           >
//             Reset Password
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default ResetPassword;

import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BASE_URL } from '../config';

const ResetPassword = () => {
  const { token } = useParams(); // Capture the token from the URL
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match!');
      return;
    }

    try {
      const response = await axios.post(
        `${BASE_URL}/user/resetePassword/${token}`,
        {
          password,
        }
      );
      setMessage(response.data.message || 'Password reset successfully!');
      setTimeout(() => navigate('/login'), 2000); // Redirect to login page after 2 seconds
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
          {message && <p className='text-green-600 text-sm mb-4'>{message}</p>}
          {error && <p className='text-red-600 text-sm mb-4'>{error}</p>}
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
