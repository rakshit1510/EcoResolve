import React, { useState, useEffect } from 'react';
import axios from 'axios';

const WorkersManagement = () => {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingWorker, setEditingWorker] = useState(null);
  const [filters, setFilters] = useState({ status: '', department: '' });
  const [userDepartment, setUserDepartment] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department: '',
    role: '',
    skills: '',
    status: 'Available'
  });

  useEffect(() => {
    fetchUserProfile();
    fetchWorkers();
  }, [filters]);

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.get('/api/profile/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Profile response:', response.data);
      const department = response.data.data.department;
      console.log('User department:', department);
      setUserDepartment(department);
    } catch (err) {
      console.error('Failed to fetch user profile:', err);
      // Fallback: try to get department from user data in localStorage
      try {
        const userData = JSON.parse(localStorage.getItem('user') || '{}');
        if (userData.department) {
          setUserDepartment(userData.department);
          console.log('Using department from localStorage:', userData.department);
        }
      } catch (fallbackErr) {
        console.error('Fallback failed:', fallbackErr);
      }
    }
  };

  const fetchWorkers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.department) params.append('department', filters.department);
      
      const response = await axios.get(`/api/workers?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setWorkers(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch workers');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!userDepartment) {
      setError('Department information not available. Please refresh the page.');
      return;
    }

    const token = localStorage.getItem('accessToken');
    const workerData = {
      ...formData,
      department: userDepartment, // guaranteed now
      skills: formData.skills.split(',').map(s => s.trim()).filter(s => s)
    };

    console.log('Submitting workerData:', workerData);

    try {
      if (editingWorker) {
        await axios.put(`/api/workers/${editingWorker._id}`, workerData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post('/api/workers', workerData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      resetForm();
      fetchWorkers();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save worker');
    }
  };


  const handleEdit = (worker) => {
    setEditingWorker(worker);
    setFormData({
      name: worker.name,
      email: worker.email,
      department: worker.department,
      role: worker.role,
      skills: worker.skills.join(', '),
      status: worker.status
    });
    setShowAddForm(true);
  };

  const handleRetire = async (workerId) => {
    if (!confirm('Are you sure you want to retire this worker?')) return;
    
    try {
      const token = localStorage.getItem('accessToken');
      await axios.patch(`/api/workers/${workerId}/retire`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchWorkers();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to retire worker');
    }
  };

  const resetForm = () => {
    setFormData({ name: '', email: '', department: userDepartment, role: '', skills: '', status: 'Available' });
    setEditingWorker(null);
    setShowAddForm(false);
  };

  if (loading) return <div className="p-6">Loading workers...</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Workers Management</h1>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 cursor-pointer"
        >
          Add Worker
        </button>
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
            <option value="Available">Available</option>
            <option value="On-Duty">On-Duty</option>
            <option value="Off-Duty">Off-Duty</option>
            <option value="Retired">Retired</option>
          </select>
          <button
            onClick={() => setFilters({ status: '', department: '' })}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 cursor-pointer"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="bg-white p-6 rounded shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">
            {editingWorker ? 'Edit Worker' : 'Add New Worker'}
          </h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Name *"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
              className="border rounded px-3 py-2"
            />
            <input
              type="email"
              placeholder="Email *"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required
              className="border rounded px-3 py-2"
            />
            <input
              type="text"
              value={userDepartment}
              readOnly
              className="border rounded px-3 py-2 bg-gray-100 cursor-not-allowed"
              placeholder="Department (Auto-filled) *"
            />
            <input
              type="text"
              placeholder="Role *"
              value={formData.role}
              onChange={(e) => setFormData({...formData, role: e.target.value})}
              required
              className="border rounded px-3 py-2"
            />
            <input
              type="text"
              placeholder="Skills (comma separated)"
              value={formData.skills}
              onChange={(e) => setFormData({...formData, skills: e.target.value})}
              className="border rounded px-3 py-2"
            />
            <select
              value={formData.status}
              onChange={(e) => setFormData({...formData, status: e.target.value})}
              className="border rounded px-3 py-2 cursor-pointer"
            >
              <option value="Available">Available</option>
              <option value="On-Duty">On-Duty</option>
              <option value="Off-Duty">Off-Duty</option>
            </select>
            <div className="md:col-span-2 flex gap-2">
              <button
                type="submit"
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 cursor-pointer"
              >
                {editingWorker ? 'Update' : 'Add'} Worker
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
        </div>
      )}

      {/* Workers List */}
      <div className="bg-white rounded shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assignments</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {workers.map((worker) => (
                <tr key={worker._id}>
                  <td className="px-6 py-4 whitespace-nowrap">{worker.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{worker.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{worker.department}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{worker.role}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      worker.status === 'Available' ? 'bg-green-100 text-green-800' :
                      worker.status === 'On-Duty' ? 'bg-blue-100 text-blue-800' :
                      worker.status === 'Off-Duty' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {worker.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{worker.assignedCount}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(worker)}
                        className="text-blue-600 hover:text-blue-800 cursor-pointer"
                      >
                        Edit
                      </button>
                      {worker.status !== 'Retired' && (
                        <button
                          onClick={() => handleRetire(worker._id)}
                          className="text-red-600 hover:text-red-800 cursor-pointer"
                        >
                          Retire
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {workers.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No workers found
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkersManagement;
