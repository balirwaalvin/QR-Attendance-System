import React, { useState, useEffect } from 'react';
import api from '../api/axios'; // Use the custom axios instance
import { toast } from 'react-toastify';
import { useSearchParams, Link } from 'react-router-dom';

const User = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    eventCode: ''
  });
  const [eventDetails, setEventDetails] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [eventError, setEventError] = useState('');
  const [searchParams] = useSearchParams();
  const [isRegistered, setIsRegistered] = useState(false);

  const eventCodeFromQuery = searchParams.get('eventCode');

  useEffect(() => {
    // Pre-fill eventCode from URL query parameter e.g. /user-register?eventCode=ABC123
    if (eventCodeFromQuery) {
      setFormData((prev) => ({ ...prev, eventCode: eventCodeFromQuery }));
    }
  }, [eventCodeFromQuery]);

  const { name, email, password, eventCode } = formData;

  // Fetch event details when eventCode changes
  useEffect(() => {
    const fetchEventDetails = async () => {
      if (eventCode && eventCode.trim().length >= 6) { // Assuming codes are at least 6 chars
        setEventError('');
        try {
          const response = await api.get(`/events/by-code/${eventCode.trim()}`, { headers: { Authorization: null } });
          setEventDetails(response.data);
        } catch (err) {
          setEventDetails(null);
          setEventError(err.response?.data?.message || 'Invalid Event Code.');
        }
      } else {
        setEventDetails(null);
        setEventError('');
      }
    };

    // Debounce API call to avoid spamming while user is typing
    const timer = setTimeout(() => {
      fetchEventDetails();
    }, 300);

    return () => clearTimeout(timer);
  }, [eventCode]);

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password || !eventCode) {
      return toast.error('Please fill in all fields');
    }
    if (!eventDetails) {
      return toast.error('Please enter a valid event code to continue.');
    }
    setIsSubmitting(true);
    try {
      const res = await api.post(
        '/users/register',
        {
          name,
          email,
          password,
          eventCode
        },
        // Prevent sending stale auth headers on a public route
        { headers: { Authorization: null } }
      );
      toast.success(res.data.message || 'Registration successful! You can now log in.');
      setIsRegistered(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isRegistered) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="p-8 bg-white rounded-lg shadow-md text-center">
          <h2 className="text-2xl font-bold mb-4 text-green-600">Registration Successful!</h2>
          <p className="text-gray-700 mb-6">
            Your account has been created. You can now log in to get your event QR code.
          </p>
          <Link to="/user-login" className="btn-primary">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Event Registration</h2>
        {eventDetails && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-center">
            <p className="text-sm text-gray-600">You are registering for:</p>
            <p className="font-bold text-lg text-blue-800">{eventDetails.purpose}</p>
            {eventDetails.start_date && (
              <p className="text-sm text-gray-500 mt-1">
                {new Date(eventDetails.start_date).toLocaleDateString()}
                {eventDetails.end_date && ` - ${new Date(eventDetails.end_date).toLocaleDateString()}`}
              </p>
            )}
          </div>
        )}
        {eventError && (
          <p className="text-red-500 text-center text-sm mb-4">{eventError}</p>
        )}
        <form onSubmit={onSubmit}>
          <div className="mb-4">
            <label htmlFor="name" className="block text-gray-700 font-bold mb-2">
              Full Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={name}
              onChange={onChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
            disabled={isSubmitting}
            />
          </div>
          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-700 font-bold mb-2">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={onChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
            disabled={isSubmitting}
            />
          </div>
          <div className="mb-4">
            <label htmlFor="password" className="block text-gray-700 font-bold mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={onChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
              disabled={isSubmitting}
            />
          </div>
          <div className="mb-6">
            <label htmlFor="eventCode" className="block text-gray-700 font-bold mb-2">
              Event Code
            </label>
            <input
              type="text"
              id="eventCode"
              name="eventCode"
              value={eventCode}
              onChange={onChange}
            className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${eventCodeFromQuery ? 'bg-gray-200' : ''}`}
              placeholder="Event code from your invitation"
            required
            readOnly={!!eventCodeFromQuery}
            disabled={isSubmitting}
            />
          </div>
          <div className="flex items-center justify-between">
            <button
              type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full disabled:bg-blue-300"
            disabled={isSubmitting || !eventDetails}
            >
            {isSubmitting ? 'Registering...' : 'Register'}
            </button>
          </div>
        </form>
      </div>
      <div className="mt-4 text-center">
        <p className="text-gray-600">
          Are you an admin?{' '}
          <Link to="/admin-login" className="text-blue-500 hover:underline">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default User;