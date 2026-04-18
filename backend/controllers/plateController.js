// backend/controllers/plateController.js
import axios from "axios";

export const detectPlate = async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: "No image uploaded" });
    }

    // Convert uploaded image to Base64 format
    const imageBase64 = `data:image/jpeg;base64,${file.buffer.toString("base64")}`;

    // Send the image to Flask API
    const flaskURL = "http://127.0.0.1:5000/detect"; // Flask runs on port 5000
    const response = await axios.post(flaskURL, { image: imageBase64 });

    // Send Flask response back to frontend
    res.json(response.data);
  } catch (err) {
    console.error("❌ Flask API Error:", err.message);
    res.status(500).json({ error: "Failed to connect to Flask API" });
  }
};  