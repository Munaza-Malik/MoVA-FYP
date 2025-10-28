const mongoose = require("mongoose");

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
  brand: {
    type: String,
  },
  model: {
    type: String,
  },
  color: {
    type: String,
  },

  //  Store multiple profile images
  profileImages: [
    {
      type: String, // e.g., "uploads/vehicle_123_img1.jpg"
    },
  ],

  //  Multiple document uploads
  documents: [
    {
      type: String, // e.g., "uploads/vehicle_123_doc1.pdf"
    },
  ],

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
