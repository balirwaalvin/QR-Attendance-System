import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import api from 'api/axios';
import { toast } from 'react-toastify';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import QRCode from 'qrcode';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const [events, setEvents] = useState([]);
  const role = localStorage.getItem('role');
  const [attendanceSummary, setAttendanceSummary] = useState(null);
  const [loadingSummary, setLoadingSummary] = useState(true);

  // State for QR Code Modal
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [selectedEvent, setSelectedEvent] = useState(null);
  // State for filtering and sorting
  const [filter, setFilter] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'start_date', direction: 'descending' });
  const [remindingEventId, setRemindingEventId] = useState(null);

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

    const fetchAttendanceSummary = async () => {
      try {
        // NOTE: This is a hypothetical endpoint. The backend needs to implement this.
        // It should return an object like: { totalRegistered: 150, totalAttended: 120 }
        const response = await api.get('/analytics/attendance-summary');
        setAttendanceSummary(response.data);
      } catch (err) {
        // This error is logged to the console instead of a toast, as the endpoint might not exist yet.
        console.error('Could not fetch attendance summary:', err);
      } finally {
        setLoadingSummary(false);
      }
    };

    fetchEvents();
    fetchAttendanceSummary();
  }, []);

  const handleShowQR = async (event) => {
    setSelectedEvent(event);
    const registrationLink = `${window.location.origin}/user-register?eventCode=${event.event_code}`;
    try {
      // Generate QR code as a data URL
      const url = await QRCode.toDataURL(registrationLink, { width: 300 });
      setQrCodeUrl(url);
      setShowQRModal(true);
    } catch (err) {
      console.error('Failed to generate QR code for modal:', err);
      toast.error('Failed to generate QR code.');
    }
  };

  const handleCopy = (textToCopy, message) => {
    navigator.clipboard.writeText(textToCopy).then(() => {
      toast.info(message);
    }, (err) => {
      toast.error('Failed to copy text.');
      console.error('Could not copy text: ', err);
    });
  };

  const handleRegenerateQR = async (eventId) => {
    if (!window.confirm('Are you sure you want to regenerate the QR code for this event? The old QR code for the registration link will be replaced.')) {
      return;
    }
    try {
      await api.post(`/events/${eventId}/regenerate-qr`);
      toast.success('QR Code regenerated successfully.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to regenerate QR code.');
    }
  };

  const handleDelete = async (eventId) => {
    // Use window.confirm for a simple confirmation dialog
    if (!window.confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      return;
    }

    try {
      await api.delete(`/events/${eventId}`);
      setEvents(prevEvents => prevEvents.filter(event => event.id !== eventId));
      toast.success('Event deleted successfully.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete event.');
    }
  };

  const handleSendReminders = async (eventId) => {
    if (!window.confirm('Are you sure you want to send reminder emails to all registered users who have not yet attended?')) {
      return;
    }
    setRemindingEventId(eventId);
    try {
      const response = await api.post(`/events/${eventId}/send-reminders`);
      toast.success(response.data.message || 'Reminder emails are being sent.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send reminders.');
    } finally {
      setRemindingEventId(null);
    }
  };

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

  const eventStats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize today to midnight for accurate date comparison

    const upcoming = events.filter(event => {
      if (!event.start_date) return false;
      // An event is upcoming if its end date (or start date if no end date) is today or in the future
      const eventDate = event.end_date ? new Date(event.end_date) : new Date(event.start_date);
      return eventDate >= today;
    }).length;

    const completed = events.filter(event => {
      if (!event.start_date) return false;
      // An event is completed if its end date (or start date if no end date) is in the past
      const eventDate = event.end_date ? new Date(event.end_date) : new Date(event.start_date);
      return eventDate < today;
    }).length;

    return {
      total: events.length,
      upcoming,
      completed,
    };
  }, [events]);

  const eventsByMonthChartData = useMemo(() => {
    const monthCounts = Array(12).fill(0); // Initialize counts for 12 months
    const monthLabels = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    events.forEach(event => {
      if (event.start_date) {
        const monthIndex = new Date(event.start_date).getMonth(); // 0-11
        monthCounts[monthIndex]++;
      }
    });

    return {
      labels: monthLabels,
      datasets: [
        {
          label: 'Number of Events',
          data: monthCounts,
          backgroundColor: 'rgba(54, 162, 235, 0.6)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1,
        },
      ],
    };
  }, [events]);

  const attendanceChartData = useMemo(() => {
    if (!attendanceSummary || !attendanceSummary.totalRegistered) {
      return null;
    }

    const { totalAttended, totalRegistered } = attendanceSummary;
    const totalAbsent = totalRegistered - totalAttended;

    return {
      labels: ['Attended', 'Absent'],
      datasets: [
        {
          label: '# of Users',
          data: [totalAttended, totalAbsent],
          backgroundColor: [
            'rgba(75, 192, 192, 0.6)',
            'rgba(255, 99, 132, 0.6)',
          ],
          borderColor: [
            'rgba(75, 192, 192, 1)',
            'rgba(255, 99, 132, 1)',
          ],
          borderWidth: 1,
        },
      ],
    };
  }, [attendanceSummary]);

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Monthly Event Distribution',
        font: {
          size: 18,
        }
      },
    },
    scales: {
      y: { beginAtZero: true, ticks: { stepSize: 1 } }
    }
  };

  const pieChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Overall Attendance Rate',
        font: {
          size: 18,
        }
      },
    },
  };

  const QRModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-xl text-center relative max-w-sm w-full">
        <button
          onClick={() => setShowQRModal(false)}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
          aria-label="Close modal"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <h3 className="text-xl font-bold mb-2">Registration QR Code</h3>
        <p className="mb-4 text-gray-600">For: {selectedEvent?.purpose}</p>
        {qrCodeUrl ? (
          <img src={qrCodeUrl} alt={`QR Code for ${selectedEvent?.purpose}`} className="mx-auto" />
        ) : (
          <p>Generating QR Code...</p>
        )}
        <p className="text-xs text-gray-500 mt-4">Users can scan this to open the registration page.</p>
      </div>
    </div>
  );

  return (
    <div className="p-4">
      {showQRModal && <QRModal />}
      <h2 className="text-2xl font-bold mb-4">Admin Dashboard</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8 font-normal">
        <Link to="create-event" className="bg-blue-500 text-white p-4 rounded-xl hover:bg-blue-600 text-center">
          Create Event
        </Link>
        <Link to="import-users" className="bg-blue-500 text-white p-4 rounded-xl hover:bg-blue-600 text-center">
          Import Users
        </Link>
        <Link to="generate-qr" className="bg-blue-500 text-white p-4 rounded-xl hover:bg-blue-600 text-center">
          Generate QR Code
        </Link>
        <Link to="scan-qr" className="bg-blue-500 text-white p-4 rounded-xl hover:bg-blue-600 text-center">
          Scan QR Code
        </Link>
        <Link to="design-card" className="bg-blue-500 text-white p-4 rounded-xl hover:bg-blue-600 text-center">
          Design Card
        </Link>
        <Link to="reports" className="bg-blue-500 text-white p-4 rounded-xl hover:bg-blue-600 text-center">
          Generate Report
        </Link>
        {role === 'super_admin' && (
          <Link to="register-admin" className="bg-blue-500 text-white p-4 rounded-xl hover:bg-blue-600 text-center">
            Register Admin
          </Link>
        )}
        <Link to="notifications" className="bg-blue-500 text-white p-4 rounded-xl hover:bg-blue-600 text-center">
          Notification Status
        </Link>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md flex items-center">
          <div className="flex-shrink-0 bg-blue-100 text-blue-600 rounded-full p-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div className="ml-4">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Events</h3>
            <p className="mt-1 text-3xl font-semibold text-gray-900">{eventStats.total}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md flex items-center">
          <div className="flex-shrink-0 bg-green-100 text-green-600 rounded-full p-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="ml-4">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Upcoming Events</h3>
            <p className="mt-1 text-3xl font-semibold text-gray-900">{eventStats.upcoming}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md flex items-center">
          <div className="flex-shrink-0 bg-gray-100 text-gray-600 rounded-full p-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="ml-4">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Completed Events</h3>
            <p className="mt-1 text-3xl font-semibold text-gray-900">{eventStats.completed}</p>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        {/* Events per month chart */}
        <div className="bg-white p-6 rounded-lg shadow-md flex items-center justify-center">
          {events.length > 0 ? (
              <Bar options={chartOptions} data={eventsByMonthChartData} />
          ) : (
              <p className="text-gray-500 text-center py-10">No event data to display in chart.</p>
          )}
        </div>

        {/* Attendance Rate Chart */}
        <div className="bg-white p-6 rounded-lg shadow-md flex items-center justify-center">
          {loadingSummary ? (
            <p className="text-gray-500 text-center py-10">Loading attendance data...</p>
          ) : attendanceChartData ? (
            <div className="w-full h-full max-w-xs max-h-xs">
              <Pie options={pieChartOptions} data={attendanceChartData} />
            </div>
          ) : (
            <p className="text-gray-500 text-center py-10">No attendance data available to display.</p>
          )}
        </div>
      </div>

      {/* Events Table */}
      <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">Your Events</h3>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search events..."
              className="shadow-sm appearance-none border rounded w-full py-2 pl-10 pr-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
          </div>
        </div>
        {filteredAndSortedEvents.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => requestSort('purpose')}>
                    Event Name{getSortIcon('purpose')}
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Event Code
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => requestSort('start_date')}>
                    Date(s){getSortIcon('start_date')}
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => requestSort('location')}>
                    Location{getSortIcon('location')}
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAndSortedEvents.map(event => (
                  <tr key={event.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{event.purpose}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <span className="font-mono">{event.event_code || 'N/A'}</span>
                        {event.event_code && (
                          <button
                            onClick={() => handleCopy(event.event_code, 'Event code copied!')}
                            className="text-gray-400 hover:text-blue-600"
                            title="Copy event code"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {event.start_date ? new Date(event.start_date).toLocaleDateString() : ''}
                      {event.end_date ? ` - ${new Date(event.end_date).toLocaleDateString()}` : ''}
                      {!event.start_date && 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {event.start_time && event.end_time
                        ? `${formatTime(event.start_time)} - ${formatTime(event.end_time)}`
                        : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{event.location || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link to={`/admin/event/${event.id}`} className="text-indigo-600 hover:text-indigo-900" title="View Details">
                        View Details
                      </Link>
                      <Link to={`/admin/event/${event.id}/edit`} className="text-green-600 hover:text-green-900 ml-4" title="Edit Event">
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(event.id)}
                        className="text-red-600 hover:text-red-900 ml-4"
                        title="Delete Event"
                      >
                        Delete
                      </button>
                      {event.event_code && (
                        <button
                          onClick={() => handleShowQR(event)}
                          className="text-gray-600 hover:text-gray-900 ml-4"
                          title="Show Registration QR Code"
                        >
                          Show QR
                        </button>
                      )}
                      {event.event_code && (
                        <button
                          onClick={() => {
                            const registrationLink = `${window.location.origin}/user-register?eventCode=${event.event_code}`;
                            handleCopy(registrationLink, 'Registration link copied!');
                          }}
                          className="text-blue-600 hover:text-blue-900 ml-4"
                          title="Copy Registration Link"
                        >
                          Copy Link
                        </button>
                      )}
                      {event.event_code && (
                        <button
                          onClick={() => handleRegenerateQR(event.id)}
                          className="text-purple-600 hover:text-purple-900 ml-4"
                          title="Regenerate Registration QR Code"
                        >
                          Regen QR
                        </button>
                      )}
                      {event.event_code && (
                        <button
                          onClick={() => handleSendReminders(event.id)}
                          className="text-teal-600 hover:text-teal-900 ml-4 disabled:text-gray-400"
                          title="Send Reminders to non-attendees"
                          disabled={remindingEventId === event.id}
                        >
                          {remindingEventId === event.id ? 'Sending...' : 'Remind'}
                        </button>
                      )}
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