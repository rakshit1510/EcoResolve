import Assignment from "../models/assignment.model.js";
import Worker from "../models/worker.model.js";
import Resource from "../models/resource.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

export const createAssignment = async (req, res) => {
  try {
    const {
      workers,
      resources,
      department,
      location,
      startDate,
      endDate,
      description,
    } = req.body;
    if (!workers?.length || !resources?.length) {
      throw new ApiError(
        400,
        "At least one worker and one resource are required"
      );
    }
    const existingWorkers = await Worker.find({
      _id: { $in: workers },
      status: "Available",
    });
    const existingResources = await Resource.find({
      _id: { $in: resources },
      status: "Available",
    });
    if (existingWorkers.length !== workers.length)
      throw new ApiError(400, "Some workers are invalid or not available");
    if (existingResources.length !== resources.length)
      throw new ApiError(400, "Some resources are invalid or not available");
    const assignment = await Assignment.create({
      workers,
      resources,
      department,
      location,
      startDate,
      endDate,
      description,
    });
    await Worker.updateMany({ _id: { $in: workers } }, { status: "On-Duty" });
    await Resource.updateMany(
      { _id: { $in: resources } },
      { status: "In Use" }
    );
    res
      .status(201)
      .json(
        new ApiResponse(201, assignment, "Assignment created successfully")
      );
  } catch (error) {
    throw new ApiError(
      error?.status || 500,
      error?.message || "Failed to create assignment"
    );
  }
};

export const getAssignments = async (req, res) => {
  try {
    const filters = {};
    if (req.query.workerId) filters.workers = req.query.workerId;
    if (req.query.resourceId) filters.resources = req.query.resourceId;
    if (req.query.department) filters.department = req.query.department;
    const assignments = await Assignment.find(filters)
      .populate("workers", "name department role status")
      .populate("resources", "resourceName department category status");
    res
      .status(200)
      .json(
        new ApiResponse(200, assignments, "Assignments fetched successfully")
      );
  } catch (error) {
    throw new ApiError(
      error?.status || 500,
      error?.message || "Failed to fetch assignments"
    );
  }
};

export const getAssignmentById = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id)
      .populate("workers", "name department role status")
      .populate("resources", "resourceName department category status");
    if (!assignment) throw new ApiError(404, "Assignment not found");
    res
      .status(200)
      .json(
        new ApiResponse(200, assignment, "Assignment fetched successfully")
      );
  } catch (error) {
    throw new ApiError(
      error?.status || 500,
      error?.message || "Failed to fetch assignment"
    );
  }
};

export const updateAssignment = async (req, res) => {
  try {
    const {
      workers,
      resources,
      department,
      location,
      startDate,
      endDate,
      description,
    } = req.body;
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) throw new ApiError(404, "Assignment not found");
    if (workers) assignment.workers = workers;
    if (resources) assignment.resources = resources;
    if (department) assignment.department = department;
    if (location) assignment.location = location;
    if (startDate) assignment.startDate = startDate;
    if (endDate) assignment.endDate = endDate;
    if (description) assignment.description = description;
    await assignment.save();
    res
      .status(200)
      .json(
        new ApiResponse(200, assignment, "Assignment updated successfully")
      );
  } catch (error) {
    throw new ApiError(
      error?.status || 500,
      error?.message || "Failed to update assignment"
    );
  }
};

export const deleteAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) throw new ApiError(404, "Assignment not found");
    await Worker.updateMany(
      { _id: { $in: assignment.workers } },
      { status: "Available" }
    );
    await Resource.updateMany(
      { _id: { $in: assignment.resources } },
      { status: "Available" }
    );
    await assignment.remove();
    res
      .status(200)
      .json(new ApiResponse(200, null, "Assignment deleted successfully"));
  } catch (error) {
    throw new ApiError(
      error?.status || 500,
      error?.message || "Failed to delete assignment"
    );
  }
};
