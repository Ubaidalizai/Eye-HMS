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
      name: 'Yeglizer',
      path: '/branches/yeglizer',
      icon: (
        <LiaHandLizardSolid className='h-4 w-4 transition-colors duration-300 hover:text-blue-500 focus:text-blue-500' />
      ),
    },
  ];

  return (
    <details
      open={isOpen}
      className='group [&_summary::-webkit-details-marker]:hidden'
    >
      <summary
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center cursor-pointer gap-2 rounded-lg px-4 py-2 transition-colors duration-300 ${
          isBranchActive()
            ? 'bg-blue-50 text-blue-600 font-medium'
            : 'text-gray-500 hover:text-blue-500'
        }`}
      >
        <span className='flex items-center justify-center gap-2'>
          <FaSitemap className='text-lg' />
          <span className='text-sm flex font-medium'>
            Branches <IoMdArrowDropdown className='ml-5 text-2xl' />
          </span>
        </span>
      </summary>

      <div className='pl-5'>
        {branches.map(({ name, path, icon }, index) => (
          <Link
            key={index}
            to={path}
            onClick={() => onMobileItemClick && onMobileItemClick()}
            className={`flex items-center gap-1 rounded-lg px-4 py-2 transition-colors duration-300 ${
              isActive(path)
                ? 'bg-blue-50 text-blue-600 font-medium'
                : 'text-gray-500 hover:text-blue-500'
            }`}
          >
            <span className='text-lg'>{icon}</span>
            <span className='text-xs font-semibold'>{name}</span>
            <span className='ml-auto text-xs'>→</span>
          </Link>
        ))}
      </div>
    </details>
  );
}
