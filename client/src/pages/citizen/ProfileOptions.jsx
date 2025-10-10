import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function ProfileOptions() {
    const navigate = useNavigate();
    const [userProfile, setUserProfile] = useState({
        firstName: "",
        lastName: "",
        email: "",
        contactNumber: "",
        gender: "",
        dateOfBirth: "",
        about: "",
        image: ""
    });
    const [selectedImageFile, setSelectedImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState("");
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [message, setMessage] = useState("");
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);

    useEffect(() => {
        fetchUserProfile();
    }, []);

    const fetchUserProfile = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            const res = await axios.get("/api/profile/me", {
                headers: { "Authorization": `Bearer ${token}` },
                withCredentials: true
            });
            setUserProfile(res.data.data);
        } catch (error) {
            setMessage("Failed to fetch profile data");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setUserProfile({ ...userProfile, [e.target.name]: e.target.value });
    };

    const handleImageSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setSelectedImageFile(file);
        
        // Create preview
        const reader = new FileReader();
        reader.onload = (e) => {
            setImagePreview(e.target.result);
        };
        reader.readAsDataURL(file);
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setUpdating(true);
        setMessage("");

        try {
            const token = localStorage.getItem('accessToken');
            
            // Upload image first if selected
            if (selectedImageFile) {
                const formData = new FormData();
                formData.append('image', selectedImageFile);
                
                await axios.put('/api/profile/update-image', formData, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                });
            }
            
            // Update profile data
            const { image, ...profileData } = userProfile;
            await axios.put("/api/profile/update", profileData, {
                headers: { "Authorization": `Bearer ${token}` },
                withCredentials: true
            });
            
            setMessage("Profile updated successfully!");
            setSelectedImageFile(null);
            setImagePreview("");
            
            // Scroll to top immediately
            window.scrollTo(0, 0);
            
            // Reload page after 1.5 seconds
            setTimeout(() => {
                window.location.reload();
            }, 1500);
        } catch (error) {
            setMessage(error.response?.data?.message || "Failed to update profile");
        } finally {
            setUpdating(false);
        }
    };

    const handleDeleteAccount = async () => {
        setDeleteLoading(true);
        try {
            const token = localStorage.getItem('accessToken');
            await axios.delete("/api/profile/delete", {
                headers: { "Authorization": `Bearer ${token}` },
                withCredentials: true
            });
            localStorage.removeItem('accessToken');
            navigate("/");
        } catch (error) {
            setMessage("Failed to delete account");
            setDeleteLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-xl">Loading profile...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-2xl mx-auto px-4">
                <div className="bg-white rounded-xl shadow-md p-8">
                    <div className="flex items-center justify-between mb-6">
                        <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
                        <button
                            onClick={() => navigate("/citizen")}
                            className="text-blue-600 hover:text-blue-800 font-medium cursor-pointer"
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

                    <form onSubmit={handleUpdateProfile} className="space-y-6">
                        {/* Profile Image */}
                        <div className="flex items-center space-x-6">
                            <div className="shrink-0">
                                <img
                                    className="h-16 w-16 object-cover rounded-full"
                                    src={imagePreview || userProfile.image || "https://via.placeholder.com/64"}
                                    alt="Profile"
                                />
                            </div>
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Profile Picture
                                </label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageSelect}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    First Name *
                                </label>
                                <input
                                    type="text"
                                    name="firstName"
                                    value={userProfile.firstName}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Last Name *
                                </label>
                                <input
                                    type="text"
                                    name="lastName"
                                    value={userProfile.lastName}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                                value={userProfile.email}
                                readOnly
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                            />
                            <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Contact Number
                            </label>
                            <input
                                type="tel"
                                name="contactNumber"
                                value={userProfile.contactNumber || ""}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Gender
                                </label>
                                <select
                                    name="gender"
                                    value={userProfile.gender || ""}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="">Select Gender</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Date of Birth
                                </label>
                                <input
                                    type="date"
                                    name="dateOfBirth"
                                    value={userProfile.dateOfBirth ? userProfile.dateOfBirth.split('T')[0] : ""}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                About
                            </label>
                            <textarea
                                name="about"
                                value={userProfile.about || ""}
                                onChange={handleChange}
                                rows={3}
                                placeholder="Tell us about yourself..."
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={updating}
                            className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 hover:scale-105 transition cursor-pointer disabled:opacity-50"
                        >
                            {updating ? "Updating..." : "Update Profile"}
                        </button>
                    </form>

                    {/* Delete Account Section */}
                    <div className="mt-8 pt-6 border-t border-gray-200">
                        <h3 className="text-lg font-semibold text-red-600 mb-4">Danger Zone</h3>
                        {!showDeleteConfirm ? (
                            <button
                                onClick={() => setShowDeleteConfirm(true)}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition cursor-pointer"
                            >
                                Delete Account
                            </button>
                        ) : (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                <p className="text-red-800 mb-4">
                                    ⚠️ Are you sure you want to delete your account? This action cannot be undone.
                                </p>
                                <div className="flex gap-3">
                                    <button
                                        onClick={handleDeleteAccount}
                                        disabled={deleteLoading}
                                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition cursor-pointer disabled:opacity-50"
                                    >
                                        {deleteLoading ? "Deleting..." : "Yes, Delete Account"}
                                    </button>
                                    <button
                                        onClick={() => setShowDeleteConfirm(false)}
                                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition cursor-pointer"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
