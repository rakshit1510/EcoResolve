import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing.jsx";
import TabbedSignup from "./pages/TabbedSignup.jsx";
import Login from "./pages/Login.jsx";
import CitizenDashboard from "./pages/citizen/Dashboard.jsx";
// import Geotagging from "./pages/citizen/Geotagging/Geotagging.jsx";
import HeatMap from "./pages/GIS_Pages/data/HeatMap.jsx";
import Complaints from "./pages/citizen/Complaints/Complaints.jsx";
import ComplaintWithMap from "./pages/citizen/ComplaintWithMap.jsx";
import GISPopups from "./pages/GIS_Pages/data/GISPopups.jsx";
import ComplaintStatus from "./pages/citizen/Complaints/ComplaintStatus.jsx";
import ProfileOptions from "./pages/citizen/ProfileOptions.jsx";
import Feedback from "./pages/citizen/Feedback.jsx";
import Notifications from "./pages/citizen/Notifications.jsx";
import StaffVerification from "./pages/admin/StaffVerification.jsx";
import ResourceManagement from "./pages/staff/Resource Management/ResourceManagement.jsx";
import WorkersManagement from "./pages/staff/Workers Management/WorkersManagement.jsx";
import TaskAssignment from "./pages/staff/Task Assignment/TaskAssignment.jsx";
import ComplaintManagement from "./pages/staff/Complaint Management/ComplaintManagement.jsx";
import ComplaintReview from "./pages/staff/Complaint Review/ComplaintReview.jsx";
import ViewProfile from "./pages/staff/ViewProfile.jsx";
import StaffDashboard from "./pages/staff/Dashboard.jsx";
import StaffNotifications from "./pages/staff/Notifications.jsx";
import AdminDashboard from "./pages/admin/Dashboard.jsx";
import SuperAdminDashboard from "./pages/superadmin/Dashboard.jsx";
import AdminApprovals from "./pages/superadmin/AdminApprovals.jsx";
import EscalatedComplaints from "./pages/admin/EscalatedComplaints.jsx";
import ReportGeneration from "./pages/admin/ReportGeneration.jsx";
import AdminNotifications from "./pages/admin/Notifications.jsx";
import SuperAdminEscalatedComplaints from "./pages/superadmin/EscalatedComplaints.jsx";
import SuperAdminReportGeneration from "./pages/superadmin/ReportGeneration.jsx";
import Announcements from "./pages/superadmin/Announcements.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import AdminChat from "./pages/Discussion/AdminChat.jsx";
import HeadChat from "./pages/Discussion/HeadChat.jsx";
import WorkersLogin from "./pages/WorkersLogin.jsx";

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
          <Route path="/citizen/heatmap" element={<HeatMap />} />
          {/* <Route path="/citizen/geotagging" element={<Geotagging />} /> */}
          <Route path="/citizen/complaints" element={<ComplaintWithMap />} />
          <Route path="/citizen/complaints-basic" element={<Complaints />} />
          <Route path="/citizen/complaint-status" element={<ComplaintStatus />} />
          <Route path="/citizen/profile" element={<ProfileOptions />} />
          <Route path="/citizen/feedback" element={<Feedback />} />
          <Route path="/citizen/notifications" element={<Notifications />} />
        </Route>

        {/* Staff Routes */}
        <Route element={<ProtectedRoute allowedRoles={["Staff"]} />}>
          <Route path="/staff" element={<StaffDashboard />} />
          <Route path="/staff/resources" element={<ResourceManagement />} />
          <Route path="/staff/workers" element={<WorkersManagement />} />
          <Route path="/staff/assignments" element={<TaskAssignment />} />
          <Route path="/staff/reviews" element={<ComplaintReview />} />
          <Route path="/staff/complaints" element={<ComplaintManagement />} />
          <Route path="/staff/profile" element={<ViewProfile />} />
          <Route path="/staff/notifications" element={<StaffNotifications />} />
        </Route>

        {/* Admin Routes */}
        <Route element={<ProtectedRoute allowedRoles={["Admin"]} />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/reports" element={<ReportGeneration />} />
          <Route path="/admin/staff-verification" element={<StaffVerification />} />
          <Route path="/admin/unresolved-alerts" element={<div>Unresolved Alerts - Coming Soon</div>} />
          <Route path="/admin/escalated-complaints" element={<EscalatedComplaints />} />
          <Route path="/admin/notifications" element={<AdminNotifications />} />
        </Route>

        {/* SuperAdmin Routes */}
        <Route element={<ProtectedRoute allowedRoles={["SuperAdmin"]} />}>
          <Route path="/superadmin" element={<SuperAdminDashboard />} />
          <Route path="/superadmin/approvals" element={<AdminApprovals />} />
          <Route path="/superadmin/reports" element={<SuperAdminReportGeneration />} />
          <Route path="/superadmin/announcements" element={<Announcements />} />
          <Route path="/superadmin/escalated-complaints" element={<SuperAdminEscalatedComplaints />} />
        </Route>
        
        <Route path="/AdminChat" element={<AdminChat/>} />
        <Route path="/head/:dept/:head" element={<HeadChat/>} />
        <Route path="/worker-portal" element={<WorkersLogin />} />

        <Route path="*" element={<Landing />} />
      </Routes>
    </Router>
  );
}

export default App;
