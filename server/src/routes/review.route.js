import { Router } from "express";
import { createReview, getReviewsByUser, getReviewsForComplaint , getReviewById,getAllReviews} from "../controllers/review.controller.js";
import { verifyJWT, isCitizen, isStaff } from "../middlewares/auth.middleware.js";

const router= Router();

router.route("/createReview").post(verifyJWT,isCitizen,createReview);
router.route("/getReviewsForComplaint/:complaintId").get(verifyJWT,getReviewsForComplaint);
router.route("/my-reviews").get(verifyJWT,isCitizen,getReviewsByUser);
router.route("/getReviewById/:id").get(verifyJWT,getReviewById);
router.route("/getAllReviews").get(verifyJWT,isStaff,getAllReviews);

export default router;