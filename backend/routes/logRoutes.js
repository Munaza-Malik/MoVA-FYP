const express = require("express");
const router = express.Router();
const Vehicle = require("../models/Vehicle"); // your mongoose model
const authMiddleware = require("../middleware/authMiddleware");

// Get all logs/vehicles (protected)
router.get("/", authMiddleware, async (req, res) => {
  try {
    const vehicles = await Vehicle.find().sort({ createdAt: -1 });
    res.json(vehicles);
  } catch (error) {
    console.error("Error fetching logs:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
