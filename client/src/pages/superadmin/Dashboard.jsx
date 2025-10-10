import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const SuperAdminDashboard = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const dashboardOptions = [
    {
      title: "Admin Approvals",
      description: "Approve pending admin account registrations",
      icon: "✅",
      path: "/superadmin/approvals"
    },
    {
      title: "Report Generation",
      description: "Generate comprehensive reports including department analytics",
      icon: "📊",
      path: "/superadmin/reports"
    },
    {
      title: "Announcements",
      description: "Send announcements and notifications to citizens",
      icon: "📢",
      path: "/superadmin/announcements"
    },
    {
      title: "Escalated Complaints",
      description: "Handle complaints escalated by citizens or system",
      icon: "🚨",
      path: "/superadmin/escalated-complaints"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">EcoResolve - SuperAdmin Dashboard</h1>
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
};

export default SuperAdminDashboard;