import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AdminApprovals = () => {
  const navigate = useNavigate();
  const [pendingAdmins, setPendingAdmins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const fetchPendingAdmins = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/auth/unapproved-admins", {
        headers: { "Authorization": `Bearer ${localStorage.getItem("accessToken")}` }
      });
      const data = await response.json();
      if (response.ok) {
        setPendingAdmins(data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch pending admins", error);
    }
  };

  const approveAdmin = async (email) => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:8000/api/auth/approve-admin-account", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("accessToken")}`
        },
        body: JSON.stringify({ email })
      });
      
      if (response.ok) {
        setMessage("Admin approved successfully!");
        fetchPendingAdmins();
        setTimeout(() => setMessage(""), 3000);
      } else {
        setMessage("Failed to approve admin");
      }
    } catch (error) {
      setMessage("Network error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingAdmins();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">Admin Approvals</h1>
            <button
              onClick={() => navigate("/superadmin")}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${message.includes("successfully") ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
            {message}
          </div>
        )}

        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Pending Admin Accounts</h2>
          </div>
          
          <div className="p-6">
            {pendingAdmins.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-400 text-6xl mb-4">✅</div>
                <p className="text-gray-500 text-lg">No pending admin accounts</p>
                <p className="text-gray-400 text-sm mt-2">All admin accounts have been approved</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingAdmins.map((admin) => (
                  <div key={admin._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4 mb-3">
                          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                            <span className="text-purple-600 font-semibold text-lg">
                              {admin.firstName.charAt(0)}{admin.lastName.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                              {admin.firstName} {admin.lastName}
                            </h3>
                            <p className="text-gray-600">{admin.email}</p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium text-gray-700">Department:</span>
                            <p className="text-gray-600">{admin.department}</p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Account Type:</span>
                            <p className="text-gray-600">{admin.accountType}</p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Registration Date:</span>
                            <p className="text-gray-600">{new Date(admin.createdAt).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Status:</span>
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                              Pending Approval
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="ml-6">
                        <button
                          onClick={() => approveAdmin(admin.email)}
                          disabled={loading}
                          className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {loading ? "Approving..." : "Approve"}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminApprovals;