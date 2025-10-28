const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const Vehicle = require("../models/Vehicle");
const User = require("../models/User");
const upload = require("../middleware/upload"); //  Import multer middleware

// =============================
//  POST /api/vehicles/register
// =============================
router.post(
  "/register",
  authMiddleware,
upload.fields([
  { name: "profileImages", maxCount: 4 }, // allow multiple images
  { name: "documents", maxCount: 5 },
]),

  async (req, res) => {
    try {
      console.log(" Vehicle Register API Hit!");
      console.log(" req.body:", req.body);
      console.log(" req.files:", req.files);
      console.log(" req.user:", req.user);

      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "User authentication failed" });
      }

      const { phone, plateNumber, vehicleType, brand, model, color } = req.body;

      const existingVehicle = await Vehicle.findOne({ plateNumber });
      if (existingVehicle) {
        return res
          .status(400)
          .json({ message: "Vehicle with this plate number already exists." });
      }

      const profileImages = req.files?.profileImages
      ? req.files.profileImages.map((file) => file.path)
      : [];


      const documents = req.files?.documents
        ? req.files.documents.map((file) => file.path)
        : [];

      const newVehicle = new Vehicle({
        user: userId,
        phone,
        plateNumber,
        vehicleType,
        brand,
        model,
        color,
        profileImages,
        documents,
        status: "Pending",
      });

      await newVehicle.save();

      res.status(201).json({ message: "Vehicle registered successfully!" });
    } catch (err) {
      console.error(" Vehicle register error:", err);
      res.status(500).json({
        message: "Error registering vehicle",
        error: err.message,
        stack: err.stack,
      });
    }
  }
);


// =============================
//  GET /api/vehicles/admin
// =============================
router.get("/admin", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const vehicles = await Vehicle.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    const vehiclesWithOwner = vehicles.map((v) => ({
      ...v._doc,
      ownerName: v.user?.name || "Unknown",
    }));

    res.json(vehiclesWithOwner);
  } catch (err) {
    console.error(" Fetch vehicles error:", err);
    res.status(500).json({ message: "Error fetching vehicles" });
  }
});

// =============================
//  PUT /api/vehicles/:id/status
// =============================
router.put("/:id/status", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const { status } = req.body;
    const vehicle = await Vehicle.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!vehicle) {
      return res.status(404).json({ message: "Vehicle not found" });
    }

    res.json({ message: "Vehicle status updated successfully", vehicle });
  } catch (err) {
    console.error(" Update status error:", err);
    res.status(500).json({
      message: "Error updating vehicle status",
      error: err.message,
    });
  }
});

// =============================
//  GET /api/vehicles/my-vehicles
// =============================
router.get("/my-vehicles", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id; //  From authMiddleware
    console.log("🔍 Fetching vehicles for user:", userId);

    const vehicles = await Vehicle.find({ user: userId }).sort({ createdAt: -1 });

    res.status(200).json({
      count: vehicles.length,
      vehicles,
    });
  } catch (err) {
    console.error(" Error fetching user's vehicles:", err);
    res.status(500).json({ message: "Failed to fetch vehicles" });
  }
});


module.exports = router;
