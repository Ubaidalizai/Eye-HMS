import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import axios from "axios";
import { RoleMenus } from "../roles";
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
} from "react-icons/fa";
import BranchesMenu from "./BranchesMenu.jsx";
import { BASE_URL, IMAGE_BASE_URL } from "../config";

const menuItems = [
  { id: "dashboard", path: "/", icon: <FaTachometerAlt />, label: "Dashboard" },
  {
    id: "admin-panel",
    path: "/Admin-panel",
    icon: <FaUserShield />,
    label: "Admin Panel",
  },
  {
    id: "inventory",
    path: "/inventory",
    icon: <FaBoxes />,
    label: "Inventory",
  },
  {
    id: "purchase-details",
    path: "/purchase-details",
    icon: <FaShoppingCart />,
    label: "Purchase",
  },
  { id: "sales", path: "/sales", icon: <FaChartLine />, label: "Sales" },
  {
    id: "patient",
    path: "/patient",
    icon: <FaUserInjured />,
    label: "Patient",
  },
  {
    id: "expenses",
    path: "/expenseManagement",
    icon: <FaMoneyBillWave />,
    label: "Expenses",
  },
  {
    id: "income",
    path: "/incomeReport",
    icon: <FaCoins />,
    label: "Income",
  },
  {
    id: "pharmacy",
    path: "/pharmacy",
    icon: <FaPills />,
    label: "Pharmacy",
  },
  {
    id: "doctor-finance",
    path: "/doctor-finance",
    icon: <FaCalculator />,
    label: "Finance",
  },
  {
    id: "glasses",
    path: "/glasses",
    icon: <FaGlasses />,
    label: "Glasses",
  },
  { id: "branches", path: "", icon: <FaSitemap />, label: "Branches" }, // Updated with sitemap icon
];

function SideMenu({ onMobileItemClick }) {
  const [userInfo, setUserInfo] = useState({ role: null });
  const location = useLocation();

  // TEMPORARY: Disable authentication for demo
  const DISABLE_AUTH = true;

  useEffect(() => {
    // If auth is disabled, set mock admin user immediately
    if (DISABLE_AUTH) {
      setUserInfo({
        role: 'admin',
        firstName: 'Demo',
        lastName: 'Admin',
        email: 'admin@demo.com'
      });
      return;
    }

    const fetchData = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/user/profile`, {
          withCredentials: true,
        });
        if (res.status === 200) {
          setUserInfo(res.data.data);
        } else {
          console.error("Failed to fetch user profile", res);
        }
      } catch (error) {
        console.error("Error fetching user profile", error);
      }
    };
    fetchData();
  }, []);

  // Filter menu items based on the user's role
  // When auth is disabled, show all menus (admin has access to everything)
  const allowedMenus = DISABLE_AUTH 
    ? menuItems.map(item => item.id) 
    : (RoleMenus[userInfo.role] || []);

  // Check if a path is active
  const isActive = (path) => {
    if (path === "/" && location.pathname === "/") {
      return true;
    }
    return path !== "/" && location.pathname.startsWith(path);
  };

  // Handle mobile menu item click
  const handleItemClick = () => {
    if (onMobileItemClick) {
      onMobileItemClick();
    }
  };

  return (
    <div className='h-full flex flex-col bg-white w-full relative shadow-xl border-r border-gray-200'>
      {/* Main content area with scrolling */}
      <div className='flex-grow overflow-y-auto pb-20 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent'>
        {/* Add padding at bottom to ensure content doesn't get hidden behind user info */}
        <div className='px-5 py-8'>
          {/* Logo/Title Section */}
          <div className='flex items-center mb-8'>
            <div className='flex justify-center items-center gap-2 w-full'>
              <div className='bg-gradient-to-br from-blue-600 to-indigo-600 p-2 rounded-lg shadow-md'>
                <FaGlasses className='text-white text-lg' />
              </div>
              <span className='font-bold text-gray-900 text-lg tracking-tight'>
                Eye-Hospital MIS
              </span>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav aria-label='Main Nav' className='flex flex-col space-y-2'>
            {menuItems.map(({ id, path, icon, label }) =>
              allowedMenus.includes(id) ? (
                id === "branches" ? (
                  <BranchesMenu
                    key={id}
                    onMobileItemClick={onMobileItemClick}
                  />
                ) : (
                  <Link
                    key={id}
                    to={path}
                    onClick={handleItemClick}
                    className={`group flex items-center gap-3 rounded-xl px-4 py-3 transition-all duration-200 ${
                      isActive(path)
                        ? "text-white shadow-lg transform scale-[1.02]"
                        : "text-gray-800 hover:bg-gray-50 hover:shadow-md border border-transparent hover:border-gray-200"
                    }`}
                    style={
                      isActive(path)
                        ? {
                            background:
                              "linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)",
                            boxShadow:
                              "0 10px 25px -5px rgba(37, 99, 235, 0.3)",
                          }
                        : {}
                    }
                  >
                    <span
                      className={`text-lg transition-colors ${
                        isActive(path)
                          ? "text-white"
                          : "text-gray-600 group-hover:text-blue-600"
                      }`}
                    >
                      {icon}
                    </span>
                    <span
                      className={`text-sm font-semibold transition-colors ${
                        isActive(path)
                          ? "text-white"
                          : "text-gray-800 group-hover:text-blue-600"
                      }`}
                    >
                      {label}
                    </span>
                  </Link>
                )
              ) : null
            )}
          </nav>
        </div>
      </div>

      {/* User Info at Bottom - Fixed position */}
      <div className='absolute bottom-0 left-0 right-0 border-t border-gray-300 bg-white shadow-lg'>
        <div className='flex justify-start items-center gap-3 py-4 px-5 hover:bg-gray-50 transition-colors cursor-pointer rounded-t-lg'>
          {userInfo?.image ? (
            <img
              src={`${IMAGE_BASE_URL}/users/${userInfo.image}`}
              alt={`${userInfo.firstName || ""} ${userInfo.lastName || ""}`}
              className='h-12 w-12 rounded-full object-cover ring-2 ring-gray-300 shadow-md'
            />
          ) : (
            <div className='h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-md'>
              {userInfo?.firstName?.[0] || "D"}
            </div>
          )}
          <div className='flex-1 min-w-0'>
            <p className='text-sm flex flex-col items-start'>
              <strong className='block font-semibold text-gray-900 truncate w-full'>
                {userInfo?.firstName || 'Demo'} {userInfo?.lastName || 'Admin'}
              </strong>
              <span className='text-xs text-gray-600 truncate w-full'>
                {userInfo?.email || 'admin@demo.com'}
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SideMenu;
