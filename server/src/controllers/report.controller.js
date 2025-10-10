import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import Complaint from "../models/complaint.model.js";
import User from "../models/user.model.js";
import Assignment from "../models/assignment.model.js";
import { Parser } from "json2csv"; // for CSV export
import PDFDocument from "pdfkit";  // for PDF export
import fs from "fs";



/**
 * Generate complaint report (Admin only)
 * Query params:
 *  - type: "monthly" | "department"
 *  - month, year (for monthly report)
 *  - format: "json" | "csv" | "pdf"
 */

export const generateReport = asyncHandler(async (req, res) => {
  const user = req.user._id ? await User.findById(req.user._id) : null;
  if (!user) throw new ApiError(404, "User not found");
  if (user.accountType !== "Admin")
    throw new ApiError(403, "Only admins can generate reports");

  const { type = "monthly", format = "json", month, year } = req.query;

  let matchQuery = {};

  // Monthly filter
  if (type === "monthly" && month && year) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);
    matchQuery = { createdAt: { $gte: startDate, $lte: endDate } };
  }

  const complaints = await Complaint.find(matchQuery);
  const assignments = await Assignment.find(matchQuery);

  if (!complaints.length && !assignments.length)
    throw new ApiError(404, "No complaints or assignments found for this period");

  // 🧩 Basic metrics
  const total = complaints.length;
  const resolved = complaints.filter(c => c.status === "resolved").length;
  const pending = complaints.filter(c => c.status !== "resolved").length;

  // Average resolution time
  const resolvedComplaints = complaints.filter(c => c.resolvedAt);
  const avgResolutionTime =
    resolvedComplaints.length > 0
      ? (
          resolvedComplaints.reduce(
            (sum, c) => sum + (c.resolvedAt - c.createdAt),
            0
          ) /
          resolvedComplaints.length /
          (1000 * 60 * 60)
        ).toFixed(2)
      : 0;

  // Department-wise analytics summary
  const departments = [
    "Public Works Department (PWD)",
    "Sanitation Department",
    "Water Supply Department",
    "Electricity Department",
    "Parks & Environment Department",
  ];

  const departmentBreakdown = {};

  departments.forEach(dept => {
    const deptComplaints = complaints.filter(c => c.department === dept);
    const deptAssignments = assignments.filter(a => a.department === dept);
    const overdueComplaints = deptComplaints.filter(c => c.overdue);
    const overdueAssignments = deptAssignments.filter(a => a.overdue);
    const escalatedComplaints = deptComplaints.filter(
      c => c.escalationLevel === "admin" || c.escalationLevel === "superadmin"
    );

    departmentBreakdown[dept] = {
      totalComplaints: deptComplaints.length,
      resolvedComplaints: deptComplaints.filter(c => c.status === "resolved").length,
      pendingComplaints: deptComplaints.filter(c => c.status !== "resolved").length,
      overdueComplaints: overdueComplaints.length,
      overdueAssignments: overdueAssignments.length,
      escalatedComplaints: escalatedComplaints.length,
    };
  });

  // High-level summaries
  const totalOverdueComplaints = complaints.filter(c => c.overdue).length;
  const totalOverdueAssignments = assignments.filter(a => a.overdue).length;
  const totalEscalations = complaints.filter(
    c => c.escalationLevel === "admin" || c.escalationLevel === "superadmin"
  ).length;

  const reportData = {
    type,
    summary: {
      totalComplaints: total,
      resolvedComplaints: resolved,
      pendingComplaints: pending,
      averageResolutionTimeHours: avgResolutionTime,
      totalOverdueComplaints,
      totalOverdueAssignments,
      totalEscalations,
    },
    departmentBreakdown,
  };

  // 🟢 JSON format
  if (format === "json") {
    return res
      .status(200)
      .json(new ApiResponse(200, reportData, "Report generated successfully"));
  }

  // 🟡 CSV format
  if (format === "csv") {
    const fields = [
      "Department",
      "Total Complaints",
      "Resolved Complaints",
      "Pending Complaints",
      "Overdue Complaints",
      "Overdue Assignments",
      "Escalated Complaints",
    ];

    const csvData = Object.entries(departmentBreakdown).map(
      ([dept, data]) => ({
        Department: dept,
        "Total Complaints": data.totalComplaints,
        "Resolved Complaints": data.resolvedComplaints,
        "Pending Complaints": data.pendingComplaints,
        "Overdue Complaints": data.overdueComplaints,
        "Overdue Assignments": data.overdueAssignments,
        "Escalated Complaints": data.escalatedComplaints,
      })
    );

    const parser = new Parser({ fields });
    const csv = parser.parse(csvData);
    res.header("Content-Type", "text/csv");
    res.attachment(`complaint_report_${type}.csv`);
    return res.send(csv);
  }

  // 🔵 PDF format
  if (format === "pdf") {
    const doc = new PDFDocument({ margin: 40 });
    const filePath = `/tmp/complaint_report_${Date.now()}.pdf`;
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    // Header
    doc.fontSize(20).text("Complaint Analytics Report", { align: "center" });
    doc.moveDown();
    doc.fontSize(12).text(`Report Type: ${type}`);
    doc.text(`Total Complaints: ${total}`);
    doc.text(`Resolved Complaints: ${resolved}`);
    doc.text(`Pending Complaints: ${pending}`);
    doc.text(`Average Resolution Time: ${avgResolutionTime} hours`);
    doc.moveDown();

    // Department summary
    doc.fontSize(14).text("Department-Wise Breakdown", { underline: true });
    doc.moveDown(0.5);

    departments.forEach(dept => {
      const d = departmentBreakdown[dept];
      doc.fontSize(12).text(`${dept}`);
      doc.text(`  • Total Complaints: ${d.totalComplaints}`);
      doc.text(`  • Resolved Complaints: ${d.resolvedComplaints}`);
      doc.text(`  • Pending Complaints: ${d.pendingComplaints}`);
      doc.text(`  • Overdue Complaints: ${d.overdueComplaints}`);
      doc.text(`  • Overdue Assignments: ${d.overdueAssignments}`);
      doc.text(`  • Escalated Complaints: ${d.escalatedComplaints}`);
      doc.moveDown(0.8);
    });

    doc.end();
    stream.on("finish", () => {
      res.download(filePath, `complaint_report_${type}.pdf`, err => {
        if (err) console.error(err);
        fs.unlinkSync(filePath);
      });
    });
  }
});
