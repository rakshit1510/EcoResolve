import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function Feedback() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("create");
    const [myReviews, setMyReviews] = useState([]);
    const [resolvedComplaints, setResolvedComplaints] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    
    // Create Review Form State
    const [reviewForm, setReviewForm] = useState({
        complaintId: "",
        rating: 5,
        comment: ""
    });

    useEffect(() => {
        if (activeTab === "my-reviews") {
            fetchMyReviews();
        } else if (activeTab === "create") {
            fetchResolvedComplaints();
        }
    }, [activeTab]);

    const fetchMyReviews = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('accessToken');
            const res = await axios.get("http://localhost:8000/api/reviews/my-reviews", {
                headers: { "Authorization": `Bearer ${token}` },
                withCredentials: true
            });
            setMyReviews(res.data.data || []);
        } catch (error) {
            setMessage("Failed to fetch your reviews");
        } finally {
            setLoading(false);
        }
    };

    const fetchResolvedComplaints = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('accessToken');
            const res = await axios.get("http://localhost:8000/api/complaints/my-complaints", {
                headers: { "Authorization": `Bearer ${token}` },
                withCredentials: true
            });
            // Filter only resolved complaints
            const resolved = res.data.data?.filter(complaint => complaint.status === 'resolved') || [];
            setResolvedComplaints(resolved);
        } catch (error) {
            setMessage("Failed to fetch resolved complaints");
        } finally {
            setLoading(false);
        }
    };

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");

        try {
            const token = localStorage.getItem('accessToken');
            await axios.post("http://localhost:8000/api/reviews/createReview", reviewForm, {
                headers: { "Authorization": `Bearer ${token}` },
                withCredentials: true
            });
            setMessage("Review submitted successfully!");
            setReviewForm({ complaintId: "", rating: 5, comment: "" });
            fetchResolvedComplaints();
        } catch (error) {
            setMessage(error.response?.data?.message || "Failed to submit review");
        } finally {
            setLoading(false);
        }
    };

    const renderStars = (rating, interactive = false, onChange = null) => {
        return (
            <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        type={interactive ? "button" : undefined}
                        onClick={interactive ? () => onChange(star) : undefined}
                        className={`text-2xl ${interactive ? 'cursor-pointer hover:scale-110' : ''} transition ${
                            star <= rating ? 'text-yellow-400' : 'text-gray-300'
                        }`}
                        disabled={!interactive}
                    >
                        ⭐
                    </button>
                ))}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4">
                <div className="bg-white rounded-xl shadow-md">
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b">
                        <h1 className="text-2xl font-bold text-gray-900">Reviews & Feedback</h1>
                        <button
                            onClick={() => navigate("/citizen")}
                            className="text-blue-600 hover:text-blue-800 font-medium cursor-pointer"
                        >
                            ← Back to Dashboard
                        </button>
                    </div>

                    {/* Tabs */}
                    <div className="flex border-b">
                        <button
                            onClick={() => setActiveTab("create")}
                            className={`flex-1 py-4 px-6 text-center font-semibold transition cursor-pointer ${
                                activeTab === "create"
                                    ? "bg-blue-600 text-white"
                                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                            }`}
                        >
                            📝 Create Review
                        </button>
                        <button
                            onClick={() => setActiveTab("my-reviews")}
                            className={`flex-1 py-4 px-6 text-center font-semibold transition cursor-pointer ${
                                activeTab === "my-reviews"
                                    ? "bg-blue-600 text-white"
                                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                            }`}
                        >
                            📋 My Reviews
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                        {message && (
                            <div className={`mb-4 p-4 rounded-lg text-center ${
                                message.includes("successfully") ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                            }`}>
                                {message}
                            </div>
                        )}

                        {/* Create Review Tab */}
                        {activeTab === "create" && (
                            <div>
                                <h3 className="text-lg font-semibold mb-4">Rate Your Resolved Complaints</h3>
                                {loading ? (
                                    <div className="text-center py-8">Loading...</div>
                                ) : resolvedComplaints.length === 0 ? (
                                    <div className="text-center py-8">
                                        <div className="text-4xl mb-4">📋</div>
                                        <p className="text-gray-500">No resolved complaints to review</p>
                                    </div>
                                ) : (
                                    <form onSubmit={handleReviewSubmit} className="space-y-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Select Complaint to Review *
                                            </label>
                                            <select
                                                value={reviewForm.complaintId}
                                                onChange={(e) => setReviewForm({...reviewForm, complaintId: e.target.value})}
                                                required
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                            >
                                                <option value="">Choose a resolved complaint</option>
                                                {resolvedComplaints.map((complaint) => (
                                                    <option key={complaint._id} value={complaint._id}>
                                                        {complaint.department} - {complaint.location}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Rating *
                                            </label>
                                            {renderStars(reviewForm.rating, true, (rating) => 
                                                setReviewForm({...reviewForm, rating})
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Comment *
                                            </label>
                                            <textarea
                                                value={reviewForm.comment}
                                                onChange={(e) => setReviewForm({...reviewForm, comment: e.target.value})}
                                                placeholder="Share your experience with the resolution..."
                                                required
                                                rows={4}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 hover:scale-105 transition cursor-pointer disabled:opacity-50"
                                        >
                                            {loading ? "Submitting..." : "Submit Review"}
                                        </button>
                                    </form>
                                )}
                            </div>
                        )}

                        {/* My Reviews Tab */}
                        {activeTab === "my-reviews" && (
                            <div>
                                <h3 className="text-lg font-semibold mb-4">Your Reviews</h3>
                                {loading ? (
                                    <div className="text-center py-8">Loading...</div>
                                ) : myReviews.length === 0 ? (
                                    <div className="text-center py-8">
                                        <div className="text-4xl mb-4">⭐</div>
                                        <p className="text-gray-500">You haven't submitted any reviews yet</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {myReviews.map((review) => (
                                            <div key={review._id} className="border border-gray-200 rounded-lg p-4">
                                                <div className="flex justify-between items-start mb-2">
                                                    <div>
                                                        <h4 className="font-semibold text-gray-900">
                                                            {review.complaint?.department} - {review.complaint?.location}
                                                        </h4>
                                                        <p className="text-sm text-gray-500">
                                                            Reviewed on {new Date(review.createdAt).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                    {renderStars(review.rating)}
                                                </div>
                                                <p className="text-gray-700">{review.comment}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
