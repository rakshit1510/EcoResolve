import cron from "node-cron";
import { autoEscalateComplaints } from "../controllers/escalation.controller.js";

// Run auto-escalation every minute
export const startEscalationCron = () => {
  cron.schedule("* * * * *", async () => {
    console.log("Running auto-escalation check...");
    await autoEscalateComplaints();
  });
  
  console.log("Escalation cron job started - running every minute");
};