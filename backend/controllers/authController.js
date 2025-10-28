const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/sendEmail"); //  SendGrid utility
const fs = require("fs");

//  In-memory OTP store (in production: use Redis or DB)
const otpStore = {};

// ================== SIGNUP ==================
exports.signup = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role,
      userType,
      faculty,
      programType,
      semester,
      batch,
      phone,
      sapId,
      year,
    } = req.body;

    console.log("📥 Signup payload:", req.body);

    // -----------------------------
    //  Email domain validation
    if (userType === "student" && !email.endsWith("@students.riphah.edu.pk")) {
      return res
        .status(400)
        .json({ message: "Student email must end with @students.riphah.edu.pk" });
    }
    if (userType === "faculty" && !email.endsWith("@riphah.edu.pk")) {
      return res
        .status(400)
        .json({ message: "Faculty email must end with @riphah.edu.pk" });
    }

    // -----------------------------
    //  Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "Email already registered" });

    // -----------------------------
    //  Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // -----------------------------
    //  Handle profile image upload if multer used
    let profileImage = null;
    if (req.file) {
      profileImage = req.file.path;
    } else if (req.files && req.files.profileImages && req.files.profileImages[0]) {
  profileImage = `uploads/${req.files.profileImages[0].filename}`;
}


    // -----------------------------
    //  Create new user object
    const userData = {
      name: name || "",
      email,
      password: hashedPassword,
      role: role || "user",
      userType: userType || "student",
      faculty: faculty || "",
      programType: programType || "",
      semester: semester ? Number(semester) : null,
      batch: batch || "",
      phone: phone || "",
      sapId: sapId || "",
      year: year || "",
      profileImage: profileImage || "",
    };

    const user = new User(userData);
    console.log("🧾 User object to save:", user.toObject());

    await user.save();

    res.status(201).json({
      message: "Signup successful!",
      user,
    });
  } catch (err) {
    console.error(" Signup error:", err);
    res
      .status(500)
      .json({ message: "Signup failed", error: err.message });
  }
};

// ================== LOGIN ==================
exports.login = async (req, res) => {
  try {
    const { email, password, role, userType, remember } = req.body;

    //  Find user with correct role + type
    const query = { email, role };
    if (role === "user") query.userType = userType;

    const user = await User.findOne(query);
    if (!user) return res.status(404).json({ message: "User not found" });

    //  Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid password" });

    //  Generate JWT
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role, userType: user.userType },
      process.env.JWT_SECRET || "secretKey",
      { expiresIn: remember ? "7d" : "1h" }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        userType: user.userType,
      },
    });
  } catch (err) {
    console.error(" Login error:", err);
    res
      .status(500)
      .json({ message: "Login failed", error: err.message });
  }
};

// ================== SEND OTP ==================
exports.sendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore[email] = { otp, expires: Date.now() + 5 * 60 * 1000 }; // 5 minutes expiry

    await sendEmail(email, "Your OTP Code", `Your OTP is: ${otp}`);

    res.json({ message: "OTP sent to your email" });
  } catch (err) {
    console.error(" Send OTP error:", err.response?.body || err);
    res
      .status(500)
      .json({ message: "Error sending OTP", error: err.message });
  }
};

// ================== VERIFY OTP + RESET PASSWORD ==================
exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp, password } = req.body;
    const record = otpStore[email];

    if (!record || record.otp !== otp || Date.now() > record.expires) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await User.updateOne({ email }, { password: hashedPassword });

    delete otpStore[email];
    res.json({ message: "Password reset successful!" });
  } catch (err) {
    console.error(" Verify OTP error:", err);
    res
      .status(500)
      .json({ message: "Error resetting password", error: err.message });
  }
};

// ================== GET PROFILE ==================
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    //  Build absolute URL for image if exists
    if (user.profileImage) {
      const baseUrl = `${req.protocol}://${req.get("host")}`;
      const fixedPath = user.profileImage.replace(/\\/g, "/"); // convert backslashes to forward slashes
      user.profileImage = `${baseUrl}/${fixedPath}`;
    }

    res.json(user);
  } catch (err) {
    console.error(" Get profile error:", err);
    res.status(500).json({ message: "Error fetching profile", error: err.message });
  }
};

