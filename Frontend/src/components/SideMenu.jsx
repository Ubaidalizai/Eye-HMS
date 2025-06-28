import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import { RoleMenus } from '../roles';
import {
  FaTachometerAlt,
  FaUserShield,
  FaBoxes,
  FaShoppingCart,
  FaChartLine,
  FaUserInjured,
  FaMoneyBillWave,
  FaCoins,
  FaPills,
  FaCalculator,
  FaGlasses,
  FaSitemap,
} from 'react-icons/fa';
import BranchesMenu from "./BranchesMenu.jsx";
import { BASE_URL, IMAGE_BASE_URL } from '../config';

const menuItems = [
  { id: 'dashboard', path: '/', icon: <FaTachometerAlt />, label: 'Dashboard' },
  {
    id: 'admin-panel',
    path: '/Admin-panel',
    icon: <FaUserShield />,
    label: 'Admin Panel',
  },
  {
    id: 'inventory',
    path: '/inventory',
    icon: <FaBoxes />,
    label: 'Inventory',
  },
  {
    id: 'purchase-details',
    path: '/purchase-details',
    icon: <FaShoppingCart />,
    label: 'Purchase',
  },
  { id: 'sales', path: '/sales', icon: <FaChartLine />, label: 'Sales' },
  {
    id: 'patient',
    path: '/patient',
    icon: <FaUserInjured />,
    label: 'Patient',
  },
  {
    id: 'expenses',
    path: '/expenseManagement',
    icon: <FaMoneyBillWave />,
    label: 'Expenses',
  },
  {
    id: 'income',
    path: '/incomeReport',
    icon: <FaCoins />,
    label: 'Income',
  },
  {
    id: 'pharmacy',
    path: '/pharmacy',
    icon: <FaPills />,
    label: 'Pharmacy',
  },
  {
    id: 'doctor-finance',
    path: '/doctor-finance',
    icon: <FaCalculator />,
    label: 'Finance',
  },
  {
    id: 'glasses',
    path: '/glasses',
    icon: <FaGlasses />,
    label: 'Glasses',
  },
  { id: 'branches', path: '', icon: <FaSitemap />, label: 'Branches' }, // Updated with sitemap icon
];

function SideMenu({ onMobileItemClick }) {
  const [userInfo, setUserInfo] = useState({ role: null });
  const location = useLocation();

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

  // Check if a path is active
  const isActive = (path) => {
    if (path === '/' && location.pathname === '/') {
      return true;
    }
    return path !== '/' && location.pathname.startsWith(path);
  };

  // Handle mobile menu item click
  const handleItemClick = () => {
    if (onMobileItemClick) {
      onMobileItemClick();
    }
  };

  return (
    <div className='h-full flex flex-col bg-white w-full relative'>
      {/* Main content area with scrolling */}
      <div className='flex-grow overflow-y-auto pb-16'>
        {' '}
        {/* Add padding at bottom to ensure content doesn't get hidden behind user info */}
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
                  <BranchesMenu
                    key={id}
                    onMobileItemClick={onMobileItemClick}
                  />
                ) : (
                  <Link
                    key={id}
                    to={path}
                    onClick={handleItemClick}
                    className={`flex items-center gap-2 rounded-lg px-4 py-2 transition ${
                      isActive(path)
                        ? 'bg-blue-50 text-blue-600 font-medium'
                        : 'text-gray-500 hover:text-blue-500'
                    }`}
                  >
                    {icon}
                    <span className='text-sm font-medium'>{label}</span>
                  </Link>
                )
              ) : null
            )}
          </nav>
        </div>
      </div>

      {/* User Info at Bottom - Fixed position */}
      <div className='absolute bottom-0 left-0 right-0 border-t border-gray-100 bg-white'>
        <div className='flex justify-start items-end gap-2 py-3 px-4 hover:bg-gray-50'>
          {userInfo?.image && (
            <img
              src={`${IMAGE_BASE_URL}/users/${userInfo.image}`}
              alt={`${userInfo.firstName || ''} ${userInfo.lastName || ''}`}
              className='h-10 w-10 rounded-full object-cover'
            />
          )}
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
