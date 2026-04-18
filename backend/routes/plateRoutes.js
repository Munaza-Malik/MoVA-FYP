const express = require("express");
const multer = require("multer");
const { detectPlate } = require("../controllers/plateController");
const Vehicle = require("../models/Vehicle"); // import your Vehicle model

const router = express.Router();
const upload = multer();

// POST /api/plates/detect
router.post("/detect", upload.single("image"), detectPlate);

// GET /api/plates/:plate
router.get("/:plate", async (req, res) => {
  try {
    let plateRaw = req.params.plate.toUpperCase().replace(/[^A-Z0-9]/g, "");
    if (plateRaw.length < 6) return res.status(400).json({ message: "Invalid plate format" });

    const plateRegexStr = `^${plateRaw.slice(0, 3)}[- ]?${plateRaw.slice(3, 6)}$`;
    const plateRegex = new RegExp(plateRegexStr, "i");

    const vehicle = await Vehicle.findOne({ plateNumber: { $regex: plateRegex } })
                                 .populate("user", "name phone email");

    if (!vehicle) return res.status(404).json({ message: "Vehicle not found" });

    res.json(vehicle);
  } catch (err) {
    console.error("Error fetching vehicle:", err);
    res.status(500).json({ message: "Server error" });
  }
});


module.exports = router;
