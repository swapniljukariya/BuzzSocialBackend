const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const Story = require("../models/Stories");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Configure storage for uploaded files
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, "../uploads/stories");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

const upload = multer({ storage });

// Modified Add Story endpoint
router.post(
  "/add",
  protect,
  upload.single("media"),
  async (req, res) => {
    try {
      const userId = req.user.id;
      const { type } = req.body;

      if (!req.file) {
        return res.status(400).json({ message: "No media file uploaded" });
      }

      const mediaUrl = `${process.env.API_BASE_URL}/uploads/stories/${req.file.filename}`;

      const newStory = {
        type,
        mediaUrl,
        createdAt: new Date(),
      };

      let userStory = await Story.findOne({ userId });

      if (!userStory) {
        userStory = new Story({
          userId,
          stories: [newStory],
        });
      } else {
        userStory.stories.push(newStory);
      }

      await userStory.save();

      res.status(201).json({
        message: "Story added successfully",
        story: userStory,
        mediaUrl: mediaUrl,
      });
    } catch (error) {
      console.error("Error adding story:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

module.exports = router;