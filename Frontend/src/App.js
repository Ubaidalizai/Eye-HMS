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
import Sales from "./pages/Sales";
import Patient from "./pages/Patient";
import PurchaseDetails from "./pages/PurchaseDetails";
import Move from "./pages/Move";
import { Provider } from "react-redux";
import store from "./redux/store";
import PrescriptionPage from "./pages/PrescriptionPage";
import Bedroom from "./components/Bedroom";
import Ultrasound from "./components/Altrasound";
import Operation from "./components/Operation";
import IncomeReport from "./pages/IncomeReport";
import ExpenseManagement from "./pages/ExpenseManagement";
// import PrescriptionPage from './pages/PrescriptionPage';
// import Patient from './pages/Patient';

import { PrescriptionForm } from "./components/PrescriptionForm";
import { PrescriptionList } from "./components/PrescriptionList";
import { PrescriptionDetail } from "./components/PrescriptionDetail";
import Pharmacy from "./pages/Pharmacy";
import ExpiredProduct from "./pages/ExpiredProduct";
import AdminPanel from "./pages/Admin-panel";
import Laboratory from "./components/Laboratory";
import OCT from "./components/OCT";
import OPD from "./components/OPD";
import Yeglizer from "./components/Yeglizer";
import MoveHistory from "./pages/MoveHistory";
import ForgotPassword from "./pages/ForgotPassword ";
import ResetPassword from "./pages/ResetPassword ";

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
            <Route path='/forgot-password' element={<ForgotPassword />} />
            <Route path='/reset-password' element={<ResetPassword />} />
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
              <Route
                path='patients/:patientId/prescriptions'
                element={<PrescriptionList />}
              />
              <Route
                path='/prescriptions/:patientId'
                element={<PrescriptionForm />}
              />

              <Route
                path='/patients/:patientId/prescriptions/:prescriptionId'
                element={<PrescriptionDetail />}
              />
              <Route
                path='/patients/:patientId/prescriptions/:prescriptionId/edit'
                element={<PrescriptionForm />}
              />
              <Route index element={<Dashboard />} />

              <Route
                path='/expenseManagement'
                element={<ExpenseManagement />}
              />

              <Route path='/patient' element={<Patient />} />

              <Route path='/inventory' element={<Inventory />} />
              <Route path='/purchase-details' element={<PurchaseDetails />} />
              <Route path='/sales' element={<Sales />} />
              <Route path='/move' element={<Move />} />

              <Route path='/patient' element={<Patient />} />
              <Route path='/prescription/:id' element={<PrescriptionPage />} />

              <Route path='/branches/bedroom' element={<Bedroom />} />
              <Route path='/branches/ultrasound' element={<Ultrasound />} />
              <Route path='/branches/operation' element={<Operation />} />
              <Route path='/branches/laboratory' element={<Laboratory />} />
              <Route path='/branches/oct' element={<OCT />} />
              <Route path='/branches/opd' element={<OPD />} />
              <Route path='/pharmacy' element={<Pharmacy />} />
              <Route path='/incomeReport' element={<IncomeReport />} />
              <Route path='/ExpiredProduct' element={<ExpiredProduct />} />
              <Route path='/Admin-panel' element={<AdminPanel />} />
              <Route path='/branches/yeglizer' element={<Yeglizer />} />
              <Route path='/move/history' element={<MoveHistory />} />
            </Route>
            Yeglizer
            <Route path='*' element={<NoPageFound />} />
          </Routes>
        </BrowserRouter>
      </AuthContext.Provider>
    </Provider>
  );
};

export default App;
