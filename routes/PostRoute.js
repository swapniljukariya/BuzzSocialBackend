const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Post = require("../models/Post");
const upload = require("../config/multerConfig");

router.post("/", upload.array("mediaUrl"), async (req, res) => {
  try {
    // Validate User ID
    const { userId, username, avatar, text } = req.body;
    if (!mongoose.isValidObjectId(userId)) {
      return res.status(400).json({
        error: "Invalid user ID format",
        solution: "Please provide a valid 24-character hexadecimal user ID"
      });
    }

    // Process Files (Upload to Cloudinary)
    const mediaUrls = req.files.map(file => ({
      url: file.path, // Cloudinary URL
      type: file.mimetype.startsWith("video") ? "video" : "image", // Set type based on MIME type
    }));

    // Set mediaType based on the first file (if any)
    const mediaType = mediaUrls.length > 0 ? mediaUrls[0].type : null;

    // Create post data
    const postData = {
      userId,
      username,
      avatar,
      text,
      mediaUrl: mediaUrls,
      mediaType, // Ensure mediaType is set
    };

    // Validate and save post
    const newPost = new Post(postData);
    const savedPost = await newPost.save();

    res.status(201).json(savedPost);

  } catch (error) {
    console.error("Post creation error:", error);

    const response = {
      error: error.message,
      details: error.errors 
        ? Object.values(error.errors).map(e => e.message)
        : []
    };

    if (error.message.includes("File too large")) {
      res.status(413).json(response);
    } else if (error.message.includes("Invalid file type")) {
      res.status(415).json(response);
    } else {
      res.status(400).json(response);
    }
  }
});

module.exports = router;