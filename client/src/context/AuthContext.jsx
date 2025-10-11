import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { API_ENDPOINTS } from '../config/api.js';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const login = async (email, password, accountType = "Citizen") => {
        try {
            let endpoint;
            if (accountType === "Citizen") endpoint = API_ENDPOINTS.AUTH.LOGIN_CITIZEN;
            else if (accountType === "Admin") endpoint = API_ENDPOINTS.AUTH.LOGIN_ADMIN;
            else if (accountType === "Staff") endpoint = API_ENDPOINTS.AUTH.LOGIN_STAFF;
            else if (accountType === "SuperAdmin") endpoint = API_ENDPOINTS.AUTH.LOGIN_SUPERADMIN;
            
            const res = await axios.post(endpoint, { email, password });
            const { accessToken } = res.data.data;
            
            // Store token and account type in localStorage
            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('accountType', accountType);
            
            setUser({ email, accountType, accessToken });
            return { user: { email, accountType } };
        } catch (err) {
            throw err.response?.data || { message: "Login failed" };
        }
    };

    const logout = async () => {
        try {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('accountType');
            setUser(null);
        } catch (err) {
            console.error("Logout failed", err);
        }
    };

    const fetchUser = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            if (token) {
                // If token exists, set user as authenticated
                // You can decode the token or make an API call to verify
                setUser({ accessToken: token, accountType: localStorage.getItem('accountType') || 'Citizen' });
            } else {
                setUser(null);
            }
        } catch {
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUser();
    }, []);

    return (
        <AuthContext.Provider value={{ user, setUser, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
