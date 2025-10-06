import Profile from '../models/profile.model.js';
import User from '../models/user.model.js';
import { uploadOnCloudinary,deleteFromCloudinary } from '../utils/Cloudinary.js';
import { convertSecondsToDuration } from '../utils/secToDuration.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
//update profile
export const updateProfile = asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id; // ✅ fixed destructuring
    const {
      gender = '',
      dateOfBirth = '',
      about = '',
      contactNumber = '',
      firstName,
      lastName
    } = req.body;

    if (!userId) {
      throw new ApiError(400, "User ID is required");
    }

    if (!firstName || !lastName) {
      throw new ApiError(400, "First name and last name are required");
    }

    const user = await User.findById(userId).populate("additionalDetails"); // ✅ populate profile
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    user.firstName = firstName;
    user.lastName = lastName;
    await user.save();

    const profileData = { gender, dateOfBirth, about, contactNumber };

    if (user.additionalDetails) {
      const existingProfile = user.additionalDetails;
      Object.assign(existingProfile, profileData);
      await existingProfile.save();
    } else {
      const newProfile = await Profile.create({ ...profileData, user: userId });
      user.additionalDetails = newProfile._id;
      await user.save();
    }

    const updatedUserDetails = await User.findById(userId).populate('additionalDetails');

    res.status(200).json(new ApiResponse(200, "Profile updated successfully", updatedUserDetails));

  } catch (error) {
    console.error(error); // helpful for debugging
    throw new ApiError(500, "Internal Server Error");
  }
});



export const deleteAccount = asyncHandler(async (req, res) => {
 try {
    const userId = req.user._id; // ✅ 
    const userDetails= await User.findById(userId)
    if (!userDetails) {
      throw new ApiError(404, "User not found");
    }

    await deleteFromCloudinary(userDetails.image); // delete user image from cloudinary


        await Profile.findByIdAndDelete(userDetails.additionalDetails); // delete user profile
        await User.findByIdAndDelete(userId); // delete user account    
        return res.status(200).json(new ApiResponse(200, "Account deleted successfully"));
    }
  catch (error) {
    console.error(error); // helpful for debugging
    throw new ApiError(500, "Internal Server Error in deleteAccount");  
 }
  });
    
export const updateUserProfileImage = asyncHandler(async (req, res) => {
  try {
    const profileImage = req.file;
    const userId = req.user._id;

    console.log("updating", profileImage);
    if (!profileImage) {
      throw new ApiError(400, "Profile image is required");
    }

    const imageUrl = await uploadOnCloudinary(profileImage.path, "profile_images");

    if (!imageUrl || !imageUrl.secure_url) {
      throw new ApiError(500, "Failed to upload image to Cloudinary");
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    if (user.image) {
      await deleteFromCloudinary(user.image);
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { image: imageUrl.secure_url }, // ✅ store only the URL
      { new: true }
    ).select("-password -refreshToken");

    if (!updatedUser) {
      throw new ApiError(404, "Failed to update user profile image");
    }

    return res.status(200).json(
      new ApiResponse(200, updatedUser, "Profile image updated successfully")
    );
  } catch (error) {
    console.error(error);
    throw new ApiError(500, "Internal Server Error in updateUserProfileImage");
  }
});


export const getUserById= asyncHandler(async(req,res)=>{
  try {
    const user=req.user._id ? await User.findById(req.user._id) : null;
    if(!user){
      throw new ApiError(400,"user not found");
    }
    const totalUser= await User.findById(req.user._id).populate("additionalDetails");
    if(!totalUser){
      throw new ApiError(400,"user not found")
    }
    return res.status(200).json(
      new ApiResponse(200,user,"user details fetched successfully")
    )
  } catch (error) {
      throw new ApiError(500,"Internal server error while fretching user")
  }
})