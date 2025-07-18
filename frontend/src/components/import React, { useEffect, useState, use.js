import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import api from 'api/axios';
import { toast } from 'react-toastify';

const Dashboard = () => {
  const [events, setEvents] = useState([]);
  const role = localStorage.getItem('role');

  // State for filtering and sorting
  const [filter, setFilter] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'descending' });

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        // Use the custom api instance to automatically send the auth token.
        const response = await api.get('/events');
        setEvents(response.data);
      } catch (err) {
        toast.error(err.response?.data?.message || 'Error fetching events');
      }
    };
    fetchEvents();
  }, []);

  // Memoize the filtering and sorting logic to avoid re-computation on every render
  const filteredAndSortedEvents = useMemo(() => {
    let sortableEvents = [...events];

    // Apply filter
    if (filter) {
      sortableEvents = sortableEvents.filter(event =>
        event.purpose.toLowerCase().includes(filter.toLowerCase())
      );
    }

    // Apply sorting
    if (sortConfig.key !== null) {
      sortableEvents.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }

    return sortableEvents;
  }, [events, filter, sortConfig]);

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (name) => {
    if (sortConfig.key !== name) return null;
    return sortConfig.direction === 'ascending' ? ' ▲' : ' ▼';
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    // Create a dummy date to use toLocaleTimeString for formatting
    const [hours, minutes] = timeString.split(':');
    const date = new Date();
    date.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0);
    // Format to 12-hour time without seconds
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Admin Dashboard</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <Link to="create-event" className="bg-blue-500 text-white p-4 rounded hover:bg-blue-600">
          Create Event
        </Link>
        <Link to="import-users" className="bg-blue-500 text-white p-4 rounded hover:bg-blue-600">
          Import Users
        </Link>
        <Link to="generate-qr" className="bg-blue-500 text-white p-4 rounded hover:bg-blue-600">
          Generate QR Code
        </Link>
        <Link to="scan-qr" className="bg-blue-500 text-white p-4 rounded hover:bg-blue-600">
          Scan QR Code
        </Link>
        <Link to="design-card" className="bg-blue-500 text-white p-4 rounded hover:bg-blue-600">
          Design Card
        </Link>
        <Link to="reports" className="bg-blue-500 text-white p-4 rounded hover:bg-blue-600">
          Generate Report
        </Link>
        {role === 'super_admin' && (
          <Link to="register-admin" className="bg-blue-500 text-white p-4 rounded hover:bg-blue-600">
            Register Admin
          </Link>
        )}
        <Link to="notifications" className="bg-blue-500 text-white p-4 rounded hover:bg-blue-600">
          Notification Status
        </Link>
      </div>

      {/* Events Table */}
      <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-start items-center mb-4">
          <h3 className="text-xl font-bold">Your Events</h3>
          <input
            type="text"
            placeholder="Filter by name..."
            className="shadow-sm appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>
        {filteredAndSortedEvents.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => requestSort('purpose')}>
                    Event Name{getSortIcon('purpose')}
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => requestSort('date')}>
                    Date{getSortIcon('date')}
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => requestSort('location')}>
                    Location{getSortIcon('location')}
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAndSortedEvents.map(event => (
                  <tr key={event.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{event.purpose}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {event.date ? new Date(event.date).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {event.start_time && event.end_time
                        ? `${formatTime(event.start_time)} - ${formatTime(event.end_time)}`
                        : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{event.location || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link to={`/admin/event/${event.id}`} className="text-indigo-600 hover:text-indigo-900">
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : events.length > 0 && filteredAndSortedEvents.length === 0 ? (
          <p className="text-gray-500">No events match your filter.</p>
        ) : (
          <p className="text-gray-500">No events found. Create one to get started!</p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;