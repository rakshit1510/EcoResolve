import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ViewProfile = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;


  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.get(`${BASE_URL}/api/profile/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfile(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch profile');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-6">Loading profile...</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">View Profile</h1>
        <button
          onClick={() => navigate('/staff')}
          className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 cursor-pointer"
        >
          ← Back to Dashboard
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {profile && (
        <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto">
          {/* Profile Image */}
          <div className="flex items-center mb-6">
            <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
              {profile.image ? (
                <img 
                  src={profile.image} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-gray-500 text-2xl">
                  {profile.firstName?.charAt(0)}{profile.lastName?.charAt(0)}
                </span>
              )}
            </div>
            <div className="ml-6">
              <h2 className="text-2xl font-semibold text-gray-900">
                {profile.firstName} {profile.lastName}
              </h2>
              <p className="text-gray-600">{profile.accountType}</p>
            </div>
          </div>

          {/* Profile Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First Name
              </label>
              <div className="bg-gray-50 p-3 rounded border">
                {profile.firstName || 'Not provided'}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Name
              </label>
              <div className="bg-gray-50 p-3 rounded border">
                {profile.lastName || 'Not provided'}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <div className="bg-gray-50 p-3 rounded border">
                {profile.email}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Account Type
              </label>
              <div className="bg-gray-50 p-3 rounded border">
                {profile.accountType}
              </div>
            </div>

            {profile.department && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Department
                </label>
                <div className="bg-gray-50 p-3 rounded border">
                  {profile.department}
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contact Number
              </label>
              <div className="bg-gray-50 p-3 rounded border">
                {profile.contactNumber || 'Not provided'}
              </div>
            </div>

            

            
          </div>

          {profile.about && (
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                About
              </label>
              <div className="bg-gray-50 p-3 rounded border">
                {profile.about}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ViewProfile;