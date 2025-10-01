import mongoose from "mongoose";

const resourceSchema = new mongoose.Schema(
  {
    resourceName: { type: String, required: true },
    department: { type: String, required: true },
    category: { type: String, required: true },
    status: {
      type: String,
      enum: ["Available", "In Use", "Under Maintenance", "Unavailable"],
      default: "Available",
    },
    location: { type: String, required: true },
    nextAvailable: { type: Date },
    description: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model("Resource", resourceSchema);
