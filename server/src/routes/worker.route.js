import express from "express";
import {
  addWorker,
  getWorkers,
  getWorkerById,
  updateWorker,
  deleteWorker,
} from "../controllers/worker.controller.js";
import { verifyJWT, isStaff } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/", verifyJWT, isStaff, addWorker);
router.get("/", verifyJWT, isStaff, getWorkers);
router.get("/:id", verifyJWT, isStaff, getWorkerById);
router.put("/:id", verifyJWT, isStaff, updateWorker);
router.patch("/:id/retire", verifyJWT, isStaff, deleteWorker);

export default router;
