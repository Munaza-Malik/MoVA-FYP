const express = require("express");
const multer = require("multer");
const { detectPlate } = require("../controllers/plateController");

const router = express.Router();
const upload = multer();

router.post("/detect", upload.single("image"), detectPlate);

module.exports = router;
