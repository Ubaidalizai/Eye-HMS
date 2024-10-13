import IncomeReport from "./pages/IncomeReport";

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
import store from "./redux/store";
import ExpenseManagement from "./pages/ExpenceManegement";
import PrescriptionPage from "./pages/PrescriptionPage";
import Patient from "./pages/Patient";

const App = () => {
  const [user, setUser] = useState("");
  const [loader, setLoader] = useState(true);
  let myLoginUser = JSON.parse(localStorage.getItem("user"));
  // console.log("USER: ",user)

  useEffect(() => {
    if (myLoginUser) {
      setUser(myLoginUser._id);
      setLoader(false);
      // console.log("inside effect", myLoginUser)
    } else {
      setUser("");
      setLoader(false);
    }
  }, [myLoginUser]);

  const signin = (newUser, callback) => {
    setUser(newUser);
    callback();
  };

  const signout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  let value = { user, signin, signout };

  if (loader)
    return (
      <div
        style={{
          flex: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
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
            <Route path='/login' element={<Login />} />
            <Route path='/register' element={<Register />} />
            <Route
              path='/'
              element={
                <ProtectedWrapper>
                  <Layout />
                </ProtectedWrapper>
              }
            >
              <Route index element={<Dashboard />} />
              <Route
                path='/expenceManegement'
                element={<ExpenseManagement />}
              />

              <Route path='/patient' element={<Patient />} />

              <Route path='/inventory' element={<Inventory />} />
              <Route path='/purchase-details' element={<PurchaseDetails />} />
              <Route path='/sales' element={<Sales />} />
              <Route path='/manage-store' element={<Store />} />
              <Route path='/move' element={<Move />} />
              <Route path='/pharmacy' element={<Pharmacy />} />
              <Route path='/incomeReport' element={<IncomeReport />} />
            </Route>
            <Route path='*' element={<NoPageFound />} />
          </Routes>
        </BrowserRouter>
      </AuthContext.Provider>
    </Provider>
  );
};

export default App;
