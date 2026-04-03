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
        // Driver ki images ko alag folder mein rakhna hai verification ke liye
        if (file.fieldname === "driverImages" || file.fieldname === "profileImages") {
            cb(null, driverDir);
        } else {
            cb(null, docDir);
        }
    },
    filename: (req, file, cb) => {
        // Naming: Plate-Field-Time.jpg (Easy to search for Python)
        const plate = req.body.plateNumber ? req.body.plateNumber.replace(/[^a-zA-Z0-9]/g, "") : "unknown";
        const uniqueSuffix = Date.now();
        cb(null, `${plate}-${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
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