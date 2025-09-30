import express from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/ApiResponse.js';
import Complaint from '../models/complaint.model.js';
import { ApiError } from '../utils/ApiError.js';
import User from '../models/user.model.js';
import { isCitizen, isStaff, verifyJWT } from '../middlewares/auth.middleware.js';
import Review from '../models/review.model.js';

const createReview = asyncHandler(async (req, res) => {
    try {
        const { complaintId, rating, comment } = req.body;      
       
        if (!user) throw new ApiError("User not found", 404);
        if (user.accountType !== 'Citizen') {
            throw new ApiError("Only citizens can create reviews", 403);
        }
        const complaint = await Complaint.findById(complaintId); const user = req.user._id ? await User.findById(req.user._id) : null;
        if (!complaint) throw new ApiError("Complaint not found", 404);
        if (complaint.user._id.toString() !== user._id.toString()) {
            throw new ApiError("You are not authorized to review this complaint", 403);
        }
        if (rating < 1 || rating > 5) {
            throw new ApiError("Rating must be between 1 and 5", 400);
        }

        const existingReview = await Review.findOne({ complaintId, userId: user._id });
        if (existingReview) {
            throw new ApiError("You have already reviewed this complaint", 400);
        }

        const review = await Review.create({
            complaintId,
            userId: user._id,
            rating,
            feedback: comment
        });

        return res.status(200).json(new ApiResponse(200, review, "Review created successfully"));
    } catch (error) {
        throw new ApiError(error?.message || "Something went wrong while creating the review", error?.code || 500);
    }   
});

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

const getReviewsByUser= asyncHandler(async(req,res) => {
    try{
         const user = req.user._id ? await User.findById(req.user._id) : null;
         if(!user){
            throw new ApiError("User not found",404);
         }
         const reviews=await Review.find({userId: user._id}).populate({path:'user',select:'firstName lastName email '});
         if(!reviews){
            throw new ApiError("reviews not found for this user",402);
         }
         return res.status(200).json(new ApiResponse(200,reviews,"Reviews fetched successfully"));
    }catch{
        throw new ApiError(error?.message || "Something went wrong while fetching reviews of user", error?.code || 500);
    }
})

const getAllReviews= asyncHandler(async(req,res) => {
    try{
         const reviews=await Review.find().populate({path:'userId',select:'firstName lastName email '});        
            if(!reviews){
                throw new ApiError("reviews not found",404);
            }
            return res.status(200).json(new ApiResponse(200,reviews,"Reviews fetched successfully"));
    }catch{
        throw new ApiError(error?.message || "Something went wrong while fetching reviews", error?.code || 500);
    }       
})
    
const getReviewById= asyncHandler(async (req,res)=>{
    try {
        const {id}= req.params;
        const review = await Review.findById(id).populate({path:'userId',select:'firstName lastName email '});
        if(!review) throw new ApiError("Review not found",404);
        return res.status(200).json(new ApiResponse(200,review,"Review fetched successfully"));
    } catch (error) {
        throw new ApiError(error?.message || "Something went wrong while fetching the review",error?.code || 500);
    }
});

export { 
        createReview, 
        getReviewsForComplaint,
         getReviewsByUser,
         getAllReviews,
         getReviewById
         };

