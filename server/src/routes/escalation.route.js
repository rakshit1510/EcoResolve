import { Router } from "express";
import { 
  getEscalatedComplaints, 
  resolveComplaint, 
  reassignComplaint 
} from "../controllers/escalation.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT);

router.route("/escalated").get(getEscalatedComplaints);
router.route("/:id/resolve").patch(resolveComplaint);
router.route("/:id/reassign").patch(reassignComplaint);

export default router;