const express = require("express");
const router = express.Router();
const Log = require("../models/Log");
const authMiddleware = require("../middleware/authMiddleware");

// GET /api/logs → Protected route
router.get("/", authMiddleware, async (req, res) => {
  try {
    // Fetch all logs and sort by newest first
    const logs = await Log.find().sort({ time: -1 });

    // Only return logs with valid user, vehicle, status
    const validLogs = logs.filter(log => log.user && log.vehicle && log.status);

    res.json(validLogs);
  } catch (err) {
    console.error("Failed to fetch logs:", err);
    res.status(500).json({ message: "Failed to fetch logs", error: err.message });
  }
});

// POST /api/logs → Protected route
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { user, vehicle, status } = req.body;
    const log = new Log({
      user,
      vehicle,
      status,
      time: new Date(), // ensure a timestamp
    });
    await log.save();
    res.status(201).json(log);
  } catch (err) {
    console.error("Failed to save log:", err);
    res.status(500).json({ message: "Failed to save log", error: err.message });
  }
});

// DELETE /api/logs/:id → Admin only
router.delete("/:id", authMiddleware, authMiddleware.requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const deletedLog = await Log.findByIdAndDelete(id);

    if (!deletedLog) {
      return res.status(404).json({ message: "Log not found" });
    }

    res.json({ message: "Log deleted successfully", deletedLog });
  } catch (err) {
    console.error("Failed to delete log:", err);
    res.status(500).json({ message: "Failed to delete log", error: err.message });
  }
});

// DELETE /api/logs → Admin only
router.delete("/", authMiddleware, authMiddleware.requireAdmin, async (req, res) => {
  try {
    await Log.deleteMany({});
    res.json({ message: "All logs deleted successfully" });
  } catch (err) {
    console.error("Failed to delete all logs:", err);
    res.status(500).json({ message: "Failed to delete all logs", error: err.message });
  }
});

module.exports = router;
