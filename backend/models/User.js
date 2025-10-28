const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: "user" },
    userType: { type: String, required: true }, // student / faculty / guest

    faculty: { type: String, default: "" },
    programType: { type: String, default: "" },
    semester: { type: Number, default: null },
    batch: { type: String, default: "" },
    phone: { type: String, default: "" },
    sapId: { type: String, default: "" },
    year: { type: String, default: "" },
    profileImage: { type: String }, // image path
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
