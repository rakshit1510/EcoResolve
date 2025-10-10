import Assignment from "../models/assignment.model.js";
import Worker from "../models/worker.model.js";
import Resource from "../models/resource.model.js";
import Complaint from "../models/complaint.model.js";
import User from "../models/user.model.js"; // ✅ Added missing import
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  generateCredentials,
  generateOtp,
} from "../utils/generateCredentials.js";
import mailSender from "../utils/mailSender.js"; // ✅
import sendMail from "../utils/mailSender.js"; // ✅ Alias for consistency

// ✅ Create new Assignment
export const createAssignment = asyncHandler(async (req, res) => {
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

  if (!workers) throw new ApiError(400, "Worker selection is required");
  if (!resources?.length)
    throw new ApiError(400, "At least one resource must be selected");
  if (!compliantId) throw new ApiError(400, "Complaint ID is required");
  if (!department) throw new ApiError(400, "Department is required");
  if (!location) throw new ApiError(400, "Location is required");
  if (!startDate) throw new ApiError(400, "Start date is required");
  if (!endDate) throw new ApiError(400, "End date is required");

  const complaint = await Complaint.findById(compliantId).populate("userId");
  if (!complaint)
    throw new ApiError(
      404,
      "Selected complaint not found or may have been deleted"
    );
  if (complaint.status === "resolved")
    throw new ApiError(
      400,
      "Cannot assign workers to an already resolved complaint"
    );

  const citizenEmail = complaint.userId?.email;
  if (!citizenEmail)
    throw new ApiError(400, "Citizen email not found for this complaint");

  const worker = await Worker.findById(workers);
  if (!worker) throw new ApiError(404, `Worker not found`);
  if (worker.status !== "Available")
    throw new ApiError(
      400,
      `Worker "${worker.name}" is currently ${worker.status.toLowerCase()}`
    );

  const availableResources = await Resource.find({
    _id: { $in: resources },
    status: "Available",
  });

  if (availableResources.length !== resources.length) {
    const unavailable = await Resource.find({
      _id: { $in: resources },
      status: { $ne: "Available" },
    });
    const names = unavailable
      .map((r) => `"${r.resourceName}" (${r.status})`)
      .join(", ");
    throw new ApiError(400, `These resources are not available: ${names}`);
  }

  const { loginId, loginPassword } = generateCredentials();
  const { otp, otpExpiry } = generateOtp();

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

  await Worker.findByIdAndUpdate(workers, { status: "On-Duty" });
  await Resource.updateMany({ _id: { $in: resources } }, { status: "In Use" });

  await mailSender(
    worker.email,
    "New Assignment Credentials",
    `
    <h2>New Assignment Assigned</h2>
    <p><strong>Login ID:</strong> ${loginId}</p>
    <p><strong>Password:</strong> ${loginPassword}</p>
    <p><strong>Location:</strong> ${location}</p>
    <p><strong>Department:</strong> ${department}</p>
    `
  );

  await mailSender(
    citizenEmail,
    "Complaint Verification OTP",
    `
    <h2>OTP for Your Complaint</h2>
    <p>Your OTP is: <strong>${otp}</strong> (valid for 10 minutes)</p>
    `
  );

  res
    .status(201)
    .json(
      new ApiResponse(
        201,
        assignment,
        "Assignment created successfully. Credentials sent to worker and OTP sent to citizen."
      )
    );
});

// ✅ Get all Assignments
export const getAssignments = asyncHandler(async (req, res) => {
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
    .json(
      new ApiResponse(200, assignments, "Assignments fetched successfully")
    );
});

// ✅ Get Single Assignment
export const getAssignmentById = asyncHandler(async (req, res) => {
  const assignment = await Assignment.findById(req.params.id)
    .populate("workers", "name email department role status")
    .populate("resources", "resourceName department category status")
    .populate("compliantId", "location status description");

  if (!assignment) throw new ApiError(404, "Assignment not found");

  res
    .status(200)
    .json(new ApiResponse(200, assignment, "Assignment fetched successfully"));
});

// ✅ Update Assignment
export const updateAssignment = asyncHandler(async (req, res) => {
  const updates = req.body;
  const assignment = await Assignment.findByIdAndUpdate(
    req.params.id,
    updates,
    { new: true }
  );

  if (!assignment) throw new ApiError(404, "Assignment not found");

  res
    .status(200)
    .json(new ApiResponse(200, assignment, "Assignment updated successfully"));
});

// ✅ Delete Assignment
export const deleteAssignment = asyncHandler(async (req, res) => {
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
});

// ✅ Assignment Login
export const assignmentLogin = asyncHandler(async (req, res) => {
  const { loginId, loginPassword } = req.body;
  if (!loginId || !loginPassword)
    throw new ApiError(400, "Login ID and Password are required");

  const assignment = await Assignment.findOne({ loginId })
    .populate("workers")
    .populate("resources")
    .populate("compliantId");

  if (!assignment) throw new ApiError(404, "Invalid login ID");
  if (assignment.loginPassword !== loginPassword)
    throw new ApiError(401, "Incorrect password");
  if (assignment.status === "Resolved")
    throw new ApiError(400, "This assignment has already been resolved");

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

  res
    .status(200)
    .json(new ApiResponse(200, responseData, "Worker logged in successfully"));
});

// ✅ Resolve Assignment
export const resolveAssignment = asyncHandler(async (req, res) => {
  const { assignmentId, otp } = req.body;
  if (!assignmentId || !otp)
    throw new ApiError(400, "Assignment ID and OTP are required");

  const assignment = await Assignment.findById(assignmentId).populate({
    path: "compliantId",
    populate: { path: "userId", select: "email name" },
  });

  if (!assignment) throw new ApiError(404, "Assignment not found");
  if (assignment.status === "Resolved")
    throw new ApiError(400, "Already resolved");
  if (assignment.otp !== otp) throw new ApiError(401, "Invalid OTP");
  if (assignment.otpExpiry < new Date()) throw new ApiError(400, "OTP expired");

  assignment.status = "Resolved";
  assignment.otp = undefined;
  assignment.otpExpiry = undefined;
  assignment.loginId = undefined;
  assignment.loginPassword = undefined;
  await assignment.save();

  const complaint = await Complaint.findById(assignment.compliantId);
  if (complaint) {
    complaint.status = "resolved";
    complaint.resolvedAt = new Date();
    await complaint.save();
  }

  await Worker.updateMany(
    { _id: { $in: assignment.workers } },
    { status: "Available" }
  );
  await Resource.updateMany(
    { _id: { $in: assignment.resources } },
    { status: "Available" }
  );

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
      <p>Thank you for your cooperation!</p>
      `
    );
  }

  res
    .status(200)
    .json(new ApiResponse(200, null, "Assignment resolved successfully"));
});

// ✅ Reject False Complaint
export const rejectFalseComplaint = asyncHandler(async (req, res) => {
  const { complaintId } = req.params;
  const complaint = await Complaint.findById(complaintId).populate("userId");
  if (!complaint) throw new ApiError(404, "Complaint not found");

  complaint.status = "rejected";
  complaint.updatedAt = new Date();
  await complaint.save();

  const citizen = await User.findById(complaint.userId);
  if (!citizen) throw new ApiError(404, "Citizen not found");

  citizen.warnings = (citizen.warnings || 0) + 1;

  let subject, body;
  if (citizen.warnings < 3) {
    subject = `Warning ${citizen.warnings}/3 - False Complaint Notice`;
    body = `
      <h2>Dear ${citizen.firstName},</h2>
      <p>Your recent complaint was marked as false. This is your ${citizen.warnings} of 3 warnings.</p>
      <p>After 3 warnings, your account may be suspended.</p>
    `;
  } else {
    citizen.approved = false;
    subject = "Account Frozen - Multiple False Complaints";
    body = `
      <h2>Dear ${citizen.firstName},</h2>
      <p>Your account has been frozen due to multiple false complaints.</p>
    `;
  }

  await mailSender(citizen.email, subject, body);
  await citizen.save();

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { citizen, complaint },
        `Complaint rejected. Warning ${citizen.warnings}/3 issued.`
      )
    );
});

// ✅ Get Overdue Complaints
export const getOverdueComplaints = asyncHandler(async (req, res) => {
  const user = req.user?._id ? await User.findById(req.user._id) : null;
  if (!user) throw new ApiError(404, "User not found");

  if (user.accountType !== "Staff" && user.accountType !== "Admin") {
    throw new ApiError(
      403,
      "Only staff and admins can view overdue complaints"
    );
  }

  const overdueComplaints = await Complaint.find({ overdue: true })
    .populate({ path: "userId", select: "firstName lastName email" })
    .select("department status location description overdue resolvedAt userId")
    .sort({ updatedAt: -1 });

  if (!overdueComplaints.length)
    throw new ApiError(404, "No overdue complaints found");

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        overdueComplaints,
        "Overdue complaints fetched successfully"
      )
    );
});
