import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

function SideMenu() {
  const [userInfo, setUserInfo] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Send a GET request to the server to fetch the user profile
        const res = await axios.get(
          'http://localhost:4000/api/v1/user/profile',
          { withCredentials: true }
        );

        // Check if the response is valid
        if (res.status === 200) {
          // Update the user info state with the response data
          setUserInfo(res?.data?.data);
        } else {
          console.error('Failed to fetch user profile', res);
        }
      } catch (error) {
        console.error('Error fetching user profile', error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className='h-full flex-col justify-between  bg-white hidden lg:flex '>
      <div className='px-4 py-6'>
        <nav aria-label='Main Nav' className='mt-6 flex flex-col space-y-1'>
          <Link
            to='/'
            className='flex items-center gap-2 rounded-lg hover:bg-gray-100 px-4 py-2 text-gray-700'
          >
            <img
              alt='dashboard-icon'
              src={require('../assets/dashboard-icon.png')}
            />
            <span className='text-sm font-medium'> Dashboard </span>
          </Link>

          <details className='group [&_summary::-webkit-details-marker]:hidden'>
            <summary className='flex cursor-pointer items-center justify-between rounded-lg px-4 py-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700'>
              <Link to='/inventory'>
                <div className='flex items-center gap-2'>
                  <img
                    alt='inventory-icon'
                    src={require('../assets/inventory-icon.png')}
                  />
                  <span className='text-sm font-medium'> Inventory </span>
                </div>
              </Link>
            </summary>
          </details>

          <Link
            to='/purchase-details'
            className='flex items-center gap-2 rounded-lg px-4 py-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700'
          >
            <img
              alt='purchase-icon'
              src={require('../assets/supplier-icon.png')}
            />
            <span className='text-sm font-medium'> Purchase Details</span>
          </Link>
          <Link
            to='/sales'
            className='flex items-center gap-2 rounded-lg px-4 py-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700'
          >
            <img alt='sale-icon' src={require('../assets/supplier-icon.png')} />
            <span className='text-sm font-medium'> Sales</span>
          </Link>
          <Link
            to='/move'
            className='flex items-center gap-2 rounded-lg px-4 py-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700'
          >
            <img alt='sale-icon' src={require('../assets/supplier-icon.png')} />
            <span className='text-sm font-medium'> Sales</span>
          </Link>
          <Link
            to='/patient'
            className='flex items-center gap-2 rounded-lg px-4 py-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700'
          >
            <img alt='sale-icon' src={require('../assets/supplier-icon.png')} />
            <span className='text-sm font-medium'>Paitent</span>
          </Link>
          <Link
            to='/pharmacy'
            className='flex items-center gap-2 rounded-lg px-4 py-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700'
          >
            <img alt='sale-icon' src={require('../assets/supplier-icon.png')} />
            <span className='text-sm font-medium'> Move</span>
          </Link>
          <Link
            to='/incomeReports'
            className='flex items-center gap-2 rounded-lg px-4 py-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700'
          >
            <img alt='sale-icon' src={require('../assets/supplier-icon.png')} />
            <span className='text-sm font-medium'> Pharmacy</span>
          </Link>

          <details className='group [&_summary::-webkit-details-marker]:hidden'>
            <summary className='flex cursor-pointer items-center justify-between rounded-lg px-4 py-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700'>
              <Link to='/manage-store'>
                <div className='flex items-center gap-2'>
                  <img
                    alt='store-icon'
                    src={require('../assets/order-icon.png')}
                  />
                  <span className='text-sm font-medium'> Manage Store </span>
                </div>
              </Link>
            </summary>
          </details>
        </nav>
      </div>

      <div className='sticky inset-x-0 bottom-0 border-t border-gray-100'>
        <div className='flex items-center gap-2 bg-white p-4 hover:bg-gray-50'>
          <img
            alt='Profile'
            src={`http://localhost:4000/public/img/users/${userInfo.imageUrl}`}
            className='h-10 w-10 rounded-full object-cover'
          />

          <div>
            <p className='text-xs'>
              <strong className='block font-medium'>
                {userInfo.firstName + ' ' + userInfo.lastName}
              </strong>

              <span> {userInfo.email} </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SideMenu;
