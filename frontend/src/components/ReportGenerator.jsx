import React, { useState } from 'react';
import axios from 'axios';

const ReportGenerator = () => {
  const [format, setFormat] = useState('pdf');
  const [eventId, setEventId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleGenerateReport = async (e) => {
    e.preventDefault();
    try {
      // Rely on the global axios instance for auth headers and proxy.
      const response = await axios.get('/api/report/export', {
        params: { format, eventId, startDate, endDate },
        responseType: 'blob' // Handle binary response (PDF/Excel)
      });

      // Create a download link for the file
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `attendance.${format}`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setSuccess(`Report downloaded as ${format.toUpperCase()}`);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Error generating report');
      setSuccess('');
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Generate Attendance Report</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {success && <p className="text-green-500 mb-4">{success}</p>}
      <form onSubmit={handleGenerateReport}>
        <div className="mb-4">
          <label className="block text-gray-700">Report Format</label>
          <select
            value={format}
            onChange={(e) => setFormat(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="pdf">PDF</option>
            <option value="xlsx">Excel</option>
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Event ID (Optional)</label>
          <input
            type="number"
            value={eventId}
            onChange={(e) => setEventId(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Start Date (Optional)</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">End Date (Optional)</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>
        <button
          type="submit"
          className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
        >
          Generate Report
        </button>
      </form>
    </div>
  );
};

export default ReportGenerator;