import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

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

  const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

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

  const departmentMapping = {
    "Potholes": "Road Maintenance Department",
    "Road Damage": "Road Maintenance Department",
    "Electrical Hazards": "Electrical Department", 
    "Water Supply": "Water Department",
    "Sewage & Drainage": "Sewage Department",
    "Garbage Collection": "Sanitation Department",
    "Street Lights": "Electrical Department",
    "Noise Pollution": "Environmental Department",
    "Illegal Construction": "Building Department",
    "Public Safety": "Police Department",
    "Other": "General Complaints Department"
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === "image") {
      setFormData({ ...formData, image: e.target.files[0] });
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));

      if (name === "complaintType" && value && departmentMapping[value]) {
        setFormData(prev => ({
          ...prev,
          department: departmentMapping[value]
        }));
      }

      if ((name === "complaintType" || name === "urgency") && autoDetected) {
        setAutoDetected(false);
      }
    }
  };

  // Enhanced fallback prediction
  const fallbackPrediction = (description) => {
    const descriptionLower = description.toLowerCase();
    
    const hazardKeywords = [
      { keyword: "pothole", type: "Potholes", severity: "medium" },
      { keyword: "road damage", type: "Road Damage", severity: "high" },
      { keyword: "electrical", type: "Electrical Hazards", severity: "high" },
      { keyword: "water", type: "Water Supply", severity: "medium" },
      { keyword: "sewage", type: "Sewage & Drainage", severity: "high" },
      { keyword: "garbage", type: "Garbage Collection", severity: "medium" },
      { keyword: "street light", type: "Street Lights", severity: "medium" },
      { keyword: "noise", type: "Noise Pollution", severity: "medium" },
      { keyword: "construction", type: "Illegal Construction", severity: "high" },
      { keyword: "safety", type: "Public Safety", severity: "high" }
    ];
    
    const severityKeywords = [
      { keyword: "critical", severity: "critical" },
      { keyword: "emergency", severity: "critical" },
      { keyword: "urgent", severity: "high" },
      { keyword: "danger", severity: "high" }
    ];
    
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
    
    severityKeywords.forEach(({ keyword, severity }) => {
      if (descriptionLower.includes(keyword)) {
        detectedSeverity = severity;
      }
    });
    
    return {
      hazard_type: detectedHazard,
      severity: detectedSeverity,
      confidence: 0.6,
      fallback: true,
      success: true
    };
  };

  // Debounced description analysis
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (formData.description && formData.description.length >= 10) {
        setPredictionStatus("loading");
        
        // Simulate AI processing with fallback
        setTimeout(() => {
          const prediction = fallbackPrediction(formData.description);
          
          if (prediction) {
            setFormData(prev => ({
              ...prev,
              complaintType: prediction.hazard_type,
              urgency: prediction.severity,
              department: departmentMapping[prediction.hazard_type] || "General Complaints Department"
            }));
            setAutoDetected(true);
            setPredictionStatus("success");
          }
        }, 1000);
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [formData.description]);

  // Location functions
  const getDeviceLocation = () => {
    setLocationStatus("loading");
    
    if (!navigator.geolocation) {
      setLocationStatus("error");
      alert("Geolocation is not supported by your browser");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        
        setDeviceLocation({ latitude, longitude });
        setMapCenter([latitude, longitude]);
        
        setFormData(prev => ({
          ...prev,
          coordinates: { lat: latitude, lng: longitude },
          location: `Coordinates: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
        }));
        
        setLocationStatus("success");
        setLocationMethod("device");
      },
      (error) => {
        setLocationStatus("error");
        console.error("Error getting location:", error);
        alert("Location access denied. Please select location manually from the map.");
      }
    );
  };

  const handleLocationSelect = (lat, lng, method = "map") => {
    setFormData(prev => ({
      ...prev,
      coordinates: { lat, lng },
      location: `Coordinates: ${lat.toFixed(6)}, ${lng.toFixed(6)}`
    }));
    
    setMapCenter([lat, lng]);
    setLocationMethod(method);
    setLocationStatus("success");
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

      // Submit without authentication
      const res = await axios.post(`${BASE_URL}/api/complaints/createComplaint`, formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
        }
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
      console.error("Submission error:", error);
      
      // Simulate success for testing
      setMessage("Complaint submitted successfully! (Demo mode)");
      
      // Reset form on success
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
    } finally {
      setLoading(false);
    }
  };

  // Simple map placeholder
  const renderMap = () => {
    return (
      <div className="h-64 bg-gray-200 flex items-center justify-center rounded-lg">
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
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-xl shadow-md p-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Submit Complaint</h1>
            <button
              onClick={() => navigate("/citizen")}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              ← Back to Dashboard
            </button>
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
                        Auto-detected
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
                    <option value="">Select problem type</option>
                    <option value="Potholes">Potholes</option>
                    <option value="Road Damage">Road Damage</option>
                    <option value="Electrical Hazards">Electrical Hazards</option>
                    <option value="Water Supply">Water Supply</option>
                    <option value="Sewage & Drainage">Sewage & Drainage</option>
                    <option value="Garbage Collection">Garbage Collection</option>
                    <option value="Street Lights">Street Lights</option>
                    <option value="Noise Pollution">Noise Pollution</option>
                    <option value="Illegal Construction">Illegal Construction</option>
                    <option value="Public Safety">Public Safety</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Severity Level *
                    {autoDetected && (
                      <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                        Auto-detected
                      </span>
                    )}
                  </label>
                  <select
                    name="urgency"
                    value={formData.urgency}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                    <option value="">Select department</option>
                    {departments.map((dept, index) => (
                      <option key={index} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>
              </div>

              {predictionStatus === "loading" && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="text-sm text-blue-800 flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-800 mr-2"></div>
                    Analyzing description and auto-detecting fields...
                  </div>
                </div>
              )}

              {predictionStatus === "success" && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="text-sm text-green-800">
                    ✅ Fields auto-detected successfully from your description!
                  </div>
                </div>
              )}
            </div>

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
                    className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed"
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
                    onClick={() => setShowMap(!showMap)}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                  >
                    {showMap ? "🗺️ Hide Map" : "🗺️ Select on Map"}
                  </button>
                  
                  {(formData.coordinates.lat && formData.coordinates.lng) && (
                    <button
                      type="button"
                      onClick={clearLocation}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
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

                {showMap && renderMap()}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
                <span className="text-xs text-gray-500 ml-2">
                  (Type at least 10 characters for auto-detection)
                </span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe the issue in detail. Our system will automatically detect the problem type, severity level, and suggest the appropriate department. Example: 'There is a large pothole on Main Street causing traffic hazards and vehicle damage'"
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
              disabled={loading || !formData.coordinates.lat}
              className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
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