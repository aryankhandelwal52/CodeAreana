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

// -----------------------
//  CORS CONFIGURATION
// -----------------------
// The liveUrl should be set as an Environment Variable (CLIENT_URL) on Render.
// If running locally, this array ensures http://localhost:5173 is always allowed.
const liveUrl = process.env.CLIENT_URL; // e.g., https://code-arena-client.onrender.com
const ALLOWED_ORIGINS = [
    "http://localhost:5173", // Vite/React local dev server
    ...(liveUrl ? [liveUrl] : []), 
];

// CORS for REST API (Auth routes)
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests from allowed origins or no origin (like Postman or server-side calls)
      if (!origin || ALLOWED_ORIGINS.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

// -----------------------
//  DATABASE CONNECTION
// -----------------------
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error("DB Connection Error:", err));

// -----------------------
//  USER MODEL
// -----------------------
const userSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
});
const User = mongoose.model("User", userSchema);

// -----------------------
//  REGISTER ROUTE
// -----------------------
app.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password)
      return res.status(400).json({ message: "All fields required" });

    const existing = await User.findOne({ $or: [{ email }, { username }] });
    if (existing)
      return res.status(400).json({ message: "Username or Email already taken" });

    const hashedPassword = await bcrypt.hash(password, 10);
    await User.create({ username, email, password: hashedPassword });

    res.status(201).json({ message: "User created successfully" });
  } catch (e) {
    console.error("Registration Error:", e);
    res.status(500).json({ message: "Server error during registration" });
  }
});

// -----------------------
//  LOGIN ROUTE
// -----------------------
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({ token, username: user.username });
  } catch (e) {
    console.error("Login Error:", e);
    res.status(500).json({ message: "Server error during login" });
  }
});

// -----------------------
//  SOCKET.IO SERVER SETUP
// -----------------------
const server = createServer(app);

const io = new Server(server, {
  cors: {
    origin: ALLOWED_ORIGINS, // Uses the same allowed origins as the REST API
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// -----------------------
//  SOCKET.IO LOGIC
// -----------------------
const rooms = {};
const MAX_PLAYERS = 3;
const CONTEST_DURATION = 45 * 60 * 1000;

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
        countdownInterval: null,
        contestTimeout: null,
      };
    }

    const room = rooms[roomId];

    // Check if user is reconnecting or new
    let existingUser = room.users.find((u) => u.username === username);

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
      io.to(roomId).emit("notification", `${username} joined the arena!`);
    } else {
      // Reconnecting user: update their socket id
      existingUser.id = socket.id;
    }

    io.to(roomId).emit("room-users", room.users);

    // If contest is active, inform the reconnecting user of time left
    if (room.contestStarted) {
      const remainingTime = CONTEST_DURATION - (Date.now() - room.contestStartTime);
      socket.emit("contest-started", {
        remainingTime,
        users: room.users,
      });
    }
  });


  // START CONTEST
  socket.on("start-contest", (roomId) => {
    const room = rooms[roomId];
    if (!room) return;

    if (room.users.length < 2) {
      io.to(roomId).emit("error-message", "Need at least 2 players to start!");
      return;
    }

    if (room.contestStarted) return;

    // Reset scores for a fresh start
    room.users = room.users.map((u) => ({
      ...u,
      score: 0,
      problemIndex: 0,
    }));

    io.to(roomId).emit("instruction-phase", true);

    let countdown = 10;
    room.countdownInterval = setInterval(() => {
      io.to(roomId).emit("contest-countdown", countdown);
      countdown--;

      if (countdown < 0) {
        clearInterval(room.countdownInterval);

        room.contestStarted = true;
        room.contestStartTime = Date.now();

        io.to(roomId).emit("contest-started", {
          remainingTime: CONTEST_DURATION,
          users: room.users,
        });

        // contest end
        room.contestTimeout = setTimeout(() => {
          io.to(roomId).emit("contest-ended", room.users);
          room.contestStarted = false;
        }, CONTEST_DURATION);
      }
    }, 1000);
  });

  // WHEN A PLAYER SOLVES A PROBLEM
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

    // Broadcast only updated info
    io.to(roomId).emit("room-users", room.users);

    io.to(roomId).emit(
      "notification",
      `${username} solved their Problem and moved ahead! 🚀`
    );
  });

  // DISCONNECT
  socket.on("disconnect", () => {
    Object.keys(rooms).forEach((roomId) => {
      const room = rooms[roomId];
      const userIndex = room.users.findIndex(u => u.id === socket.id);
      
      if (userIndex !== -1) {
          // Do not remove the user, just mark their socket ID as null if needed, 
          // or just rely on the re-join logic to update the ID.
          // For simplicity in a small contest, we can just broadcast the remaining users.
          
          // Re-broadcast all users (important for reconnect logic)
          // Note: Full-blown production apps would have a grace period before marking offline
          // We will rely on the re-join logic for simple games.
          
          // io.to(roomId).emit("room-users", room.users);
      }
    });
  });
});


// -----------------------
//  START SERVER
// -----------------------
const PORT = process.env.PORT || 5000;
server.listen(PORT, () =>
  console.log(`Server running on ${PORT}`)
);