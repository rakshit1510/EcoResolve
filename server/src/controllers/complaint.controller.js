import express from 'express';
import asyncHandler from 'express-async-handler';
import {ApiResponse} from '../utils/ApiResponse.js';
import Complaint from '../models/complaint.model.js';
import { ApiError } from '../utils/ApiError.js';
import  User from '../models/user.model.js';
import { isCitizen, isStaff, verifyJWT } from '../middlewares/auth.middleware.js';
import { uploadOnCloudinary } from '../utils/Cloudinary.js';

const createComplaint= asyncHandler(async (req,res)=>{
    try {
    
        const {service,location,decription}= req.body;
        const user = req.user._id ? await User.findById(req.user._id) : null;
        const imageUrl = req.file ? req.file.path : null;
        if(!imageUrl) throw new ApiError("Image is required",400);
        const serviceImage = await uploadOnCloudinary(imageUrl,"complaints");
        if(!serviceImage) throw new ApiError("Failed to upload image",500);

        if(!user) throw new ApiError("User not found",404);
        if(!service || !location) throw new ApiError("Service and location are required",400);
        if(decription.length<5){
            throw new ApiError("decription is required",400);
        }
        if(user.accountType !== 'Citizen'){
            throw new ApiError("Only citizens can create complaints",403);
        }
        
        const complaint = await Complaint.create({
            user:user._id,
            service,
            location,
            imageUrl:serviceImage.secure_url,
            decription
        });
        return res.status(200).json(new ApiResponse(200,complaint,"Complaint created successfully"));
} catch (error) {
    throw new ApiError(error?.message || "Something went wrong while creating the complaint",error?.code || 500);
}
});

const deleteComplaint= asyncHandler(async (req,res)=>{
    try {
        const {id}= req.params;
        const user = req.user._id ? await User.findById(req.user._id) : null;
        if(!user) throw new ApiError("User not found",404); 
        if(user.accountType !== 'Citizen'){
            throw new ApiError("Only citizens can delete complaints",403);
        }
        const complaint = await Complaint.findById(id);
        if(!complaint) throw new ApiError("Complaint not found",404);
        if(complaint.user._id.toString() !== user._id.toString()){
            throw new ApiError("You are not authorized to delete this complaint",403);
        }   
        await complaint.remove();
        return res.status(200).json(new ApiResponse(200,null,"Complaint deleted successfully"));
    } catch (error) {
        throw new ApiError(error?.message || "Something went wrong while deleting the complaint",error?.code || 500);
    }
});

const changeProgressStatus= asyncHandler(async (req,res)=>{
    try {
        const {id}= req.params; 
        const {status}= req.body;
        const user = req.user._id ? await User.findById(req.user._id) : null;
        if(!user) throw new ApiError("User not found",404); 
        if(user.accountType !== 'Staff'){
            throw new ApiError("Only staff can change the progress status of complaints",403);
        }
        const complaint = await Complaint.findById(id);
        if(!complaint) throw new ApiError("Complaint not found",404);
        if(!['pending','open', 'in-progress', 'resolved'].includes(status)){
            throw new ApiError("Invalid status",400);
        }
        complaint.status=status;
        await complaint.save();
        return res.status(200).json(new ApiResponse(200,complaint,"Complaint status updated successfully"));
    } catch (error) {
        throw new ApiError(error?.message || "Something went wrong while changing the progress status of the complaint",error?.code || 500);
    }
})
const getAllComplaints= asyncHandler(async (req,res)=>{
    try {
        const user = req.user._id ? await User.findById(req.user._id) : null;

        if(!user) throw new ApiError("User not found",404); 
        let complaints;
        if(user.accountType === 'Citizen'){
            complaints = await Complaint.find({user:user._id}).populate('user','firstName lastName email');
        }
        else if(user.accountType === 'Staff'){
            complaints = await Complaint.find().populate('user','firstName lastName email');
        }
        else{
            throw new ApiError("Only citizens and staff can view complaints",403);
        }
        if(!complaints) throw new ApiError("No complaints found",404);
        return res.status(200).json(new ApiResponse(200,complaints,"Complaints fetched successfully"));
    } catch (error) {
        throw new ApiError(error?.message || "Something went wrong while fetching the complaints",error?.code || 500);
    }
});

const getCitizenComplaints= asyncHandler(async (req,res)=>{
    try {
        const user = req.user._id ? await User.findById(req.user._id) : null;   
        if(!user) throw new ApiError("User not found",404);
        if(user.accountType !== 'Citizen'){
            throw new ApiError("Only citizens can view their complaints",403);
        }
        const complaints = await Complaint.find({user:user._id}).populate('user','firstName lastName email');
        if(!complaints) throw new ApiError("No complaints found",404);
        return res.status(200).json(new ApiResponse(200,complaints,"Complaints fetched successfully"));
    } catch (error) {
        throw new ApiError(error?.message || "Something went wrong while fetching the complaints",error?.code || 500);
    }
});

const getComplaintById= asyncHandler(async (req,res)=>{
    try {
        const {id}= req.params; 
        const complaint = await Complaint.findById(id).populate({path:'user',select:'firstName lastName email '});
        if(!complaint) throw new ApiError("Complaint not found",404);
        return res.status(200).json(new ApiResponse(200,complaint,"Complaint fetched successfully"));
    } catch (error) {
        throw new ApiError(error?.message || "Something went wrong while fetching the complaint",error?.code || 500);
    }
});

export {createComplaint,
        getAllComplaints,
        deleteComplaint,
        changeProgressStatus,
        getCitizenComplaints,
        getComplaintById
        };