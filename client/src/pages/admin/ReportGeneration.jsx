import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ReportGeneration = () => {
  const navigate = useNavigate();
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [downloadMessage, setDownloadMessage] = useState('');
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    type: 'monthly',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear()
  });

  const BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const generateReport = async () => {
    setLoading(true);
    setError('');
    setDownloadMessage('');

    try {
      const token = localStorage.getItem('accessToken');

      // For yearly report, omit month to get full year data
      let params;
      if (formData.type === 'yearly') {
        params = new URLSearchParams({
          type: 'monthly',
          year: formData.year
        });
      } else {
        params = new URLSearchParams(formData);
      }

      await new Promise(resolve => setTimeout(resolve, 2000));

      const response = await axios.get(`${BASE_URL}/api/reports/admin?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReportData(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Report Generation</h1>
        <button
          onClick={() => navigate('/admin')}
          className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 cursor-pointer"
        >
          ← Back to Dashboard
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 max-w-4xl mx-auto">
        {/* Report Configuration */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Report Type
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
            >
              <option value="monthly">Monthly Report</option>
              <option value="yearly">Yearly Report</option>
            </select>
          </div>

          {formData.type === 'monthly' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Month
              </label>
              <select
                name="month"
                value={formData.month}
                onChange={handleInputChange}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {new Date(0, i).toLocaleString('default', { month: 'long' })}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Year
            </label>
            <input
              type="number"
              name="year"
              value={formData.year}
              onChange={handleInputChange}
              min="2020"
              max="2030"
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <button
          onClick={generateReport}
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
        >
          {loading ? 'Generating...' : 'Generate Report'}
        </button>

        {error && (
          <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {downloadMessage && (
          <div className="mt-4 bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded">
            {downloadMessage}
          </div>
        )}

        {/* Report Display */}
        {reportData && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Report Results</h2>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-blue-600">Total Complaints</h3>
                <p className="text-2xl font-bold text-blue-900">{reportData.summary?.totalComplaints}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-green-600">Resolved</h3>
                <p className="text-2xl font-bold text-green-900">{reportData.summary?.resolvedComplaints}</p>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-yellow-600">Pending</h3>
                <p className="text-2xl font-bold text-yellow-900">{reportData.summary?.pendingComplaints}</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-purple-600">Avg Resolution Time</h3>
                <p className="text-2xl font-bold text-purple-900">{reportData.summary?.averageResolutionTimeHours}h</p>
              </div>
            </div>

            {/* Department Breakdown */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">Department Breakdown</h3>
              <div className="grid grid-cols-1 gap-3">
                {Object.entries(reportData.departmentBreakdown || {}).map(([dept, data]) => (
                  <div key={dept} className="bg-white p-4 rounded border">
                    <h4 className="font-medium text-gray-900 mb-2">{dept}</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                      <span>Total: <span className="font-semibold text-blue-600">{data.totalComplaints}</span></span>
                      <span>Resolved: <span className="font-semibold text-green-600">{data.resolvedComplaints}</span></span>
                      <span>Pending: <span className="font-semibold text-yellow-600">{data.pendingComplaints}</span></span>
                      <span>Overdue: <span className="font-semibold text-red-600">{data.overdueComplaints}</span></span>
                      <span>Escalated: <span className="font-semibold text-purple-600">{data.escalatedComplaints}</span></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportGeneration;
