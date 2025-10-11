import Announcement from "../models/announcements.model.js";
import User from "../models/user.model.js";
import {asyncHandler} from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/Cloudinary.js";

/* -------------------------------------------------------------------------- */
/* 🟢 1. CREATE ANNOUNCEMENT — Only SuperAdmin                                */
/* -------------------------------------------------------------------------- */
export const createAnnouncement = asyncHandler(async (req, res) => {
  try {
    const { title, message, audience, expiresAt } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) throw new ApiError(404, "User not found");
    if (user.accountType !== "SuperAdmin") {
      throw new ApiError(403, "Only SuperAdmin can create announcements");
    }

    if (!title || !message) {
      throw new ApiError(400, "Title and message are required");
    }

    // Handle attachments
    const attachments = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const uploaded = await uploadOnCloudinary(file.path, "announcements");
        if (uploaded) {
          attachments.push({
            fileUrl: uploaded.url,
            fileType: file.mimetype.includes("image")
              ? "image"
              : file.mimetype.includes("pdf")
              ? "pdf"
              : "other",
          });
        }
      }
    }

    const announcement = await Announcement.create({
      title,
      message,
      createdBy: user._id,
      audience: audience || "All",
      attachments,
      expiresAt: expiresAt ? new Date(expiresAt) : undefined,
    });

    return res
      .status(201)
      .json(new ApiResponse(201, announcement, "Announcement created successfully"));
  } catch (error) {
    throw new ApiError(500, error.message || "Error while creating announcement");
  }
});

/* -------------------------------------------------------------------------- */
/* 🟡 2. GET ANNOUNCEMENT BY ID (visible to all logged-in users)              */
/* -------------------------------------------------------------------------- */
export const getAnnouncementById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const announcement = await Announcement.findById(id)
      .populate("createdBy", "firstName lastName email accountType")
      .lean();

    if (!announcement) throw new ApiError(404, "Announcement not found");

    return res
      .status(200)
      .json(new ApiResponse(200, announcement, "Announcement fetched successfully"));
  } catch (error) {
    throw new ApiError(500, error.message || "Error fetching announcement by ID");
  }
});

/* -------------------------------------------------------------------------- */
/* 🟢 3. UPDATE ANNOUNCEMENT — Only SuperAdmin                                */
/* -------------------------------------------------------------------------- */
export const updateAnnouncement = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { title, message, audience, isActive, expiresAt } = req.body;

    const user = await User.findById(req.user._id);
    if (!user || user.accountType !== "SuperAdmin") {
      throw new ApiError(403, "Only SuperAdmin can update announcements");
    }

    const announcement = await Announcement.findById(id);
    if (!announcement) throw new ApiError(404, "Announcement not found");

    // Update fields
    if (title) announcement.title = title;
    if (message) announcement.message = message;
    if (audience) announcement.audience = audience;
    if (typeof isActive !== "undefined") announcement.isActive = isActive;
    if (expiresAt) announcement.expiresAt = new Date(expiresAt);

    // Handle new attachments
    if (req.files && req.files.length > 0) {
      const attachments = [];
      for (const file of req.files) {
        const uploaded = await uploadOnCloudinary(file.path, "announcements");
        if (uploaded) {
          attachments.push({
            fileUrl: uploaded.url,
            fileType: file.mimetype.includes("image")
              ? "image"
              : file.mimetype.includes("pdf")
              ? "pdf"
              : "other",
          });
        }
      }
      announcement.attachments.push(...attachments);
    }

    await announcement.save();

    return res
      .status(200)
      .json(new ApiResponse(200, announcement, "Announcement updated successfully"));
  } catch (error) {
    throw new ApiError(500, error.message || "Error updating announcement");
  }
});

/* -------------------------------------------------------------------------- */
/* 🔴 4. DELETE ANNOUNCEMENT — Only SuperAdmin                                */
/* -------------------------------------------------------------------------- */
export const deleteAnnouncement = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(req.user._id);
    if (!user || user.accountType !== "SuperAdmin") {
      throw new ApiError(403, "Only SuperAdmin can delete announcements");
    }

    const announcement = await Announcement.findByIdAndDelete(id);
    if (!announcement) throw new ApiError(404, "Announcement not found");

    return res
      .status(200)
      .json(new ApiResponse(200, null, "Announcement deleted successfully"));
  } catch (error) {
    throw new ApiError(500, error.message || "Error deleting announcement");
  }
});

/* -------------------------------------------------------------------------- */
/* 🔍 5. GET ANNOUNCEMENTS BY FILTERS                                         */
/* -------------------------------------------------------------------------- */
export const getAnnouncementsByFilters = asyncHandler(async (req, res) => {
  try {
    const { audience, isActive } = req.query;
    const filter = {};

    // Only show announcements for specific audience (no 'All' announcements)
    if (audience) {
      filter.audience = audience;
    }
    if (typeof isActive !== "undefined") filter.isActive = isActive === "true";

    // For SuperAdmin management, show all announcements (including expired)
    const announcements = await Announcement.find(filter)
      .populate("createdBy", "firstName lastName email accountType")
      .sort({ createdAt: -1 });

    return res
      .status(200)
      .json(new ApiResponse(200, announcements, "Announcements fetched successfully"));
  } catch (error) {
    throw new ApiError(500, error.message || "Error fetching announcements");
  }
});

/* -------------------------------------------------------------------------- */
/* 🔎 6. SEARCH ANNOUNCEMENTS (query by title/message)                        */
/* -------------------------------------------------------------------------- */
export const getAnnouncementByQuery = asyncHandler(async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) throw new ApiError(400, "Search query is required");

    const announcements = await Announcement.find({
      $or: [
        { title: { $regex: query, $options: "i" } },
        { message: { $regex: query, $options: "i" } },
      ],
    })
      .populate("createdBy", "firstName lastName email accountType")
      .sort({ createdAt: -1 });

    return res
      .status(200)
      .json(new ApiResponse(200, announcements, "Announcements fetched by query"));
  } catch (error) {
    throw new ApiError(500, error.message || "Error searching announcements");
  }
});
