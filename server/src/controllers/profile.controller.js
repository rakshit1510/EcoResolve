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


