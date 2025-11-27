import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Signup() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [notification, setNotification] = useState({ message: '', type: '' });
  const navigate = useNavigate();

  // The Live Render API URL is correctly set here for production.
  const BACKEND_URL = "https://code-arena-api1.onrender.com";

  const showNotification = (message, type = 'error', delay = 0) => {
    setNotification({ message, type });
    if (delay > 0) {
        setTimeout(() => setNotification({ message: '', type: '' }), delay);
    } else {
        // Hide standard error message after 4 seconds
        setTimeout(() => setNotification({ message: '', type: '' }), 4000);
    }
  };


  const handleSignup = async (e) => {
    e.preventDefault();
    setNotification({ message: '', type: '' }); // Clear previous messages
    try {
      const res = await fetch(`${BACKEND_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });
      const data = await res.json();
      
      if (res.ok) {
        // Replaced alert() with a notification toast and redirect delay
        showNotification("Account created! Redirecting to login...", 'success');
        setTimeout(() => navigate("/"), 2000);
      } else {
        // Replaced alert() with a notification toast
        showNotification(data.message, 'error');
      }
    } catch (err) {
      console.error("Signup Network Error:", err);
      // Replaced alert() with a notification toast
      showNotification("Registration failed. Check server connection.", 'error');
    }
  };

  const notificationClasses = notification.type === 'error'
    ? 'bg-red-100 border-l-4 border-red-500 text-red-700 p-3 rounded-lg shadow-md mb-4'
    : 'bg-green-100 border-l-4 border-green-500 text-green-700 p-3 rounded-lg shadow-md mb-4';

  return (
    <div className="flex items-center justify-center min-h-screen bg-linear-to-r from-purple-500 to-pink-600">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-96">
        <h1 className="text-3xl font-bold text-center mb-6 text-purple-700">Join CodeArena</h1>
        
        {/* Notification Toast */}
        {notification.message && (
          <div className={notificationClasses} role="alert">
            {notification.message}
          </div>
        )}

        <form onSubmit={handleSignup} className="flex flex-col gap-4">
          <input 
            className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400" 
            placeholder="Username" 
            value={username} 
            onChange={e => setUsername(e.target.value)} 
            required 
            autoComplete="username" 
          />
          <input 
            className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400" 
            type="email" 
            placeholder="Email" 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
            required 
            autoComplete="email" 
          />
          <input 
            className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400" 
            type="password" 
            placeholder="Password" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            required 
            autoComplete="new-password"
          />
          <button className="bg-purple-600 text-white p-3 rounded-lg font-bold hover:bg-purple-700 transition" type="submit">
            Sign Up
          </button>
        </form>
        <p className="text-center mt-4 text-gray-500">
          Already have an account?{" "}
          <Link to="/" className="text-purple-600 font-bold hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}