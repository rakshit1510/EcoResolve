import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const TaskAssignment = () => {
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const [formData, setFormData] = useState({
    compliantId: '',
    workers: '',
    resources: [],
    department: '',
    location: '',
    startDate: '',
    endDate: '',
    description: ''
  });

  useEffect(() => {
    fetchAssignments();
    fetchComplaints();
    fetchWorkers();
    fetchResources();
  }, []);

  const fetchAssignments = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.get('/api/assignments', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAssignments(response.data.data || response.data);
    } catch (err) {
      setError('Failed to fetch assignments');
    }
  };

  const fetchComplaints = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.get('/api/complaints/getAllComplaints', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const complaintsData = response.data.data || response.data;
      const openComplaints = complaintsData.filter(c => c.status === 'open');
      setComplaints(openComplaints);
    } catch (err) {
      console.error('Failed to fetch complaints:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchWorkers = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.get('/api/workers?status=Available', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setWorkers(response.data.data || response.data);
    } catch (err) {
      console.error('Failed to fetch workers:', err);
    }
  };

  const fetchResources = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.get('/api/resources?status=Available', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setResources(response.data.data || response.data);
    } catch (err) {
      console.error('Failed to fetch resources:', err);
    }
  };

  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('accessToken');
      await axios.post('/api/assignments', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      resetForm();
      fetchAssignments();
      fetchWorkers();
      fetchResources();
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create assignment');
    }
  };

  const handleComplaintSelect = (complaint) => {
    setSelectedComplaint(complaint);
    setFormData({
      ...formData,
      compliantId: complaint._id,
      department: complaint.department,
      location: complaint.location,
      description: complaint.description
    });
  };

  const resetForm = () => {
    setFormData({
      compliantId: '',
      workers: '',
      resources: [],
      department: '',
      location: '',
      startDate: '',
      endDate: '',
      description: ''
    });
    setSelectedComplaint(null);
    setShowCreateForm(false);
  };

  const handleWorkerSelect = (workerId) => {
    setFormData(prev => ({
      ...prev,
      workers: workerId
    }));
  };

  const handleResourceToggle = (resourceId) => {
    setFormData(prev => ({
      ...prev,
      resources: prev.resources.includes(resourceId)
        ? prev.resources.filter(id => id !== resourceId)
        : [...prev.resources, resourceId]
    }));
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Task Assignment</h1>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 cursor-pointer"
          >
            Create Assignment
          </button>
          <button
            onClick={() => navigate('/staff')}
            className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 cursor-pointer"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Create Assignment Form */}
      {showCreateForm && (
        <div className="bg-white p-6 rounded shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">Create New Assignment</h2>
          
          {/* Step 1: Select Complaint */}
          {!selectedComplaint && (
            <div>
              <h3 className="text-lg font-medium mb-3">Select Complaint *</h3>
              <div className="grid gap-3 max-h-60 overflow-y-auto">
                {complaints.map((complaint) => (
                  <div
                    key={complaint._id}
                    onClick={() => handleComplaintSelect(complaint)}
                    className="border p-3 rounded cursor-pointer hover:bg-gray-50"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{complaint.department}</p>
                        <p className="text-sm text-gray-600">{complaint.location}</p>
                        <p className="text-sm text-gray-500 mt-1">{complaint.description}</p>
                      </div>
                      <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                        {complaint.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Assignment Details */}
          {selectedComplaint && (
            <form onSubmit={handleCreateAssignment} className="space-y-4">
              <div className="bg-gray-50 p-3 rounded">
                <h4 className="font-medium">Selected Complaint:</h4>
                <p className="text-sm">{selectedComplaint.department} - {selectedComplaint.location}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                  required
                  className="border rounded px-3 py-2"
                  placeholder="Start Date *"
                />
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                  required
                  className="border rounded px-3 py-2"
                  placeholder="End Date *"
                />
              </div>

              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Additional Description"
                className="w-full border rounded px-3 py-2 h-20"
              />

              {/* Select Worker */}
              <div>
                <h4 className="font-medium mb-2">Select Worker * (Available: {workers.length})</h4>
                <select
                  value={formData.workers}
                  onChange={(e) => handleWorkerSelect(e.target.value)}
                  required
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="">Select a worker</option>
                  {workers.map((worker) => (
                    <option key={worker._id} value={worker._id}>
                      {worker.name} - {worker.role}
                    </option>
                  ))}
                </select>
              </div>

              {/* Select Resources */}
              <div>
                <h4 className="font-medium mb-2">Select Resources * (Available: {resources.length})</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                  {resources.map((resource) => (
                    <label key={resource._id} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.resources.includes(resource._id)}
                        onChange={() => handleResourceToggle(resource._id)}
                        className="cursor-pointer"
                      />
                      <span className="text-sm">{resource.resourceName} - {resource.category}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={!formData.workers || !formData.resources.length}
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 cursor-pointer disabled:opacity-50"
                >
                  Create Assignment
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Assignments List */}
      <div className="bg-white rounded shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Workers</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Resources</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Duration</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {assignments.map((assignment) => (
                <tr key={assignment._id}>
                  <td className="px-6 py-4 whitespace-nowrap">{assignment.department}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{assignment.location}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm">
                      {assignment.workers?.name || 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm">
                      {assignment.resources?.map(r => r.resourceName).join(', ')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      assignment.status === 'Active' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {assignment.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {new Date(assignment.startDate).toLocaleDateString()} - {new Date(assignment.endDate).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {assignments.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No assignments found
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskAssignment;
