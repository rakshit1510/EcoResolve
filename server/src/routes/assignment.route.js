import express from "express";
import {
  createAssignment,
  getAssignments,
  getAssignmentById,
  updateAssignment,
  deleteAssignment,
} from "../controllers/assignment.controller.js";
import { verifyJWT, isStaff, isAdmin } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/", verifyJWT, isStaff, createAssignment);
router.get("/", verifyJWT, isStaff, getAssignments);
router.get("/:id", verifyJWT, isStaff, getAssignmentById);
router.put("/:id", verifyJWT, isStaff, updateAssignment);
router.delete("/:id", verifyJWT, isStaff, deleteAssignment);

export default router;
