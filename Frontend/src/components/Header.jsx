'use client';

import { Fragment, useState, useEffect } from 'react';
import { Disclosure, Menu, Transition } from '@headlessui/react';
import { MdOutlineCloudDownload } from 'react-icons/md';
import { TbLogout } from 'react-icons/tb';
import { useAuth } from "../AuthContext.jsx";
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Bell } from 'lucide-react'; // Use the Bell icon from lucide-react
import { BASE_URL } from '../config';

const userNavigation = [{ name: 'Sign out', href: './login' }];

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function Header() {
  const [userInfo, setUserInfo] = useState('');
  const [exProductsCount, setExProductsCount] = useState(0);
  const [exDrugsCount, setExDrugsCount] = useState(0);
  const { user, logout, authStatus } = useAuth();

  useEffect(() => {
    // Only fetch data if authenticated
    if (authStatus === 'authenticated') {
      fetchData();
      expiredProduct();
      expiredDrugs();
    }
  }, [authStatus]);

  const handleLogout = () => {
    // Simple logout with redirect
    logout(true);
  };

  const fetchData = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/user/profile`, {
        withCredentials: true,
      });

      if (res.status === 200) {
        setUserInfo(res?.data?.data);
      } else {
        console.error('Failed to fetch user profile', res);
      }
    } catch (error) {
      console.error('Error fetching user profile', error);
    }
  };

  const expiredProduct = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/inventory/product/expire`, {
        withCredentials: true,
      });
      if (res?.data?.length > 0) {
        setExProductsCount(res?.data?.length);
      } else {
        setExProductsCount(0);
      }
    } catch (error) {
      console.error('Error fetching expired products', error);
    }
  };

  const expiredDrugs = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/pharmacy/expire`, {
        withCredentials: true,
      });

      if (res.status === 200 && res?.data?.length > 0) {
        setExDrugsCount(res?.data?.length);
      } else {
        setExDrugsCount(0);
      }
    } catch (error) {
      console.error('Error fetching expired drugs', error);
    }
  };

  const handleBackup = async () => {
    try {
      // Fetch the backup file from the API
      const response = await fetch(`${BASE_URL}/backup/download`, {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch the backup file.');
      }
      // Create a blob from the response
      const blob = await response.blob();

      // Create a download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `mongodb_backup_${Date.now()}.gz`); // Filename
      document.body.appendChild(link);
      link.click();

      // Clean up the link after downloading
      link.remove();
      window.URL.revokeObjectURL(url);

      alert('Backup downloaded successfully!');
    } catch (error) {
      console.error('Error during backup:', error);
      alert('Failed to download backup. Please try again.');
    }
  };

  const totalExpiredCount = exProductsCount + exDrugsCount; // Calculate total
  return (
    <>
      <div className='min-h-full z-30'>
        <Disclosure
          as='nav'
          className='fixed top-0 left-0 right-0 md:left-64 z-30'
        >
          {({ open }) => (
            <>
              <div 
                className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-6 w-full'
                style={{
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(255, 255, 255, 0.95) 100%)',
                  backdropFilter: 'blur(10px)',
                  boxShadow: '0 4px 20px -2px rgba(37, 99, 235, 0.1)'
                }}
              >
                <div className='flex h-16 items-center justify-end gap-3 sm:mr-10'>
                  <div className='flex items-center gap-3 mr-4'>
                    {/* Backup Button - Visible on all screens */}
                    <button
                      onClick={handleBackup}
                      className='relative flex items-center justify-center w-10 h-10 rounded-full bg-white border shadow-sm text-gray-700 hover:bg-gray-200 active:scale-95 transition transform duration-150'
                      aria-label='Backup data'
                    >
                      <MdOutlineCloudDownload className='text-xl' />
                    </button>

                    {/* Notifications Button - Visible on all screens */}
                    <Link to='/ExpiredProduct'>
                      <button
                        type='button'
                        className='relative flex items-center justify-center w-10 h-10 rounded-full bg-white border shadow-sm text-gray-700 hover:bg-gray-200 active:scale-95 transition'
                        aria-label='View notifications'
                      >
                        <Bell className='text-lg' aria-hidden='true' />

                        {/* Notification Badge - Admin */}
                        {user?.role === 'admin' && totalExpiredCount > 0 && (
                          <span
                            className='absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full'
                            aria-label={`You have ${totalExpiredCount} expired items`}
                          >
                            {totalExpiredCount > 99 ? '99+' : totalExpiredCount}
                          </span>
                        )}

                        {/* Notification Badge - Pharmacist */}
                        {user?.role === 'pharmacist' && exDrugsCount > 0 && (
                          <span
                            className='absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full'
                            aria-label={`You have ${exDrugsCount} expired drugs`}
                          >
                            {exDrugsCount > 99 ? '99+' : exDrugsCount}
                          </span>
                        )}
                      </button>
                    </Link>

                    {/* Logout Button - Visible on all screens */}
                    <Menu as='div' className='relative'>
                      <div>
                        <Menu.Button
                          className='relative flex items-center justify-center w-10 h-10 rounded-full bg-white border shadow-sm text-gray-700 hover:bg-gray-200 active:scale-95 transition'
                          aria-label='Logout menu'
                        >
                          <TbLogout className='text-xl' />
                        </Menu.Button>
                      </div>
                      <Transition
                        as={Fragment}
                        enter='transition ease-out duration-100'
                        enterFrom='transform opacity-0 scale-95'
                        enterTo='transform opacity-100 scale-100'
                        leave='transition ease-in duration-75'
                        leaveFrom='transform opacity-100 scale-100'
                        leaveTo='transform opacity-0 scale-95'
                      >
                        <Menu.Items className='absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none'>
                          {userNavigation.map((item) => (
                            <Menu.Item key={item.name}>
                              {({ active }) => (
                                <Link
                                  to={item.href}
                                  className={classNames(
                                    active ? 'bg-gray-100' : '',
                                    'block px-4 py-2 text-sm text-gray-700'
                                  )}
                                  onClick={(e) => {
                                    e.preventDefault(); // Prevent default navigation
                                    handleLogout();
                                  }}
                                >
                                  {item.name}
                                </Link>
                              )}
                            </Menu.Item>
                          ))}
                        </Menu.Items>
                      </Transition>
                    </Menu>
                  </div>
                </div>
              </div>
            </>
          )}
        </Disclosure>
      </div>
    </>
  );
}
