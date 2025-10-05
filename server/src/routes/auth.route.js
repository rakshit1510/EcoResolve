import express from "express";
import { Router } from "express";
import { verifyJWT,isAdmin,isInstructor,isStudent } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import {   
   resetPasswordToken,
   logout,
    sendOTP,
    Signup,
    loginCitizen,
    loginAdmin,
    loginStaff,
} from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/signup",upload.single('image'),  Signup);
router.route('/sendotp').post(upload.none(), sendOTP);
router.post("/login/citizen", loginCitizen);

router.post("/login/admin", loginAdmin);

router.post("/login/staff", loginStaff);

export default router;
