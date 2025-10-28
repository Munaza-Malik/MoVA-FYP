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

//  Signup (with profile image upload)
router.post("/signup", upload.single("profileImage"), signup);

// Login
router.post("/login", login);

// OTP Flow
router.post("/forgot-password", sendOtp);
router.post("/verify-otp", verifyOtp);

// Profile
router.get("/profile", authMiddleware, getProfile);

// Dashboard
router.get("/dashboard", authMiddleware, (req, res) => {
  res.json({ message: `Welcome ${req.user.email}, you are logged in!` });
});

module.exports = router;
