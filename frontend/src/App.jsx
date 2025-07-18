// d:\qr-attendance-system\frontend\src\App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './styles/custom.css'; // Import custom styles

// Assuming these are the locations of your page components
import Home from './pages/Home';
import AdminLogin from './pages/AdminLogin';
import User from './pages/User';
import UserLoginPage from './pages/UserLoginPage';
import AdminRegisterPage from './pages/AdminRegisterPage';
import Admin from './pages/Admin';
import ProtectedRoute from './components/ProtectedRoute';
import UserDashboard from './pages/UserDashboard';

const App = () => {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/admin-register" element={<AdminRegisterPage />} />
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route path="/user-register" element={<User />} />
          <Route path="/user-login" element={<UserLoginPage />} />
          <Route path="/user-dashboard" element={<UserDashboard />} />


          {/* Protected Admin Route */}
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute>
                <Admin />
              </ProtectedRoute>
            }
          />
        </Routes>
        <ToastContainer />
      </div>
    </Router>
  );
};

export default App;
