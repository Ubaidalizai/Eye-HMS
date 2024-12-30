import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
  FaUserMd,
  FaStethoscope,
  FaBed,
  FaClipboard,
  FaStore,
  FaFileInvoice,
  FaShoppingBag,
  FaCapsules,
  FaFileMedical,
  FaWarehouse,
  FaUsers,
} from 'react-icons/fa';
import BranchesMenu from './BranchesMenu';

function SideMenu({ setActiveComponent }) {
  const [userInfo, setUserInfo] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(
          'http://localhost:4000/api/v1/user/profile',
          { withCredentials: true }
        );

        if (res.status === 200) {
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
    <div className='h-full flex-col justify-between bg-white hidden lg:flex'>
      <div className='px-4 py-6'>
        <div className='flex items-center'>
          <div className='flex-shrink-0'>
            <div className='flex justify-center items-center gap-2'>
              <span className='font-bold text-xl italic underline'>
                Al Sayed Eye HMS
              </span>
            </div>
          </div>
        </div>
        <nav aria-label='Main Nav' className='mt-6 flex flex-col space-y-1'>
          <Link
            to='/'
            className='flex items-center gap-2 rounded-lg hover:bg-gray-100 px-4 py-2 text-gray-700'
          >
            <FaClipboard className='text-lg text-gray-500' />
            <span className='text-sm font-medium'>Dashboard</span>
          </Link>

          <Link
            to='/Admin-panel'
            className='flex items-center gap-2 rounded-lg hover:bg-gray-100 px-4 py-2 text-gray-700'
          >
            <FaUsers className='text-lg text-gray-500' />
            <span className='text-sm font-medium'>Admain Panel</span>
          </Link>

          <Link
            to='/inventory'
            className='flex items-center gap-2 rounded-lg hover:bg-gray-100 px-4 py-2 text-gray-500'
          >
            <FaWarehouse className='text-lg text-gray-500' />
            <span className='text-sm font-medium'>Inventory</span>
          </Link>

          <Link
            to='/purchase-details'
            className='flex items-center gap-2 rounded-lg hover:bg-gray-100 px-4 py-2 text-gray-500'
          >
            <FaFileInvoice className='text-lg text-gray-500' />
            <span className='text-sm font-medium'>Purchase Details</span>
          </Link>

          <Link
            to='/sales'
            className='flex items-center gap-2 rounded-lg hover:bg-gray-100 px-4 py-2 text-gray-500'
          >
            <FaShoppingBag className='text-lg text-gray-500' />
            <span className='text-sm font-medium'>Sales</span>
          </Link>

          <Link
            to='/patient'
            className='flex items-center gap-2 rounded-lg hover:bg-gray-100 px-4 py-2 text-gray-500'
          >
            <FaFileMedical className='text-lg text-gray-500' />
            <span className='text-sm font-medium'>Patient</span>
          </Link>

          {/* <Link
            to='/move'
            className='flex items-center gap-2 rounded-lg hover:bg-gray-100 px-4 py-2 text-gray-500'
          >
            <FaUserMd className='text-lg text-gray-500' />
            <span className='text-sm font-medium'>Move</span>
          </Link> */}

          <Link
            to='/expenseManagement'
            className='flex items-center gap-2 rounded-lg px-4 py-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700'
          >
            <FaFileInvoice className='text-lg text-gray-500' />
            <span className='text-sm font-medium'>Expenses</span>
          </Link>

          <Link
            to='/incomeReport'
            className='flex items-center gap-2 rounded-lg px-4 py-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700'
          >
            <FaFileInvoice className='text-lg text-gray-500' />
            <span className='text-sm font-medium'>Income</span>
          </Link>

          <Link
            to='/pharmacy'
            className='flex items-center gap-2 rounded-lg px-4 py-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700'
          >
            <FaCapsules className='text-lg text-gray-500' />
            <span className='text-sm font-medium'>Pharmacy</span>
          </Link>

          {/* <Link
            to='/manage-store'
            className='flex items-center gap-2 rounded-lg hover:bg-gray-100 px-4 py-2 text-gray-500'
          >
            <FaStore className='text-lg text-gray-500' />
            <span className='text-sm font-medium'>Manage Store</span>
          </Link> */}

          <BranchesMenu />
        </nav>
      </div>

      <div className='sticky inset-x-0 bottom-0  border-t border-gray-100'>
        <div className='flex justify-start items-end  gap-2 bg-white py-3 text-center hover:bg-gray-50'>
          <FaUserMd className='h-10 w-10 text-gray-500' />
          <div>
            <p className='text-xs'>
              <strong className='block font-medium'>
                {userInfo.firstName} {userInfo.lastName}
              </strong>
              <span>{userInfo.email}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SideMenu;
