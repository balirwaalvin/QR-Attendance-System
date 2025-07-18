import React, { useState, useRef } from 'react';
import axios from 'axios';

const UserImport = () => {
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const fileInputRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file');
      return;
    }
    const formData = new FormData();
    formData.append('file', file);
    try {
      // Rely on the global axios instance for auth headers and proxy.
      // Axios sets the 'Content-Type' header automatically for FormData.
      await axios.post('/api/user/import', formData);
      setSuccess('Users imported successfully');
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = null; // Clear the file input on success
      }
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Error importing users');
      setSuccess('');
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Import Users</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {success && <p className="text-green-500 mb-4">{success}</p>}
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700">Upload CSV/Excel</label>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
            className="w-full p-2 border rounded"
          />
        </div>
        <button type="submit" className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
          Import Users
        </button>
      </form>
    </div>
  );
};

export default UserImport;
