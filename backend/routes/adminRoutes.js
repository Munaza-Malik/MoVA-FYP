const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Vehicle = require("../models/Vehicle");
const Log = require("../models/Log");

// GET /api/admin/stats - No auth middleware
router.get("/stats", async (req, res) => {
  try {
    // Count total users
    const totalUsers = await User.countDocuments();

    // Count total registered vehicles
    const totalVehicles = await Vehicle.countDocuments();

    // Count unauthorized attempts
    const unauthorizedAttempts = await Log.countDocuments({ status: "Unauthorized" });

    // Prepare stats array
    const stats = [
      {
        title: "Total Users",
        value: totalUsers,
        color: "from-[#1A2B49] to-[#2F3E64]",
        icon: "Users",
      },
      {
        title: "Registered Vehicles",
        value: totalVehicles,
        color: "from-[#4BB543] to-[#2E8B57]",
        icon: "Car",
      },
      {
        title: "Unauthorized Attempts",
        value: unauthorizedAttempts,
        color: "from-[#FF6B6B] to-[#C70039]",
        icon: "AlertTriangle",
      },
    ];

    // Send stats as JSON
    res.json(stats);
  } catch (err) {
    console.error("Error fetching stats:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
