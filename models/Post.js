const mongoose = require('mongoose');
const { Schema } = mongoose;

// Sub-schema for media items
const mediaSchema = new Schema({
  url: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
    enum: ['image', 'video'], // Adjust as needed
  },
});

// Sub-schema for comments
const commentSchema = new Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Main post schema
const postSchema = new Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  avatar: {
    type: String,
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  mediaUrl: [mediaSchema], // Array of media items
  mediaType: {
    type: String,
    required: true,
  },
  likes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
  comments: [commentSchema],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Post', postSchema);
