import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { generateReport } from "../controllers/report.controller.js";

const router = Router();

// Admin-only route to generate and export reports
router.get("/generate", verifyJWT, generateReport);

export default router;
