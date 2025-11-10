const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const Vehicle = require("../models/Vehicle");
const upload = require("../middleware/upload"); // multer middleware

// =============================
//  POST /api/vehicles/register
//  Only authenticated users can register a vehicle
// =============================
router.post(
  "/register",
  authMiddleware,
  upload.fields([
    { name: "driverImages", maxCount: 3 },
    { name: "documents", maxCount: 5 },
    { name: "profileImages", maxCount: 5 },
  ]),
  async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "User authentication failed" });
      }

      const {
        phone,
        plateNumber,
        vehicleType,
        brand,
        model,
        color,
        driverNames,
        cnics,
        driverPhones,
      } = req.body;

      const existingVehicle = await Vehicle.findOne({ plateNumber });
      if (existingVehicle) {
        return res.status(400).json({
          message: "Vehicle with this plate number already exists.",
        });
      }

      const documents = req.files?.documents?.map((f) => f.path) || [];
      const profileImages = req.files?.profileImages?.map((f) => f.path) || [];
      const driverImages = req.files?.driverImages?.map((f) => f.path) || [];

      const driverNamesArr = Array.isArray(driverNames) ? driverNames : driverNames ? [driverNames] : [];
      const cnicsArr = Array.isArray(cnics) ? cnics : cnics ? [cnics] : [];
      const driverPhonesArr = Array.isArray(driverPhones) ? driverPhones : driverPhones ? [driverPhones] : [];

      const drivers = driverNamesArr.map((name, index) => ({
        name: name || "",
        cnic: cnicsArr[index] || "",
        phone: driverPhonesArr[index] || "",
        image: driverImages[index] || "",
      }));

      const newVehicle = new Vehicle({
        user: userId,
        phone,
        plateNumber,
        vehicleType,
        brand,
        model,
        color,
        drivers,
        profileImages,
        documents,
        status: "Pending",
      });

      await newVehicle.save();

      res.status(201).json({
        message: "Vehicle registered successfully!",
        vehicle: newVehicle,
      });
    } catch (err) {
      console.error("Vehicle register error:", err);
      res.status(500).json({ message: "Error registering vehicle", error: err.message });
    }
  }
);

// =============================
//  GET /api/vehicles/admin
//  Admin-only route to view all vehicles
// =============================
router.get("/admin", authMiddleware, authMiddleware.requireAdmin, async (req, res) => {
  try {
    const vehicles = await Vehicle.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    const vehiclesWithOwner = vehicles.map((v) => ({
      ...v._doc,
      ownerName: v.user?.name || "Unknown",
    }));

    res.json(vehiclesWithOwner);
  } catch (err) {
    console.error("Fetch vehicles error:", err);
    res.status(500).json({ message: "Error fetching vehicles" });
  }
});

// =============================
//  PUT /api/vehicles/:id/status
//  Admin-only route to update vehicle status
// =============================
router.put("/:id/status", authMiddleware, authMiddleware.requireAdmin, async (req, res) => {
  try {
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
    console.error("Update status error:", err);
    res.status(500).json({ message: "Error updating vehicle status", error: err.message });
  }
});

// =============================
//  GET /api/vehicles/my-vehicles
//  Authenticated users can view their vehicles
// =============================
router.get("/my-vehicles", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const vehicles = await Vehicle.find({ user: userId }).sort({ createdAt: -1 });

    res.status(200).json({
      count: vehicles.length,
      vehicles,
    });
  } catch (err) {
    console.error("Error fetching user's vehicles:", err);
    res.status(500).json({ message: "Failed to fetch vehicles" });
  }
});

// =============================
//  GET /api/vehicles/plate/:plate
//  Public route to get vehicle by plate number
// =============================
// GET /api/plates/:plate
router.get("/:plate", async (req, res) => {
  try {
    // 1️⃣ Normalize input plate
    let plateRaw = req.params.plate.toUpperCase().replace(/[^A-Z0-9]/g, ""); 
    if (plateRaw.length < 6) return res.status(400).json({ message: "Invalid plate format" });

    const plateRegexStr = `^${plateRaw.slice(0, 3)}[- ]?${plateRaw.slice(3, 6)}$`;
    const plateRegex = new RegExp(plateRegexStr, "i"); // case-insensitive

    // 2️⃣ Search vehicle in DB
      const vehicle = await Vehicle.findOne({ plateNumber: { $regex: plateRegex } })
                             .populate("user", "name phone email");


    if (!vehicle) {
      return res.status(404).json({ message: "Vehicle not found" });
    }

    res.json(vehicle);
  } catch (err) {
    console.error("Error fetching vehicle:", err);
    res.status(500).json({ message: "Server error" });
  }
});


module.exports = router;
