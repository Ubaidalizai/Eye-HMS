import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import SideMenu from './SideMenu';

function Layout() {
  return (
    <>
      <div className='mb-16'>
        <Header />
      </div>

      <div className='grid grid-cols-12  min-h-screen'>
        <div
          className='col-span-2 sticky top-0 hidden lg:flex bg-white shadow-lg border-r border-gray-200 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-track-gray-200'
          style={{ maxHeight: '90vh' }}
        >
          <SideMenu />
        </div>

        <main
          className='col-span-12 scrollbar-thin lg:col-span-10   overflow-y-auto  scrollbar-track-gray-200 px-6 py-4'
          style={{ maxHeight: '100vh' }}
        >
          {/* <div className='bg-white'> */}
          <Outlet />
          {/* </div> */}
        </main>
      </div>
    </>
  );
}

export default Layout;
