import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ComplaintManagement = () => {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [filters, setFilters] = useState({ status: '', department: '' });
  
  const statusOptions = ['open', 'in-progress', 'resolved', 'rejected'];
  const departmentOptions = [
    'Public Works Department (PWD)',
    'Sanitation Department',
    'Water Supply Department',
    'Electricity Department',
    'Parks & Environment Department'
  ];

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.get('http://localhost:8000/api/complaints/getAllComplaints', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setComplaints(response.data.data || response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch complaints');
    } finally {
      setLoading(false);
    }
  };

  const updateComplaintStatus = async (complaintId, newStatus) => {
    try {
      const token = localStorage.getItem('accessToken');
      await axios.patch(`http://localhost:8000/api/complaints/changeProgressStatus/${complaintId}/status`, 
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Update local state
      setComplaints(complaints.map(complaint => 
        complaint._id === complaintId 
          ? { ...complaint, status: newStatus, resolvedAt: newStatus === 'resolved' ? new Date() : null }
          : complaint
      ));
      
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update status');
    }
  };

  const handleViewDetails = (complaint) => {
    setSelectedComplaint(complaint);
    setShowModal(true);
  };

  const closeModal = () => {
    setSelectedComplaint(null);
    setShowModal(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredComplaints = complaints.filter(complaint => {
    return (!filters.status || complaint.status === filters.status) &&
           (!filters.department || complaint.department === filters.department);
  });

  if (loading) return <div className="p-6">Loading complaints...</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Complaint Management</h1>
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-600">
            Total: {filteredComplaints.length} complaints
          </div>
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

      {/* Filters */}
      <div className="bg-white p-4 rounded shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <select
            value={filters.status}
            onChange={(e) => setFilters({...filters, status: e.target.value})}
            className="border rounded px-3 py-2 cursor-pointer"
          >
            <option value="">All Status</option>
            {statusOptions.map(status => (
              <option key={status} value={status}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </option>
            ))}
          </select>
          
          <select
            value={filters.department}
            onChange={(e) => setFilters({...filters, department: e.target.value})}
            className="border rounded px-3 py-2 cursor-pointer"
          >
            <option value="">All Departments</option>
            {departmentOptions.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
          
          <button
            onClick={() => setFilters({ status: '', department: '' })}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 cursor-pointer"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Complaints Table */}
      <div className="bg-white rounded shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Citizen</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredComplaints.map((complaint) => (
                <tr key={complaint._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="font-medium">
                        {complaint.userId?.firstName} {complaint.userId?.lastName}
                      </div>
                      <div className="text-sm text-gray-500">{complaint.userId?.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{complaint.department}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{complaint.location}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(complaint.status)}`}>
                      {complaint.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(complaint.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleViewDetails(complaint)}
                        className="text-blue-600 hover:text-blue-800 cursor-pointer"
                      >
                        View
                      </button>
                      {complaint.status !== 'resolved' && complaint.status !== 'rejected' && (
                        <select
                          value={complaint.status}
                          onChange={(e) => updateComplaintStatus(complaint._id, e.target.value)}
                          className="text-xs border rounded px-2 py-1 cursor-pointer"
                        >
                          {statusOptions.map(status => (
                            <option key={status} value={status}>
                              {status.charAt(0).toUpperCase() + status.slice(1)}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredComplaints.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No complaints found
          </div>
        )}
      </div>

      {/* Complaint Details Modal */}
      {showModal && selectedComplaint && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Complaint Details</h2>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700 text-2xl cursor-pointer"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Citizen</label>
                  <p className="text-gray-900">
                    {selectedComplaint.userId?.firstName} {selectedComplaint.userId?.lastName}
                  </p>
                  <p className="text-sm text-gray-600">{selectedComplaint.userId?.email}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <span className={`px-3 py-1 text-sm rounded-full ${getStatusColor(selectedComplaint.status)}`}>
                    {selectedComplaint.status}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <p className="text-gray-900">{selectedComplaint.department}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <p className="text-gray-900">{selectedComplaint.location}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <p className="text-gray-900 bg-gray-50 p-3 rounded">{selectedComplaint.description}</p>
              </div>

              {selectedComplaint.imageUrl && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Image</label>
                  <img 
                    src={selectedComplaint.imageUrl} 
                    alt="Complaint" 
                    className="w-full max-w-md h-auto rounded border"
                  />
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Created At</label>
                  <p className="text-gray-900">{new Date(selectedComplaint.createdAt).toLocaleString()}</p>
                </div>
                
                {selectedComplaint.resolvedAt && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Resolved At</label>
                    <p className="text-gray-900">{new Date(selectedComplaint.resolvedAt).toLocaleString()}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              {selectedComplaint.status !== 'resolved' && selectedComplaint.status !== 'rejected' && (
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      updateComplaintStatus(selectedComplaint._id, 'in-progress');
                      closeModal();
                    }}
                    className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700 cursor-pointer"
                  >
                    Mark In Progress
                  </button>
                  <button
                    onClick={() => {
                      updateComplaintStatus(selectedComplaint._id, 'resolved');
                      closeModal();
                    }}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 cursor-pointer"
                  >
                    Mark Resolved
                  </button>
                  <button
                    onClick={() => {
                      updateComplaintStatus(selectedComplaint._id, 'rejected');
                      closeModal();
                    }}
                    className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 cursor-pointer"
                  >
                    Reject
                  </button>
                </div>
              )}
              <button
                onClick={closeModal}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComplaintManagement;
