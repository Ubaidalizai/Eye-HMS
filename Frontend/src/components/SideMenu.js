import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

function SideMenu() {
  const [userInfo, setUserInfo] = useState('');

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

  const MenuItem = ({ to, imgSrc, label }) => (
    <Link
      to={to}
      className="flex items-center gap-2 rounded-lg px-4 py-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
    >
      <img alt={label} src={imgSrc} />
      <span className="text-sm font-medium">{label}</span>
    </Link>
  );

  return (
    <div className="h-full flex-col justify-between bg-white hidden lg:flex">
      <div className="px-4 py-6">
        <nav aria-label="Main Nav" className="mt-6 flex flex-col space-y-1">
          <MenuItem
            to="/"
            imgSrc={require('../assets/dashboard-icon.png')}
            label="Dashboard"
          />

          <details className="group [&_summary::-webkit-details-marker]:hidden">
            <summary className="flex cursor-pointer items-center justify-between rounded-lg px-4 py-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700">
              <MenuItem
                to="/inventory"
                imgSrc={require('../assets/inventory-icon.png')}
                label="Inventory"
              />
            </summary>
          </details>

          <MenuItem
            to="/purchase-details"
            imgSrc={require('../assets/supplier-icon.png')}
            label="Purchase Details"
          />
          <MenuItem
            to="/sales"
            imgSrc={require('../assets/supplier-icon.png')}
            label="Sales"
          />
          <MenuItem
            to="/move"
            imgSrc={require('../assets/supplier-icon.png')}
            label="Move"
          />
          <MenuItem
            to="/patient"
            imgSrc={require('../assets/supplier-icon.png')}
            label="Patient"
          />

          <Link
            to="/expenseManagement"
            className="flex items-center gap-2 rounded-lg px-4 py-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
          >
            <img alt="sale-icon" src={require('../assets/supplier-icon.png')} />
            <span className="text-sm font-medium"> Expenses</span>
          </Link>
          {/* --------------------------------------- */}

          {/* --------------------------------------- */}
          <Link
            imgSrc={require('../assets/supplier-icon.png')}
            label="Patient"
          />
          <MenuItem
            to="/pharmacy"
            imgSrc={require('../assets/supplier-icon.png')}
            label="Pharmacy"
          />
          <MenuItem
            to="/incomeReport"
            imgSrc={require('../assets/supplier-icon.png')}
            label="Income"
          />

          <details className="group [&_summary::-webkit-details-marker]:hidden">
            <summary className="flex cursor-pointer items-center justify-between rounded-lg px-4 py-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700">
              <MenuItem
                to="/manage-store"
                imgSrc={require('../assets/order-icon.png')}
                label="Manage Store"
              />
            </summary>
          </details>
        </nav>
      </div>

      <div className="sticky inset-x-0 bottom-0 border-t border-gray-100">
        <div className="flex items-center gap-2 bg-white p-4 hover:bg-gray-50">
          <img
            alt="Profile"
            src={`http://localhost:4000/public/img/users/${userInfo.imageUrl}`}
            className="h-10 w-10 rounded-full object-cover"
          />

          <div>
            <p className="text-xs">
              <strong className="block font-medium">
                {userInfo.firstName + ' ' + userInfo.lastName}
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
