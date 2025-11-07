// Load environment variables
require("dotenv").config();

// Import dependencies
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

// Import routes
const authRoutes = require("./routes/authRoutes");
const vehicleRoutes = require("./routes/vehicleRoutes");
const contactRoutes = require("./routes/contactRoutes");
const userRoutes = require("./routes/userRoutes");
const plateRoutes = require("./routes/plateRoutes");
const logsRoutes = require("./routes/logsRoutes");

// Initialize app
const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Connect to MongoDB
connectDB();

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/vehicles", vehicleRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/users", userRoutes); 

app.use("/uploads", express.static("uploads"));
app.use("/api/plates", plateRoutes);
app.use("/api/logs", logsRoutes);



// Default Route
app.get("/", (req, res) => {
  res.send("🚀 Backend server is running...");
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
