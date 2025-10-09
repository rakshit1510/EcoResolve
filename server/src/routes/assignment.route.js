import express from "express";
import {
  createAssignment,
  getAssignments,
  getAssignmentById,
  updateAssignment,
  deleteAssignment,
  getOverdueComplaints,
  assignmentLogin,
  resolveAssignment
} from "../controllers/assignment.controller.js";
import { verifyJWT, isStaff, isAdmin } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/resolve-assignment", resolveAssignment);
router.post("/assignment-login", assignmentLogin);
router.post("/", verifyJWT, isStaff, createAssignment);
router.get("/", verifyJWT, isStaff, getAssignments);
router.get("/:id", verifyJWT, isStaff, getAssignmentById);
router.put("/:id", verifyJWT, isStaff, updateAssignment);
router.delete("/:id", verifyJWT, isStaff, deleteAssignment);
router.get("/overdue-complaints", verifyJWT, getOverdueComplaints);


export default router;
