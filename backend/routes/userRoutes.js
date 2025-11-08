const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const upload = require("../middleware/upload"); // Multer config
const router = express.Router();

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
    const {
      name,
      email,
      userType,
      role,
      password,
      faculty,
      programType,
      semester,
      batch,
      year,
      phone,
      sapId,
    } = req.body;

    // Validate fields
    if (!name || !email || !role || !password) {
      return res.status(400).json({ message: "Please provide all required fields" });
    }

    // Check if email exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Prepare user object with all optional fields
    const newUserData = {
      name,
      email,
      userType,
      role,
      password: hashedPassword,
      faculty: faculty || null,
      programType: programType || null,
      semester: semester || null,
      batch: batch || null,
      year: year || null,
      phone: phone || null,
      sapId: sapId || null,
    };

    // Add uploaded file path if any
    if (req.file) {
      newUserData.profileImage = req.file.path.replace(/\\/g, "/");
    }

    // Save user
    const newUser = new User(newUserData);
    const savedUser = await newUser.save();

    // Exclude password in response
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

    // Hash new password if provided
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    } else {
      delete updateData.password; // don't overwrite with empty string
    }

    // Include uploaded file if any
    if (req.file) {
      updateData.profileImage = req.file.path.replace(/\\/g, "/");
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
