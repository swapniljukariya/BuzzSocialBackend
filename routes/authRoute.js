// routes/authRoute.js
const express = require("express");
const router = express.Router();
const userController = require("../controllers/authController")

// Public routes
router.post("/register", userController.registerUser);
router.post("/login", userController.loginUser);

module.exports = router;