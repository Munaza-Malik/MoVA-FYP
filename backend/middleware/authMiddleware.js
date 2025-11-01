const jwt = require("jsonwebtoken");

function authMiddleware(req, res, next) {
  const token = req.headers["authorization"]?.split(" ")[1]; // Bearer <token>

  if (!token) {
    return res.status(401).json({ message: "Access denied, no token provided" });
  }

  try {
    // Verify JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secretKey");

    // Attach user info (id, email, role, userType) to request
    req.user = decoded;

    next();
  } catch (err) {
    res.status(400).json({ message: "Invalid token" });
  }
}

// 🧩 Optional: Admin-only route guard
authMiddleware.requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ message: "Admins only" });
  }
  next();
};

module.exports = authMiddleware;
