import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { logout } from '../utils/auth';

const Header = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Use the centralized logout function
    logout();
    toast.success('You have been logged out successfully.');
    navigate('/admin-login');
  };

  return (
    <header className="bg-blue-500 text-white p-4 flex justify-between items-center shadow-md">
      <Link to="/admin" className="text-2xl font-bold">Admin Portal</Link>
      <div className="flex items-center gap-4">
        <Link to="/admin/profile" className="hover:underline">Profile</Link>
        <button onClick={handleLogout} className="btn-secondary">
          Logout
        </button>
      </div>
    </header>
  );
};

export default Header;
