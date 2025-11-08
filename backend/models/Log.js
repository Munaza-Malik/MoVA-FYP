const mongoose = require("mongoose");

const logSchema = new mongoose.Schema({
  user: String,
  vehicle: String,
  status: String,
  time: { type: Date, default: Date.now },  // store as Date
});


module.exports = mongoose.model("Log", logSchema);