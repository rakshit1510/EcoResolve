import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function AdminDashboard() {
    const navigate = useNavigate();
    const { logout } = useAuth();

    const handleLogout = () => {
        logout();
        navigate("/");
    };

    const dashboardOptions = [
        {
            title: "Report Generation",
            description: "Generate comprehensive reports on complaints and resolutions",
            icon: "📊",
            path: "/admin/reports"
        },
        {
            title: "Staff Account Verification",
            description: "Approve or reject pending staff account registrations",
            icon: "✅",
            path: "/admin/staff-verification"
        },
        {
            title: "Escalated Complaints",
            description: "Handle complaints escalated by citizens or system",
            icon: "🚨",
            path: "/admin/escalated-complaints"
        },
        {
            title: "View Notifications",
            description: "Check announcements and updates from administration",
            icon: "🔔",
            path: "/admin/notifications"
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4">
                        <h1 className="text-2xl font-bold text-gray-900">EcoResolve - Admin Dashboard</h1>
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