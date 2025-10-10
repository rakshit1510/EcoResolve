import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { generateReport, generateDepartmentReport, generateAdminReport } from "../controllers/report.controller.js";

const router = Router();

// Admin-only route to generate and export reports
router.get("/generate", verifyJWT, generateReport);
router.get("/admin", verifyJWT, generateAdminReport);
router.post("/department", verifyJWT, generateDepartmentReport);
export default router;
