import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import SideMenu from './SideMenu';

function Layout() {
  return (
    <div className='h-screen overflow-hidden'>
      <div className='bg-white fixed w-full z-50 top-0 left-0'>
        <Header />
      </div>

      {/* <div className='grid grid-cols-12 mt-20 min-h-screen'>
        <div className='col-span-2 h-screen hidden lg:flex scrollbar-thin bg-white shadow-lg border-r border-gray-200 overflow-y-auto'>
          <SideMenu />
        </div>
        <main className='col-span-12 lg:col-span-10 h-screen overflow-y-auto thumb'>
          <div className='bg-white h-full'>
            <Outlet />
          </div>
        </main>
      </div> */}

      <div className='grid grid-cols-12 mt-20 min-h-screen'>
        <div className='col-span-2 h-screen hidden lg:flex  bg-white shadow-lg border-r border-gray-200 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-500 scrollbar-track-gray-200'>
          <SideMenu />
        </div>
        <main className='col-span-12 lg:col-span-10 h-screen overflow-y-auto scrollbar-thin scrollbar-thumb-gray-500 scrollbar-track-gray-200'>
          <div className='bg-white h-full'>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

export default Layout;
