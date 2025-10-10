import express from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import Complaint from '../models/complaint.model.js';
import { ApiError } from '../utils/ApiError.js';
import User from '../models/user.model.js';
import Review from '../models/review.model.js';

// ✅ Create Review (only if complaint is resolved or rejected)
const createReview = asyncHandler(async (req, res) => {
  try {
    const { complaintId, rating, comment } = req.body;

    // find logged-in user
    const user = req.user?._id ? await User.findById(req.user._id) : null;
    if (!user) throw new ApiError("User not found", 404);

    // only citizens can create review
    if (user.accountType !== 'Citizen') {
      throw new ApiError("Only citizens can create reviews", 403);
    }

    // check complaint
    const complaint = await Complaint.findById(complaintId);
    if (!complaint) throw new ApiError("Complaint not found", 404);

    // verify ownership
    if (complaint.userId.toString() !== user._id.toString()) {
      throw new ApiError("You are not authorized to review this complaint", 403);
    }

    // ✅ allow only if resolved or rejected
    if (!['resolved', 'rejected'].includes(complaint.status)) {
      throw new ApiError("You can only review resolved or rejected complaints", 400);
    }

    // validate rating
    if (rating < 1 || rating > 5) {
      throw new ApiError("Rating must be between 1 and 5", 400);
    }

    // check if review already exists
    const existingReview = await Review.findOne({ complaintId, userId: user._id });
    if (existingReview) {
      throw new ApiError("You have already reviewed this complaint", 400);
    }

    // create review
    const review = await Review.create({
      complaintId,
      userId: user._id,
      rating,
      feedback: comment,
    });

    return res.status(200).json(
      new ApiResponse(200, review, "Review created successfully")
    );
  } catch (error) {
    throw new ApiError(
      error?.message || "Something went wrong while creating the review",
      error?.code || 500
    );
  }
});

// ✅ Get reviews for a complaint
const getReviewsForComplaint = asyncHandler(async (req, res) => {
  try {
    const { complaintId } = req.params;
    const complaint = await Complaint.findById(complaintId);
    if (!complaint) throw new ApiError("Complaint not found", 404);

    const reviews = await Review.find({ complaintId }).populate('userId', 'firstName lastName email');
    return res.status(200).json(new ApiResponse(200, reviews, "Reviews fetched successfully"));
  } catch (error) {
    throw new ApiError(error?.message || "Something went wrong while fetching reviews", error?.code || 500);
  }
});

// ✅ Get reviews by logged-in user
const getReviewsByUser = asyncHandler(async (req, res) => {
  try {
    const user = req.user?._id ? await User.findById(req.user._id) : null;
    if (!user) throw new ApiError("User not found", 404);

    const reviews = await Review.find({ userId: user._id })
      .populate({ path: 'userId', select: 'firstName lastName email' });

    if (!reviews || reviews.length === 0)
      throw new ApiError("No reviews found for this user", 404);

    return res.status(200).json(new ApiResponse(200, reviews, "Reviews fetched successfully"));
  } catch (error) {
    throw new ApiError(error?.message || "Something went wrong while fetching user reviews", error?.code || 500);
  }
});

// ✅ Get all reviews
const getAllReviews = asyncHandler(async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate({ path: 'userId', select: 'firstName lastName email' });
    if (!reviews || reviews.length === 0)
      throw new ApiError("No reviews found", 404);

    return res.status(200).json(new ApiResponse(200, reviews, "All reviews fetched successfully"));
  } catch (error) {
    throw new ApiError(error?.message || "Something went wrong while fetching reviews", error?.code || 500);
  }
});

// ✅ Get single review by ID
const getReviewById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const review = await Review.findById(id)
      .populate({ path: 'userId', select: 'firstName lastName email' });
    if (!review) throw new ApiError("Review not found", 404);

    return res.status(200).json(new ApiResponse(200, review, "Review fetched successfully"));
  } catch (error) {
    throw new ApiError(error?.message || "Something went wrong while fetching the review", error?.code || 500);
  }
});

export {
  createReview,
  getReviewsForComplaint,
  getReviewsByUser,
  getAllReviews,
  getReviewById,
};
