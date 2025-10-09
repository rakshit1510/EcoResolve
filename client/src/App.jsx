import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing.jsx";
import TabbedSignup from "./pages/TabbedSignup.jsx";
import Login from "./pages/Login.jsx";
import CitizenDashboard from "./pages/citizen/Dashboard.jsx";
import Geotagging from "./pages/citizen/Geotagging/Geotagging.jsx";
import Complaints from "./pages/citizen/Complaints/Complaints.jsx";
import ComplaintStatus from "./pages/citizen/Complaints/ComplaintStatus.jsx";
import ProfileOptions from "./pages/citizen/ProfileOptions.jsx";
import Feedback from "./pages/citizen/Feedback.jsx";
import StaffVerification from "./pages/admin/StaffVerification.jsx";
import ResourceManagement from "./pages/staff/Resource Management/ResourceManagement.jsx";
import WorkersManagement from "./pages/staff/Workers Management/WorkersManagement.jsx";
import TaskAssignment from "./pages/staff/Task Assignment/TaskAssignment.jsx";
import ComplaintManagement from "./pages/staff/Complaint Management/ComplaintManagement.jsx";
import ComplaintReview from "./pages/staff/Complaint Review/ComplaintReview.jsx";
import StaffDashboard from "./pages/staff/Dashboard.jsx";
import AdminDashboard from "./pages/admin/Dashboard.jsx";
import SuperAdminDashboard from "./pages/superadmin/Dashboard.jsx";
import AdminApprovals from "./pages/superadmin/AdminApprovals.jsx";
import EscalatedComplaints from "./pages/admin/EscalatedComplaints.jsx";
import SuperAdminEscalatedComplaints from "./pages/superadmin/EscalatedComplaints.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import AdminChat from "./pages/Discussion/AdminChat.jsx";
import HeadChat from "./pages/Discussion/HeadChat.jsx";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/signup" element={<TabbedSignup />} />
        <Route path="/login" element={<Login />} />

        {/* Citizen Routes */}
        <Route element={<ProtectedRoute allowedRoles={["Citizen"]} />}>
          <Route path="/citizen" element={<CitizenDashboard />} />
          <Route path="/citizen/geotagging" element={<Geotagging />} />
          <Route path="/citizen/complaints" element={<Complaints />} />
          <Route path="/citizen/complaint-status" element={<ComplaintStatus />} />
          <Route path="/citizen/profile" element={<ProfileOptions />} />
          <Route path="/citizen/feedback" element={<Feedback />} />
        </Route>

        {/* Staff Routes */}
        <Route element={<ProtectedRoute allowedRoles={["Staff"]} />}>
          <Route path="/staff" element={<StaffDashboard />} />
          <Route path="/staff/resources" element={<ResourceManagement />} />
          <Route path="/staff/workers" element={<WorkersManagement />} />
          <Route path="/staff/assignments" element={<TaskAssignment />} />
          <Route path="/staff/city-map" element={<div>City Complaint Map - Coming Soon</div>} />
          <Route path="/staff/reviews" element={<ComplaintReview />} />
          <Route path="/staff/complaints" element={<ComplaintManagement />} />
          <Route path="/staff/profile" element={<div>Staff Profile - Coming Soon</div>} />
        </Route>

        {/* Admin Routes */}
        <Route element={<ProtectedRoute allowedRoles={["Admin"]} />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/reports" element={<div>Report Generation - Coming Soon</div>} />
          <Route path="/admin/staff-verification" element={<StaffVerification />} />
          <Route path="/admin/unresolved-alerts" element={<div>Unresolved Alerts - Coming Soon</div>} />
          <Route path="/admin/escalated-complaints" element={<EscalatedComplaints />} />
        </Route>

        {/* SuperAdmin Routes */}
        <Route element={<ProtectedRoute allowedRoles={["SuperAdmin"]} />}>
          <Route path="/superadmin" element={<SuperAdminDashboard />} />
          <Route path="/superadmin/approvals" element={<AdminApprovals />} />
          <Route path="/superadmin/escalated-complaints" element={<SuperAdminEscalatedComplaints />} />
        </Route>
        
        <Route path="/AdminChat" element={<AdminChat/>} />
        <Route path="/head/:dept/:head" element={<HeadChat/>} />

        <Route path="*" element={<Landing />} />
      </Routes>
    </Router>
  );
}

export default App;
