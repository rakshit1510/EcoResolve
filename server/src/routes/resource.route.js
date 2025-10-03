import express from "express";
import {
  createResource,
  getResources,
  getResourceById,
  updateResource,
  retireResource,
} from "../controllers/resource.controller.js";
import { verifyJWT, isStaff } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/", verifyJWT, isStaff, createResource);
router.get("/", verifyJWT, isStaff, getResources);
router.get("/:id", verifyJWT, isStaff, getResourceById);
router.put("/:id", verifyJWT, isStaff, updateResource);
router.patch("/:id/retire", verifyJWT, isStaff, retireResource);

export default router;
