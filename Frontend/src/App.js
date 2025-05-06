import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './redux/store';
import { AuthProvider } from './AuthContext';

// Import components
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Layout from './components/Layout';
import Inventory from './pages/Inventory';
import NoPageFound from './pages/NoPageFound';
import ProtectedWrapper from './ProtectedWrapper';
import Sales from './pages/Sales';
import Patient from './pages/Patient';
import PurchaseDetails from './pages/PurchaseDetails';
import Move from './pages/Move';
import Bedroom from './components/Bedroom';
import Ultrasound from './components/Altrasound';
import Operation from './components/Operation';
import IncomeReport from './pages/IncomeReport';
import ExpenseManagement from './pages/ExpenseManagement';
import Pharmacy from './pages/Pharmacy';
import Glasses from './pages/Glasses';
import ExpiredProduct from './pages/ExpiredProduct';
import AdminPanel from './pages/Admin-panel';
import Laboratory from './components/Laboratory';
import OCT from './components/OCT';
import OPD from './components/OPD';
import Yeglizer from './components/Yeglizer';
import MoveHistory from './pages/MoveHistory';
import ForgotPassword from './pages/ForgotPassword ';
import ResetPassword from './pages/ResetPassword ';

import { Roles } from './roles';
// Import styles
import './index.css';

const App = () => {
  return (
    <Provider store={store}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path='/forgot-password' element={<ForgotPassword />} />
            <Route path='/reset-password/:token' element={<ResetPassword />} />
            <Route path='/login' element={<Login />} />
            <Route path='/register' element={<Register />} />

            {/* Protected Routes */}
            <Route
              path='/'
              element={
                <ProtectedWrapper
                  allowedRoles={[
                    Roles.ADMIN,
                    Roles.PHARMACIST,
                    Roles.RECEPTIONIST,
                  ]}
                >
                  <Layout />
                </ProtectedWrapper>
              }
            >
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
            </Route>

            <Route path='*' element={<NoPageFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </Provider>
  );
};

export default App;
