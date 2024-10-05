<<<<<<< HEAD
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import UploadImage from '../components/UploadImage';

function Register() {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phoneNumber: '',
    imageUrl: '',
=======
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import UploadImage from "../components/UploadImage";

function Register() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phoneNumber: "",
    imageUrl: "",
    termsAgreed: false, // Add state for the checkbox
>>>>>>> origin/master
  });

  const navigate = useNavigate();

  // Handling Input change for registration form.
  const handleInputChange = (e) => {
<<<<<<< HEAD
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Register User
  const registerUser = () => {
    fetch('http://localhost:4000/api/v1/user/register', {
      method: 'POST',
      headers: {
        'Content-type': 'application/json',
=======
    const { name, type, checked, value } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  // Register User
  const registerUser = (e) => {
    e.preventDefault(); // Prevent the default form submission
    fetch("http://localhost:4000/api/v1/user/register", {
      method: "POST",
      headers: {
        "Content-type": "application/json",
>>>>>>> origin/master
      },
      body: JSON.stringify(form),
    })
      .then((result) => {
<<<<<<< HEAD
        alert('Successfully Registered, Now Login with your details');
        navigate('/login');
      })
      .catch((err) => console.log(err));
  };
  // ------------------
=======
        alert("Successfully Registered, Now Login with your details");
        navigate("/login");
      })
      .catch((err) => console.log(err));
  };
>>>>>>> origin/master

  // Uploading image to cloudinary
  const uploadImage = async (image) => {
    const data = new FormData();
<<<<<<< HEAD
    data.append('file', image);
    data.append('upload_preset', 'inventoryapp');

    await fetch('https://api.cloudinary.com/v1_1/ddhayhptm/image/upload', {
      method: 'POST',
=======
    data.append("file", image);
    data.append("upload_preset", "inventoryapp");

    await fetch("https://api.cloudinary.com/v1_1/ddhayhptm/image/upload", {
      method: "POST",
>>>>>>> origin/master
      body: data,
    })
      .then((res) => res.json())
      .then((data) => {
        setForm({ ...form, imageUrl: data.url });
<<<<<<< HEAD
        alert('Image Successfully Uploaded');
=======
        alert("Image Successfully Uploaded");
>>>>>>> origin/master
      })
      .catch((error) => console.log(error));
  };

<<<<<<< HEAD
  const handleSubmit = (e) => {
    e.preventDefault();
  };

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 h-screen  items-center place-items-center">
        <div className="w-full max-w-md space-y-8  p-10 rounded-lg">
          <div>
            <img
              className="mx-auto h-12 w-auto"
              src={require('../assets/logo.png')}
              alt="Your Company"
            />
            <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
              Register your account
            </h2>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {/* <input type="hidden" name="remember" defaultValue="true"  /> */}
            <div className="flex flex-col gap-4 -space-y-px rounded-md shadow-sm">
              <div className="flex gap-4">
                <input
                  name="firstName"
                  type="text"
                  required
                  className="relative block w-full rounded-t-md border-0 py-1.5 px-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  placeholder="First Name"
=======
  return (
    <>
      <div className='grid grid-cols-1 sm:grid-cols-2 h-screen items-center place-items-center'>
        <div className='w-full max-w-md space-y-8 p-10 rounded-lg'>
          <div>
            <img
              className='mx-auto h-12 w-auto'
              src={require("../assets/logo.png")}
              alt='Your Company'
            />
            <h2 className='mt-6 text-center text-3xl font-bold tracking-tight text-gray-900'>
              Register your account
            </h2>
          </div>
          <form className='mt-8 space-y-6' onSubmit={registerUser}>
            <div className='flex flex-col gap-4 -space-y-px rounded-md shadow-sm'>
              <div className='flex gap-4'>
                <input
                  name='firstName'
                  type='text'
                  required
                  className='relative block w-full rounded-t-md border-0 py-1.5 px-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6'
                  placeholder='First Name'
>>>>>>> origin/master
                  value={form.firstName}
                  onChange={handleInputChange}
                />
                <input
<<<<<<< HEAD
                  name="lastName"
                  type="text"
                  required
                  className="relative block w-full rounded-t-md border-0 py-1.5 px-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  placeholder="Last Name"
=======
                  name='lastName'
                  type='text'
                  required
                  className='relative block w-full rounded-t-md border-0 py-1.5 px-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6'
                  placeholder='Last Name'
>>>>>>> origin/master
                  value={form.lastName}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <input
<<<<<<< HEAD
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="relative block w-full rounded-t-md border-0 py-1.5 px-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  placeholder="Email address"
=======
                  id='email-address'
                  name='email'
                  type='email'
                  autoComplete='email'
                  required
                  className='relative block w-full rounded-t-md border-0 py-1.5 px-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6'
                  placeholder='Email address'
>>>>>>> origin/master
                  value={form.email}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <input
<<<<<<< HEAD
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="relative block w-full rounded-b-md border-0 py-1.5 px-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  placeholder="Password"
=======
                  id='password'
                  name='password'
                  type='password'
                  autoComplete='current-password'
                  required
                  className='relative block w-full rounded-b-md border-0 py-1.5 px-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6'
                  placeholder='Password'
>>>>>>> origin/master
                  value={form.password}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <input
<<<<<<< HEAD
                  name="phoneNumber"
                  type="number"
                  autoComplete="phoneNumber"
                  required
                  className="relative block w-full rounded-b-md border-0 py-1.5 px-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  placeholder="Phone Number"
=======
                  name='phoneNumber'
                  type='number'
                  autoComplete='phoneNumber'
                  required
                  className='relative block w-full rounded-b-md border-0 py-1.5 px-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6'
                  placeholder='Phone Number'
>>>>>>> origin/master
                  value={form.phoneNumber}
                  onChange={handleInputChange}
                />
              </div>
              <UploadImage uploadImage={uploadImage} />
            </div>

<<<<<<< HEAD
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                  checked
                  required
                />
                <label
                  htmlFor="remember-me"
                  className="ml-2 block text-sm text-gray-900"
                >
                  I Agree Terms & Conditons
                </label>
              </div>

              <div className="text-sm">
                <span className="font-medium text-indigo-600 hover:text-indigo-500">
=======
            <div className='flex items-center justify-between'>
              <div className='flex items-center'>
                <input
                  id='remember-me'
                  name='termsAgreed' // Change name to match state
                  type='checkbox'
                  className='h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600'
                  checked={form.termsAgreed} // Use state for checked
                  onChange={handleInputChange} // Add onChange handler
                  required
                />
                <label
                  htmlFor='remember-me'
                  className='ml-2 block text-sm text-gray-900'
                >
                  I Agree to Terms & Conditions
                </label>
              </div>

              <div className='text-sm'>
                <span className='font-medium text-indigo-600 hover:text-indigo-500'>
>>>>>>> origin/master
                  Forgot your password?
                </span>
              </div>
            </div>

            <div>
              <button
<<<<<<< HEAD
                type="submit"
                className="group relative flex w-full justify-center rounded-md bg-indigo-600 py-2 px-3 text-sm font-semibold text-white hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                onClick={registerUser}
              >
                <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                  {/* <LockClosedIcon
                      className="h-5 w-5 text-indigo-500 group-hover:text-indigo-400"
                      aria-hidden="true"
                    /> */}
                </span>
                Sign up
              </button>
              <p className="mt-2 text-center text-sm text-gray-600">
                Or{' '}
                <span className="font-medium text-indigo-600 hover:text-indigo-500">
                  Already Have an Account, Please
                  <Link to="/login"> Signin now </Link>
=======
                type='submit'
                className='group relative flex w-full justify-center rounded-md bg-indigo-600 py-2 px-3 text-sm font-semibold text-white hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600'
              >
                Sign up
              </button>
              <p className='mt-2 text-center text-sm text-gray-600'>
                Or{" "}
                <span className='font-medium text-indigo-600 hover:text-indigo-500'>
                  Already Have an Account?{" "}
                  <Link to='/login'> Sign in now </Link>
>>>>>>> origin/master
                </span>
              </p>
            </div>
          </form>
        </div>
<<<<<<< HEAD
        <div className="flex justify-center order-first sm:order-last">
          <img src={require('../assets/Login.png')} alt="" />
=======
        <div className='flex justify-center order-first sm:order-last'>
          <img src={require("../assets/Login.png")} alt='' />
>>>>>>> origin/master
        </div>
      </div>
    </>
  );
}

export default Register;
