const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const Vehicle = require("../models/Vehicle");
const upload = require("../middleware/upload"); // multer middleware

// =============================
//  POST /api/vehicles/register
// =============================
router.post(
  "/register",
  authMiddleware,
  upload.fields([
    { name: "driverImages", maxCount: 3 }, // multiple driver images
    { name: "documents", maxCount: 5 },
    { name: "profileImages", maxCount: 5 },
  ]),
  async (req, res) => {
    try {
      console.log("✅ Vehicle Register API Hit!");
      console.log("📩 req.body:", req.body);
      console.log("🖼️ req.files:", req.files);

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

      // ✅ Prevent duplicate plate number
      const existingVehicle = await Vehicle.findOne({ plateNumber });
      if (existingVehicle) {
        return res.status(400).json({
          message: "Vehicle with this plate number already exists.",
        });
      }

      // ✅ Safely extract uploaded files
      const documents = req.files?.documents?.map((f) => f.path) || [];
      const profileImages = req.files?.profileImages?.map((f) => f.path) || [];
      const driverImages = req.files?.driverImages?.map((f) => f.path) || [];

      // ✅ Ensure arrays (so it doesn’t break when one driver only)
      const driverNamesArr = Array.isArray(driverNames)
        ? driverNames
        : driverNames
        ? [driverNames]
        : [];
      const cnicsArr = Array.isArray(cnics) ? cnics : cnics ? [cnics] : [];
      const driverPhonesArr = Array.isArray(driverPhones)
        ? driverPhones
        : driverPhones
        ? [driverPhones]
        : [];

      // ✅ Map driver details correctly
      const drivers = driverNamesArr.map((name, index) => ({
        name: name || "",
        cnic: cnicsArr[index] || "",
        phone: driverPhonesArr[index] || "",
        image: driverImages[index] || "", // ✅ store driver image path (for Logs display)
      }));

      // ✅ Create new vehicle entry
      const newVehicle = new Vehicle({
        user: userId,
        phone,
        plateNumber,
        vehicleType,
        brand,
        model,
        color,
        drivers, // structured driver array
        profileImages,
        documents,
        status: "Pending",
      });

      await newVehicle.save();

      res.status(201).json({
        message: "✅ Vehicle registered successfully with multiple drivers!",
        vehicle: newVehicle,
      });
    } catch (err) {
      console.error("❌ Vehicle register error:", err);
      res.status(500).json({
        message: "Error registering vehicle",
        error: err.message,
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
    console.error("❌ Fetch vehicles error:", err);
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
    console.error("❌ Update status error:", err);
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
    const userId = req.user.id;
    console.log("🔍 Fetching vehicles for user:", userId);

    const vehicles = await Vehicle.find({ user: userId }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      count: vehicles.length,
      vehicles,
    });
  } catch (err) {
    console.error("❌ Error fetching user's vehicles:", err);
    res.status(500).json({ message: "Failed to fetch vehicles" });
  }
});

// =============================
//  GET /api/vehicles/plate/:plate
// =============================
router.get("/plate/:plate", async (req, res) => {
  try {
    const plate = req.params.plate.toUpperCase().trim();

    // Find vehicle and populate user details
    const vehicle = await Vehicle.findOne({ plateNumber: plate }).populate(
      "user", 
      "name email" // only get name and email
    );

    if (!vehicle) return res.status(404).json(null);

    // Add ownerName to response
    const vehicleWithOwner = {
      ...vehicle._doc,
      ownerName: vehicle.user?.name || "Unknown",
    };

    res.json(vehicleWithOwner);
  } catch (err) {
    console.error("❌ Error fetching vehicle by plate:", err);
    res.status(500).json({ error: "Server error" });
  }
});




module.exports = router;