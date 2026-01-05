import React, { useState, useEffect } from 'react';
import { LiaHandLizardSolid } from 'react-icons/lia';
import { GiDoctorFace } from 'react-icons/gi';
import { Link, useLocation } from 'react-router-dom';
import {
  FaSitemap,
  FaUserMd,
  FaStethoscope,
  FaBed,
  FaFlask,
  FaEye,
  FaSearchPlus,
  FaTint,
  FaBurn,
} from 'react-icons/fa';
import { IoMdArrowDropdown } from 'react-icons/io';

export default function BranchesMenu({ onMobileItemClick }) {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  // Check if current path is a branch path
  const isBranchActive = () => {
    return location.pathname.startsWith('/branches/');
  };

  // Check if specific branch is active
  const isActive = (path) => {
    return location.pathname.startsWith(path);
  };

  // Auto-open the branches menu if we're on a branch page
  useEffect(() => {
    if (isBranchActive()) {
      setIsOpen(true);
    }
  }, [location.pathname]);

  const branches = [
    {
      name: 'Operation',
      path: '/branches/operation',
      icon: <FaUserMd className='h-4 w-4' />,
    },
    {
      name: 'B-Scan',
      path: '/branches/ultrasound',
      icon: <FaStethoscope className='h-4 w-4' />,
    },
    {
      name: 'Bedroom',
      path: '/branches/bedroom',
      icon: <FaBed className='h-4 w-4' />,
    },
    {
      name: 'Laboratory',
      path: '/branches/laboratory',
      icon: <FaFlask className='h-4 w-4' />,
    },
    {
      name: 'OCT',
      path: '/branches/oct',
      icon: <FaEye className='h-4 w-4' />,
    },
    {
      name: 'OPD',
      path: '/branches/opd',
      icon: <GiDoctorFace className='h-4 w-4 ' />,
    },
    {
      name: 'Yag Laser',
      path: '/branches/yeglizer',
      icon: (
        <LiaHandLizardSolid className='h-4 w-4 transition-colors duration-300' style={{ color: 'inherit' }} />
      ),
    },
    {
      name: 'Perimetry',
      path: '/branches/perimetry',
      icon: <FaSearchPlus className='h-4 w-4' />,
    },
    {
      name: 'FA',
      path: '/branches/FA',
      icon: <FaTint className='h-4 w-4' />, // Use FaTint here
    },
    {
      name: 'PRP',
      path: '/branches/PRP',
      icon: <FaBurn className='h-4 w-4' />, // Use FaTint here
    },
  ];

  return (
    <details
      open={isOpen}
      className='group [&_summary::-webkit-details-marker]:hidden'
    >
      <summary
        onClick={() => setIsOpen(!isOpen)}
        className={`group flex items-center cursor-pointer gap-3 rounded-xl px-4 py-3 transition-all duration-200 ${
          isBranchActive()
            ? 'text-white shadow-lg'
            : 'text-gray-700 hover:bg-gray-100 hover:shadow-md'
        }`}
        style={isBranchActive() ? {
          background: 'linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)',
          boxShadow: '0 10px 25px -5px rgba(37, 99, 235, 0.3)'
        } : {}}
      >
        <span className={`text-lg transition-colors ${isBranchActive() ? 'text-white' : 'text-gray-500 group-hover:text-blue-600'}`}>
          <FaSitemap />
        </span>
        <span className={`text-sm font-semibold flex items-center gap-2 transition-colors ${isBranchActive() ? 'text-white' : 'text-gray-700 group-hover:text-blue-600'}`}>
          Branches
          <IoMdArrowDropdown className={`text-xl transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </span>
      </summary>

      <div className='pl-6 mt-2 space-y-1'>
        {branches.map(({ name, path, icon }, index) => (
          <Link
            key={index}
            to={path}
            onClick={() => onMobileItemClick && onMobileItemClick()}
            className={`group flex items-center gap-3 rounded-lg px-4 py-2 transition-all duration-200 ${
              isActive(path)
                ? 'text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
            style={isActive(path) ? {
              background: 'linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)',
              boxShadow: '0 4px 15px -3px rgba(37, 99, 235, 0.2)'
            } : {}}
          >
            <span className={`text-base transition-colors ${isActive(path) ? 'text-white' : 'text-gray-500 group-hover:text-blue-600'}`}>
              {icon}
            </span>
            <span className={`text-xs font-semibold transition-colors ${isActive(path) ? 'text-white' : 'text-gray-700 group-hover:text-blue-600'}`}>
              {name}
            </span>
          </Link>
        ))}
      </div>
    </details>
  );
}
