import Worker from "../models/worker.model.js";

export const addWorker = async (req, res) => {
  try {
    const worker = new Worker(req.body);
    await worker.save();
    res.status(201).json(worker);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const getWorkers = async (req, res) => {
  try {
    const filters = {};
    if (req.query.status) filters.status = req.query.status;
    if (req.query.department) filters.department = req.query.department;
    if (req.query.skills) filters.skills = { $in: req.query.skills.split(",") };

    const workers = await Worker.find(filters);
    res.json(workers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getWorkerById = async (req, res) => {
  try {
    const worker = await Worker.findById(req.params.id);
    if (!worker) return res.status(404).json({ error: "Worker not found" });
    res.json(worker);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateWorker = async (req, res) => {
  try {
    const worker = await Worker.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!worker) return res.status(404).json({ error: "Worker not found" });
    res.json(worker);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteWorker = async (req, res) => {
  try {
    const worker = await Worker.findById(req.params.id);
    if (!worker) return res.status(404).json({ error: "Worker not found" });
    worker.status = "Retired";
    await worker.save();
    res.json({ message: "Worker retired successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
