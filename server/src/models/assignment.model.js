import mongoose from "mongoose";

const assignmentSchema = new mongoose.Schema(
  {
    workers: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Worker", required: true },
    ],
    resources: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Resource", required: true },
    ],
    department: { type: String, required: true },
    location: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    description: { type: String },
  },
  { timestamps: true }
);

const Assignment = mongoose.model("Assignment", assignmentSchema);
export default Assignment;
