import React from "react";
import { Outlet } from "react-router-dom";
import Header from "./Header";
import SideMenu from "./SideMenu";

function Layout() {
  return (
    <>
<<<<<<< HEAD
      <div className="md:h-16 bg-white shadow-md">
        <Header />
      </div>
      <div className="grid grid-cols-12 bg-gray-100 min-h-screen">
        <div className="col-span-2 h-full sticky top-0 hidden lg:flex">
          <SideMenu />
        </div>
        <main className="col-span-12 lg:col-span-10 p-4">
          <Outlet />
        </main>
=======
      <div className="md:h-16">
        <Header />
      </div>
      <div className="grid grid-cols-12 bg-gray-100 items-baseline">
        <div className="col-span-2 h-screen sticky top-0 hidden lg:flex">
          <SideMenu />
        </div>
        <Outlet />
>>>>>>> origin/master
      </div>
    </>
  );
}

export default Layout;
