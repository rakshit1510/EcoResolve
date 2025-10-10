import Complaint from "../models/complaint.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

// Get escalated complaints based on user role
export const getEscalatedComplaints = async (req, res) => {
  try {
    const userRole = req.user.accountType;
    let escalationLevel;

    if (userRole === "Admin") {
      escalationLevel = "admin";
    } else if (userRole === "SuperAdmin") {
      escalationLevel = "superadmin";
    } else {
      throw new ApiError(403, "Access denied");
    }

    const complaints = await Complaint.find({
      escalationLevel: escalationLevel,
      status: { $in: ["pending", "open", "in-progress"] }
    }).populate("userId", "firstName lastName email").sort({ escalatedAt: -1 });

    res.status(200).json(new ApiResponse(200, complaints, "Escalated complaints fetched successfully"));
  } catch (error) {
    throw new ApiError(500, error?.message || "Failed to fetch escalated complaints");
  }
};

// Resolve complaint
export const resolveComplaint = async (req, res) => {
  try {
    const { id } = req.params;
    
    const complaint = await Complaint.findByIdAndUpdate(
      id,
      { 
        status: "resolved",
        resolvedAt: new Date()
      },
      { new: true }
    );

    if (!complaint) {
      throw new ApiError(404, "Complaint not found");
    }

    res.status(200).json(new ApiResponse(200, complaint, "Complaint resolved successfully"));
  } catch (error) {
    throw new ApiError(500, error?.message || "Failed to resolve complaint");
  }
};

// Reassign complaint (SuperAdmin only)
export const reassignComplaint = async (req, res) => {
  try {
    if (req.user.accountType !== "SuperAdmin") {
      throw new ApiError(403, "Only SuperAdmin can reassign complaints");
    }

    const { id } = req.params;
    const { department } = req.body;

    const complaint = await Complaint.findByIdAndUpdate(
      id,
      { 
        department: department,
        escalationLevel: "staff",
        escalatedAt: null
      },
      { new: true }
    );

    if (!complaint) {
      throw new ApiError(404, "Complaint not found");
    }

    res.status(200).json(new ApiResponse(200, complaint, "Complaint reassigned successfully"));
  } catch (error) {
    throw new ApiError(500, error?.message || "Failed to reassign complaint");
  }
};

// Auto-escalation function (to be called by cron job)
export const autoEscalateComplaints = async () => {
  try {
    const now = new Date();
    const twoMinutesAgo = new Date(now.getTime() - 2 * 60 * 1000);
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);

    // Escalate to admin after 2 minutes
    await Complaint.updateMany(
      {
        createdAt: { $lte: twoMinutesAgo },
        escalationLevel: "staff",
        status: { $in: ["pending", "open", "in-progress"] }
      },
      {
        escalationLevel: "admin",
        escalatedAt: now
      }
    );

    // Escalate to superadmin after 5 minutes
    await Complaint.updateMany(
      {
        createdAt: { $lte: fiveMinutesAgo },
        escalationLevel: "admin",
        status: { $in: ["pending", "open", "in-progress"] }
      },
      {
        escalationLevel: "superadmin",
        escalatedAt: now
      }
    );

    console.log("Auto-escalation completed successfully");
  } catch (error) {
    console.error("Auto-escalation failed:", error);
  }
};