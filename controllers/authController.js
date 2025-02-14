// controllers/userController.js
const User = require("../models/User");
const jwt = require("jsonwebtoken");

// Register User
exports.registerUser = async (req, res) => {
  try {
    const { name, username, email, password } = req.body;

    // Check if user already exists
    let userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Create new user
    const user = await User.create({
      name,
      username,
      email,
      password,
      avatar: req.body.avatar || "https://via.placeholder.com/150",
      bio: req.body.bio || "New user!",
    });

    // Generate JWT token
    const token = user.generateToken();

    // Return response
    res.status(201).json({
      message: "User registered successfully",
      user: {
        _id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        bio: user.bio,
      },
      token,
    });
  } catch (error) {
    console.error("Error in registerUser:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// Login User
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate JWT token
    const token = user.generateToken();

    // Return response
    res.status(200).json({
      message: "Login successful",
      user: {
        _id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        bio: user.bio,
      },
      token,
    });
  } catch (error) {
    console.error("Error in loginUser:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// Update User Profile
exports.updateUserProfile = async (req, res) => {
  try {
    const { id } = req.params; // User ID from the URL
    const { name, username, bio, avatar } = req.body; // Updated fields

    // Find the user by ID
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update user fields
    if (name) user.name = name;
    if (username) user.username = username;
    if (bio) user.bio = bio;
    if (avatar) user.avatar = avatar;

    // Save the updated user
    const updatedUser = await user.save();

    // Return the updated user data
    res.status(200).json({
      message: "Profile updated successfully",
      user: {
        _id: updatedUser._id,
        name: updatedUser.name,
        username: updatedUser.username,
        email: updatedUser.email,
        avatar: updatedUser.avatar,
        bio: updatedUser.bio,
      },
    });
  } catch (error) {
    console.error("Error in updateUserProfile:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};