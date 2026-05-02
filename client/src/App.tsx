import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AnimatePresence } from 'framer-motion';
import { useAuthStore } from './store/authStore';

import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import AdminLogin from './pages/auth/AdminLogin';
import ProtectedRoute from './components/ProtectedRoute';

// Layouts
import StudentLayout from './components/StudentLayout';
import SecurityLayout from './components/SecurityLayout';
import SystemGuard from './components/SystemGuard';
import SocketManager from './components/SocketManager';

// Admin Pages (Shared)
import Students from './pages/admin/Students';
import AdminComplaints from './pages/admin/Complaints';
import Visitors from './pages/admin/Visitors';
import AuditLogs from './pages/admin/AuditLogs';

// Chief Warden Pages
import Stats from './pages/chief-warden/Stats';
import ChiefWardenServices from './pages/chief-warden/Services';
import Rooms from './pages/chief-warden/Rooms';
import Allocations from './pages/chief-warden/Allocations';
import Fees from './pages/chief-warden/Fees';
import Mess from './pages/chief-warden/Mess';
import Leaves from './pages/chief-warden/Leaves';
import Hostels from './pages/chief-warden/Hostels';
import Settings from './pages/chief-warden/Settings';
import WardenManagement from './pages/chief-warden/WardenManagement';

// Student Pages
import StudentDashboard from './pages/student/StudentDashboard';
import StudentServices from './pages/student/Services';
import MyRoom from './pages/student/MyRoom';
import RoomSelection from './pages/student/RoomSelection';
import StudentComplaints from './pages/student/Complaints';
import Leave from './pages/student/Leave';
import Profile from './pages/student/Profile';
import StudentAttendance from './pages/student/Attendance';

// Warden Pages
import WardenAttendance from './pages/warden/Attendance';
import WardenLayout from './components/WardenLayout';

// Security Pages
import SecurityScanner from './pages/security/SecurityScanner';
import ParcelManagement from './pages/security/ParcelManagement';

import StudentMess from './pages/student/Mess';
import StudentFees from './pages/student/StudentFees';
import StudentParcels from './pages/student/StudentParcels';
import StudentVisitors from './pages/student/Visitors';
import LaundryManagement from './pages/student/LaundryManagement';
import LostFound from './pages/student/LostFound';
import AboutUs from './pages/AboutUs';
import PaymentProcessing from './pages/payment/PaymentProcessing';
import PaymentSimulator from './pages/student/PaymentSimulator';


// Security Placeholder
const SecurityHistory = () => <div className="p-6">Scan History & Audit Logs</div>;


const queryClient = new QueryClient();

function App() {
  const { checkAuth } = useAuthStore();

  React.useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <SocketManager />
        <AnimatePresence mode='wait'>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/admin/login" element={<AdminLogin />} />

            {/* Student Routes */}
            <Route element={<ProtectedRoute allowedRoles={['student']} />}>
              <Route path="/student" element={<SystemGuard><StudentLayout /></SystemGuard>}>
                <Route index element={<Navigate to="/student/dashboard" replace />} />
                <Route path="dashboard" element={<StudentDashboard />} />
                <Route path="services" element={<StudentServices />} />
                <Route path="profile" element={<Profile />} />
                <Route path="room" element={<MyRoom />} />
                <Route path="selection" element={<RoomSelection />} />
                <Route path="attendance" element={<StudentAttendance />} />
                <Route path="laundry" element={<LaundryManagement />} />
                <Route path="lost-found" element={<LostFound />} />
                <Route path="mess" element={<StudentMess />} />
                <Route path="fees" element={<StudentFees />} />
                <Route path="payment-simulator" element={<PaymentSimulator />} />

                <Route path="leave" element={<Leave />} />

                <Route path="visitors" element={<StudentVisitors />} />
                <Route path="parcels" element={<StudentParcels />} />
                <Route path="complaints" element={<StudentComplaints />} />
                <Route path="about" element={<AboutUs />} />
              </Route>
            </Route>

            {/* Payment Processing Route */}
            <Route element={<ProtectedRoute allowedRoles={['student']} />}>
              <Route path="/payment-processing" element={<PaymentProcessing />} />
            </Route>


            {/* Warden Routes */}
            <Route element={<ProtectedRoute allowedRoles={['warden', 'chief_warden', 'admin']} />}>
              <Route path="/warden" element={<WardenLayout />}>
                <Route index element={<Navigate to="/warden/attendance" replace />} />
                <Route path="attendance" element={<WardenAttendance />} />
                <Route path="students" element={<Students />} />
                <Route path="parcels" element={<ParcelManagement />} />
                <Route path="complaints" element={<AdminComplaints />} />
                <Route path="visitors" element={<Visitors />} />
                <Route path="audit-logs" element={<AuditLogs />} />
              </Route>
            </Route>

            {/* Chief Warden Routes */}
            <Route element={<ProtectedRoute allowedRoles={['chief_warden', 'admin']} />}>
              <Route path="/chief-warden" element={<WardenLayout />}>
                <Route index element={<Navigate to="/chief-warden/stats" replace />} />
                <Route path="stats" element={<Stats />} />
                <Route path="services" element={<ChiefWardenServices />} />
                <Route path="rooms" element={<Rooms />} />
                <Route path="allocations" element={<Allocations />} />
                <Route path="students" element={<Students />} />
                <Route path="fees" element={<Fees />} />
                <Route path="mess" element={<Mess />} />
                <Route path="complaints" element={<AdminComplaints />} />
                <Route path="leaves" element={<Leaves />} />
                <Route path="visitors" element={<Visitors />} />
                <Route path="wardens" element={<WardenManagement />} />
                <Route path="audit-logs" element={<AuditLogs />} />
                <Route path="hostels" element={<Hostels />} />
                <Route path="settings" element={<Settings />} />
              </Route>
            </Route>

            {/* Security Routes (Legacy/Staff) */}
            <Route element={<ProtectedRoute allowedRoles={['security', 'admin']} />}>
              <Route path="/security" element={<SecurityLayout />}>
                <Route index element={<Navigate to="/security/scanner" replace />} />
                <Route path="scanner" element={<SecurityScanner />} />
                <Route path="history" element={<SecurityHistory />} />
                <Route path="parcels" element={<ParcelManagement />} />
              </Route>
            </Route>


            {/* Root Redirect */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </AnimatePresence>
        <Toaster position="top-right" reverseOrder={false} />
      </Router>
    </QueryClientProvider>
  );
}

export default App;
