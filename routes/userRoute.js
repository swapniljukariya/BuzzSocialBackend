const express = require("express");
const User = require("../models/User");

const router = express.Router();

// Search for users by username or name
router.get("/search", async (req, res) => {
  const { query } = req.query; // Get the search term from the query parameters

  if (!query) {
    return res.status(400).json({ error: "Search term is required" });
  }

  try {
    // Query the database for users matching the search term
    const users = await User.find({
      $or: [
        { username: { $regex: query, $options: "i" } }, // Case-insensitive search
        { name: { $regex: query, $options: "i" } },
      ],
    });

    if (users.length > 0) {
      res.json({ exists: true, users }); // Return matching users
    } else {
      res.json({ exists: false }); // No users found
    }
  } catch (error) {
    console.error("Error searching for users:", error);
    res.status(500).json({ error: "Failed to search for users" });
  }
});

module.exports = router;