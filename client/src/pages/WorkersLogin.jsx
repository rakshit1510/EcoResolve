import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const WorkersLogin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    loginId: '',
    loginPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [assignmentData, setAssignmentData] = useState(null);
  const [otpForm, setOtpForm] = useState({
    otp: ''
  });
  const [showOtpForm, setShowOtpForm] = useState(false);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleOtpChange = (e) => {
    setOtpForm({
      ...otpForm,
      [e.target.name]: e.target.value
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post('http://localhost:8000/api/assignments/assignment-login', formData);
      setAssignmentData(response.data.data);
      setShowOtpForm(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResolveAssignment = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await axios.post('http://localhost:8000/api/assignments/resolve-assignment', {
        assignmentId: assignmentData.id,
        otp: otpForm.otp
      });
      
      alert('Assignment resolved successfully! Citizen has been notified.');
      setAssignmentData(null);
      setShowOtpForm(false);
      setFormData({ loginId: '', loginPassword: '' });
      setOtpForm({ otp: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resolve assignment');
    } finally {
      setLoading(false);
    }
  };

  const handleRejectComplaint = async () => {
    if (!confirm('Are you sure you want to reject this complaint as false?')) return;
    
    try {
      await axios.patch(`http://localhost:8000/api/assignments/reject/${assignmentData.compliantId._id}`);
      alert('Complaint rejected successfully. Citizen has been warned.');
      setAssignmentData(null);
      setShowOtpForm(false);
      setFormData({ loginId: '', loginPassword: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reject complaint');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white shadow-2xl rounded-2xl p-8">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-extrabold text-gray-900">Worker Portal</h1>
          <p className="text-gray-600 mt-2">Access your assignment details</p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {!assignmentData ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Login ID
              </label>
              <input
                type="text"
                name="loginId"
                value={formData.loginId}
                onChange={handleInputChange}
                required
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your login ID"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                name="loginPassword"
                value={formData.loginPassword}
                onChange={handleInputChange}
                required
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        ) : (
          <div className="space-y-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h2 className="text-lg font-semibold text-blue-900 mb-3">Assignment Details</h2>
              <div className="space-y-2 text-sm">
                <p><span className="font-medium">Department:</span> {assignmentData.department}</p>
                <p><span className="font-medium">Location:</span> {assignmentData.location}</p>
                <p><span className="font-medium">Description:</span> {assignmentData.description}</p>
                <p><span className="font-medium">Start Date:</span> {new Date(assignmentData.startDate).toLocaleDateString()}</p>
                <p><span className="font-medium">End Date:</span> {new Date(assignmentData.endDate).toLocaleDateString()}</p>
                <p><span className="font-medium">Status:</span> 
                  <span className="ml-1 px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                    {assignmentData.status}
                  </span>
                </p>
              </div>
            </div>

            {assignmentData.workers && assignmentData.workers.length > 0 && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">Assigned Workers</h3>
                {assignmentData.workers.map((worker, index) => (
                  <div key={index} className="text-sm text-gray-700">
                    {worker.name} - {worker.role} ({worker.department})
                  </div>
                ))}
              </div>
            )}

            {assignmentData.resources && assignmentData.resources.length > 0 && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">Assigned Resources</h3>
                {assignmentData.resources.map((resource, index) => (
                  <div key={index} className="text-sm text-gray-700">
                    {resource.resourceName} - {resource.category}
                  </div>
                ))}
              </div>
            )}

            {showOtpForm && (
              <form onSubmit={handleResolveAssignment} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Enter OTP from Citizen
                  </label>
                  <input
                    type="text"
                    name="otp"
                    value={otpForm.otp}
                    onChange={handleOtpChange}
                    required
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500"
                    placeholder="Enter 6-digit OTP"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 cursor-pointer"
                  >
                    {loading ? 'Resolving...' : 'Mark as Resolved'}
                  </button>
                  <button
                    type="button"
                    onClick={handleRejectComplaint}
                    className="flex-1 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 cursor-pointer"
                  >
                    Reject as False
                  </button>
                </div>
              </form>
            )}

            {!showOtpForm && (
              <button
                onClick={() => setShowOtpForm(true)}
                className="w-full py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 cursor-pointer"
              >
                Complete Assignment
              </button>
            )}
          </div>
        )}

        <div className="mt-6 text-center">
          <button
            onClick={() => navigate('/')}
            className="text-blue-600 hover:text-blue-800 text-sm cursor-pointer"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default WorkersLogin;