import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function Complaints() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        department: "",
        location: "",
        coordinates: { lat: null, lng: null },
        description: "",
        image: null
    });
    const [showMap, setShowMap] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    const departments = [
        "Public Works Department (PWD)",
        "Sanitation Department", 
        "Water Supply Department",
        "Electricity Department",
        "Parks & Environment Department"
    ];

    const handleChange = (e) => {
        if (e.target.name === "image") {
            setFormData({ ...formData, image: e.target.files[0] });
        } else {
            setFormData({ ...formData, [e.target.name]: e.target.value });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");

        try {
            const formDataToSend = new FormData();
            formDataToSend.append("department", formData.department);
            formDataToSend.append("location", formData.location);
            formDataToSend.append("description", formData.description);
            formDataToSend.append("image", formData.image);

            const token = localStorage.getItem('accessToken');
            // console.log('Token from localStorage:', token);
            
            if (!token) {
                setMessage('Please login first');
                setLoading(false);
                return;
            }
            
            const res = await axios.post("http://localhost:8000/api/complaints/createComplaint", formDataToSend, {
                headers: { 
                    "Content-Type": "multipart/form-data",
                    "Authorization": `Bearer ${token}`
                },
                withCredentials: true
            });

            setMessage("Complaint submitted successfully!");
            setFormData({ department: "", location: "", description: "", image: null });
        } catch (error) {
            setMessage(error.response?.data?.message || "Failed to submit complaint");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-2xl mx-auto px-4">
                <div className="bg-white rounded-xl shadow-md p-8">
                    <div className="flex items-center justify-between mb-6">
                        <h1 className="text-2xl font-bold text-gray-900">Submit Complaint</h1>
                        <button
                            onClick={() => navigate("/citizen")}
                            className="text-blue-600 cursor-pointer hover:text-blue-800 font-medium"
                        >
                            ← Back to Dashboard
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Department *
                            </label>
                            <select
                                name="department"
                                value={formData.department}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="">Select Department</option>
                                {departments.map((dept, index) => (
                                    <option key={index} value={dept}>{dept}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Location *
                            </label>
                            <div className="space-y-3">
                                <input
                                    type="text"
                                    name="location"
                                    value={formData.location}
                                    onChange={handleChange}
                                    placeholder="Enter address or click 'Select on Map'"
                                    required
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowMap(!showMap)}
                                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition cursor-pointer"
                                >
                                    {showMap ? "Hide Map" : "📍 Select on Map"}
                                </button>
                                {showMap && (
                                    <div className="border border-gray-300 rounded-lg overflow-hidden">
                                        <div className="h-64 bg-gray-200 flex items-center justify-center">
                                            <div className="text-center">
                                                <div className="text-4xl mb-2">🗺️</div>
                                                <p className="text-gray-600">Interactive Map</p>
                                                <p className="text-sm text-gray-500 mt-2">Click to select location</p>
                                                {formData.coordinates.lat && (
                                                    <p className="text-xs text-green-600 mt-1">
                                                        Selected: {formData.coordinates.lat.toFixed(6)}, {formData.coordinates.lng.toFixed(6)}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Description *
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Describe the issue in detail..."
                                required
                                rows={4}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Upload Image *
                            </label>
                            <input
                                type="file"
                                name="image"
                                onChange={handleChange}
                                accept="image/*"
                                required
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 hover:scale-105 transition cursor-pointer disabled:opacity-50"
                        >
                            {loading ? "Submitting..." : "Submit Complaint"}
                        </button>
                    </form>

                    {message && (
                        <div className={`mt-4 p-4 rounded-lg text-center ${
                            message.includes("successfully") ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                        }`}>
                            {message}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
