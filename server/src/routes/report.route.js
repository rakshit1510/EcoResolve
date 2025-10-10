import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { generateReport, generateDepartmentReport } from "../controllers/report.controller.js";

const router = Router();

// Admin-only route to generate and export reports
router.get("/generate", verifyJWT, generateReport);
router.post("/department", verifyJWT, generateDepartmentReport);
export default router;
