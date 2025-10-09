import mongoose from "mongoose";

const assignmentSchema = new mongoose.Schema(
  {
    workers: [{ type: mongoose.Schema.Types.ObjectId, ref: "Worker", required: true }],
    resources: [{ type: mongoose.Schema.Types.ObjectId, ref: "Resource", required: true }],
    compliantId: { type: mongoose.Schema.Types.ObjectId, ref: "Complaint", required: true },
    department: { type: String, required: true },
    location: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    description: { type: String },
    loginId: { type: String },
    loginPassword: { type: String },
    status: { type: String, enum: ["Active", "Resolved"], default: "Active" },
    otp: { type: String },
    otpExpiry: { type: Date },
    overdue: { type: Boolean, default: false },
    reminderSent: { type: Boolean, default: false },
  },
  { timestamps: true }
);


const Assignment = mongoose.model("Assignment", assignmentSchema);
export default Assignment;
