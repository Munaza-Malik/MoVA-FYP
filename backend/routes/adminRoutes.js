const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Vehicle = require("../models/Vehicle");
const Log = require("../models/Log");
const authMiddleware = require("../middleware/authMiddleware"); // Import your middleware

// GET /api/admin/stats - Admin only
router.get("/stats", authMiddleware, authMiddleware.requireAdmin, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalVehicles = await Vehicle.countDocuments();
    const unauthorizedAttempts = await Log.countDocuments({ status: "Unauthorized" });

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

    res.json(stats);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
