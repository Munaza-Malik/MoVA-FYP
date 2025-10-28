const express = require("express");
const router = express.Router();
const { sendContactMessage } = require("../controllers/contactController");

//  POST request to handle contact form submissions
router.post("/", sendContactMessage);

module.exports = router;
