import React from 'react';
import { LiaHandLizardSolid } from 'react-icons/lia';
import { GiDoctorFace } from 'react-icons/gi';
import { Link } from 'react-router-dom';
import {
  FaClipboard,
  FaUserMd,
  FaStethoscope,
  FaBed,
  FaFlask,
  FaEye,
} from 'react-icons/fa';
import { IoMdArrowDropdown } from 'react-icons/io';

export default function BranchesMenu() {
  const branches = [
    {
      name: 'Operation',
      path: '/branches/operation',
      icon: <FaUserMd className='h-4 w-4' />,
    },
    {
      name: 'Ultrasound',
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
      name: 'Yezliger',
      path: '/branches/yeglizer',
      icon: (
        <LiaHandLizardSolid className='h-4 w-4 transition-colors duration-300 hover:text-blue-500 focus:text-blue-500' />
      ),
    },
  ];

  return (
    <details className='group [&_summary::-webkit-details-marker]:hidden'>
      <summary className='flex items-center cursor-pointer gap-2 rounded-lg transition-colors duration-300 hover:text-blue-500 focus:text-blue-500 px-4 py-2 text-gray-500 '>
        <span className='flex items-center  justify-center gap-2'>
          <FaClipboard className='text-lg' />
          <span className='text-sm flex  font-medium '>
            Branches <IoMdArrowDropdown className='ml-5 text-2xl ' />
          </span>
        </span>
      </summary>

      <div className='pl-5'>
        {branches.map(({ name, path, icon }, index) => (
          <Link
            key={index}
            to={path}
            className='flex  items-center gap-1 rounded-lg px-4 py-2 text-gray-700 group'
          >
            <span className='text-lg text-gray-500'>{icon}</span>
            <span className='text-xs font-semibold text-gray-500'>{name}</span>
            <span className='ml-auto text-xs text-gray-500'>→</span>
          </Link>
        ))}
      </div>
    </details>
  );
}
