import express from "express";
import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import {   
   logout,
    sendOTP,
    Signup,
    loginCitizen,
    loginAdmin,
    loginStaff,
    approveAccount
} from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/signup",upload.single('image'),  Signup);
router.route('/sendotp').post(upload.none(), sendOTP);
router.post("/login/citizen", loginCitizen);

router.post("/login/admin", loginAdmin);

router.post("/login/staff", loginStaff);
router.post("/logout", verifyJWT, logout);
router.post("/approve-account", verifyJWT, approveAccount);

export default router;
