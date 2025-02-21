const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const Story = require("../models/Stories");

// Add a new story
router.post("/add", protect, async (req, res) => {
  try {
    const { stories } = req.body;
    const userId = req.user.id;

    if (!stories || stories.length === 0) {
      return res.status(400).json({ message: "No story data provided" });
    }

    // Find the existing story document for the user
    let userStory = await Story.findOne({ userId });

    if (!userStory) {
      // If no story document exists, create a new one
      userStory = new Story({
        userId,
        stories: [],
      });
    }

    // Append the new stories to the existing stories array
    userStory.stories.push(...stories);

    // Save the updated story document
    await userStory.save();

    res.status(201).json({ message: "Story added successfully", story: userStory });
  } catch (error) {
    console.error("Error adding story:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;