// models/Alert.js
const mongoose = require("mongoose");

const alertSchema = new mongoose.Schema({
  vehicle: { type: String },
  message: { type: String, required: true },
  type: { type: String, enum: ["Critical", "Warning", "Info"], required: true },
  time: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Alert", alertSchema);
