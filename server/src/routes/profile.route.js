import express from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

import {
  updateProfile,
  deleteAccount,
  updateUserProfileImage,
  getUserById
} from "../controllers/profile.controller.js";

const router = express.Router();

// ✅ Get current user details (with populated profile)
router.get("/me", verifyJWT, getUserById);

// ✅ Update profile (name, gender, about, etc.)
router.put("/update", verifyJWT, updateProfile);

// ✅ Update user profile image
router.put(
  "/update-image",
  verifyJWT,
  upload.single("image"), // expects field name = image
  updateUserProfileImage
);

// ✅ Delete account
router.delete("/delete", verifyJWT, deleteAccount);

export default router;
