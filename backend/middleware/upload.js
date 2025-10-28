const multer = require("multer");
const path = require("path");
const fs = require("fs");

//  Ensure uploads folder exists
const uploadDir = "uploads";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

//  Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  },
});

//  File filter (supports both profileImage & documents)
//  File filter (supports vehicle images)
const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|pdf|doc|docx/;
  const ext = path.extname(file.originalname).toLowerCase();

  if (!allowed.test(ext)) {
    return cb(
      new Error("Only images (jpg, png) and documents (pdf, doc, docx) are allowed"),
      false
    );
  }

  //  Allow all valid vehicle-related fields
  const validFields = ["profileImages", "documents", "cnicImage", "vehicleImage"];


  if (validFields.includes(file.fieldname)) {
    cb(null, true);
  } else {
    cb(new multer.MulterError("LIMIT_UNEXPECTED_FILE", file.fieldname));
  }
};


//  Export multer instance
module.exports = multer({ storage, fileFilter });
