import express from "express";
import {
  createResource,
  getResources,
  getResourceById,
  updateResource,
  retireResource,
} from "../controllers/resource.controller.js";

const router = express.Router();

router.post("/", createResource); 
router.get("/", getResources); 
router.get("/:id", getResourceById); 
router.put("/:id", updateResource); 
router.delete("/:id", retireResource); 

export default router;
