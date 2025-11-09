const express = require("express");
const router = express.Router();
const { sendContactMessage } = require("../controllers/contactController");
const authMiddleware = require("../middleware/authMiddleware");

// POST request to handle contact form submissions
// Protected: only logged-in users can send messages
router.post("/", authMiddleware, sendContactMessage);

module.exports = router;
