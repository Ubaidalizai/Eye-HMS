import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './redux/store';
import { AuthProvider } from "./AuthContext.jsx";

// Import components
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Layout from "./components/Layout.jsx";
import Inventory from "./pages/Inventory.jsx";
import NoPageFound from "./pages/NoPageFound.jsx";
import ProtectedWrapper from "./ProtectedWrapper.jsx";
import ErrorBoundary from "./components/ErrorBoundary.jsx";
import Sales from "./pages/Sales.jsx";
import Patient from "./pages/Patient.jsx";
import PurchaseDetails from "./pages/PurchaseDetails.jsx";
import Move from "./pages/Move.jsx";
import Bedroom from "./components/Bedroom.jsx";
import Ultrasound from "./components/Altrasound.jsx";
import Operation from "./components/Operation.jsx";
import IncomeReport from "./pages/IncomeReport.jsx";
import ExpenseManagement from "./pages/ExpenseManagement.jsx";
import Pharmacy from "./pages/Pharmacy.jsx";
import Glasses from "./pages/Glasses.jsx";
import ExpiredProduct from "./pages/ExpiredProduct.jsx";
import AdminPanel from "./pages/Admin-panel.jsx";
import Laboratory from "./components/Laboratory.jsx";
import OCT from "./components/OCT.jsx";
import OPD from "./components/OPD.jsx";
import Yeglizer from "./components/Yeglizer.jsx";
import MoveHistory from "./pages/MoveHistory.jsx";
import ForgotPassword from "./pages/ForgotPassword .jsx";
import ResetPassword from "./pages/ResetPassword .jsx";
import DoctorFinance from "./pages/DoctorFinance.jsx";
import Perimetry from "./components/Perimetry.jsx";
import FA from "./components/FA.jsx";
import PRP from "./components/PRP.jsx";

import { Roles } from './roles';
import './index.css';

const App = () => {
  return (
    <ErrorBoundary>
      <Provider store={store}>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path='/forgot-password' element={<ForgotPassword />} />
              <Route
                path='/reset-password/:token'
                element={<ResetPassword />}
              />
              <Route path='/login' element={<Login />} />
              <Route path='/register' element={<Register />} />

              {/* Protected Routes with Layout */}
              <Route
                path='/'
                element={
                  <ProtectedWrapper
                    allowedRoles={[
                      Roles.ADMIN,
                      Roles.PHARMACIST,
                      Roles.RECEPTIONIST,
                      Roles.DOCTOR,
                    ]}
                  >
                    <Layout />
                  </ProtectedWrapper>
                }
              >
                {/* Dashboard - Admin only */}
                <Route
                  index
                  element={
                    <ProtectedWrapper allowedRoles={[Roles.ADMIN]}>
                      <Dashboard />
                    </ProtectedWrapper>
                  }
                />
                <Route
                  path='/patient'
                  element={
                    <ProtectedWrapper
                      allowedRoles={[Roles.ADMIN, Roles.RECEPTIONIST]}
                    >
                      <Patient />
                    </ProtectedWrapper>
                  }
                />
                <Route
                  path='/pharmacy'
                  element={
                    <ProtectedWrapper
                      allowedRoles={[
                        Roles.ADMIN,
                        Roles.PHARMACIST,
                        Roles.RECEPTIONIST,
                      ]}
                    >
                      <Pharmacy />
                    </ProtectedWrapper>
                  }
                />
                <Route
                  path='/glasses'
                  element={
                    <ProtectedWrapper
                      allowedRoles={[Roles.ADMIN, Roles.RECEPTIONIST]}
                    >
                      <Glasses />
                    </ProtectedWrapper>
                  }
                />
                <Route
                  path='/purchase-details'
                  element={
                    <ProtectedWrapper
                      allowedRoles={[Roles.ADMIN, Roles.RECEPTIONIST]}
                    >
                      <PurchaseDetails />
                    </ProtectedWrapper>
                  }
                />

                <Route
                  path='/doctor-finance'
                  element={
                    <ProtectedWrapper
                      allowedRoles={[
                        Roles.DOCTOR,
                        Roles.ADMIN,
                        Roles.RECEPTIONIST,
                      ]}
                    >
                      <DoctorFinance />
                    </ProtectedWrapper>
                  }
                />

                <Route
                  path='/expenseManagement'
                  element={
                    <ProtectedWrapper allowedRoles={[Roles.ADMIN]}>
                      <ExpenseManagement />
                    </ProtectedWrapper>
                  }
                />
                <Route
                  path='/inventory'
                  element={
                    <ProtectedWrapper allowedRoles={[Roles.ADMIN]}>
                      <Inventory />
                    </ProtectedWrapper>
                  }
                />
                <Route
                  path='/sales'
                  element={
                    <ProtectedWrapper
                      allowedRoles={[
                        Roles.ADMIN,
                        Roles.PHARMACIST,
                        Roles.RECEPTIONIST,
                      ]}
                    >
                      <Sales />
                    </ProtectedWrapper>
                  }
                />
                <Route
                  path='/move'
                  element={
                    <ProtectedWrapper allowedRoles={[Roles.ADMIN]}>
                      <Move />
                    </ProtectedWrapper>
                  }
                />
                <Route
                  path='/incomeReport'
                  element={
                    <ProtectedWrapper allowedRoles={[Roles.ADMIN]}>
                      <IncomeReport />
                    </ProtectedWrapper>
                  }
                />
                <Route
                  path='/ExpiredProduct'
                  element={
                    <ProtectedWrapper
                      allowedRoles={[
                        Roles.ADMIN,
                        Roles.PHARMACIST,
                        Roles.RECEPTIONIST,
                      ]}
                    >
                      <ExpiredProduct />
                    </ProtectedWrapper>
                  }
                />
                <Route
                  path='/Admin-panel'
                  element={
                    <ProtectedWrapper allowedRoles={[Roles.ADMIN]}>
                      <AdminPanel />
                    </ProtectedWrapper>
                  }
                />
                <Route
                  path='/move/history'
                  element={
                    <ProtectedWrapper allowedRoles={[Roles.ADMIN]}>
                      <MoveHistory />
                    </ProtectedWrapper>
                  }
                />

                {/* Branches - Role-Based Protection */}
                <Route
                  path='/branches/bedroom'
                  element={
                    <ProtectedWrapper
                      allowedRoles={[Roles.ADMIN, Roles.RECEPTIONIST]}
                    >
                      <Bedroom />
                    </ProtectedWrapper>
                  }
                />
                <Route
                  path='/branches/ultrasound'
                  element={
                    <ProtectedWrapper
                      allowedRoles={[Roles.ADMIN, Roles.RECEPTIONIST]}
                    >
                      <Ultrasound />
                    </ProtectedWrapper>
                  }
                />
                <Route
                  path='/branches/operation'
                  element={
                    <ProtectedWrapper
                      allowedRoles={[Roles.ADMIN, Roles.RECEPTIONIST]}
                    >
                      <Operation />
                    </ProtectedWrapper>
                  }
                />
                <Route
                  path='/branches/laboratory'
                  element={
                    <ProtectedWrapper
                      allowedRoles={[Roles.ADMIN, Roles.RECEPTIONIST]}
                    >
                      <Laboratory />
                    </ProtectedWrapper>
                  }
                />
                <Route
                  path='/branches/oct'
                  element={
                    <ProtectedWrapper
                      allowedRoles={[Roles.ADMIN, Roles.RECEPTIONIST]}
                    >
                      <OCT />
                    </ProtectedWrapper>
                  }
                />
                <Route
                  path='/branches/opd'
                  element={
                    <ProtectedWrapper
                      allowedRoles={[Roles.ADMIN, Roles.RECEPTIONIST]}
                    >
                      <OPD />
                    </ProtectedWrapper>
                  }
                />
                <Route
                  path='/branches/yeglizer'
                  element={
                    <ProtectedWrapper
                      allowedRoles={[Roles.ADMIN, Roles.RECEPTIONIST]}
                    >
                      <Yeglizer />
                    </ProtectedWrapper>
                  }
                />
                <Route
                  path='/branches/perimetry'
                  element={
                    <ProtectedWrapper
                      allowedRoles={[Roles.ADMIN, Roles.RECEPTIONIST]}
                    >
                      <Perimetry />
                    </ProtectedWrapper>
                  }
                />
                <Route
                  path='/branches/FA'
                  element={
                    <ProtectedWrapper
                      allowedRoles={[Roles.ADMIN, Roles.RECEPTIONIST]}
                    >
                      <FA />
                    </ProtectedWrapper>
                  }
                />
                <Route
                  path='/branches/PRP'
                  element={
                    <ProtectedWrapper
                      allowedRoles={[Roles.ADMIN, Roles.RECEPTIONIST]}
                    >
                      <PRP />
                    </ProtectedWrapper>
                  }
                />
              </Route>

              <Route path='*' element={<NoPageFound />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </Provider>
    </ErrorBoundary>
  );
};

export default App;
