import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { toast } from 'react-toastify';
import { logout } from '../utils/auth';

const UserDashboard = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserEvents = async () => {
      try {
        const response = await api.get('/users/events'); // Assumes this endpoint returns user's events
        setEvents(response.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch events.');
      } finally {
        setLoading(false);
      }
    };
    fetchUserEvents();
  }, []);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully.');
    navigate('/user-login');
  };

  // Split events into attended and upcoming
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const attendedEvents = events.filter(e => e.attended);
  const upcomingEvents = events.filter(e => {
    const eventDate = e.end_date ? new Date(e.end_date) : new Date(e.start_date);
    return eventDate >= today && !e.attended;
  });

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-lg flex flex-col p-6">
        <h2 className="text-2xl font-bold text-blue-600 mb-8">User Dashboard</h2>
        <nav className="flex-1">
          <ul className="space-y-4">
            <li>
              <Link to="#attended" className="text-gray-700 hover:text-blue-600 font-medium">Attended Events</Link>
            </li>
            <li>
              <Link to="#upcoming" className="text-gray-700 hover:text-blue-600 font-medium">Upcoming Events</Link>
            </li>
            <li>
              <Link to="/admin-register" className="text-gray-700 hover:text-blue-600 font-medium">Admin Register</Link>
            </li>
            <li>
              <Link to="/admin-login" className="text-gray-700 hover:text-blue-600 font-medium">Admin Login</Link>
            </li>
          </ul>
        </nav>
        <button onClick={handleLogout} className="mt-8 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded">Logout</button>
      </aside>
      {/* Main Content */}
      <main className="flex-1 p-8">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Welcome!</h1>
        {loading ? (
          <p>Loading events...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Attended Events */}
            <section id="attended">
              <h2 className="text-xl font-semibold mb-4 text-green-700">Attended Events</h2>
              {attendedEvents.length === 0 ? (
                <p className="text-gray-500">No attended events yet.</p>
              ) : (
                <ul className="space-y-4">
                  {attendedEvents.map(event => (
                    <li key={event.id} className="bg-green-50 p-4 rounded shadow">
                      <div className="font-bold text-lg">{event.purpose}</div>
                      <div className="text-gray-600 text-sm">
                        {event.start_date ? new Date(event.start_date).toLocaleDateString() : ''}
                        {event.end_date ? ` - ${new Date(event.end_date).toLocaleDateString()}` : ''}
                      </div>
                      <div className="text-gray-500 text-xs">Location: {event.location || 'N/A'}</div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
            {/* Upcoming Events */}
            <section id="upcoming">
              <h2 className="text-xl font-semibold mb-4 text-blue-700">Upcoming Events</h2>
              {upcomingEvents.length === 0 ? (
                <p className="text-gray-500">No upcoming events.</p>
              ) : (
                <ul className="space-y-4">
                  {upcomingEvents.map(event => (
                    <li key={event.id} className="bg-blue-50 p-4 rounded shadow">
                      <div className="font-bold text-lg">{event.purpose}</div>
                      <div className="text-gray-600 text-sm">
                        {event.start_date ? new Date(event.start_date).toLocaleDateString() : ''}
                        {event.end_date ? ` - ${new Date(event.end_date).toLocaleDateString()}` : ''}
                      </div>
                      <div className="text-gray-500 text-xs">Location: {event.location || 'N/A'}</div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        )}
      </main>
    </div>
  );
};

export default UserDashboard; 