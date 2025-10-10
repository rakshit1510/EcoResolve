import Resource from "../models/resource.model.js";

export const createResource = async (req, res) => {
  try {
    const resourceData = { ...req.body };
    
    // Auto-assign department for staff members
    if (req.user && req.user.accountType === 'Staff') {
      resourceData.department = req.user.department;
    }
    
    const resource = new Resource(resourceData);
    await resource.save();
    res.status(201).json(resource);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const getResources = async (req, res) => {
  try {
    const filters = {};
    if (req.query.status) filters.status = req.query.status;
    if (req.query.department) filters.department = req.query.department;
    if (req.query.category) filters.category = req.query.category;

    // Add department filtering for staff members
    if (req.user && req.user.accountType === 'Staff') {
      filters.department = req.user.department;
    }

    const resources = await Resource.find(filters);
    res.status(200).json(resources);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getResourceById = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) return res.status(404).json({ error: "Resource not found" });
    res.status(200).json(resource);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateResource = async (req, res) => {
  try {
    const resource = await Resource.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!resource) return res.status(404).json({ error: "Resource not found" });
    res.status(200).json(resource);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const retireResource = async (req, res) => {
  try {
    const resource = await Resource.findByIdAndUpdate(
      req.params.id,
      { status: "Retired" },
      { new: true }
    );
    if (!resource) return res.status(404).json({ error: "Resource not found" });
    res.status(200).json({ message: "Resource marked as Retired", resource });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
