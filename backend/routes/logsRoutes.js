// backend/routes/logs.js
const express = require("express");
const router = express.Router();
const Log = require("../models/Log");

// GET /api/logs
router.get("/", async (req, res) => {
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

// POST /api/logs
router.post("/", async (req, res) => {
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



module.exports = router;
