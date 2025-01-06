import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import UploadImage from '../components/UploadImage';
import { BASE_URL } from '../config';

function Register() {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phoneNumber: '',
    image: null, // Set to null initially, updated with file input
  });

  const navigate = useNavigate();

  // Handle input change for form fields.
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  // Handle image change
  const handleImageChange = (e) => {
    setForm({ ...form, image: e.target.files[0] });
  };

  // Register user along with the image
  const registerUser = () => {
    const data = new FormData(); // Create FormData object for file and text data
    data.append('firstName', form.firstName);
    data.append('lastName', form.lastName);
    data.append('email', form.email);
    data.append('password', form.password);
    data.append('phoneNumber', form.phoneNumber);
    data.append('image', form.image); // Append image file

    fetch(`${BASE_URL}/user/register`, {
      method: 'POST',
      body: data, // Send FormData directly
    })
      .then((result) => {
        alert('Successfully Registered, Now Login with your details');
        navigate('/login');
      })
      .catch((err) => console.log(err));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    registerUser();
  };

  return (
    <div className='grid grid-cols-1 sm:grid-cols-2 h-screen items-center place-items-center'>
      <div className='w-full max-w-md space-y-8 p-10 rounded-lg'>
        <div>
          <img
            className='mx-auto h-12 w-auto'
            src={require('../assets/logo.png')}
            alt='Your Company'
          />
          <h2 className='mt-6 text-center text-3xl font-bold tracking-tight text-gray-900'>
            Register your account
          </h2>
        </div>
        <form className='mt-8 space-y-6' onSubmit={handleSubmit}>
          <div className='flex flex-col gap-4 -space-y-px rounded-md shadow-sm'>
            <div className='flex gap-4'>
              <input
                name='firstName'
                type='text'
                required
                className='relative block w-full rounded-t-md py-1.5 px-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm'
                placeholder='First Name'
                value={form.firstName}
                onChange={handleInputChange}
              />
              <input
                name='lastName'
                type='text'
                required
                className='relative block w-full rounded-t-md py-1.5 px-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm'
                placeholder='Last Name'
                value={form.lastName}
                onChange={handleInputChange}
              />
            </div>
            <input
              name='email'
              type='email'
              required
              className='relative block w-full rounded-t-md py-1.5 px-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm'
              placeholder='Email address'
              value={form.email}
              onChange={handleInputChange}
            />
            <input
              name='password'
              type='password'
              required
              className='relative block w-full rounded-t-md py-1.5 px-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm'
              placeholder='Password'
              value={form.password}
              onChange={handleInputChange}
            />
            <input
              name='phoneNumber'
              type='text'
              required
              className='relative block w-full rounded-t-md py-1.5 px-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm'
              placeholder='Phone Number'
              value={form.phoneNumber}
              onChange={handleInputChange}
            />
            {/* File input for image */}
            <input
              type='file'
              accept='image/*'
              onChange={handleImageChange}
              className='mt-2'
            />
          </div>

          <button
            type='submit'
            className='group relative flex w-full justify-center rounded-md bg-indigo-600 py-2 px-3 text-sm font-semibold text-white hover:bg-indigo-500'
          >
            Sign up
          </button>
          <p className='mt-2 text-center text-sm text-gray-600'>
            Already have an account?{' '}
            <Link
              to='/login'
              className='font-medium text-indigo-600 hover:text-indigo-500'
            >
              Sign in
            </Link>
          </p>
        </form>
      </div>
      <div className='flex justify-center order-first sm:order-last'>
        <img src={require('../assets/Login.png')} alt='' />
      </div>
    </div>
  );
}

export default Register;
