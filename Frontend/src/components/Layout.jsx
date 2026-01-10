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
      <div className='min-h-screen flex'>
        {/* Desktop Sidebar - Always visible on desktop (768px and above) */}
        <aside
          className='hidden md:block md:flex-shrink-0 w-64 bg-white shadow-xl border-r-2 border-gray-300 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100 z-40 fixed left-0 top-0 bottom-0'
          style={{ minHeight: '100vh', maxHeight: '100vh' }}
        >
          <SideMenu />
        </aside>

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
        <div className='flex-1 overflow-y-auto scrollbar-track-gray-200 px-6 py-4 bg-gray-50 min-h-screen relative md:ml-64'>
          <div className='mb-16 pt-0'>
            <Header />
          </div>

          <main className='mt-4'>
            <Outlet />
          </main>
        </div>
      </div>
    </>
  );
}

export default Layout;
