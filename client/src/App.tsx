import React from 'react';
/* import AdminVisitors ... */
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AnimatePresence } from 'framer-motion';
import { useAuthStore } from './store/authStore';

import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import AdminLogin from './pages/auth/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';

// Layouts
import StudentLayout from './components/StudentLayout';
import AdminLayout from './components/AdminLayout';
import SecurityLayout from './components/SecurityLayout';
import SystemGuard from './components/SystemGuard';
import SocketManager from './components/SocketManager';

// Admin Pages
import Rooms from './pages/admin/Rooms';
import AdminAllocations from './pages/admin/AdminAllocations';
import AdminStudents from './pages/admin/AdminStudents';
import AdminHostels from './pages/admin/AdminHostels';

// Student Pages
import StudentDashboard from './pages/student/StudentDashboard';
import MyRoom from './pages/student/MyRoom';
import RoomSelection from './pages/student/RoomSelection';
import Complaints from './pages/student/Complaints';
import Leave from './pages/student/Leave';
import Profile from './pages/student/Profile';
import Attendance from './pages/student/Attendance';

// Security Pages
import SecurityScanner from './pages/security/SecurityScanner';

import AdminComplaints from './pages/admin/AdminComplaints';
import AdminLeaves from './pages/admin/AdminLeaves';
import AdminSettings from './pages/admin/AdminSettings';
import Visitors from './pages/admin/Visitors';
import AdminMess from './pages/admin/AdminMess';
import Mess from './pages/student/Mess';
import StudentVisitors from './pages/student/Visitors';
import AboutUs from './pages/AboutUs';

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
            <Route path="/admin/login" element={<AdminLogin />} />

            {/* Student Routes */}
            <Route element={<ProtectedRoute allowedRoles={['student']} />}>
              <Route path="/student" element={<SystemGuard><StudentLayout /></SystemGuard>}>
                <Route index element={<Navigate to="/student/dashboard" replace />} />
                <Route path="dashboard" element={<StudentDashboard />} />
                <Route path="profile" element={<Profile />} />
                <Route path="room" element={<MyRoom />} />
                <Route path="selection" element={<RoomSelection />} />
                <Route path="attendance" element={<Attendance />} />
                <Route path="mess" element={<Mess />} />
                <Route path="leave" element={<Leave />} />
                <Route path="visitors" element={<StudentVisitors />} />
                <Route path="complaints" element={<Complaints />} />
                <Route path="about" element={<AboutUs />} />
              </Route>
            </Route>

            {/* Admin Routes */}
            <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="hostels" element={<AdminHostels />} />
                <Route path="students" element={<AdminStudents />} />
                <Route path="rooms" element={<Rooms />} />
                <Route path="allocations" element={<AdminAllocations />} />
                <Route path="mess" element={<AdminMess />} />
                <Route path="leaves" element={<AdminLeaves />} />
                <Route path="visitors" element={<Visitors />} />
                <Route path="complaints" element={<AdminComplaints />} />
                <Route path="scanner" element={<SecurityScanner />} />
                <Route path="settings" element={<AdminSettings />} />
                <Route path="about" element={<AboutUs />} />
              </Route>
            </Route>

            {/* Security Routes */}
            <Route element={<ProtectedRoute allowedRoles={['security', 'admin']} />}>
              <Route path="/security" element={<SecurityLayout />}>
                <Route index element={<Navigate to="/security/scanner" replace />} />
                <Route path="scanner" element={<SecurityScanner />} />
                <Route path="history" element={<SecurityHistory />} />
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
