import Assignment from "../models/assignment.model.js";
import Worker from "../models/worker.model.js";
import Resource from "../models/resource.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import Complaint from "../models/complaint.model.js";
import { generateCredentials, generateOtp } from "../utils/generateCredentials.js";
import sendMail  from "../utils/mailSender.js"; // your mail sending function


// ✅ Create new Assignment
export const createAssignment = async (req, res) => {
  try {
    const {
      workers,
      resources,
      department,
      location,
      startDate,
      endDate,
      description,
      compliantId,
    } = req.body;

    if (!workers?.length || !resources?.length) {
      throw new ApiError(400, "At least one worker and one resource are required");
    }

    // Fetch complaint and citizen email
    const complaint = await Complaint.findById(compliantId).populate("userId");
    if (!complaint) throw new ApiError(404, "Complaint not found");
    const citizenEmail = complaint.userId?.email;
    if (!citizenEmail) throw new ApiError(400, "Citizen email not found");

    // Validate workers & resources
    const availableWorkers = await Worker.find({
      _id: { $in: workers },
      status: "Available",
    });

    const availableResources = await Resource.find({
      _id: { $in: resources },
      status: "Available",
    });

    if (availableWorkers.length !== workers.length)
      throw new ApiError(400, "Some workers are invalid or not available");
    if (availableResources.length !== resources.length)
      throw new ApiError(400, "Some resources are invalid or not available");

    // Generate credentials & OTP
    const { loginId, loginPassword } = generateCredentials();
    const { otp, otpExpiry } = generateOtp();

    // Create assignment
    const assignment = await Assignment.create({
      workers,
      resources,
      compliantId,
      department,
      location,
      startDate,
      endDate,
      description,
      loginId,
      loginPassword,
      otp,
      otpExpiry,
    });

    // Update statuses
    await Worker.updateMany({ _id: { $in: workers } }, { status: "On-Duty" });
    await Resource.updateMany({ _id: { $in: resources } }, { status: "In Use" });

    // Send credentials to workers
    for (const worker of availableWorkers) {
      await sendMail(
        worker.email,
        "New Assignment Credentials",
        `
        <h2>New Assignment Assigned</h2>
        <p><strong>Login ID:</strong> ${loginId}</p>
        <p><strong>Password:</strong> ${loginPassword}</p>
        <p>Please use these credentials to access your assignment panel.</p>
        `
      );
    }

    // Send OTP to citizen
    await sendMail(
      citizenEmail,
      "Complaint Verification OTP",
      `
      <h2>OTP for Your Complaint</h2>
      <p>Your OTP for verification is: <strong>${otp}</strong></p>
      <p>This OTP is valid for 10 minutes.</p>
      `
    );

    res
      .status(201)
      .json(
        new ApiResponse(
          201,
          assignment,
          "Assignment created successfully. Credentials sent to workers and OTP sent to citizen."
        )
      );
  } catch (error) {
    throw new ApiError(
      error?.status || 500,
      error?.message || "Failed to create assignment"
    );
  }
};


// ✅ Get All Assignments (with filters)
export const getAssignments = async (req, res) => {
  try {
    const filters = {};
    if (req.query.workerId) filters.workers = req.query.workerId;
    if (req.query.resourceId) filters.resources = req.query.resourceId;
    if (req.query.department) filters.department = req.query.department;

    const assignments = await Assignment.find(filters)
      .populate("workers", "name email department role status")
      .populate("resources", "resourceName department category status")
      .populate("compliantId", "location status description");

    res
      .status(200)
      .json(new ApiResponse(200, assignments, "Assignments fetched successfully"));
  } catch (error) {
    throw new ApiError(
      error?.status || 500,
      error?.message || "Failed to fetch assignments"
    );
  }
};


// ✅ Get Single Assignment by ID
export const getAssignmentById = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id)
      .populate("workers", "name email department role status")
      .populate("resources", "resourceName department category status")
      .populate("compliantId", "location status description");

    if (!assignment) throw new ApiError(404, "Assignment not found");

    res
      .status(200)
      .json(new ApiResponse(200, assignment, "Assignment fetched successfully"));
  } catch (error) {
    throw new ApiError(
      error?.status || 500,
      error?.message || "Failed to fetch assignment"
    );
  }
};


// ✅ Update Assignment
export const updateAssignment = async (req, res) => {
  try {
    const {
      workers,
      resources,
      department,
      location,
      startDate,
      endDate,
      description,
    } = req.body;

    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) throw new ApiError(404, "Assignment not found");

    // Update fields
    if (workers) assignment.workers = workers;
    if (resources) assignment.resources = resources;
    if (department) assignment.department = department;
    if (location) assignment.location = location;
    if (startDate) assignment.startDate = startDate;
    if (endDate) assignment.endDate = endDate;
    if (description) assignment.description = description;

    await assignment.save();

    res
      .status(200)
      .json(new ApiResponse(200, assignment, "Assignment updated successfully"));
  } catch (error) {
    throw new ApiError(
      error?.status || 500,
      error?.message || "Failed to update assignment"
    );
  }
};


// ✅ Delete Assignment
export const deleteAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) throw new ApiError(404, "Assignment not found");

    await Worker.updateMany(
      { _id: { $in: assignment.workers } },
      { status: "Available" }
    );
    await Resource.updateMany(
      { _id: { $in: assignment.resources } },
      { status: "Available" }
    );

    await assignment.deleteOne();

    res
      .status(200)
      .json(new ApiResponse(200, null, "Assignment deleted successfully"));
  } catch (error) {
    throw new ApiError(
      error?.status || 500,
      error?.message || "Failed to delete assignment"
    );
  }
};

export const assignmentLogin = async (req, res) => {
  try {
    const { loginId, loginPassword } = req.body;

    if (!loginId || !loginPassword)
      throw new ApiError(400, "Login ID and Password are required");

    // Find assignment by loginId
    const assignment = await Assignment.findOne({ loginId })
      .populate("workers", "name email department role status")
      .populate("resources", "resourceName department category status")
      .populate("compliantId", "location description status");

    if (!assignment) throw new ApiError(404, "Invalid login ID");

    // If password is plain text
    if (assignment.loginPassword !== loginPassword) {
      throw new ApiError(401, "Incorrect password");
    }

    // ✅ If using hashed passwords (recommended)
    /*
    const isMatch = await bcrypt.compare(loginPassword, assignment.loginPassword);
    if (!isMatch) throw new ApiError(401, "Incorrect password");
    */

    // ✅ Check if assignment is still active
    if (assignment.status === "Resolved")
      throw new ApiError(400, "This assignment has already been resolved");

    // Return assignment info (excluding sensitive fields)
    const responseData = {
      id: assignment._id,
      department: assignment.department,
      location: assignment.location,
      workers: assignment.workers,
      resources: assignment.resources,
      startDate: assignment.startDate,
      endDate: assignment.endDate,
      description: assignment.description,
      status: assignment.status,
    };

    res.status(200).json(
      new ApiResponse(
        200,
        responseData,
        "Worker logged in successfully using assignment credentials"
      )
    );
  } catch (error) {
    throw new ApiError(
      error?.status || 500,
      error?.message || "Assignment login failed"
    );
  }
};

export const resolveAssignment = async (req, res) => {
  try {
    const { assignmentId, otp } = req.body;

    if (!assignmentId || !otp)
      throw new ApiError(400, "Assignment ID and OTP are required");

    // Find assignment
    const assignment = await Assignment.findById(assignmentId).populate({
      path: "compliantId",
      populate: { path: "userId", select: "email name" },
    });

    if (!assignment) throw new ApiError(404, "Assignment not found");
    if (assignment.status === "Resolved")
      throw new ApiError(400, "This assignment is already resolved");

    // Check OTP validity
    if (assignment.otp !== otp)
      throw new ApiError(401, "Invalid OTP");
    if (assignment.otpExpiry < new Date())
      throw new ApiError(400, "OTP has expired. Please request a new one.");

    // Mark assignment & complaint as resolved
    assignment.status = "Resolved";
    assignment.otp = undefined;
    assignment.otpExpiry = undefined;
    assignment.loginId = undefined;
    assignment.loginPassword = undefined;

    await assignment.save();

    // Update linked complaint
    const complaint = await Complaint.findById(assignment.compliantId);
    if (complaint) {
      complaint.status = "resolved";
      complaint.resolvedAt = new Date();
      await complaint.save();
    }

    // Free up worker & resources
    await Worker.updateMany(
      { _id: { $in: assignment.workers } },
      { status: "Available" }
    );
    await Resource.updateMany(
      { _id: { $in: assignment.resources } },
      { status: "Available" }
    );

    // Send mail to citizen
    const citizenEmail = assignment.compliantId?.userId?.email;
    if (citizenEmail) {
      await sendMail(
        citizenEmail,
        "Complaint Resolved Successfully",
        `
        <h2>Good news!</h2>
        <p>Your complaint has been resolved by our department team.</p>
        <p><strong>Department:</strong> ${assignment.department}</p>
        <p><strong>Location:</strong> ${assignment.location}</p>
        <p>Thank you for helping us improve civic management in your area.</p>
        <p>Best regards,<br/><strong>EcoResolve Team</strong></p>
        `
      );
    }

    res.status(200).json(
      new ApiResponse(200, null, "Assignment resolved successfully. Citizen notified via email.")
    );
  } catch (error) {
    throw new ApiError(
      error?.status || 500,
      error?.message || "Failed to resolve assignment"
    );
  }
};

export const rejectFalseComplaint = async (req, res) => {
  try {
    const { complaintId } = req.params;

    const complaint = await Complaint.findById(complaintId).populate("userId");
    if (!complaint) throw new ApiError(404, "Complaint not found");

    complaint.status = "rejected";
    complaint.updatedAt = new Date();
    await complaint.save();

    const citizen = await User.findById(complaint.userId);
    if (!citizen) throw new ApiError(404, "Citizen not found");

    citizen.warnings = (citizen.warnings || 0) + 1;

    let emailSubject = "";
    let emailBody = "";

    if (citizen.warnings < 3) {
      emailSubject = `Warning ${citizen.warnings}/3 - False Complaint Notice`;
      emailBody = `
        <div style="font-family:sans-serif;color:#333;">
          <h2>Dear ${citizen.firstName},</h2>
          <p>Your recent complaint has been reviewed and marked as <b>false</b> by the department.</p>
          <p>This is your <b>${citizen.warnings} of 3</b> warnings.</p>
          <p>Please note that after <b>3 warnings</b>, your account will be temporarily frozen.</p>
          <br/>
          <p>Regards,<br/>EcoResolve Team</p>
        </div>
      `;
    } else {
      citizen.approved = false;
      emailSubject = "Account Frozen - Multiple False Complaints";
      emailBody = `
        <div style="font-family:sans-serif;color:#333;">
          <h2>Dear ${citizen.firstName},</h2>
          <p>Your account has been <b>frozen</b> due to multiple false complaints filed through the EcoResolve system.</p>
          <p>You have received <b>3 warnings</b>, which is the limit for fraudulent reports.</p>
          <p>If you believe this action is incorrect, please contact the EcoResolve support team for further assistance.</p>
          <br/>
          <p>Regards,<br/>EcoResolve Team</p>
        </div>
      `;
    }

    await mailSender(citizen.email, emailSubject, emailBody);

    await citizen.save();

    return res.status(200).json(
      new ApiResponse(200, { citizen, complaint }, 
        `Complaint rejected. Warning ${citizen.warnings}/3 issued to ${citizen.firstName}`)
    );

  } catch (error) {
    console.error("❌ Error in rejectFalseComplaint:", error);
    throw new ApiError(
      error?.status || 500,
      error?.message || "Failed to reject complaint"
    );
  }
};

// Get Overdue Complaints (for assignments)
export const getOverdueComplaints = asyncHandler(async (req, res) => {
  try {
    const user = req.user?._id ? await User.findById(req.user._id) : null;
    if (!user) throw new ApiError(404, "User not found");

    if (user.accountType !== "Staff" && user.accountType !== "Admin") {
      throw new ApiError(403, "Only staff and admins can view overdue complaints");
    }

    const overdueComplaints = await Complaint.find({ overdue: true })
      .populate({ path: "userId", select: "firstName lastName email" })
      .select("department status location description overdue resolvedAt userId")
      .sort({ updatedAt: -1 });

    if (!overdueComplaints || overdueComplaints.length === 0) {
      throw new ApiError(404, "No overdue complaints found");
    }

    return res.status(200).json(
      new ApiResponse(200, overdueComplaints, "Overdue complaints fetched successfully")
    );
  } catch (error) {
    console.error("❌ Error in getOverdueComplaints:", error);
    throw new ApiError(
      error?.status || 500,
      error?.message || "Something went wrong while fetching overdue complaints"
    );
  }
});
