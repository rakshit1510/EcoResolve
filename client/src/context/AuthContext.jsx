import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const login = async (email, password) => {
        try {
            const res = await axios.post("/api/users/login", { email, password }, { withCredentials: true });
            setUser(res.data.user);
            return res.data;
        } catch (err) {
            throw err.response?.data || { message: "Login failed" };
        }
    };

    const logout = async () => {
        try {
            await axios.post("/api/users/logout", {}, { withCredentials: true });
            setUser(null);
        } catch (err) {
            console.error("Logout failed", err);
        }
    };

    const fetchUser = async () => {
        try {
            const res = await axios.get("/api/users/me", { withCredentials: true });
            setUser(res.data.user);
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
