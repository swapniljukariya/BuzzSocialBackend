// routes/authRoute.js
const express = require("express");
const router = express.Router();
const userController = require("../controllers/authController")

// Public routes
router.post("/register", userController.registerUser);
router.post("/login", userController.loginUser);
// Add this near your other routes
router.post('/reset-password', async (req, res) => {
    try {
      const { email, newPassword } = req.body;
      
      if (!email || !newPassword) {
        return res.status(400).json({ error: "Email and new password required" });
      }
  
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
  
      user.password = newPassword.trim();
      await user.save();
  
      res.json({ success: true, message: "Password updated successfully" });
    } catch (error) {
      console.error("Password reset error:", error);
      res.status(500).json({ error: "Password reset failed" });
    }
  });
module.exports = router;