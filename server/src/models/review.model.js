import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
    complaintId: { type: mongoose.Schema.Types.ObjectId, ref: 'Complaint', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    rating: { type: Number, min: 1, max: 5, required: true },
    feedback: { type: String },
}, { timestamps: true });

const Review = mongoose.model('Review', reviewSchema);

export default Review;