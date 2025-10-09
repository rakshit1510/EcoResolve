import cron from "node-cron";
import Assignment from "../models/assignment.model.js";
import Complaint from "../models/complaint.model.js";
import Worker from "../models/worker.model.js";
import  sendMail  from "../utils/mailSender.js";

// Run every 30 minutes
cron.schedule("*/30 * * * *", async () => {
  console.log("🔍 Checking for overdue assignments...");

  // 6 hours = 6 * 60 * 60 * 1000 = 21600000 ms
  const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000);

  // Find all assignments not resolved after 6 hrs
  const overdueAssignments = await Assignment.find({
    status: "Active",
    startDate: { $lte: sixHoursAgo },
    overdue: false,
  }).populate("workers compliantId");

  for (const assignment of overdueAssignments) {
    // Mark overdue
    assignment.overdue = true;
    await assignment.save();

    // Mark linked complaint overdue
    if (assignment.compliantId) {
      const complaint = await Complaint.findById(assignment.compliantId._id);
      if (complaint) {
        complaint.overdue = true;
        await complaint.save();
      }
    }

    // Send reminder mail to all assigned workers
    for (const worker of assignment.workers) {
      await sendMail(
        worker.email,
        "⚠️ Overdue Assignment Reminder",
        `
        <h2>Reminder: Assignment Overdue</h2>
        <p>Dear ${worker.name},</p>
        <p>The following assignment has exceeded the 6-hour resolution window:</p>
        <ul>
          <li><b>Department:</b> ${assignment.department}</li>
          <li><b>Location:</b> ${assignment.location}</li>
          <li><b>Description:</b> ${assignment.description}</li>
        </ul>
        <p>Please take immediate action to resolve it.</p>
        <p>— EcoResolve Monitoring System</p>
        `
      );
    }

    console.log(`⚠️ Marked assignment ${assignment._id} as overdue.`);
  }

  console.log("✅ Overdue check completed.");
});
