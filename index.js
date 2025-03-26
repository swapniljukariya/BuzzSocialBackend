const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./database/db");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const Message = require("./models/Message");
const jwt = require("jsonwebtoken");
const path = require("path");

// Load environment variables
dotenv.config();

// Initialize Express
const app = express();
const server = http.createServer(app);

// Configure CORS
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(",") 
  : ["http://localhost:3004"];

console.log("Allowed Origins:", allowedOrigins);

// Middleware
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"]
}));

app.use(express.json());

// Serve favicon
app.get("/favicon.ico", (req, res) => {
  res.sendFile(path.join(__dirname, "favicon.ico"));
});

// Configure Socket.IO
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Database Connection
connectDB();

// Root Route
app.get("/", (req, res) => {
  res.send("Welcome to the Buzz Social Backend!");
});

// Routes
app.use("/api/auth", require("./routes/authRoute"));
app.use("/api/users", require("./routes/userRoute"));
app.use("/api/messages", require("./routes/meassageRoute"));
app.use("/api/posts", require("./routes/PostRoute"));
app.use("/api/stories", require("./routes/StoriesRouter"));

// Socket.IO Authentication Middleware
io.use((socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    if (!token) {
      throw new Error("Authentication error");
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.id; // Ensure your JWT uses 'id' claim
    next();
  } catch (error) {
    console.error("Socket authentication error:", error.message);
    next(new Error("Authentication failed"));
  }
});

// Socket.IO Event Handlers
io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id} (User ID: ${socket.userId})`);

  socket.on("joinRoom", ({ sender, receiver }) => {
    if (!sender || !receiver) {
      return console.error("Invalid room parameters");
    }
    
    const room = [sender, receiver].sort().join("-");
    socket.join(room);
    console.log(`User ${socket.userId} joined room ${room}`);
  });

  socket.on("privateMessage", async ({ sender, receiver, text }) => {
    try {
      if (!sender || !receiver || !text) {
        throw new Error("Invalid message parameters");
      }

      const newMessage = await Message.create({
        sender,
        receiver,
        text
      });

      const room = [sender, receiver].sort().join("-");
      io.to(room).emit("receiveMessage", newMessage);
    } catch (error) {
      console.error("Message error:", error.message);
    }
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id} (User ID: ${socket.userId})`);
  });
});

// Server Configuration
const PORT = process.env.PORT || 8001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
});