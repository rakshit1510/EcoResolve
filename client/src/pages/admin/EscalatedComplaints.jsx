import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const EscalatedComplaints = () => {
  const navigate = useNavigate();
  const [escalatedComplaints, setEscalatedComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEscalatedComplaints();
  }, []);

  const fetchEscalatedComplaints = async () => {
    try {
      const response = await axios.get("/api/escalation/escalated", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });
      
      if (response.data.status) {
        setEscalatedComplaints(response.data.data);
      } else {
        console.error("API returned error:", response.data.message);
      }
    } catch (error) {
      console.error("Error fetching escalated complaints:", error);
      alert("Failed to fetch escalated complaints. Please check console for details.");
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (complaintId) => {
    if (!confirm("Are you sure you want to mark this complaint as resolved?")) return;
    
    try {
      await axios.patch(`/api/escalation/${complaintId}/resolve`, {}, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });
      alert("Complaint resolved successfully!");
      fetchEscalatedComplaints();
    } catch (error) {
      console.error("Error resolving complaint:", error);
      alert("Error resolving complaint");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">Loading escalated complaints...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">Escalated Complaints</h1>
            <button
              onClick={() => navigate("/admin")}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition cursor-pointer"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {escalatedComplaints.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎉</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Escalated Complaints</h3>
            <p className="text-gray-600">All complaints are being handled properly.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {escalatedComplaints.map((complaint) => (
              <div key={complaint._id} className="bg-white rounded-lg shadow-md p-6 border-l-4 border-red-500">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Complaint #{complaint._id.slice(-6)}</h3>
                    <p className="text-sm text-gray-600">Status: {complaint.status}</p>
                    <p className="text-sm text-gray-600">Citizen: {complaint.userId ? `${complaint.userId.firstName} ${complaint.userId.lastName}` : 'N/A'}</p>
                  </div>
                  <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
                    {complaint.escalationLevel.toUpperCase()}
                  </span>
                </div>
                
                <p className="text-gray-700 mb-4">{complaint.description}</p>
                
                <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                  <div>
                    <span className="font-medium">Location:</span> {complaint.location}
                  </div>
                  <div>
                    <span className="font-medium">Department:</span> {complaint.department}
                  </div>
                  <div>
                    <span className="font-medium">Created:</span> {new Date(complaint.createdAt).toLocaleDateString()}
                  </div>
                  <div>
                    <span className="font-medium">Escalated:</span> {complaint.escalatedAt ? new Date(complaint.escalatedAt).toLocaleDateString() : 'N/A'}
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => handleResolve(complaint._id)}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
                  >
                    Mark Resolved
                  </button>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EscalatedComplaints;