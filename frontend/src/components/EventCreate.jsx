import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from 'api/axios';
import { toast } from 'react-toastify';

const EventCreate = () => {
  const [formData, setFormData] = useState({
    purpose: '',
    startDate: '',
    endDate: '',
    location: '',
    startTime: '',
    endTime: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [createdEventInfo, setCreatedEventInfo] = useState(null);
  const navigate = useNavigate();

  const { purpose, startDate, endDate, location, startTime, endTime } = formData;

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!purpose) {
      return toast.error('Event Name/Purpose is required.');
    }
    setIsLoading(true);
    try {
      // Use the custom api instance to automatically send the auth token.
      const response = await api.post('/events', { purpose, startDate, endDate, location, startTime, endTime });
      toast.success('Event created successfully!');
      setCreatedEventInfo(response.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create event. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (createdEventInfo) {
    return (
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md text-center">
        <h2 className="text-2xl font-bold text-green-600 mb-4">Event Created!</h2>
        <p className="text-gray-700 mb-2">Your event has been created successfully.</p>

        <div className="mt-6 text-left bg-gray-50 p-4 rounded-lg">
          <div className="mb-4">
            <label className="block text-gray-700 font-bold mb-1">Event Code:</label>
            <p className="text-2xl font-mono bg-gray-200 p-2 rounded text-center">{createdEventInfo.eventCode}</p>
            <p className="text-sm text-gray-500 mt-1">Share this code with users for manual registration.</p>
          </div>
          <div>
            <label className="block text-gray-700 font-bold mb-1">Shareable Registration Link:</label>
            <input
              type="text"
              readOnly
              value={createdEventInfo.registrationLink}
              className="w-full p-2 border rounded bg-gray-200"
              onFocus={(e) => e.target.select()}
            />
            <button
              onClick={() => {
                navigator.clipboard.writeText(createdEventInfo.registrationLink);
                toast.info('Link copied to clipboard!');
              }}
              className="mt-2 text-sm text-blue-500 hover:underline"
            >
              Copy Link
            </button>
          </div>
        </div>
        <Link to="/admin" className="mt-8 inline-block btn-primary">Back to Dashboard</Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Create New Event</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="purpose" className="block text-gray-700 font-bold mb-2">
            Event Name / Purpose
          </label>
          <input
            type="text"
            id="purpose"
            name="purpose"
            value={purpose}
            onChange={onChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
            disabled={isLoading}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label htmlFor="startDate" className="block text-gray-700 font-bold mb-2">
              Start Date
            </label>
            <input
              type="date"
              id="startDate"
              name="startDate"
              value={startDate}
              onChange={onChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              disabled={isLoading}
            />
          </div>
          <div>
            <label htmlFor="endDate" className="block text-gray-700 font-bold mb-2">
              End Date (optional)
            </label>
            <input
              type="date"
              id="endDate"
              name="endDate"
              value={endDate}
              onChange={onChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              disabled={isLoading}
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label htmlFor="startTime" className="block text-gray-700 font-bold mb-2">
              Start Time
            </label>
            <input
              type="time"
              id="startTime"
              name="startTime"
              value={startTime}
              onChange={onChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              disabled={isLoading}
            />
          </div>
          <div>
            <label htmlFor="endTime" className="block text-gray-700 font-bold mb-2">
              End Time
            </label>
            <input type="time" id="endTime" name="endTime" value={endTime} onChange={onChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" disabled={isLoading} />
          </div>
        </div>
        <div className="mb-6">
          <label htmlFor="location" className="block text-gray-700 font-bold mb-2">
            Location
          </label>
          <input
            type="text"
            id="location"
            name="location"
            value={location}
            onChange={onChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="e.g., Conference Hall A"
            disabled={isLoading}
          />
        </div>
        <div className="flex items-center justify-between gap-4 mt-8">
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full disabled:bg-blue-300"
            disabled={isLoading}
          >
            {isLoading ? 'Creating...' : 'Create Event'}
          </button>
          <Link to="/admin" className="text-center w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
};

export default EventCreate;