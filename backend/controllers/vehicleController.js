const mongoose = require("mongoose");
const Vehicle = require("../models/Vehicle");

/**
 * Register a new vehicle
 */
exports.registerVehicle = async (req, res) => {
  try {
    const { phone, plateNumber, vehicleType, brand, model, color } = req.body;

    //  Validate required fields
    if (!phone || !plateNumber || !vehicleType) {
      return res.status(400).json({
        message: "Phone, plate number, and vehicle type are required.",
      });
    }

    const normalizedPlate = plateNumber.trim().toUpperCase();
    const userId = req.user.id; // Extracted from JWT middleware

    //  Limit: Each user can register max 4 vehicles
    const existingCount = await Vehicle.countDocuments({ user: userId });
    if (existingCount >= 4) {
      return res.status(400).json({
        message: "You can only register up to 4 vehicles.",
      });
    }

    //  Check if the plate number already exists
    const existingPlate = await Vehicle.findOne({ plateNumber: normalizedPlate });
    if (existingPlate) {
      return res.status(400).json({
        message: "This plate number is already registered.",
      });
    }

    //  Handle uploaded files (multer)
    const documents = req.files?.map((file) => file.filename) || [];

    //  Create new vehicle
    const newVehicle = new Vehicle({
      user: userId,
      phone,
      plateNumber: normalizedPlate,
      vehicleType,
      brand,
      model,
      color,
      documents,
    });

    await newVehicle.save();

    return res.status(201).json({
      message: " Vehicle registered successfully.",
      vehicle: newVehicle,
    });
  } catch (err) {
    console.error("Vehicle registration error:", err);

    //  Handle MongoDB duplicate key error (E11000)
    if (err.code === 11000 && err.keyPattern?.plateNumber) {
      return res.status(400).json({
        message: "This plate number already exists.",
      });
    }

    return res.status(500).json({
      message: "Server error while registering vehicle.",
      error: err.message,
    });
  }
};

/**
 * Get all vehicles for the logged-in user
 */
exports.getMyVehicles = async (req, res) => {
  try {
    const userId = req.user.id;
    const vehicles = await Vehicle.find({ user: userId }).sort({ createdAt: -1 });

    return res.status(200).json(vehicles);
  } catch (err) {
    console.error("Error fetching vehicles:", err);
    return res.status(500).json({
      message: "Error fetching vehicles.",
      error: err.message,
    });
  }
};
