import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import  User  from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/Cloudinary.js";
import {ApiResponse} from '../utils/ApiResponse.js'
import mongoose from "mongoose";
import jwt from 'jsonwebtoken'
import bcrypt from "bcrypt"
import otpGenerator from 'otp-generator'
import accountApprovedTemplate from "../email/templates/accountApprovedTemplate.js";
import mailSender from "../utils/mailSender.js";
import OTP from "../models/OTP.model.js";
import Profile from "../models/profile.model.js";
import otpTemplate from "../email/templates/emailVerificationTemplate.js";
import passwordUpdated from "../email/templates/passwordUpdate.js";
// Citizen Signup
export const generateAccessAndRefreshToken= async(userId)=>{
    try {
        const user=await User.findById(userId);
        if(!user){
            throw new ApiError(404, "User not found");
        }
        const accessToken=user.generateAccessToken()
        // console.log("Generating access and refresh token for user:", user.email);
        const refreshToken=user.generateRefreshToken()
        user.refreshToken=refreshToken

        await user.save({ validateBeforeSave: false })

        return {accessToken,refreshToken}

    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating referesh and access token")
     
    }
}

export const sendOTP= asyncHandler(async (req, res) => {
    try {
        const {email}= req.body;
        console.log("Email received for OTP:", req.body );
        // if (!email) {
        //     console.log("Email is required");
        //     throw new ApiError(400, "Email is required");
        // }
        console.log("Sending OTP to user");
        console.log(email);
        const checkUserPresent= await User.findOne({ email: email.toLowerCase() });
        if (checkUserPresent) {
            throw new ApiError(400, "User already exists with this email");
        }   
        const otp = otpGenerator.generate(6, {
            upperCaseAlphabets: false,
            specialChars: false,
            lowerCaseAlphabets: false,
            digits: true
        });

           const name = email.split('@')[0].split('.').map(part => part.replace(/\d+/g, '')).join(' ');
        console.log(name);
        await mailSender(email, 'Verification Email from EcoResolve', otpTemplate(otp,name));
        const otpData = await OTP.create({
            email: email.toLowerCase(),
            otp: otp
        });
        if(!otpData) {
            throw new ApiError(500, "Something went wrong while saving OTP");
        }
        return res.status(200).json(
            new ApiResponse(200, "OTP sent successfully", {
                email: email.toLowerCase(),
                otpId: otpData._id
            })
        );
    } catch (error) {
        throw new ApiError(500, "Something went wrong while sending OTP ");
    }
})

export const createSuperAdmin = asyncHandler(async (req, res) => {
    try {
        const { firstName, lastName, email, password, confirmPassword, contactNumber } = req.body;
        
        if (!firstName || !lastName || !email || !password || !confirmPassword) {
            throw new ApiError(400, "All fields are required");
        }
        if (password !== confirmPassword) {
            throw new ApiError(400, "Passwords do not match");
        }
        
        // Check if any admin already exists
        const existingAdmin = await User.findOne({ accountType: "Admin" });
        if (existingAdmin) {
            throw new ApiError(403, "Super Admin already exists. Use regular signup for additional admins.");
        }
        
        const checkUserAlreadyExists = await User.findOne({ email: email.toLowerCase() });
        if (checkUserAlreadyExists) {
            throw new ApiError(400, "User already exists with this email");
        }
        
        const profileDetails = await Profile.create({
            gender: null,
            dateOfBirth: null,
            about: null,
            contactNumber: contactNumber,
        });
        
        const user = await User.create({
            firstName,
            lastName,
            email: email.toLowerCase(),
            password,
            contactNumber,
            accountType: "Admin",
            additionalDetails: profileDetails._id,
            approved: true, // Super admin is auto-approved
        });

        const createdUser = await User.findById(user._id).select("-password -refreshToken");
        
        return res.status(201).json(
            new ApiResponse(200, createdUser, "Super Admin created successfully!")
        );
    } catch (error) {
        throw new ApiError(500, error.message || "Something went wrong while creating super admin");
    }
});

export const Signup = asyncHandler(async (req, res) => {
    try {
        const { firstName, lastName, email, password, confirmPassword, accountType, contactNumber, otp } = req.body;
        if (!firstName || !lastName || !email || !password || !confirmPassword || !accountType  || !otp) {
            throw new ApiError(400, "All fields are required");
        }
        if (password !== confirmPassword) {
            throw new ApiError(400, "Passwords do not match");
        }
        const checkUserAlreadyExists = await User.findOne({ email: email.toLowerCase() });
        if (checkUserAlreadyExists) {
            throw new ApiError(400, "User already exists with this email");
        }
        
        // Find the most recent OTP for this email
        const recentOtp = await OTP.findOne({ email: email.toLowerCase() }).sort({ createdAt: -1 });
        
        if (!recentOtp) {
            throw new ApiError(400, "OTP not found or expired");
            console.log("Signup request received",firstName, lastName, email, password, confirmPassword, accountType, contactNumber, otp);
        }
        if (recentOtp.otp !== otp) {
            throw new ApiError(400, "Invalid OTP");
        }
        const profileDetails = await Profile.create({
            gender: null,
            dateOfBirth: null,
            about: null,
            contactNumber: contactNumber,
        });
        if (!profileDetails) {
            throw new ApiError(500, "Something went wrong while creating profile details");
        }
        let approved = true;
        if(accountType === "Staff" || accountType === "Admin") {
            approved = false; // Staff and Admin accounts need to be approved by an existing Admin
            
            if(accountType === "Admin") {
                const existingAdmin = await User.findOne({ accountType: "Admin", approved: true });
                if (!existingAdmin) {
                    approved = true;
                }
            }
        }
        // Create the user
        let image = null;
        if (req.file) {
            image = await uploadOnCloudinary(req.file.path, "users");
            if (!image) {
                throw new ApiError(500, "Something went wrong while uploading image");
            }
        }
        const user = await User.create({
            firstName,
            lastName,
            email: email.toLowerCase(),
            password,
            contactNumber,
            accountType,
            additionalDetails: profileDetails._id,
            approved: approved,
            image: image ? image.url : undefined,
        });

        const createdUser = await User.findById(user._id).select(
            "-password -refreshToken"
        );
        if (!createdUser) {
            throw new ApiError(500, "Something went wrong while registering the user");
        }
        return res.status(201).json(
            new ApiResponse(200, createdUser, "User registered Successfully!!")
        );

    } catch (error) {
        throw new ApiError(500, error.message || "Something went wrong while signing up");
    }
});


// Citizen Login
export const loginCitizen = asyncHandler(async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            throw new ApiError(400, "Email and password are required");
        }
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            throw new ApiError(404, "User not found");
        }
        const isPasswordCorrect = await user.isPasswordCorrect(password);
        if (!isPasswordCorrect) {
            throw new ApiError(401, "Invalid credentials");
        }
        if(user.accountType !== "Citizen"){
            throw new ApiError(403, "You are not authorized to login as Citizen");
        }
        if(!user.approved){
            throw new ApiError(403, "Your account is not approved yet. Please contact admin.");
        }
        const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);
        // Fetch user details excluding sensitive fields
        const loggedInUser = await User.findById(user._id).select("-password -refreshToken");
        if (!loggedInUser) {
            throw new ApiError(500, "Something went wrong while fetching user details");
        }

        // Set cookie options
        const options = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        };

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json(
            new ApiResponse(
                200,
                {
                user: loggedInUser,
                accessToken,
                refreshToken
                },
                "Citizen logged in Successfully"
            )
            );
    } catch (error) {
        throw new ApiError(500, error.message || "Something went wrong while citizen logging in");
    }
});
// Admin Login
export const loginAdmin =  asyncHandler(async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            throw new ApiError(400, "Email and password are required");
        }
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            throw new ApiError(404, "admin not found");
        }
        const isPasswordCorrect = await user.isPasswordCorrect(password);
        if (!isPasswordCorrect) {
            throw new ApiError(401, "Invalid credentials");
        }
        if(user.accountType !== "Admin"){
            throw new ApiError(403, "You are not authorized to login as Citizen");
        }
        if(!user.approved){
            throw new ApiError(403, "Your account is not approved yet. Please contact admin.");
        }
        const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);
        // Fetch user details excluding sensitive fields
        const loggedInUser = await User.findById(user._id).select("-password -refreshToken");
        if (!loggedInUser) {
            throw new ApiError(500, "Something went wrong while fetching user details");
        }

        // Set cookie options
        const options = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        };

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json(
            new ApiResponse(
                200,
                {
                user: loggedInUser,
                accessToken,
                refreshToken
                },
                "Admin logged in Successfully"
            )
            );
    } catch (error) {
        throw new ApiError(500, error.message || "Something went wrong while admin logging in");
    }
});

// Staff Login
export const loginStaff =  asyncHandler(async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            throw new ApiError(400, "Email and password are required");
        }
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            throw new ApiError(404, "User not found");
        }
        const isPasswordCorrect = await user.isPasswordCorrect(password);
        if (!isPasswordCorrect) {
            throw new ApiError(401, "Invalid credentials");
        }
        if(user.accountType !== "Staff"){
            throw new ApiError(403, "You are not authorized to login as Staff");
        }
        if(!user.approved){
            throw new ApiError(403, "Your account is not approved yet. Please contact admin.");
        }
        const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);
        // Fetch user details excluding sensitive fields
        const loggedInUser = await User.findById(user._id).select("-password -refreshToken");
        if (!loggedInUser) {
            throw new ApiError(500, "Something went wrong while fetching user details");
        }

        // Set cookie options
        const options = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        };

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json(
            new ApiResponse(
                200,
                {
                user: loggedInUser,
                accessToken,
                refreshToken
                },
                "Staff logged in Successfully"
            )
            );
    } catch (error) {
        throw new ApiError(500, error.message || "Something went wrong while Staff logging in");
    }
});

export const logout = asyncHandler(async (req, res) => {
    try {
        const userId = req.user;
        if (!userId) {
            throw new ApiError(400, "User not found");
        }
        const user = await User.findById(userId._id);
        if (!user) {
            throw new ApiError(404, "User not found");
        }
        user.refreshToken = null;
        await user.save({ validateBeforeSave: false });
        
        return res
            .status(200)
            .clearCookie("accessToken")
            .clearCookie("refreshToken")
            .json(new ApiResponse(200, null, "User logged out successfully"));
    } catch (error) {
        throw new ApiError(500, error.message || "Something went wrong while logging out");
    }
});

export const approveAccount = asyncHandler(async (req, res) => {
    try {
        const adminId=req.user;
        const {email}=req.body;
        if(!adminId){
            throw new ApiError(400,"Admin not found");
        }
        if(!email){
            throw new ApiError(400,"Email is required to approve account");
        }
        const admin=await User.findById(adminId._id);
        if(!admin || admin.accountType !== "Admin" || !admin.approved){
            throw new ApiError(403,"You are not authorized to approve accounts");
        }
        const _user=await User.findOne({email:email.toLowerCase()});
        if(!_user){
            throw new ApiError(404,"User not found");
        }
        if(_user.approved || _user.accountType === "Citizen"){
            throw new ApiError(400,"USer account is already approved");
        }
        _user.approved=true;
        const appro=await _user.save({validateBeforeSave:false});
        if(!appro){
            throw new ApiError(500,"somthing wnetys wrong while appriovin the account");
        }
        const new_user=await User.findById(_user._id).select("-password -refreshToken");
        if(!new_user){
            throw new ApiError(500,"Internal ServerError while appoving account");
        }
        if(!new_user.approved){
            throw new ApiError(500,"Internal ServerError while appoving account");
        }
        if(new_user.approved){
            await mailSender(new_user.email,"Account Approved", accountApprovedTemplate(new_user.firstName, new_user.email));
        }
        return res.status(200).json(new ApiResponse(200,new_user,"Account approved successfully"));

    } catch (error) {
        throw new ApiError(500,"Internal ServerError while appoving account");
    }
});