import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function StaffVerification() {
    const navigate = useNavigate();
    const [pendingStaff, setPendingStaff] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");

    useEffect(() => {
        fetchPendingStaff();
    }, []);

    const fetchPendingStaff = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            const res = await axios.get("http://localhost:8000/api/auth/unapproved-staff", {
                headers: { "Authorization": `Bearer ${token}` },
                withCredentials: true
            });
            setPendingStaff(res.data.data || []);
        } catch (error) {
            setMessage("Failed to fetch pending staff accounts");
        } finally {
            setLoading(false);
        }
    };

    const handleApproval = async (staffId, action) => {
        try {
            const token = localStorage.getItem('accessToken');
            if (action === 'approve') {
                await axios.post("http://localhost:8000/api/auth/approve-account", 
                    { email: pendingStaff.find(staff => staff._id === staffId)?.email },
                    {
                        headers: { "Authorization": `Bearer ${token}` },
                        withCredentials: true
                    }
                );
            } else {
                
                setPendingStaff(prev => prev.filter(staff => staff._id !== staffId));
                setMessage('Staff account rejected');
                return;
            }
            
            setMessage(`Staff ${action === 'approve' ? 'approved' : 'rejected'} successfully`);
            fetchPendingStaff(); // Refresh the list
        } catch (error) {
            setMessage(`Failed to ${action} staff account`);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-xl">Loading pending staff accounts...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-6xl mx-auto px-4">
                <div className="bg-white rounded-xl shadow-md p-8">
                    <div className="flex items-center justify-between mb-6">
                        <h1 className="text-2xl font-bold text-gray-900">Staff Account Verification</h1>
                        <button
                            onClick={() => navigate("/admin")}
                            className="text-blue-600 hover:text-blue-800 font-medium cursor-pointer"
                        >
                            ← Back to Dashboard
                        </button>
                    </div>

                    {message && (
                        <div className={`mb-4 p-4 rounded-lg text-center ${
                            message.includes("successfully") ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                        }`}>
                            {message}
                        </div>
                    )}

                    {pendingStaff.length === 0 ? (
                        <div className="text-center py-8">
                            <div className="text-4xl mb-4">✅</div>
                            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Pending Approvals</h3>
                            <p className="text-gray-500">All staff accounts have been verified.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {pendingStaff.map((staff) => (
                                <div key={staff._id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition">
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                                {staff.firstName} {staff.lastName}
                                            </h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                                                <div>
                                                    <span className="font-medium">Email:</span> {staff.email}
                                                </div>
                                                <div>
                                                    <span className="font-medium">Contact:</span> {staff.contactNumber || 'Not provided'}
                                                </div>
                                                <div>
                                                    <span className="font-medium">Account Type:</span> {staff.accountType}
                                                </div>
                                                <div>
                                                    <span className="font-medium">Registration Date:</span> {new Date(staff.createdAt).toLocaleDateString()}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex gap-3 ml-6">
                                            <button
                                                onClick={() => handleApproval(staff._id, 'approve')}
                                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition cursor-pointer"
                                            >
                                                ✅ Approve
                                            </button>
                                            <button
                                                onClick={() => handleApproval(staff._id, 'reject')}
                                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition cursor-pointer"
                                            >
                                                ❌ Reject
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
    );
}