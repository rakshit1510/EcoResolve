import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser' 
import "./utils/overdueChecker.js";

import resourcesRoutes from './routes/resource.route.js'
import workerRoutes from './routes/worker.route.js'
import assignmentRoutes from './routes/assignment.route.js'
import AuthRoutes from './routes/auth.route.js'
import complaintRoutes from './routes/complaint.route.js'
import reviewRoutes from './routes/review.route.js'
import reportRoutes from "./routes/report.route.js";
import escalationRoutes from "./routes/escalation.route.js";

const app = express()

const allowedOrigins = process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000']
app.use(cors({
    origin: allowedOrigins,
    credentials: true
}))
app.use(express.json({limit:'16kb'}))
app.use(express.urlencoded({extended: true, limit:"16kb"}))
app.use(express.static("public"))
app.use(cookieParser())
app.use(express.json());

// Routes
app.use('/api/resources', resourcesRoutes)
app.use("/api/workers", workerRoutes);
app.use("/api/assignments", assignmentRoutes);
app.use("/api/auth", AuthRoutes)
app.use("/api/complaints", complaintRoutes)
app.use("/api/reviews", reviewRoutes)
app.use("/api/reports", reportRoutes);
app.use("/api/escalation", escalationRoutes);
// Error handling middleware
app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    
    res.status(statusCode).json({
        success: false,
        message: message,
        error: err.error || []
    });
});

export {app}