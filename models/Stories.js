const mongoose = require("mongoose");

const storySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  stories: [
    {
      type: {
        type: String,
        enum: ["image", "video"],
        required: true,
      },
      mediaUrl: {
        type: String,
        required: true,
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 24 * 60 * 60 * 1000), // 24-hour expiration
  },
});

module.exports = mongoose.model("Story", storySchema);