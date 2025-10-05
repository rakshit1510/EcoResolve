import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function ProtectedRoute({ allowedRoles }) {
    const { user, loading } = useAuth();

    if (loading) return <div>Loading...</div>; 

    if (!user) return <Navigate to="/login" />;

    if (allowedRoles && !allowedRoles.includes(user.accountType)) {
        return <Navigate to="/login" />;
    }

    return <Outlet />; // Renders nested routes
}
