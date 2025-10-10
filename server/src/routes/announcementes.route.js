import express from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import multer from "multer";
import {
  createAnnouncement,
  getAnnouncementById,
  updateAnnouncement,
  deleteAnnouncement,
  getAnnouncementsByFilters,
  getAnnouncementByQuery,
} from "../controllers/announcement.controller.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

// 🟢 Routes
router.post("/", verifyJWT, upload.array("attachments"), createAnnouncement);
router.get("/:id", verifyJWT, getAnnouncementById);
router.put("/:id", verifyJWT, upload.array("attachments"), updateAnnouncement);
router.delete("/:id", verifyJWT, deleteAnnouncement);
router.get("/", verifyJWT, getAnnouncementsByFilters);
router.get("/search/query", verifyJWT, getAnnouncementByQuery);

export default router;
