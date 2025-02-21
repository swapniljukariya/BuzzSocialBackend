const express = require("express");
const Message = require("../models/Message");
const router = express.Router();

// Send a message
router.post("/send", async (req, res) => {
  try {
    const { sender, receiver, text } = req.body;
    if (!sender || !receiver || !text) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const newMessage = new Message({ sender, receiver, text });
    await newMessage.save();

    res.status(201).json(newMessage);
  } catch (error) {
    res.status(500).json({ message: "Error sending message" });
  }
});

// Fetch messages between two users
router.get("/:user1/:user2", async (req, res) => {
  try {
    const { user1, user2 } = req.params;

    const messages = await Message.find({
      $or: [
        { sender: user1, receiver: user2 },
        { sender: user2, receiver: user1 },
      ],
    }).sort({ timestamp: 1 });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: "Error fetching messages" });
  }
});

module.exports = router;