import React, { useEffect, useState } from 'react';
import api from 'api/axios';
import { toast } from 'react-toastify';

const NotificationStatus = () => {
  const [notifications, setNotifications] = useState([]);
  const [error, setError] = useState('');
  const [resendingId, setResendingId] = useState(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        // Use the custom api instance which automatically includes auth headers.
        const response = await api.get('/notifications');
        setNotifications(response.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Error fetching notifications');
      }
    };
    fetchNotifications();
  }, []);

  const handleResend = async (notificationId) => {
    setResendingId(notificationId);
    try {
      const response = await api.post(`/notifications/${notificationId}/resend`);
      // To provide instant feedback, we can refetch or update the state manually.
      // Let's refetch for simplicity and to get the latest data.
      const updatedNotifications = await api.get('/notifications');
      setNotifications(updatedNotifications.data);
      toast.success(response.data.message);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to resend notification.');
    } finally {
      setResendingId(null);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Notification Status</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-2 text-left">User</th>
            <th className="p-2 text-left">Event</th>
            <th className="p-2">Type</th>
            <th className="p-2">Status</th>
            <th className="p-2">Sent At</th>
            <th className="p-2 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {notifications.map((notification) => (
            <tr key={notification.id} className="border-b">
              <td className="p-2">{notification.user_name} ({notification.user_id})</td>
              <td className="p-2">{notification.event_name} ({notification.event_id})</td>
              <td className="p-2">{notification.type}</td>
              <td className="p-2">{notification.status}</td>
              <td className="p-2">{new Date(notification.sent_at).toLocaleString()}</td>
              <td className="p-2">
                {notification.status === 'failed' && (
                  <button
                    onClick={() => handleResend(notification.id)}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-1 px-2 rounded text-xs disabled:bg-yellow-300"
                    disabled={resendingId === notification.id}
                  >
                    {resendingId === notification.id ? 'Resending...' : 'Resend'}
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default NotificationStatus;