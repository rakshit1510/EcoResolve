import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function StaffDashboard() {
    const navigate = useNavigate();
    const { logout } = useAuth();

    const handleLogout = () => {
        logout();
        navigate("/");
    };

    const dashboardOptions = [
        {
            title: "Resources Management",
            description: "View and manage available resources for complaint resolution",
            icon: "🛠️",
            path: "/staff/resources"
        },
        {
            title: "Workers Management", 
            description: "View and manage available workers and their assignments",
            icon: "👷",
            path: "/staff/workers"
        },
        {
            title: "Task Assignment",
            description: "Assign tasks and complaints to workers based on department",
            icon: "📋",
            path: "/staff/assignments"
        },
        {
            title: "City Complaint Map",
            description: "View geographical distribution of complaints in the city",
            icon: "🗺️",
            path: "/staff/city-map"
        },
        {
            title: "Complaint Reviews",
            description: "View all reviews and feedback from citizens",
            icon: "⭐",
            path: "/staff/reviews"
        },
        {
            title: "Complaint Management",
            description: "View and update status of complaints in your department",
            icon: "📝",
            path: "/staff/complaints"
        },
        {
            title: "Profile Settings",
            description: "Update your personal information and preferences",
            icon: "👤",
            path: "/staff/profile"
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4">
                        <h1 className="text-2xl font-bold text-gray-900">EcoResolve - Staff Dashboard</h1>
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