import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const ComplaintStatus = () => {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'open': return 'bg-blue-100 text-blue-800';
      case 'in-progress': return 'bg-orange-100 text-orange-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const fetchComplaints = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setError('Please login first');
        setLoading(false);
        return;
      }

      const response = await axios.get("http://localhost:8000/api/complaints/my-complaints", {
        headers: {
          "Authorization": `Bearer ${token}`
        },
        withCredentials: true
      });

      setComplaints(response.data.data || []);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to fetch complaints");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading complaints...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-xl shadow-md p-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">My Complaints</h1>
            <button
              onClick={() => navigate("/citizen")}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              ← Back to Dashboard
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          {complaints.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📋</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No Complaints Found</h3>
              <p className="text-gray-500 mb-6">You haven't submitted any complaints yet.</p>
              <button
                onClick={() => navigate("/citizen/complaints")}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Submit Your First Complaint
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {complaints.map((complaint) => (
                <div key={complaint._id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {complaint.department}
                      </h3>
                      <p className="text-gray-600 mb-2">
                        📍 {complaint.location}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(complaint.status)}`}>
                      {complaint.status.charAt(0).toUpperCase() + complaint.status.slice(1)}
                    </span>
                  </div>
                  
                  <p className="text-gray-700 mb-4">{complaint.description}</p>
                  
                  {complaint.imageUrl && (
                    <div className="mb-4">
                      <img 
                        src={complaint.imageUrl} 
                        alt="Complaint" 
                        className="w-32 h-32 object-cover rounded-lg border"
                      />
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center text-sm text-gray-500">
                    <span>Submitted: {new Date(complaint.createdAt).toLocaleDateString()}</span>
                    <span>ID: {complaint._id.slice(-8)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ComplaintStatus;
