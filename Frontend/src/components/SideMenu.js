import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { RoleMenus } from '../roles';
import {
  FaClipboard,
  FaFileInvoice,
  FaShoppingBag,
  FaCapsules,
  FaFileMedical,
  FaWarehouse,
  FaUsers,
} from 'react-icons/fa';
import BranchesMenu from './BranchesMenu';
import { BASE_URL } from '../config';

const menuItems = [
  { id: 'dashboard', path: '/', icon: <FaClipboard />, label: 'Dashboard' },
  {
    id: 'admin-panel',
    path: '/Admin-panel',
    icon: <FaUsers />,
    label: 'Admin Panel',
  },
  {
    id: 'inventory',
    path: '/inventory',
    icon: <FaWarehouse />,
    label: 'Inventory',
  },
  {
    id: 'purchase-details',
    path: '/purchase-details',
    icon: <FaFileInvoice />,
    label: 'Purchase',
  },
  { id: 'sales', path: '/sales', icon: <FaShoppingBag />, label: 'Sales' },
  {
    id: 'patient',
    path: '/patient',
    icon: <FaFileMedical />,
    label: 'Patient',
  },
  {
    id: 'expenses',
    path: '/expenseManagement',
    icon: <FaFileInvoice />,
    label: 'Expenses',
  },
  {
    id: 'income',
    path: '/incomeReport',
    icon: <FaFileInvoice />,
    label: 'Income',
  },
  {
    id: 'pharmacy',
    path: '/pharmacy',
    icon: <FaCapsules />,
    label: 'Pharmacy',
  },
  {
    id: 'glasses',
    path: '/glasses',
    icon: <FaCapsules />,
    label: 'Glasses',
  },
  { id: 'branches', path: '', icon: null, label: 'Branches' }, // Placeholder for branches menu
];

function SideMenu() {
  const [userInfo, setUserInfo] = useState({ role: null });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/user/profile`, {
          withCredentials: true,
        });
        if (res.status === 200) {
          setUserInfo(res.data.data);
        } else {
          console.error('Failed to fetch user profile', res);
        }
      } catch (error) {
        console.error('Error fetching user profile', error);
      }
    };
    fetchData();
  }, []);

  // Filter menu items based on the user's role
  const allowedMenus = RoleMenus[userInfo.role] || [];

  return (
    <div className='h-full flex-col justify-between bg-white hidden lg:flex'>
      <div className='px-4 py-6'>
        <div className='flex items-center'>
          <div className='flex justify-center items-center gap-2'>
            <span className='font-semibold text-gray-500 text-xl'>
              Al Sayed Eye HMS
            </span>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav aria-label='Main Nav' className='mt-6 flex flex-col space-y-1'>
          {menuItems.map(({ id, path, icon, label }) =>
            allowedMenus.includes(id) ? (
              id === 'branches' ? (
                <BranchesMenu key={id} />
              ) : (
                <Link
                  key={id}
                  to={path}
                  className='flex items-center gap-2 rounded-lg hover:text-blue-500 px-4 py-2 text-gray-500 transition'
                >
                  {icon}
                  <span className='text-sm font-medium'>{label}</span>
                </Link>
              )
            ) : null
          )}
        </nav>
      </div>

      {/* User Info at Bottom */}
      <div className='sticky inset-x-0 bottom-0 border-t ml-2 border-gray-100'>
        <div className='flex justify-start items-end gap-2 bg-white py-3 hover:bg-gray-50'>
          <img
            src={`http://localhost:4000/public/img/users/${userInfo?.image}`}
            alt={userInfo.firstName + ' ' + userInfo.lastName}
            className='h-10 w-10 rounded-full object-cover'
          />
          <div>
            <p className='text-xs flex flex-col items-start'>
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
