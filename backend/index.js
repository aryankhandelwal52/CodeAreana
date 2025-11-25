import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

dotenv.config();

const app = express();
app.use(express.json());
app.use(
  cors({
    origin: process.env.CLIENT_URL || "*",
    methods: ["GET", "POST"],
    credentials: true,
  })
);

// --- MONGODB CONNECTION ---
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ DB Connection Error:", err));

// --- USER MODEL ---
const userSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
});
const User = mongoose.model("User", userSchema);

// --- AUTH ROUTES ---
app.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) return res.status(400).json({ message: "All fields required" });

    const existing = await User.findOne({ $or: [{ email }, { username }] });
    if (existing) return res.status(400).json({ message: "Username or Email already taken" });

    const hashedPassword = await bcrypt.hash(password, 10);
    await User.create({ username, email, password: hashedPassword });
    
    res.status(201).json({ message: "User created successfully" });
  } catch (e) {
    res.status(500).json({ message: "Server error during registration" });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id, username: user.username }, process.env.JWT_SECRET, { expiresIn: "1d" });
    res.json({ token, username: user.username });
  } catch (e) {
    res.status(500).json({ message: "Server error during login" });
  }
});

// --- SOCKET SERVER ---
const server = createServer(app);
const io = new Server(server, {
  cors: { origin: process.env.CLIENT_URL || "*", methods: ["GET", "POST"] },
});

const rooms = {};
const MAX_PLAYERS = 3;
const CONTEST_DURATION = 45 * 60 * 1000; // 45 Minutes

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // JOIN ROOM
  socket.on("join-room", ({ roomId, username }) => {
    socket.join(roomId);

    if (!rooms[roomId]) {
      rooms[roomId] = {
        users: [],
        contestStarted: false,
        contestStartTime: null,
      };
    }

    const room = rooms[roomId];

    // Prevent duplicate username in same room
    const existingUser = room.users.find((u) => u.username === username);
    if (!existingUser) {
      if (room.users.length >= MAX_PLAYERS) {
        socket.emit("error-message", "Room is full (max 3 players)");
        return;
      }
      room.users.push({
        id: socket.id,
        username,
        score: 0,
        problemIndex: 0,
      });
    } else {
      // Reconnect logic: update socket ID
      existingUser.id = socket.id;
    }

    io.to(roomId).emit("room-users", room.users);

    // If contest is already running, send current state
    if (room.contestStarted) {
      const remainingTime = CONTEST_DURATION - (Date.now() - room.contestStartTime);
      socket.emit("contest-started", {
        remainingTime,
        users: room.users,
      });
    }
  });

  // START CONTEST (Wait 10s -> Start 45m Timer)
  socket.on("start-contest", (roomId) => {
    const room = rooms[roomId];
    if (!room) return;

    if (room.users.length < 2) {
      io.to(roomId).emit("error-message", "Need at least 2 players to start!");
      return;
    }

    if (room.contestStarted) return;

    // Reset scores
    room.users = room.users.map((u) => ({ ...u, score: 0, problemIndex: 0 }));

    // 1. Notify clients to show Instructions
    io.to(roomId).emit("instruction-phase", true);

    // 2. Countdown 10 seconds on server
    let countdown = 10;
    const interval = setInterval(() => {
      io.to(roomId).emit("contest-countdown", countdown);
      countdown--;

      if (countdown < 0) {
        clearInterval(interval);
        
        // 3. Start Actual Contest
        room.contestStarted = true;
        room.contestStartTime = Date.now();
        
        io.to(roomId).emit("contest-started", {
          remainingTime: CONTEST_DURATION,
          users: room.users,
        });

        // 4. Set Timeout for End Game
        setTimeout(() => {
          io.to(roomId).emit("contest-ended", room.users);
          room.contestStarted = false;
        }, CONTEST_DURATION);
      }
    }, 1000);
  });

  // PROBLEM SOLVED
  socket.on("problem-solved", (roomId, username, points) => {
    const room = rooms[roomId];
    if (!room || !room.contestStarted) return;

    room.users = room.users.map((u) => {
      if (u.username === username) {
        return {
          ...u,
          score: u.score + points,
          problemIndex: u.problemIndex + 1,
        };
      }
      return u;
    });

    io.to(roomId).emit("room-users", room.users);
    io.to(roomId).emit("notification", `${username} solved a problem! 🚀`);
  });

  socket.on("disconnect", () => {
    // We keep the user in the room object in case they reconnect
    // But you could remove them if you prefer
  });
});
const PORT = process.env.PORT || 5000;
server.listen(PORT, () =>
  console.log(`Server running on ${process.env.PORT}`)
);