import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default markers in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Red marker icon for complaint location
const redIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

// Green marker icon for device location
const greenIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

// Component to handle map click events
const LocationPicker = ({ onLocationSelect }) => {
  useMapEvents({
    click: (e) => {
      const { lat, lng } = e.latlng;
      onLocationSelect(lat, lng, "map");
    },
  });
  return null;
};

// Component to handle automatic map centering
const MapController = ({ center, zoom }) => {
  const map = useMap();
  
  useEffect(() => {
    if (center && map) {
      map.setView(center, zoom);
    }
  }, [center, zoom, map]);

  return null;
};

// Simple Error Fallback Component
const MapErrorFallback = ({ onRetry }) => {
  return (
    <div className="h-64 bg-red-50 border border-red-200 rounded-md flex items-center justify-center">
      <div className="text-center">
        <div className="text-red-500 text-2xl mb-2">⚠️</div>
        <p className="text-red-700 font-medium">Map failed to load</p>
        <p className="text-red-600 text-sm mt-1">Please refresh the page or try again later</p>
        <button
          onClick={onRetry}
          className="mt-3 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
        >
          Try Again
        </button>
      </div>
    </div>
  );
};

export default function Complaints() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    department: "",
    location: "",
    coordinates: { lat: null, lng: null },
    description: "",
    image: null,
    name: "",
    email: "",
    phone: "",
    complaintType: "",
    urgency: "medium"
  });

  const [showMap, setShowMap] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [deviceLocation, setDeviceLocation] = useState(null);
  const [locationStatus, setLocationStatus] = useState("idle");
  const [locationMethod, setLocationMethod] = useState(null);
  const [predictionStatus, setPredictionStatus] = useState("idle");
  const [autoDetected, setAutoDetected] = useState(false);
  const [mapCenter, setMapCenter] = useState([26.8467, 80.9462]);
  const [mapError, setMapError] = useState(null);
  const [serverStatus, setServerStatus] = useState("checking");

  const BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const FLASK_SERVER_URL = "http://localhost:5000";

  const departments = [
    "Public Works Department (PWD)",
    "Sanitation Department",
    "Water Supply Department",
    "Electricity Department",
    "Parks & Environment Department",
    "Road Maintenance Department",
    "Electrical Department",
    "Water Department",
    "Sewage Department",
    "Building Department",
    "Environmental Department",
    "Police Department",
    "General Complaints Department"
  ];

  // Comprehensive department mapping based on problem type
  const departmentMapping = {
    "Potholes": "Road Maintenance Department",
    "Road Damage": "Road Maintenance Department",
    "Road Repair": "Road Maintenance Department",
    "Electrical Hazards": "Electrical Department",
    "Electrical Issue": "Electrical Department",
    "Power Outage": "Electrical Department",
    "Water Supply": "Water Department",
    "Water Issue": "Water Department",
    "Sewage & Drainage": "Sewage Department",
    "Drainage Problem": "Sewage Department",
    "Garbage Collection": "Sanitation Department",
    "Waste Management": "Sanitation Department",
    "Street Lights": "Electrical Department",
    "Noise Pollution": "Environmental Department",
    "Illegal Construction": "Building Department",
    "Public Safety": "Police Department",
    "Safety Issue": "Police Department",
    "Other": "General Complaints Department"
  };

  // Problem types for the dropdown
  const problemTypes = [
    "Potholes",
    "Road Damage",
    "Electrical Hazards",
    "Water Supply",
    "Sewage & Drainage",
    "Garbage Collection",
    "Street Lights",
    "Noise Pollution",
    "Illegal Construction",
    "Public Safety",
    "Other"
  ];

  // Check server health on component mount
  useEffect(() => {
    checkServerHealth();
  }, []);

  const checkServerHealth = async () => {
    try {
      const response = await fetch(`${FLASK_SERVER_URL}/health`);
      if (response.ok) {
        const data = await response.json();
        setServerStatus(data.model_loaded ? "healthy" : "fallback");
      } else {
        setServerStatus("offline");
      }
    } catch (error) {
      console.error("Server health check failed:", error);
      setServerStatus("offline");
    }
  };

  // AI Prediction for complaint type and severity using your text_model.joblib
  const predictComplaint = async (description) => {
    if (!description || description.trim().length < 10) {
      return null;
    }

    setPredictionStatus("loading");
    
    try {
      const response = await fetch(`${FLASK_SERVER_URL}/predict`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ description: description }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || `HTTP error! status: ${response.status}`);
      }

      if (!result.success) {
        throw new Error(result.error || "Prediction failed");
      }

      setPredictionStatus("success");
      return result;
    } catch (error) {
      console.error("Error predicting complaint:", error);
      setPredictionStatus("error");
      
      // Use enhanced client-side fallback when server is offline
      const fallbackResult = fallbackPrediction(description);
      return fallbackResult;
    }
  };

  // Enhanced client-side fallback prediction with better keyword matching
  const fallbackPrediction = (description) => {
    const descriptionLower = description.toLowerCase();
    
    const hazardKeywords = [
      { keyword: "pothole", type: "Potholes", severity: "medium" },
      { keyword: "potholes", type: "Potholes", severity: "medium" },
      { keyword: "road damage", type: "Road Damage", severity: "high" },
      { keyword: "road broken", type: "Road Damage", severity: "high" },
      { keyword: "road repair", type: "Road Damage", severity: "medium" },
      { keyword: "electrical hazard", type: "Electrical Hazards", severity: "high" },
      { keyword: "electrical", type: "Electrical Hazards", severity: "medium" },
      { keyword: "electric", type: "Electrical Hazards", severity: "medium" },
      { keyword: "wire", type: "Electrical Hazards", severity: "high" },
      { keyword: "power outage", type: "Electrical Hazards", severity: "high" },
      { keyword: "water supply", type: "Water Supply", severity: "medium" },
      { keyword: "water problem", type: "Water Supply", severity: "medium" },
      { keyword: "no water", type: "Water Supply", severity: "high" },
      { keyword: "sewage", type: "Sewage & Drainage", severity: "high" },
      { keyword: "drain", type: "Sewage & Drainage", severity: "medium" },
      { keyword: "drainage", type: "Sewage & Drainage", severity: "medium" },
      { keyword: "garbage", type: "Garbage Collection", severity: "medium" },
      { keyword: "trash", type: "Garbage Collection", severity: "medium" },
      { keyword: "waste", type: "Garbage Collection", severity: "medium" },
      { keyword: "street light", type: "Street Lights", severity: "medium" },
      { keyword: "light", type: "Street Lights", severity: "medium" },
      { keyword: "lamp", type: "Street Lights", severity: "medium" },
      { keyword: "safety", type: "Public Safety", severity: "high" },
      { keyword: "danger", type: "Public Safety", severity: "critical" },
      { keyword: "noise", type: "Noise Pollution", severity: "medium" },
      { keyword: "loud", type: "Noise Pollution", severity: "medium" },
      { keyword: "construction", type: "Illegal Construction", severity: "medium" },
      { keyword: "illegal", type: "Illegal Construction", severity: "high" }
    ];
    
    const severityBoosters = [
      { keyword: "critical", severity: "critical" },
      { keyword: "emergency", severity: "critical" },
      { keyword: "urgent", severity: "high" },
      { keyword: "danger", severity: "high" },
      { keyword: "dangerous", severity: "high" },
      { keyword: "accident", severity: "critical" },
      { keyword: "injured", severity: "critical" },
      { keyword: "fire", severity: "critical" },
      { keyword: "flood", severity: "high" },
      { keyword: "blocked", severity: "high" }
    ];
    
    // Find the best matching hazard type
    let detectedHazard = "Other";
    let detectedSeverity = "medium";
    let bestMatchLength = 0;
    
    hazardKeywords.forEach(({ keyword, type, severity }) => {
      if (descriptionLower.includes(keyword) && keyword.length > bestMatchLength) {
        detectedHazard = type;
        detectedSeverity = severity;
        bestMatchLength = keyword.length;
      }
    });
    
    // Check for severity boosters
    severityBoosters.forEach(({ keyword, severity }) => {
      if (descriptionLower.includes(keyword)) {
        detectedSeverity = severity;
      }
    });
    
    return {
      hazard_type: detectedHazard,
      severity: detectedSeverity,
      confidence: 0.7,
      fallback: true,
      success: true
    };
  };

  // Debounced description analysis - triggers AI prediction
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (formData.description && formData.description.length >= 10) {
        const prediction = await predictComplaint(formData.description);
        
        if (prediction && prediction.success) {
          setFormData(prev => ({
            ...prev,
            complaintType: prediction.hazard_type,
            urgency: prediction.severity,
            department: departmentMapping[prediction.hazard_type] || "General Complaints Department"
          }));
          setAutoDetected(true);
        }
      }
    }, 1500); // Wait 1.5 seconds after user stops typing

    return () => clearTimeout(timer);
  }, [formData.description]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === "image") {
      setFormData({ ...formData, image: e.target.files[0] });
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));

      // Auto-assign department when complaint type changes
      if (name === "complaintType" && value && departmentMapping[value]) {
        setFormData(prev => ({
          ...prev,
          department: departmentMapping[value]
        }));
      }

      // Reset auto-detected status if user manually changes type or urgency
      if ((name === "complaintType" || name === "urgency") && autoDetected) {
        setAutoDetected(false);
      }
    }
  };

  // Get device location using Geolocation API
  const getDeviceLocation = () => {
    setLocationStatus("loading");
    
    if (!navigator.geolocation) {
      setLocationStatus("error");
      alert("Geolocation is not supported by your browser");
      return;
    }

    const options = {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 60000
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        
        if (!latitude || !longitude || isNaN(latitude) || isNaN(longitude)) {
          setLocationStatus("error");
          alert("Invalid location data received. Please try again or select manually.");
          return;
        }

        setDeviceLocation({ latitude, longitude });
        setMapCenter([latitude, longitude]);
        
        setFormData(prev => ({
          ...prev,
          coordinates: { lat: latitude, lng: longitude },
          location: `Coordinates: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
        }));
        
        setLocationStatus("success");
        setLocationMethod("device");
        getAddressFromCoordinates(latitude, longitude);
      },
      (error) => {
        setLocationStatus("error");
        console.error("Error getting location:", error);
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            alert("Location access denied. Please allow location access or select manually from the map.");
            break;
          case error.POSITION_UNAVAILABLE:
            alert("Location information unavailable. Please select manually from the map.");
            break;
          case error.TIMEOUT:
            alert("Location request timed out. Please try again or select manually from the map.");
            break;
          default:
            alert("An unknown error occurred while getting location.");
            break;
        }
      },
      options
    );
  };

  // Reverse geocoding to get address from coordinates
  const getAddressFromCoordinates = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
      );
      
      if (response.ok) {
        const data = await response.json();
        if (data.display_name) {
          setFormData(prev => ({
            ...prev,
            location: data.display_name
          }));
        }
      }
    } catch (error) {
      console.error("Error getting address:", error);
    }
  };

  // Manual address search
  const searchAddress = async () => {
    if (!formData.location || formData.location.trim() === "") {
      alert("Please enter an address to search");
      return;
    }

    setLocationStatus("loading");
    
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(formData.location)}&limit=1`
      );
      
      if (response.ok) {
        const data = await response.json();
        if (data.length > 0) {
          const { lat, lon, display_name } = data[0];
          const latitude = parseFloat(lat);
          const longitude = parseFloat(lon);
          
          if (isNaN(latitude) || isNaN(longitude)) {
            throw new Error("Invalid coordinates received");
          }
          
          setMapCenter([latitude, longitude]);
          
          setFormData(prev => ({
            ...prev,
            coordinates: { lat: latitude, lng: longitude },
            location: display_name
          }));
          
          setLocationStatus("success");
          setLocationMethod("manual");
        } else {
          setLocationStatus("error");
          alert("Address not found. Please try a different address or select from the map.");
        }
      }
    } catch (error) {
      setLocationStatus("error");
      console.error("Error searching address:", error);
      alert("Error searching address. Please try again.");
    }
  };

  const handleLocationSelect = (lat, lng, method = "map") => {
    if (isNaN(lat) || isNaN(lng)) {
      alert("Invalid location selected. Please try again.");
      return;
    }

    setFormData(prev => ({
      ...prev,
      coordinates: { lat, lng },
      location: `Coordinates: ${lat.toFixed(6)}, ${lng.toFixed(6)}`
    }));
    
    setMapCenter([lat, lng]);
    setLocationMethod(method);
    setLocationStatus("success");
    getAddressFromCoordinates(lat, lng);
  };

  const clearLocation = () => {
    setFormData(prev => ({
      ...prev,
      coordinates: { lat: null, lng: null },
      location: ""
    }));
    setLocationStatus("idle");
    setLocationMethod(null);
    setDeviceLocation(null);
  };

  const handleMapError = (error) => {
    console.error("Map error:", error);
    setMapError(error);
  };

  const retryMap = () => {
    setMapError(null);
    setShowMap(false);
    setTimeout(() => setShowMap(true), 100);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    // Validate required fields
    if (!formData.coordinates.lat || !formData.coordinates.lng) {
      setMessage("Please select a location for your complaint");
      setLoading(false);
      return;
    }

    if (!formData.name || !formData.phone || !formData.department || !formData.description || !formData.image) {
      setMessage("Please fill all required fields");
      setLoading(false);
      return;
    }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("department", formData.department);
      formDataToSend.append("location", formData.location);
      formDataToSend.append("coordinates", JSON.stringify(formData.coordinates));
      formDataToSend.append("description", formData.description);
      formDataToSend.append("image", formData.image);
      formDataToSend.append("name", formData.name);
      formDataToSend.append("email", formData.email);
      formDataToSend.append("phone", formData.phone);
      formDataToSend.append("complaintType", formData.complaintType);
      formDataToSend.append("urgency", formData.urgency);
      formDataToSend.append("locationMethod", locationMethod);
      formDataToSend.append("autoDetected", autoDetected);
      formDataToSend.append("predictionStatus", predictionStatus);

      const token = localStorage.getItem("accessToken");

      if (!token) {
        setMessage("Please login first");
        setLoading(false);
        return;
      }

      const res = await axios.post(`${BASE_URL}/api/complaints/createComplaint`, formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
          "Authorization": `Bearer ${token}`
        },
        withCredentials: true
      });

      setMessage("Complaint submitted successfully!");
      
      // Reset form
      setFormData({
        department: "",
        location: "",
        coordinates: { lat: null, lng: null },
        description: "",
        image: null,
        name: "",
        email: "",
        phone: "",
        complaintType: "",
        urgency: "medium"
      });
      
      setLocationStatus("idle");
      setLocationMethod(null);
      setDeviceLocation(null);
      setAutoDetected(false);
      setPredictionStatus("idle");
      
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message || "Failed to submit complaint";
      setMessage(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Render map component with error handling
  const renderMap = () => {
    if (mapError) {
      return <MapErrorFallback onRetry={retryMap} />;
    }

    return (
      <div className="h-96">
        <MapContainer
          center={mapCenter}
          zoom={13}
          style={{ height: "100%", width: "100%" }}
          scrollWheelZoom={true}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap contributors"
          />
          
          <MapController center={mapCenter} zoom={13} />
          <LocationPicker onLocationSelect={handleLocationSelect} />
          
          {deviceLocation && (
            <Marker
              position={[deviceLocation.latitude, deviceLocation.longitude]}
              icon={greenIcon}
            >
              <Popup>Your Current Location</Popup>
            </Marker>
          )}
          
          {formData.coordinates.lat && formData.coordinates.lng && (
            <Marker
              position={[formData.coordinates.lat, formData.coordinates.lng]}
              icon={redIcon}
            >
              <Popup>Complaint Location</Popup>
            </Marker>
          )}
        </MapContainer>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
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

          {/* Server Status Indicator */}
          <div className="mb-6">
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              serverStatus === 'healthy' ? 'bg-green-100 text-green-800' :
              serverStatus === 'fallback' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              {serverStatus === 'healthy' ? '🤖 AI Assistant: Online' :
               serverStatus === 'fallback' ? '⚠️ AI Assistant: Limited' :
               '❌ AI Assistant: Offline - Using Smart Detection'}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your full name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your phone number"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your email (optional)"
              />
            </div>

            {/* AI Auto-detection Section */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Problem Type *
                    {autoDetected && (
                      <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                        🤖 Auto-detected
                      </span>
                    )}
                  </label>
                  <select
                    name="complaintType"
                    value={formData.complaintType}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select or will be auto-detected</option>
                    {problemTypes.map((type, index) => (
                      <option key={index} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Severity Level *
                    {autoDetected && (
                      <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                        🤖 Auto-detected
                      </span>
                    )}
                  </label>
                  <select
                    name="urgency"
                    value={formData.urgency}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 capitalize"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>

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
                    <option value="">Select or will be auto-assigned</option>
                    {departments.map((dept, index) => (
                      <option key={index} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Department Assignment Info */}
              {formData.department && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="text-sm text-green-800 flex items-center">
                    <span className="mr-2">🏢</span>
                    <div>
                      <strong>Automatically Assigned to:</strong> {formData.department}
                      {formData.complaintType && (
                        <span className="text-green-600 ml-2">
                          (Based on problem type: {formData.complaintType})
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Prediction Status */}
            {predictionStatus === "loading" && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="text-sm text-blue-800 flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-800 mr-2"></div>
                  🤖 AI is analyzing your description and detecting problem type, severity level, and appropriate department...
                </div>
              </div>
            )}

            {predictionStatus === "error" && serverStatus === "offline" && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="text-sm text-yellow-800">
                  ⚠️ AI server offline. Using smart keyword detection. Please verify the auto-detected values.
                </div>
              </div>
            )}

            {predictionStatus === "success" && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="text-sm text-green-800 flex items-center">
                  <span className="mr-2">✅</span>
                  AI analysis complete! Problem type, severity, and department have been auto-detected.
                </div>
              </div>
            )}

            {/* Location Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location *
              </label>
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2 mb-3">
                  <button
                    type="button"
                    onClick={getDeviceLocation}
                    disabled={locationStatus === "loading"}
                    className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed transition-colors"
                  >
                    {locationStatus === "loading" ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Detecting...
                      </>
                    ) : (
                      "📍 Use My Location"
                    )}
                  </button>
                  
                  <button
                    type="button"
                    onClick={searchAddress}
                    disabled={locationStatus === "loading"}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors"
                  >
                    🔍 Search Address
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => setShowMap(!showMap)}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    {showMap ? "🗺️ Hide Map" : "🗺️ Select on Map"}
                  </button>
                  
                  {(formData.coordinates.lat && formData.coordinates.lng) && (
                    <button
                      type="button"
                      onClick={clearLocation}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      ❌ Clear Location
                    </button>
                  )}
                </div>

                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="Enter address or use location buttons above"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />

                {formData.coordinates.lat && formData.coordinates.lng && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="text-sm text-green-800">
                      <strong>📍 Location Selected:</strong><br />
                      Coordinates: {formData.coordinates.lat.toFixed(6)}, {formData.coordinates.lng.toFixed(6)}<br />
                      Method: {locationMethod === "device" ? "Device GPS" : locationMethod === "manual" ? "Address Search" : "Map Click"}
                    </div>
                  </div>
                )}

                {locationStatus === "error" && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="text-sm text-red-800">
                      <strong>⚠️ Location Error:</strong> Please select location manually from the map.
                    </div>
                  </div>
                )}

                {showMap && (
                  <div className="border border-gray-300 rounded-lg overflow-hidden">
                    {renderMap()}
                    
                    <div className="p-3 bg-gray-50 border-t border-gray-200">
                      <div className="text-sm text-gray-600 space-y-1">
                        <p><strong>Location Selection Methods:</strong></p>
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                          <span>Green marker - Your device location</span>
                        </div>
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                          <span>Red marker - Selected complaint location</span>
                        </div>
                        <p className="mt-1">💡 <strong>Tip:</strong> Click anywhere on the map to select precise location</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
                <span className="text-xs text-gray-500 ml-2">
                  (Type at least 10 characters for AI auto-detection)
                </span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe the issue in detail. Our AI will automatically detect the problem type, severity level, and assign to the appropriate department. Example: 'There is a large pothole on Main Street causing traffic hazards and vehicle damage'"
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

            {/* Summary Card */}
            {(formData.complaintType || formData.department) && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-blue-800 mb-2">📋 Complaint Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  {formData.complaintType && (
                    <div>
                      <span className="font-medium text-blue-700">Problem Type:</span> {formData.complaintType}
                    </div>
                  )}
                  {formData.urgency && (
                    <div>
                      <span className="font-medium text-blue-700">Severity:</span> 
                      <span className={`ml-1 capitalize ${
                        formData.urgency === "critical" ? "text-red-600 font-bold" :
                        formData.urgency === "high" ? "text-orange-600 font-semibold" :
                        formData.urgency === "medium" ? "text-yellow-600" : "text-green-600"
                      }`}>
                        {formData.urgency}
                      </span>
                    </div>
                  )}
                  {formData.department && (
                    <div className="md:col-span-2">
                      <span className="font-medium text-blue-700">Assigned Department:</span> 
                      <span className="ml-1 font-semibold text-green-700">{formData.department}</span>
                    </div>
                  )}
                  {autoDetected && (
                    <div className="md:col-span-2">
                      <span className="font-medium text-blue-700">Detection Method:</span> 
                      <span className="ml-1 text-green-600">🤖 AI Auto-detection</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !formData.coordinates.lat || locationStatus === "loading"}
              className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 hover:scale-105 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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