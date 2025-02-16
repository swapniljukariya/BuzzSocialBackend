// authMiddleware.js
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Protect routes
exports.protect = async (req, res, next) => {
  let token;

  // Get token from header
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  // Check if token exists
  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find user and attach to request object
    req.user = await User.findById(decoded.id).select("-password");
    next();
  } catch (error) {
    console.error("Error in protect middleware:", error);
    res.status(401).json({ message: "Not authorized, invalid token" });
  }
};
