import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function ResourceManagement() {
    const navigate = useNavigate();
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [editingResource, setEditingResource] = useState(null);
    const [filters, setFilters] = useState({ status: "" });
    
    const [formData, setFormData] = useState({
        resourceName: "",
        department: "", // Will be auto-populated from user profile
        category: "",
        status: "Available",
        location: "",
        nextAvailable: "",
        description: ""
    });
    
    const [userDepartment, setUserDepartment] = useState("");

    const statusOptions = ["Available", "In Use", "Under Maintenance", "Unavailable"];
    const departments = [
        "Public Works Department (PWD)",
        "Sanitation Department", 
        "Water Supply Department",
        "Electricity Department",
        "Parks & Environment Department"
    ];

    useEffect(() => {
        fetchUserProfile();
        fetchResources();
    }, [filters]);
    
    const fetchUserProfile = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            const res = await axios.get("http://localhost:8000/api/profile/getProfile", {
                headers: { "Authorization": `Bearer ${token}` },
                withCredentials: true
            });
            const department = res.data.data.department;
            setUserDepartment(department);
            setFormData(prev => ({ ...prev, department }));
        } catch (error) {
            console.error("Failed to fetch user profile");
        }
    };

    const fetchResources = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('accessToken');
            const params = new URLSearchParams();
            if (filters.status) params.append('status', filters.status);

            
            const res = await axios.get(`http://localhost:8000/api/resources?${params}`, {
                headers: { "Authorization": `Bearer ${token}` },
                withCredentials: true
            });
            setResources(res.data || []);
        } catch (error) {
            setMessage("Failed to fetch resources");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");

        try {
            const token = localStorage.getItem('accessToken');
            if (editingResource) {
                await axios.put(`http://localhost:8000/api/resources/${editingResource._id}`, formData, {
                    headers: { "Authorization": `Bearer ${token}` },
                    withCredentials: true
                });
                setMessage("Resource updated successfully!");
            } else {
                await axios.post("http://localhost:8000/api/resources", formData, {
                    headers: { "Authorization": `Bearer ${token}` },
                    withCredentials: true
                });
                setMessage("Resource created successfully!");
            }
            
            resetForm();
            fetchResources();
        } catch (error) {
            setMessage(error.response?.data?.error || "Failed to save resource");
        } finally {
            setLoading(false);
        }
    };

    const handleRetire = async (resourceId) => {
        if (!confirm("Are you sure you want to retire this resource?")) return;
        
        try {
            const token = localStorage.getItem('accessToken');
            await axios.patch(`http://localhost:8000/api/resources/${resourceId}/retire`, {}, {
                headers: { "Authorization": `Bearer ${token}` },
                withCredentials: true
            });
            setMessage("Resource retired successfully!");
            fetchResources();
        } catch (error) {
            setMessage("Failed to retire resource");
        }
    };

    const handleEdit = (resource) => {
        setEditingResource(resource);
        setFormData({
            resourceName: resource.resourceName,
            department: resource.department,
            category: resource.category,
            status: resource.status,
            location: resource.location,
            nextAvailable: resource.nextAvailable ? resource.nextAvailable.split('T')[0] : "",
            description: resource.description || ""
        });
        setShowCreateForm(true);
    };

    const resetForm = () => {
        setFormData({
            resourceName: "",
            department: userDepartment, // Keep user's department
            category: "",
            status: "Available",
            location: "",
            nextAvailable: "",
            description: ""
        });
        setEditingResource(null);
        setShowCreateForm(false);
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4">
                <div className="bg-white rounded-xl shadow-md p-8">
                    <div className="flex items-center justify-between mb-6">
                        <h1 className="text-2xl font-bold text-gray-900">Resource Management</h1>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowCreateForm(!showCreateForm)}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition cursor-pointer"
                            >
                                {showCreateForm ? "Cancel" : "+ Add Resource"}
                            </button>
                            <button
                                onClick={() => navigate("/staff")}
                                className="text-blue-600 hover:text-blue-800 font-medium cursor-pointer"
                            >
                                ← Back to Dashboard
                            </button>
                        </div>
                    </div>

                    {message && (
                        <div className={`mb-4 p-4 rounded-lg text-center ${
                            message.includes("successfully") ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                        }`}>
                            {message}
                        </div>
                    )}

                    {/* Filters */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <select
                            name="status"
                            value={filters.status}
                            onChange={handleFilterChange}
                            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">All Status</option>
                            {statusOptions.map(status => (
                                <option key={status} value={status}>{status}</option>
                            ))}
                        </select>
                    </div>

                    {/* Create/Edit Form */}
                    {showCreateForm && (
                        <div className="mb-8 p-6 bg-gray-50 rounded-lg">
                            <h3 className="text-lg font-semibold mb-4">
                                {editingResource ? "Edit Resource" : "Create New Resource"}
                            </h3>
                            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Resource Name *</label>
                                    <input
                                        type="text"
                                        name="resourceName"
                                        placeholder="Enter resource name"
                                        value={formData.resourceName}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                                    <input
                                        type="text"
                                        name="category"
                                        placeholder="Enter category"
                                        value={formData.category}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                    <select
                                        name="status"
                                        value={formData.status}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                    >
                                        {statusOptions.map(status => (
                                            <option key={status} value={status}>{status}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
                                    <input
                                        type="text"
                                        name="location"
                                        placeholder="Enter location"
                                        value={formData.location}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Next Available Date</label>
                                    <input
                                        type="date"
                                        name="nextAvailable"
                                        value={formData.nextAvailable}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                    <textarea
                                        name="description"
                                        placeholder="Enter description (optional)"
                                        value={formData.description}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                        rows={3}
                                    />
                                </div>
                                <div className="md:col-span-2 flex gap-3">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition cursor-pointer disabled:opacity-50"
                                    >
                                        {loading ? "Saving..." : editingResource ? "Update" : "Create"}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={resetForm}
                                        className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition cursor-pointer"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Resources List */}
                    {loading ? (
                        <div className="text-center py-8">Loading resources...</div>
                    ) : resources.length === 0 ? (
                        <div className="text-center py-8">
                            <div className="text-4xl mb-4">📦</div>
                            <p className="text-gray-500">No resources found</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {resources.map((resource) => (
                                <div key={resource._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                                    <div className="flex justify-between items-start mb-3">
                                        <h3 className="font-semibold text-lg text-gray-900">{resource.resourceName}</h3>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                            resource.status === 'Available' ? 'bg-green-100 text-green-800' :
                                            resource.status === 'In Use' ? 'bg-blue-100 text-blue-800' :
                                            resource.status === 'Under Maintenance' ? 'bg-yellow-100 text-yellow-800' :
                                            'bg-red-100 text-red-800'
                                        }`}>
                                            {resource.status}
                                        </span>
                                    </div>
                                    <div className="space-y-2 text-sm text-gray-600 mb-4">
                                        <p><span className="font-medium">Department:</span> {resource.department}</p>
                                        <p><span className="font-medium">Category:</span> {resource.category}</p>
                                        <p><span className="font-medium">Location:</span> {resource.location}</p>
                                        {resource.nextAvailable && (
                                            <p><span className="font-medium">Next Available:</span> {new Date(resource.nextAvailable).toLocaleDateString()}</p>
                                        )}
                                        {resource.description && (
                                            <p><span className="font-medium">Description:</span> {resource.description}</p>
                                        )}
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleEdit(resource)}
                                            className="flex-1 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition cursor-pointer text-sm"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleRetire(resource._id)}
                                            className="flex-1 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition cursor-pointer text-sm"
                                        >
                                            Retire
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
