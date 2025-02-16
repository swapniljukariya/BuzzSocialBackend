// routes/StoriesRouter.js
const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware"); // Use 'protect'
const Story = require("../models/Stories"); // Ensure your Story model is correctly defined and exported

// Add a new story
router.post("/add", protect, async (req, res) => {
  try {
    const { stories } = req.body;
    const userId = req.user.id;

    if (!stories || stories.length === 0) {
      return res.status(400).json({ message: "No story data provided" });
    }

    const newStory = new Story({
      userId,
      stories,
    });

    await newStory.save();
    res.status(201).json({ message: "Story added successfully", story: newStory });
  } catch (error) {
    console.error("Error adding story:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
