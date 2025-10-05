import express from 'express';
import {asyncHandler} from '../utils/asyncHandler.js';
import {ApiResponse} from '../utils/ApiResponse.js';
import Complaint from '../models/complaint.model.js';
import { ApiError } from '../utils/ApiError.js';
import  User from '../models/user.model.js';
import { uploadOnCloudinary } from '../utils/Cloudinary.js';

const createComplaint= asyncHandler(async (req,res)=>{
    const {department,location,description}= req.body;
    const user = req.user._id ? await User.findById(req.user._id) : null;
    const imageUrl = req.file ? req.file.path : null;
    
    if(!imageUrl) throw new ApiError(400, "Image is required");
    if(!user) throw new ApiError(404, "User not found");
    if(!department || !location) throw new ApiError(400, "Department and location are required");
    if (!description || description.length < 20) throw new ApiError(400, "Description must be at least 20 characters");
    if(user.accountType !== 'Citizen') throw new ApiError(403, "Only citizens can create complaints");
    
    const serviceImage = await uploadOnCloudinary(imageUrl);
    if(!serviceImage) throw new ApiError(500, "Failed to upload image");
    
    const complaint = await Complaint.create({
      userId: user._id,
      department,
      location,
      imageUrl: serviceImage.secure_url,
      description,
    });

    return res.status(200).json(new ApiResponse(200,complaint,"Complaint created successfully"));
});

const deleteComplaint= asyncHandler(async (req,res)=>{
    try {
        const {id}= req.params;
        const user = req.user._id ? await User.findById(req.user._id) : null;
        if(!user) throw new ApiError(404, "User not found"); 
        if(user.accountType !== 'Citizen'){
            throw new ApiError(403, "Only citizens can delete complaints");
        }
        const complaint = await Complaint.findById(id);
        if(!complaint) throw new ApiError(404, "Complaint not found");
        if(complaint.userId.toString() !== user._id.toString()){
            throw new ApiError(403, "You are not authorized to delete this complaint");
        }   
        await complaint.remove();
        return res.status(200).json(new ApiResponse(200,null,"Complaint deleted successfully"));
    } catch (error) {
        throw new ApiError(error?.code || 500, error?.message || "Something went wrong while deleting the complaint");
    }
});

const changeProgressStatus= asyncHandler(async (req,res)=>{
    try {
        const {id}= req.params; 
        const {status}= req.body;
        const user = req.user._id ? await User.findById(req.user._id) : null;
        if(!user) throw new ApiError(404, "User not found"); 
        if(user.accountType !== 'Staff'){
            throw new ApiError(403, "Only staff can change the progress status of complaints");
        }
        const complaint = await Complaint.findById(id);
        if(!complaint) throw new ApiError(404, "Complaint not found");
        if(!['pending','open', 'in-progress', 'resolved'].includes(status)){
            throw new ApiError(400, "Invalid status");
        }
        complaint.status=status;
        await complaint.save();
        return res.status(200).json(new ApiResponse(200,complaint,"Complaint status updated successfully"));
    } catch (error) {
        throw new ApiError(error?.code || 500, error?.message || "Something went wrong while changing the progress status of the complaint");
    }
})
const getAllComplaints= asyncHandler(async (req,res)=>{
    try {
        const user = req.user._id ? await User.findById(req.user._id) : null;

        if(!user) throw new ApiError(404, "User not found"); 
        let complaints;
        if(user.accountType === 'Citizen'){
            complaints = await Complaint.find({userId:user._id}).populate('userId','firstName lastName email');
        }
        else if(user.accountType === 'Staff'){
            complaints = await Complaint.find().populate('userId','firstName lastName email');
        }
        else{
            throw new ApiError(403, "Only citizens and staff can view complaints");
        }
        if(!complaints) throw new ApiError(404, "No complaints found");
        return res.status(200).json(new ApiResponse(200,complaints,"Complaints fetched successfully"));
    } catch (error) {
        throw new ApiError(error?.code || 500, error?.message || "Something went wrong while fetching the complaints");
    }
});

const getCitizenComplaints= asyncHandler(async (req,res)=>{
    try {
        const user = req.user._id ? await User.findById(req.user._id) : null;   
        if(!user) throw new ApiError(404, "User not found");
        if(user.accountType !== 'Citizen'){
            throw new ApiError(403, "Only citizens can view their complaints");
        }
        const complaints = await Complaint.find({userId:user._id}).populate('userId','firstName lastName email');
        if(!complaints) throw new ApiError(404, "No complaints found");
        return res.status(200).json(new ApiResponse(200,complaints,"Complaints fetched successfully"));
    } catch (error) {
        throw new ApiError(error?.code || 500, error?.message || "Something went wrong while fetching the complaints");
    }
});

const getComplaintById= asyncHandler(async (req,res)=>{
    try {
        const {id}= req.params; 
        const complaint = await Complaint.findById(id).populate({path:'userId',select:'firstName lastName email '});
        if(!complaint) throw new ApiError(404, "Complaint not found");
        return res.status(200).json(new ApiResponse(200,complaint,"Complaint fetched successfully"));
    } catch (error) {
        throw new ApiError(error?.code || 500, error?.message || "Something went wrong while fetching the complaint");
    }
});

const updateComplaint= asyncHandler(async (req,res)=>{
    try {
        const {id}= req.params;
        const {service,location,description}= req.body;
        const user = req.user._id ? await User.findById(req.user._id) : null;
        if(!user) throw new ApiError(404, "User not found");
        if(user.accountType !== 'Staff'){
            throw new ApiError(403, "Only staff can update complaints");
        }
        const complaint = await Complaint.findById(id);
        if(!complaint) throw new ApiError(404, "Complaint not found");
        const newComplaint = await Complaint.findByIdAndUpdate(id,{
            service: service || complaint.service,
            location: location || complaint.location,
            description: description || complaint.description,
            updatedAt: Date.now(),
        },{new:true});
        return res.status(200).json(new ApiResponse(200,newComplaint,"Complaint updated successfully"));
    } catch (error) {
        throw new ApiError(error?.code || 500, error?.message || "Something went wrong while updating the complaint");
    }
});

export {createComplaint,
        getAllComplaints,
        deleteComplaint,
        changeProgressStatus,
        getCitizenComplaints,
        getComplaintById
        };