import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function Signup() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: "",
        contactNumber: "",
        otp: ""
    });

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [otpSent, setOtpSent] = useState(false);
    const [otpLoading, setOtpLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const sendOTP = async () => {
        if (!formData.email) {
            setMessage("Please enter email first");
            return;
        }
        
        setOtpLoading(true);
        setMessage("");
        
        try {
            await axios.post("http://localhost:8000/api/auth/sendotp", {
                email: formData.email
            });
            setOtpSent(true);
            setMessage(`OTP sent to ${formData.email}`);
        } catch (error) {
            setMessage(error.response?.data?.message || error.message || "Failed to send OTP");
        } finally {
            setOtpLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");

        if (formData.password !== formData.confirmPassword) {
            setMessage("Passwords do not match");
            setLoading(false);
            return;
        }

        try {
            const res = await axios.post("http://localhost:8000/api/auth/signup", {
                ...formData,
                accountType: "Citizen",
            });

            setMessage("Signup successful! Navigating to Login Page");
            setTimeout(() => {
                navigate("/login");
            }, 2000);
        } catch (error) {
            setMessage(error.response?.data?.message || error.message || "Signup failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-green-100 to-emerald-200">
            <div className="bg-white shadow-lg rounded-xl p-8 w-full max-w-md">
                <h2 className="text-2xl font-bold text-center text-emerald-700 mb-6">
                    Citizen Signup
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        type="text"
                        name="firstName"
                        placeholder="First Name"
                        value={formData.firstName}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-400"
                    />
                    <input
                        type="text"
                        name="lastName"
                        placeholder="Last Name"
                        value={formData.lastName}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-400"
                    />
                    <input
                        type="email"
                        name="email"
                        placeholder="Email Address"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-400"
                    />
                    <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            placeholder="Password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-emerald-400"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                            {showPassword ? "🙈" : "👁️"}
                        </button>
                    </div>
                    <div className="relative">
                        <input
                            type={showConfirmPassword ? "text" : "password"}
                            name="confirmPassword"
                            placeholder="Confirm Password"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-emerald-400"
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                            {showConfirmPassword ? "🙈" : "👁️"}
                        </button>
                    </div>
                    <input
                        type="tel"
                        name="contactNumber"
                        placeholder="Contact Number"
                        value={formData.contactNumber}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-400"
                    />

                    <div className="flex gap-2">
                        <input
                            type="text"
                            name="otp"
                            placeholder="Enter OTP"
                            value={formData.otp}
                            onChange={handleChange}
                            required={otpSent}
                            className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-400"
                        />
                        <button
                            type="button"
                            onClick={sendOTP}
                            disabled={otpLoading || !formData.email}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition cursor-pointer disabled:opacity-50"
                        >
                            {otpLoading ? "Sending..." : "Send OTP"}
                        </button>
                    </div>

                    <button
                        type="submit"
                        disabled={loading || !otpSent}
                        className="w-full py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 hover:scale-105 transition cursor-pointer disabled:opacity-50"
                    >
                        {loading ? "Signing up..." : "Sign Up"}
                    </button>
                </form>

                {message && (
                    <p className={`mt-4 text-center text-sm ${
                        message.includes("successful") || message.includes("sent") ? "text-green-600" : "text-red-600"
                    }`}>
                        {message}
                    </p>
                )}
            </div>
        </div>
    );
}
