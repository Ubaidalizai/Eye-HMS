<<<<<<< HEAD

import IncomeReport from './pages/IncomeReport';

=======
>>>>>>> origin/master
import React from "react";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import "./index.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Inventory from "./pages/Inventory";
import NoPageFound from "./pages/NoPageFound";
import AuthContext from "./AuthContext";
import ProtectedWrapper from "./ProtectedWrapper";
import { useEffect, useState } from "react";
import Store from "./pages/Store";
import Sales from "./pages/Sales";
import PurchaseDetails from "./pages/PurchaseDetails";
import Move from "./pages/Move";
import Pharmacy from "./pages/Pharmacy";
import { Provider } from "react-redux";
<<<<<<< HEAD
import ExpenseManagement from "./pages/expence manegement";
import PrescriptionPage from "./pages/PrescriptionPage";
import Patient from "./pages/Patient";

import store from "./redux/store";


const App = () => {
  const [user, setUser] = useState('');
  const [loader, setLoader] = useState(true);
  let myLoginUser = JSON.parse(localStorage.getItem('user'));
=======
import store from "./redux/store";
import Profile from "./pages/Profile";

const App = () => {
  const [user, setUser] = useState("");
  const [loader, setLoader] = useState(true);
  let myLoginUser = JSON.parse(localStorage.getItem("user"));
>>>>>>> origin/master
  // console.log("USER: ",user)

  useEffect(() => {
    if (myLoginUser) {
      setUser(myLoginUser._id);
      setLoader(false);
      // console.log("inside effect", myLoginUser)
    } else {
<<<<<<< HEAD
      setUser('');
=======
      setUser("");
>>>>>>> origin/master
      setLoader(false);
    }
  }, [myLoginUser]);

  const signin = (newUser, callback) => {
    setUser(newUser);
    callback();
  };

  const signout = () => {
    setUser(null);
<<<<<<< HEAD
    localStorage.removeItem('user');
=======
    localStorage.removeItem("user");
>>>>>>> origin/master
  };

  let value = { user, signin, signout };

  if (loader)
    return (
      <div
        style={{
          flex: 1,
<<<<<<< HEAD
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
=======
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
>>>>>>> origin/master
        }}
      >
        <h1>LOADING...</h1>
      </div>
    );

  return (
    <Provider store={store}>
      <AuthContext.Provider value={value}>
        <BrowserRouter>
          <Routes>
<<<<<<< HEAD
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/"
=======
            <Route path='/login' element={<Login />} />
            <Route path='/register' element={<Register />} />
            <Route
              path='/'
>>>>>>> origin/master
              element={
                <ProtectedWrapper>
                  <Layout />
                </ProtectedWrapper>
              }
            >
              <Route index element={<Dashboard />} />
<<<<<<< HEAD
              <Route
                path="/expenceManegement"
                element={<ExpenseManagement />}
              />
              <Route path="/patient" element={<Patient />} />

=======
>>>>>>> origin/master
              <Route path='/inventory' element={<Inventory />} />
              <Route path='/purchase-details' element={<PurchaseDetails />} />
              <Route path='/sales' element={<Sales />} />
              <Route path='/manage-store' element={<Store />} />
              <Route path='/move' element={<Move />} />
<<<<<<< HEAD
              <Route path='/pharmacy' element={<Pharmacy />} />
              <Route path='/incomeReport' element={<IncomeReport />} />
            </Route>
            <Route path="*" element={<NoPageFound />} />
=======
              <Route path='/*' element={<Move />} />
              <Route path='/pharmacy' element={<Pharmacy />} />
              <Route path='/profile' element={<Profile />} />
            </Route>
            <Route path='*' element={<NoPageFound />} />
>>>>>>> origin/master
          </Routes>
        </BrowserRouter>
      </AuthContext.Provider>
    </Provider>
  );
};

export default App;
