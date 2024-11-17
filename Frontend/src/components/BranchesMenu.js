import React from "react";
import { Link } from "react-router-dom";
import {
  FaClipboard,
  FaUserMd,
  FaStethoscope,
  FaBed,
  FaFlask,
  FaEye,
  FaEbay,
} from "react-icons/fa";

export default function BranchesMenu({ setActiveComponent }) {
  const branches = [
    {
      name: "Operation",
      path: "/branches/operation",
      icon: <FaUserMd />,
    },
    {
      name: "Ultrasound",
      path: "/branches/ultrasound",
      icon: <FaStethoscope />,
    },
    {
      name: "Bedroom",
      path: "/branches/bedroom",
      icon: <FaBed />,
    },
    {
      name: "Laboratory",
      path: "/branches/laboratory",
      icon: <FaFlask />,
    },
    {
      name: "OCT",
      path: "/branches/oct",
      icon: <FaEye />,
    },
    {
      name: "OPD",
      path: "/branches/opd",
      icon: <FaEbay />,
    },
  ];

  return (
    <details className='group [&_summary::-webkit-details-marker]:hidden'>
      <summary className='flex cursor-pointer items-center justify-between rounded-lg px-4 py-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700'>
        <span className='flex items-center gap-2'>
          <FaClipboard className='text-lg text-gray-500' />
          <span className='text-sm font-medium'>Branches</span>
        </span>
      </summary>

      <div className='space-y-2 pl-4'>
        {branches.map(({ name, path, icon }, index) => (
          <Link
            key={index}
            to={path}
            className='flex items-center gap-3 rounded-lg transition-all duration-300 hover:bg-blue-50 px-4 py-3 text-gray-700 group'
            onClick={() => setActiveComponent(name)}
          >
            <span className='text-lg text-blue-500 group-hover:text-blue-600'>
              {icon}
            </span>
            <span className='text-sm font-semibold group-hover:text-blue-600'>
              {name}
            </span>
            <span className='ml-auto text-xs text-gray-400 group-hover:text-blue-400 transition duration-300'>
              →
            </span>
          </Link>
        ))}
      </div>
    </details>
  );
}
