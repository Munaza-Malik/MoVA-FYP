const express = require("express");
const multer = require("multer");
const { detectPlate } = require("../controllers/plateController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();
const upload = multer();

// Protected route: only authenticated users can detect plates
router.post("/detect", authMiddleware, upload.single("image"), detectPlate);

module.exports = router;
