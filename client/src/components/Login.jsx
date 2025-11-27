import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Login({ setUser }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [notification, setNotification] = useState({ message: '', type: '' });
  const navigate = useNavigate();

  // The Live Render API URL is correctly set here for production.
  const BACKEND_URL = "https://code-arena-api1.onrender.com";

  const showNotification = (message, type = 'error') => {
    setNotification({ message, type });
    // Hide the notification after 4 seconds
    setTimeout(() => setNotification({ message: '', type: '' }), 4000);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setNotification({ message: '', type: '' }); // Clear previous messages
    try {
      const res = await fetch(`${BACKEND_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      
      if (res.ok) {
        localStorage.setItem("codearena_token", data.token);
        localStorage.setItem("codearena_user", data.username);
        setUser(data.username);
        navigate("/contests");
      } else {
        // Replaced alert() with a notification toast
        showNotification(data.message, 'error');
      }
    } catch (err) {
      console.error("Login Network Error:", err);
      // Replaced alert() with a notification toast
      showNotification("Login failed. Check server connection.", 'error');
    }
  };

  const notificationClasses = notification.type === 'error'
    ? 'bg-red-100 border-l-4 border-red-500 text-red-700 p-3 rounded-lg shadow-md mb-4'
    : 'bg-green-100 border-l-4 border-green-500 text-green-700 p-3 rounded-lg shadow-md mb-4';

  return (
    <div className="flex items-center justify-center min-h-screen bg-linear-to-r from-blue-500 to-indigo-600">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-96">
        <h1 className="text-3xl font-bold text-center mb-6 text-indigo-700">CodeArena</h1>
        <h2 className="text-xl font-semibold mb-4 text-center text-gray-600">Sign In</h2>
        
        {/* Notification Toast */}
        {notification.message && (
          <div className={notificationClasses} role="alert">
            {notification.message}
          </div>
        )}

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <input 
            className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400" 
            type="email" 
            placeholder="Email" 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
            required 
            autoComplete="email" 
          />
          <input 
            className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400" 
            type="password" 
            placeholder="Password" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            required 
            autoComplete="current-password" 
          />
          <button className="bg-indigo-600 text-white p-3 rounded-lg font-bold hover:bg-indigo-700 transition" type="submit">
            Login
          </button>
        </form>
        <p className="text-center mt-4 text-gray-500">
          Don't have an account?{" "}
          <Link to="/signup" className="text-indigo-600 font-bold hover:underline">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}