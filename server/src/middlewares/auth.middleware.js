import { ApiError } from "../utils/ApiError.js";
import mongoose from "mongoose";
import jwt from 'jsonwebtoken';
import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const verifyJWT = asyncHandler( async (req,res,next)=>{
    try {
        const token=req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","")
        // console.log(token)
        if(!token){
            throw new ApiError(401,"unauthorized request")
        }

        const decodedToken=jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)

        const user= await User.findById(decodedToken?._id).select("-password -refreshToken")

        if(!user){
            throw new ApiError(401,"invalid Access Token")
        }
        // console.log("gettin auth error")
        req.user=user
        next();
    } catch (error) {
        throw new ApiError(401,error?.message || "Invalid access token")
    }
})



export const isCitizen = asyncHandler(async (req, res, next) => {
    try {
        if (req.user?.accountType !== 'Citizen') {
            throw new ApiError(401, 'This page is protected only for students');
        }
        next();
    } catch (error) {
        throw new ApiError(401, error?.message || 'Unauthorized');
    }
});

export const isStaff = asyncHandler(async (req, res, next) => {
    try {
        if (req.user?.accountType !== 'Staff') {
            throw new ApiError(401, 'This page is protected only for instructors');
        }
        next();
    } catch (error) {
        throw new ApiError(401, error?.message || 'Unauthorized');
    }
});

export const isAdmin = asyncHandler(async (req, res, next) => {
    try {
        if (req.user?.accountType !== 'Admin') {
            throw new ApiError(401, 'This page is protected only for admins');
        }
        next();
    } catch (error) {
        throw new ApiError(401, error?.message || 'Unauthorized');
    }
});
