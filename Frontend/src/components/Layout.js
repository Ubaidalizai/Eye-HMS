import React from "react";
import { Outlet } from "react-router-dom";
import Header from "./Header";
import SideMenu from "./SideMenu";

function Layout() {
  return (
    <>
      <div className='bg-white shadow-md'>
        <Header />
      </div>
      <div className='grid grid-cols-12 bg-gray-100 min-h-screen'>
        <div className='col-span-2 h-full sticky top-0 hidden lg:flex bg-white shadow-lg border-r border-gray-200'>
          <SideMenu />
        </div>
        <main className='col-span-12 lg:col-span-10 p-6 lg:p-8'>
          <div className='bg-white rounded-lg shadow-md p-6'>
            <Outlet />
          </div>
        </main>
      </div>
    </>
  );
}

export default Layout;
