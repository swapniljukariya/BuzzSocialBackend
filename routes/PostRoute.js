const express = require("express");
const router = express.Router();
const Post = require("../models/Post"); // Adjust the path as needed

// POST route to create a new post
router.post("/", async (req, res) => {
  try {
    // Destructure the expected fields from the request body
    const { userId, username, avatar, text, mediaUrl, mediaType, likes, comments } = req.body;

    // Create a new Post instance using the provided data
    const newPost = new Post({
      userId,
      username,
      avatar,
      text,
      mediaUrl, // expects an array of media objects [{ url, type }]
      mediaType,
      likes,    // expects an array of userIds
      comments, // expects an array of comment objects
    });

    // Save the post to the database
    const savedPost = await newPost.save();

    // Respond with the saved post document
    res.status(201).json(savedPost);
  } catch (error) {
    console.error("Error creating post:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
