const express = require("express");
const {
  signup,
  login,
  getProfile,
  sendOtp,
  verifyOtp,
} = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");
const upload = require("../middleware/upload"); 

const router = express.Router();

// Signup (with profile image upload) - Public
router.post("/signup", upload.single("profileImage"), signup);

// Login - Public
router.post("/login", login);

// OTP Flow - Public
router.post("/forgot-password", sendOtp);
router.post("/verify-otp", verifyOtp);

// Profile - Authenticated users only
router.get("/profile", authMiddleware, getProfile);

// Dashboard - Authenticated users only
router.get("/dashboard", authMiddleware, (req, res) => {
  res.json({ message: `Welcome ${req.user.email}, you are logged in!` });
});

// Admin-only route
router.get("/admin-dashboard", authMiddleware, authMiddleware.requireAdmin, (req, res) => {
  res.json({ message: "Welcome, Admin!" });
});

module.exports = router;
