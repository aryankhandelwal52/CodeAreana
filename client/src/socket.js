// src/socket.js

import { io } from "socket.io-client";

// CRITICAL: This must be the live URL of your Render Web Service.
// This is correctly set to your live deployment domain.
const RENDER_BACKEND_URL = "https://code-arena-api1.onrender.com"; 

export const socket = io(RENDER_BACKEND_URL, {
  autoConnect: false,
  // Added transports for robustness, as recommended for Socket.IO deployment
  transports: ['websocket', 'polling'] 
});