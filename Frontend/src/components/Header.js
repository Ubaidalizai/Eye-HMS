import { Fragment, useContext, useState, useEffect } from 'react';
import { Disclosure, Menu, Transition } from '@headlessui/react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { MdOutlineCloudDownload } from 'react-icons/md';
import AuthContext from '../AuthContext';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Bell } from 'lucide-react'; // Use the Bell icon from lucide-react
import { BASE_URL } from '../config';

const navigation = [
  { name: 'Dashboard', href: '/', current: true },
  { name: 'Inventory', href: '/inventory', current: false },
  { name: 'Purchase Details', href: '/purchase-details', current: false },
  { name: 'Sales', href: '/Sales', current: false },
];

const userNavigation = [{ name: 'Sign out', href: './login' }];

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function Header() {
  const [userInfo, setUserInfo] = useState('');
  const [exProductsCount, setExProductsCount] = useState(0);
  const [exDrugsCount, setExDrugsCount] = useState(0);
  const authContext = useContext(AuthContext);
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    fetchData();
    expiredProduct();
    expiredDrugs();
  }, []);

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

      if (res.status === 200 && res.data.length > 0) {
        setExProductsCount(res.data.length);
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

      if (res.status === 200 && res.data.length > 0) {
        setExDrugsCount(res.data.length);
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
      <div className='min-h-full'>
        <Disclosure as='nav' className='fixed top-0 w-4/5 z-10   bg-white'>
          {({ open }) => (
            <>
              <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
                <div className='flex h-16 items-center justify-end'>
                  <div className='flex items-center gap-2'>
                    <button
                      onClick={handleBackup}
                      className='text-gray-300 active:scale-95 transition transform duration-150'
                    >
                      <MdOutlineCloudDownload className='inline-block  font-bold text-gray-600 mr-2n text-2xl' />
                    </button>
                    <div className='hidden md:block'>
                      <div className='ml-4 flex items-center md:ml-6 gap-5'>
                        <Link to='/ExpiredProduct'>
                          <button
                            type='button'
                            className='relative rounded-full text-gray-500 p-2  font-bold hover:bg-gray-200 focus:outline-none'
                            aria-label='View notifications'
                          >
                            <Bell
                              className='font-bold text-gray-600'
                              aria-hidden='true'
                            />

                            {/* Conditional Rendering Based on Role */}
                            {user?.role === 'admin' &&
                              totalExpiredCount > 0 && (
                                <span
                                  className='absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full'
                                  aria-label={`You have ${totalExpiredCount} expired items`}
                                >
                                  {totalExpiredCount > 99
                                    ? '99+'
                                    : totalExpiredCount}
                                </span>
                              )}

                            {user?.role === 'pharmacist' &&
                              exDrugsCount > 0 && (
                                <span
                                  className='absolute top-0 right-6 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full'
                                  aria-label={`You have ${exDrugsCount} expired drugs`}
                                >
                                  {exDrugsCount > 99 ? '99+' : exDrugsCount}
                                </span>
                              )}
                          </button>
                        </Link>

                        {/* Profile dropdown */}
                        <Menu as='div' className='relative ml-3'>
                          <div>
                            <Menu.Button className='flex max-w-xs items-center rounded-full b text-sm focus:outline-none focus:ring-2'>
                              <span className='sr-only'>Open user menu</span>
                              <img
                                className='h-8 w-8 rounded-full'
                                src={`http://localhost:4000/public/img/users/${userInfo.image}`}
                                alt='profile'
                              />
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
                                    >
                                      <span
                                        onClick={() => authContext.signout()}
                                      >
                                        {item.name}{' '}
                                      </span>
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
                </div>
              </div>
            </>
          )}
        </Disclosure>
      </div>
    </>
  );
}
