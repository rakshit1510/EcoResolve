import { Router } from "express";
import {
  createComplaint,
  deleteComplaint,
  changeProgressStatus,
  getAllComplaints,
  getCitizenComplaints
} from "../controllers/complaint.controller.js";
import { verifyJWT, isCitizen, isStaff } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
const router = Router();

// Complaint routes for citizens and staff operations
router
  .route("/createComplaint")
  .post(upload.single('image'),verifyJWT, isCitizen, createComplaint);

router
  .route("/deleteComplaint/:id")
  .delete(verifyJWT, isCitizen, deleteComplaint);

router
  .route("/changeProgressStatus/:id/status")
  .patch(verifyJWT, isStaff, changeProgressStatus);

router
  .route("/getAllComplaints")
  .get(verifyJWT, isStaff, getAllComplaints);

router
  .route("/my-complaints")
  .get(verifyJWT, isCitizen, getCitizenComplaints);

export default router;
