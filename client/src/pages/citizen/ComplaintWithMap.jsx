import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import axios from "axios";

// Fix for default markers in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Component to handle map click events
const LocationPicker = ({ onLocationSelect }) => {
  useMapEvents({
    click: (e) => {
      const { lat, lng } = e.latlng;
      onLocationSelect(lat, lng);
    },
  });
  return null;
};

export default function ComplaintWithMap() {
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

    const handleLocationSelect = (lat, lng) => {
        setFormData(prev => ({
            ...prev,
            coordinates: { lat, lng },
            location: prev.location || `${lat.toFixed(6)}, ${lng.toFixed(6)}`
        }));
    };

    const getCurrentLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    handleLocationSelect(latitude, longitude);
                    setMessage("Location detected successfully!");
                },
                (error) => {
                    setMessage("Unable to get your location. Please select manually on map.");
                }
            );
        } else {
            setMessage("Geolocation is not supported by this browser.");
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
            
            // Add coordinates if available
            if (formData.coordinates.lat && formData.coordinates.lng) {
                formDataToSend.append("latitude", formData.coordinates.lat);
                formDataToSend.append("longitude", formData.coordinates.lng);
            }

            const token = localStorage.getItem('accessToken');
            
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
            setFormData({ 
                department: "", 
                location: "", 
                coordinates: { lat: null, lng: null },
                description: "", 
                image: null 
            });
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message || "Failed to submit complaint";
            setMessage(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4">
                <div className="bg-white rounded-xl shadow-md p-8">
                    <div className="flex items-center justify-between mb-6">
                        <h1 className="text-2xl font-bold text-gray-900">Submit Complaint with Location</h1>
                        <button
                            onClick={() => navigate("/citizen")}
                            className="text-blue-600 cursor-pointer hover:text-blue-800 font-medium"
                        >
                            ← Back to Dashboard
                        </button>
                    </div>

                    {message && (
                        <div className={`mb-4 p-4 rounded-lg text-center ${
                            message.includes("successfully") ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                        }`}>
                            {message}
                        </div>
                    )}

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
                                    placeholder="Enter address or use location tools below"
                                    required
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                                
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={getCurrentLocation}
                                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition cursor-pointer"
                                    >
                                        📍 Use My Location
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowMap(!showMap)}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition cursor-pointer"
                                    >
                                        {showMap ? "Hide Map" : "🗺️ Select on Map"}
                                    </button>
                                </div>

                                {formData.coordinates.lat && (
                                    <div className="text-sm text-green-600 bg-green-50 p-2 rounded">
                                        📍 Location selected: {formData.coordinates.lat.toFixed(6)}, {formData.coordinates.lng.toFixed(6)}
                                    </div>
                                )}

                                {showMap && (
                                    <div className="border border-gray-300 rounded-lg overflow-hidden">
                                        <div className="h-64">
                                            <MapContainer
                                                center={formData.coordinates.lat ? [formData.coordinates.lat, formData.coordinates.lng] : [26.8467, 80.9462]}
                                                zoom={13}
                                                style={{ height: '100%', width: '100%' }}
                                            >
                                                <TileLayer
                                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                                    attribution="&copy; OpenStreetMap contributors"
                                                />
                                                <LocationPicker onLocationSelect={handleLocationSelect} />
                                                {formData.coordinates.lat && (
                                                    <Marker position={[formData.coordinates.lat, formData.coordinates.lng]} />
                                                )}
                                            </MapContainer>
                                        </div>
                                        <div className="p-2 bg-gray-50 text-sm text-gray-600">
                                            Click anywhere on the map to select location
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
                </div>
            </div>
        </div>
    );
}