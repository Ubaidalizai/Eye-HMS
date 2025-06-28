import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Header from "./Header.jsx";
import SideMenu from "./SideMenu.jsx";
import { FaBars, FaTimes } from 'react-icons/fa';

function Layout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <>
      <div className='grid grid-cols-12 min-h-screen'>
        {/* Desktop Sidebar */}
        <div
          className='fixed top-0 left-0 h-full hidden lg:block bg-white shadow-lg border-r border-gray-200 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-track-gray-200 z-40'
          style={{
            width: '16.666667%',
          }} /* This is equivalent to col-span-2 in a 12-column grid */
        >
          <SideMenu />
        </div>

        {/* Mobile Menu Toggle Button */}
        <button
          onClick={toggleMobileMenu}
          className='fixed top-3 left-3 z-50 lg:hidden bg-white p-2 rounded-full shadow-md text-gray-700 flex items-center justify-center w-10 h-10'
          aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
        >
          {mobileMenuOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
        </button>

        {/* Mobile Sidebar - Overlay */}
        {mobileMenuOpen && (
          <div
            className='fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden'
            onClick={closeMobileMenu}
          />
        )}

        {/* Mobile Sidebar - Content */}
        <div
          className={`fixed inset-y-0 left-0 z-40 w-64 bg-white transform transition-transform duration-300 ease-in-out lg:hidden ${
            mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          } overflow-y-auto`}
        >
          <SideMenu onMobileItemClick={closeMobileMenu} />
        </div>

        {/* Main Content */}
        <div
          className='col-span-12 lg:ml-[16.666667%] overflow-y-auto scrollbar-track-gray-200 px-6 py-4'
          style={{ maxHeight: '100vh' }}
        >
          <div className='mb-16'>
            <Header />
          </div>

          <main>
            <Outlet />
          </main>
        </div>
      </div>
    </>
  );
}

export default Layout;
