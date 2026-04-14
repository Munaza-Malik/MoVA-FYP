// backend/middleware/upload.js
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Folders Structure
const uploadDir = "uploads";
const driverDir = path.join(uploadDir, "driver_images"); 
const docDir = path.join(uploadDir, "documents");

// Auto-create folders
[uploadDir, driverDir, docDir].forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        if (file.fieldname === "driverImages" || file.fieldname === "profileImages") {
            cb(null, driverDir);
        } else {
            cb(null, docDir);
        }
    },
    filename: (req, file, cb) => {
        // 1. Driver Name aur Plate extract karein req.body se
        // Hum spaces ko underscore (_) se replace karenge taaki filename valid rahe
        const driverName = req.body.driverNames ? req.body.driverNames.replace(/\s+/g, '_') : "Unknown";
        const plate = req.body.plateNumber ? req.body.plateNumber.replace(/[^a-zA-Z0-9]/g, "") : "NoPlate";
        
        const uniqueSuffix = Date.now();
        const ext = path.extname(file.originalname).toLowerCase();

        // 2. IMPORTANT: Name ko sabse pehle rakhein taaki Python script split karke Name uthaye
        // Result: MUNAZA-BBU414-driverImages-17123456.jpg
        cb(null, `${driverName}-${plate}-${file.fieldname}-${uniqueSuffix}${ext}`);
    },
});

const fileFilter = (req, file, cb) => {
    const allowed = /jpeg|jpg|png|pdf|doc|docx/;
    const ext = path.extname(file.originalname).toLowerCase();
    if (!allowed.test(ext)) {
        return cb(new Error("File type not supported"), false);
    }
    cb(null, true);
};

module.exports = multer({ 
    storage, 
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});