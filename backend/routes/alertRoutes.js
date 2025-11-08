// routes/alertRoutes.js
const express = require("express");
const Alert = require("../models/Alert");

const router = express.Router();

// GET all alerts
router.get("/", async (req, res) => {
  try {
    const alerts = await Alert.find().sort({ time: -1 });
    res.json(alerts);
  } catch (err) {
    console.error("Alert GET error:", err); // <--- log the error
    res.status(500).json({ message: "Failed to fetch alerts" });
  }
});


// POST new alert
router.post("/", async (req, res) => {
  try {
    const alert = new Alert(req.body);
    await alert.save();
    res.status(201).json(alert);
  } catch (err) {
    res.status(500).json({ message: "Failed to save alert" });
  }
});

// DELETE alert by id
router.delete("/:id", async (req, res) => {
  try {
    await Alert.findByIdAndDelete(req.params.id);
    res.json({ message: "Alert deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete alert" });
  }
});

module.exports = router;
