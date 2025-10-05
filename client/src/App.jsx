import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing.jsx";
import CitizenSignup from "./pages/citizen/Signup.jsx";
import Login from "./pages/Login.jsx";
import CitizenDashboard from "./pages/citizen/Dashboard.jsx";
import StaffDashboard from "./pages/staff/Dashboard.jsx";
import AdminDashboard from "./pages/admin/Dashboard.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/signup" element={<CitizenSignup />} />
        <Route path="/login" element={<Login />} />

        {/* Citizen Routes */}
        <Route element={<ProtectedRoute allowedRoles={["Citizen"]} />}>
          <Route path="/citizen" element={<CitizenDashboard />} />
        </Route>

        {/* Staff Routes */}
        <Route element={<ProtectedRoute allowedRoles={["Staff"]} />}>
          <Route path="/staff" element={<StaffDashboard />} />
        </Route>

        {/* Admin Routes */}
        <Route element={<ProtectedRoute allowedRoles={["Admin"]} />}>
          <Route path="/admin" element={<AdminDashboard />} />
        </Route>

        <Route path="*" element={<Landing />} />
      </Routes>
    </Router>
  );
}

export default App;
