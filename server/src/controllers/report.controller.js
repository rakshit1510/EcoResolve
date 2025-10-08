import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import Complaint from "../models/complaint.model.js";
import User from "../models/user.model.js";
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

  // filter for monthly report
  if (type === "monthly" && month && year) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);
    matchQuery = { createdAt: { $gte: startDate, $lte: endDate } };
  }

  // fetch complaints
  const complaints = await Complaint.find(matchQuery);

  if (!complaints || complaints.length === 0)
    throw new ApiError(404, "No complaints found for this period");

  // compute metrics
  const total = complaints.length;
  const resolved = complaints.filter(c => c.status === "resolved").length;
  const pending = complaints.filter(c => c.status !== "resolved").length;

  // avg resolution time
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

  // department-wise count
  const departmentStats = {};
  complaints.forEach(c => {
    departmentStats[c.department] = (departmentStats[c.department] || 0) + 1;
  });

  const reportData = {
    type,
    totalComplaints: total,
    resolvedComplaints: resolved,
    pendingComplaints: pending,
    averageResolutionTimeHours: avgResolutionTime,
    departmentBreakdown: departmentStats,
  };

  // 🟢 JSON format (default)
  if (format === "json") {
    return res
      .status(200)
      .json(new ApiResponse(200, reportData, "Report generated successfully"));
  }

  // 🟡 CSV format
  if (format === "csv") {
    const fields = [
      "type",
      "totalComplaints",
      "resolvedComplaints",
      "pendingComplaints",
      "averageResolutionTimeHours",
    ];
    const parser = new Parser({ fields });
    const csv = parser.parse(reportData);

    res.header("Content-Type", "text/csv");
    res.attachment(`complaint_report_${type}.csv`);
    return res.send(csv);
  }

  // 🔵 PDF format
  if (format === "pdf") {
    const doc = new PDFDocument();
    const filePath = `/tmp/complaint_report_${Date.now()}.pdf`;
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    doc.fontSize(20).text("Complaint Report", { align: "center" });
    doc.moveDown();
    doc.fontSize(12).text(`Report Type: ${type}`);
    doc.text(`Total Complaints: ${total}`);
    doc.text(`Resolved Complaints: ${resolved}`);
    doc.text(`Pending Complaints: ${pending}`);
    doc.text(`Average Resolution Time: ${avgResolutionTime} hours`);
    doc.moveDown().text("Department Breakdown:");
    Object.entries(departmentStats).forEach(([dept, count]) => {
      doc.text(`- ${dept}: ${count}`);
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
