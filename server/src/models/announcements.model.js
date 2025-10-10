import mongoose from "mongoose";

const announcementSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true, // Only SuperAdmin will create
    },
    audience: {
      type: String,
      enum: ["All", "Citizen", "Staff", "Admin"], // sync with your accountType
      default: "All", // visible to everyone
    },
    attachments: [
      {
        fileUrl: {
          type: String,
          required: true, // required if attachments exist
        },
        fileType: {
          type: String,
          enum: ["image", "pdf", "doc", "other"],
          default: "other",
        },
      },
    ],
    expiresAt: {
      type: Date,
      default: () =>
        new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // expires in 7 days
    },
    isActive: {
      type: Boolean,
      default: true, // SuperAdmin can deactivate old announcements
    },
  },
  { timestamps: true }
);

const Announcement = mongoose.model("Announcement", announcementSchema);

export default Announcement;
