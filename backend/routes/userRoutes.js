const express = require("express");
const User = require("../models/User");
const router = express.Router();
const upload = require("../middleware/upload"); // multer

// ===== GET all users =====
router.get("/", async (req, res) => {
  try {
    const users = await User.find().select("-password"); // exclude password
    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ===== ADD new user =====
router.post("/", upload.single("profileImage"), async (req, res) => {
  try {
    // Support both JSON and multipart/form-data
    const { name, email, userType, role, password } = req.body;

    if (!name || !email || !role || !password) {
      return res.status(400).json({ message: "Please provide all required fields" });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const newUserData = { name, email, userType, role, password };

    // Add file path if uploaded
    if (req.file) {
      newUserData.profileImage = req.file.path;
    }

    const newUser = new User(newUserData);
    const savedUser = await newUser.save();

    const { password: _, ...userWithoutPassword } = savedUser.toObject();
    res.status(201).json(userWithoutPassword);
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ===== UPDATE user =====
router.put("/:id", upload.single("profileImage"), async (req, res) => {
  try {
    const updateData = { ...req.body };

    // Include file if uploaded
    if (req.file) {
      updateData.profileImage = req.file.path;
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ===== DELETE user =====
router.delete("/:id", async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
