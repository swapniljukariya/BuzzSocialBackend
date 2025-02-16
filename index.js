const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./database/db");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const Message = require("./models/Message");
const jwt = require("jsonwebtoken");

// Load .env file
dotenv.config();

const app = express();
const server = http.createServer(app);

// Get allowed origin from .env (single URL)
const allowedOrigin = process.env.ALLOWED_ORIGINS || "http://localhost:3000";
console.log("Allowed Origin:", allowedOrigin); // Debugging

// CORS middleware
app.use(
  cors({
    origin: allowedOrigin,
    methods: "GET,POST,PUT,DELETE",
    credentials: true,
  })
);

// Socket.IO CORS configuration
const io = new Server(server, {
  cors: {
    origin: allowedOrigin,
    methods: ["GET", "POST"],
  },
});

connectDB();

app.use(express.json());

// Import Routes
const authRoutes = require("./routes/authRoute");
const userRoutes = require("./routes/userRoute");
const messageRoutes = require("./routes/meassageRoute");
const postRoutes = require("./routes/PostRoute");
const storyRoutes = require("./routes/StoriesRouter");

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/stories", storyRoutes);

// Socket.IO authentication middleware
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error("Authentication error"));
  }
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return next(new Error("Authentication error"));
    socket.userId = decoded.userId;
    next();
  });
});

// Socket.IO connection handler
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  // Log all socket events for debugging
  socket.onAny((event, ...args) => {
    console.log(`Socket event: ${event}`, args);
  });

  // Join room
  socket.on("joinRoom", ({ sender, receiver }) => {
    if (!sender || !receiver) {
      console.error("Invalid sender or receiver");
      return;
    }
    const room = [sender, receiver].sort().join("-");
    socket.join(room);
    console.log(`User ${socket.id} joined room ${room}`);
  });

  // Handle private messages
  socket.on("privateMessage", async ({ sender, receiver, text }) => {
    if (!sender || !receiver || !text) {
      console.error("Missing fields in privateMessage");
      return;
    }
    try {
      const newMessage = new Message({ sender, receiver, text });
      await newMessage.save();

      const room = [sender, receiver].sort().join("-");
      io.to(room).emit("receiveMessage", newMessage);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});