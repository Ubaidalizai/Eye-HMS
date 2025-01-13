import { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../AuthContext';

// API Base URL
import { BASE_URL } from '../config';

function Login() {
  const [form, setForm] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState(null); // Error state
  const [loading, setLoading] = useState(false); // Loading state

  const authContext = useContext(AuthContext); // Auth Context for user data
  const navigate = useNavigate(); // Navigation hook

  // Handle input changes
  const handleInputChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Login User Function
  const loginUser = async (e) => {
    e.preventDefault(); // Prevent default form submission

    // Validation for empty fields
    if (!form.email || !form.password) {
      setError('Please enter both email and password.');
      return;
    }

    try {
      setError(null); // Clear previous errors
      setLoading(true); // Enable loading state
      // API Request
      const response = await fetch(`${BASE_URL}/user/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for sessions
        body: JSON.stringify(form),
      });

      if (response.ok) {
        // console.log(response, 'response');
        const data = await response.json();

        localStorage.setItem('user', JSON.stringify(data));
        localStorage.setItem('lastLoginTime', Date.now()); // Save login time

        // Navigate to dashboard or home page
        navigate('/'); // Redirect after login
      } else {
        const errorData = await response.json();
        throw new Error(errorData?.message || 'Login failed');
      }
    } catch (err) {
      setError(err.message); // Show error in UI
    } finally {
      setLoading(false); // Disable loading state
    }
  };

  return (
    <div className='flex h-[100vh] items-center justify-center bg-white'>
      <div className='w-full justify-center items-center border bg-slate-50 max-w-md space-y-8 p-10 rounded-lg'>
        <h2 className='mt-6 text-center text-3xl font-bold tracking-tight text-gray-700'>
          Sign in to your account
        </h2>

        {/* Error Message */}
        {error && (
          <div className='text-red-500 text-sm text-center'>{error}</div>
        )}

        <form className='mt-8 space-y-6' onSubmit={loginUser}>
          <div className='rounded-md shadow-sm'>
            <div>
              <label htmlFor='email-address' className='sr-only'>
                Email address
              </label>
              <input
                id='email-address'
                name='email'
                type='email'
                autoComplete='email'
                required
                className='relative block w-full rounded-t-md border-0 py-1.5 px-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6'
                placeholder='Email address'
                value={form.email}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <label htmlFor='password' className='sr-only'>
                Password
              </label>
              <input
                id='password'
                name='password'
                type='password'
                autoComplete='current-password'
                required
                className='relative block w-full rounded-b-md border-0 py-1.5 px-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6'
                placeholder='Password'
                value={form.password}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className='flex items-center justify-between'>
            <div className='text-sm'>
              <Link
                to='/forgot-password'
                className='font-medium text-indigo-600 hover:text-indigo-500'
              >
                Forgot your password?
              </Link>
            </div>
          </div>

          <div>
            <button
              type='submit'
              disabled={loading} // Disable button during loading
              className={`group relative flex w-full justify-center rounded-md ${
                loading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-500'
              } py-2 px-3 text-sm font-semibold text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600`}
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;
