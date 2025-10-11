import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ComplaintReview = () => {
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedReview, setSelectedReview] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchAllReviews();
  }, []);
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const fetchAllReviews = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.get(`${BASE_URL}/api/reviews/getAllReviews`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReviews(response.data.data || response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch reviews');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (review) => {
    setSelectedReview(review);
    setShowModal(true);
  };

  const closeModal = () => {
    setSelectedReview(null);
    setShowModal(false);
  };

  const getRatingStars = (rating) => {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  const getRatingColor = (rating) => {
    if (rating >= 4) return 'text-green-600';
    if (rating >= 3) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) return <div className="p-6">Loading reviews...</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Complaint Reviews</h1>
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-600">
            Total Reviews: {reviews.length}
          </div>
          <button
            onClick={() => navigate('/staff')}
            className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 cursor-pointer"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Reviews Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reviews.map((review) => (
          <div key={review._id} className="bg-white rounded-lg shadow-md p-6 border">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-semibold text-lg">
                  {review.userId?.firstName} {review.userId?.lastName}
                </h3>
                <p className="text-sm text-gray-600">{review.userId?.email}</p>
              </div>
              <div className="text-right">
                <div className={`text-xl ${getRatingColor(review.rating)}`}>
                  {getRatingStars(review.rating)}
                </div>
                <div className="text-sm text-gray-500">
                  {review.rating}/5
                </div>
              </div>
            </div>

            {review.feedback && (
              <div className="mb-4">
                <p className="text-gray-700 text-sm line-clamp-3">
                  {review.feedback}
                </p>
              </div>
            )}

            <div className="flex justify-between items-center text-xs text-gray-500">
              <span>
                {new Date(review.createdAt).toLocaleDateString()}
              </span>
              <button
                onClick={() => handleViewDetails(review)}
                className="text-blue-600 hover:text-blue-800 cursor-pointer"
              >
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>

      {reviews.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg">No reviews found</div>
          <p className="text-gray-400 mt-2">Reviews will appear here once citizens submit feedback</p>
        </div>
      )}

      {/* Review Details Modal */}
      {showModal && selectedReview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Review Details</h2>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700 text-2xl cursor-pointer"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reviewer
                </label>
                <p className="text-gray-900">
                  {selectedReview.userId?.firstName} {selectedReview.userId?.lastName}
                </p>
                <p className="text-sm text-gray-600">{selectedReview.userId?.email}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rating
                </label>
                <div className="flex items-center space-x-2">
                  <span className={`text-2xl ${getRatingColor(selectedReview.rating)}`}>
                    {getRatingStars(selectedReview.rating)}
                  </span>
                  <span className="text-lg font-semibold">
                    {selectedReview.rating}/5
                  </span>
                </div>
              </div>

              {selectedReview.feedback && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Feedback
                  </label>
                  <p className="text-gray-900 bg-gray-50 p-3 rounded">
                    {selectedReview.feedback}
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Submitted On
                </label>
                <p className="text-gray-900">
                  {new Date(selectedReview.createdAt).toLocaleString()}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Complaint ID
                </label>
                <p className="text-gray-900 font-mono text-sm">
                  {selectedReview.complaintId}
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={closeModal}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComplaintReview;
