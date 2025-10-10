import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function CitizenDashboard() {
    const navigate = useNavigate();
    const { logout } = useAuth();

    const handleLogout = () => {
        logout();
        navigate("/");
    };

    const dashboardOptions = [
        {
            title: "Complaint Heatmap",
            description: "View complaint density and analytics on interactive heatmap",
            icon: "🗺️",
            path: "/citizen/heatmap"
        },
        // {
        //     title: "City Complaint Map",
        //     description: "View all complaints in your city on an interactive map",
        //     icon: "🗺️",
        //     path: "/citizen/geotagging"
        // },
        {
            title: "Submit Complaint",
            description: "Report a new civic issue with precise location mapping",
            icon: "📝",
            path: "/citizen/complaints"
        },
        {
            title: "Complaint Status",
            description: "Track the status of your submitted complaints",
            icon: "📊",
            path: "/citizen/complaint-status"
        },
        {
            title: "Profile Settings",
            description: "Update your personal information and preferences",
            icon: "👤",
            path: "/citizen/profile"
        },
        {
            title: "Review & Feedback",
            description: "Rate and review resolved complaints",
            icon: "⭐",
            path: "/citizen/feedback"
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4">
                        <h1 className="text-2xl font-bold text-gray-900">EcoResolve - Citizen Dashboard</h1>
                        <button
                            onClick={handleLogout}
                            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition cursor-pointer"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </div>

            {/* Dashboard Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {dashboardOptions.map((option, index) => (
                        <div
                            key={index}
                            onClick={() => navigate(option.path)}
                            className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg hover:scale-105 transition cursor-pointer border border-gray-200"
                        >
                            <div className="text-4xl mb-4">{option.icon}</div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">{option.title}</h3>
                            <p className="text-gray-600 text-sm">{option.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
