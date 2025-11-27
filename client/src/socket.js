// src/socket.js (Updated for Local Testing)

import { io } from "socket.io-client";

// IMPORTANT: This must be changed to your Render Backend URL (e.g., https://code-arena-api.onrender.com)
// ONLY AFTER you have deployed the backend.
const RENDER_BACKEND_URL = "http://localhost:5000"; 

export const socket = io(RENDER_BACKEND_URL, {
  autoConnect: false,
  // Added transports for robustness, though not strictly needed for localhost
  transports: ['websocket', 'polling'] 
});