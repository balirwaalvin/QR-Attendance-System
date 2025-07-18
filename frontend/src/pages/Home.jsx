import React from 'react';
import { Link } from 'react-router-dom';
// Make sure you have a logo file at this path or update the import.
import logo from '../assets/logo.png';

const Home = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <div className="text-center">
        {logo && (
          <img
            src={logo}
            alt="QR Code Attendance System Logo"
            className="w-32 h-32 mx-auto mb-6"
          />
        )}
        <h1 className="text-4xl font-bold mb-4">QR Code Attendance System</h1>
        <p className="text-lg mb-8">Manage events, track attendance, and generate reports with ease.</p>
        <div className="flex justify-center gap-4">
          <Link
            to="/admin-login"
            className="btn-primary"
          >
            Admin Login
          </Link>
          <Link
            to="/user-register"
            className="btn-secondary"
          >
            Event Register
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;