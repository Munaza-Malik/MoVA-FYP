const mongoose = require("mongoose");

// =============================
// DRIVER SCHEMA
// =============================
const driverSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  cnic: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
  },
  licenseNumber: {
    type: String,
  },
  // ✅ Changed from driverImages → profileImages (to match backend + frontend)
  profileImages: [{ type: String }],
});

// =============================
// VEHICLE SCHEMA
// =============================
const vehicleSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  phone: {
    type: String,
    required: true,
  },

  plateNumber: {
    type: String,
    required: true,
    unique: true,
  },

  vehicleType: {
    type: String,
    enum: ["car", "bike", "van", "other"],
    required: true,
  },

  brand: String,
  model: String,
  color: String,

  // ✅ Each vehicle has one or more drivers
  drivers: {
    type: [driverSchema],
    validate: {
      validator: (arr) => arr.length > 0,
      message: "At least one driver is required.",
    },
  },

  // ✅ Vehicle images
  profileImages: [{ type: String }],

  // ✅ Uploaded documents
  documents: [{ type: String }],

  status: {
    type: String,
    enum: ["Pending", "Approved", "Rejected"],
    default: "Pending",
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Vehicle", vehicleSchema);
