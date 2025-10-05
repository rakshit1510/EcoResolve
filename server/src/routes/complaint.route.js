import { Router } from "express";
import {
  createComplaint,
  getAllComplaints,
  deleteComplaint,
  changeProgressStatus,
  getCitizenComplaints,
  getComplaintById,
  updateComplaint,
  getComplaintsByDepartment,
  getComplaintsByStatus,
  getComplaintsByfilter
} from "../controllers/complaint.controller.js";
import { verifyJWT, isCitizen, isStaff } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

// Complaint routes for citizens and staff operations

// Create complaint (Citizen only)
router
  .route("/createComplaint")
  .post(verifyJWT, isCitizen, upload.single('image'), createComplaint);

// Delete complaint (Citizen only – their own complaint)
router
  .route("/deleteComplaint/:id")
  .delete(verifyJWT, isCitizen, deleteComplaint);

// Change progress status (Staff only)
router
  .route("/changeProgressStatus/:id/status")
  .patch(verifyJWT, isStaff, changeProgressStatus);

// Get all complaints (Staff can view all, Citizens only their own inside controller)
router
  .route("/getAllComplaints")
  .get(verifyJWT, getAllComplaints);

// Get logged-in citizen’s complaints
router
  .route("/my-complaints")
  .get(verifyJWT, isCitizen, getCitizenComplaints);

// Get complaint by ID (Citizen or Staff)
router
  .route("/complaint/:id")
  .get(verifyJWT, getComplaintById);

// Update complaint (Staff only)
router
  .route("/updateComplaint/:id")
  .patch(verifyJWT, isStaff, updateComplaint);

// Get complaints by department (Staff only)
router
  .route("/complaints-by-department")
  .post(verifyJWT, isStaff, getComplaintsByDepartment);

// Get complaints by status (Staff only)
router
  .route("/complaints-by-status")
  .post(verifyJWT, getComplaintsByStatus);

// Get complaints by custom filter (Staff only)
router
  .route("/complaints-by-filter")
  .post(verifyJWT, getComplaintsByfilter);

export default router;
