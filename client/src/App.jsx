import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Patients from './pages/Patients';
import Appointments from './pages/Appointments';
import IPDManagement from './pages/IPDManagement';
import DoctorConsultation from './pages/DoctorConsultation';
import Pharmacy from './pages/Pharmacy';
import Laboratory from './pages/Laboratory';
import Billing from './pages/Billing';
import UsersManagement from './pages/UsersManagement';
import MyRecords from './pages/MyRecords';
import Login from './pages/Login';
import EmergencyTriage from './pages/EmergencyTriage';
import BloodBank from './pages/BloodBank';
import OperationTheatre from './pages/OperationTheatre';
import NursingStation from './pages/NursingStation';
import NotificationsLog from './pages/NotificationsLog';
import AmbulanceService from './pages/AmbulanceService';
import Telemedicine from './pages/Telemedicine';
import RadiologyViewer from './pages/RadiologyViewer';
import InsuranceClaims from './pages/InsuranceClaims';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading, role } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900 text-white">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <span className="ml-3 font-semibold text-sm">Authenticating CareSync HMS...</span>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={!user ? <Login /> : <Navigate to="/" replace />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="patients" element={<Patients />} />
        <Route path="appointments" element={<Appointments />} />
        <Route path="ipd-beds" element={<IPDManagement />} />
        <Route path="emr-consultation" element={<DoctorConsultation />} />
        <Route path="pharmacy" element={<Pharmacy />} />
        <Route path="laboratory" element={<Laboratory />} />
        <Route path="radiology" element={<RadiologyViewer />} />
        <Route path="billing" element={<Billing />} />
        <Route path="insurance" element={<InsuranceClaims />} />
        <Route path="emergency" element={<EmergencyTriage />} />
        <Route path="ambulance" element={<AmbulanceService />} />
        <Route path="telemedicine" element={<Telemedicine />} />
        <Route path="blood-bank" element={<BloodBank />} />
        <Route path="operation-theatre" element={<OperationTheatre />} />
        <Route path="nursing-station" element={<NursingStation />} />
        <Route path="notifications" element={<NotificationsLog />} />
        <Route path="my-records" element={<MyRecords />} />
        <Route
          path="users"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <UsersManagement />
            </ProtectedRoute>
          }
        />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;

