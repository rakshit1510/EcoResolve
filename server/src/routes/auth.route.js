import express from "express";
import {
  signupCitizen,
  loginCitizen,
  loginAdmin,
  loginStaff,
} from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/signup", signupCitizen);
router.post("/login/citizen", loginCitizen);

router.post("/login/admin", loginAdmin);

router.post("/login/staff", loginStaff);

export default router;
