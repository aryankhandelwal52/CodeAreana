import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Signup() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  // Using localhost for local testing. Change to your live Render API URL after deployment.
  const BACKEND_URL = "http://localhost:5000";

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${BACKEND_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });
      const data = await res.json();
      
      if (res.ok) {
        alert("Account created! Please login.");
        navigate("/");
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert("Registration failed");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-linear-to-r from-purple-500 to-pink-600">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-96">
        <h1 className="text-3xl font-bold text-center mb-6 text-purple-700">Join CodeArena</h1>
        <form onSubmit={handleSignup} className="flex flex-col gap-4">
          <input 
            className="p-3 border rounded-lg" 
            placeholder="Username" 
            value={username} 
            onChange={e => setUsername(e.target.value)} 
            required 
            autoComplete="username" 
          />
          <input 
            className="p-3 border rounded-lg" 
            type="email" 
            placeholder="Email" 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
            required 
            autoComplete="email" 
          />
          <input 
            className="p-3 border rounded-lg" 
            type="password" 
            placeholder="Password" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            required 
            autoComplete="new-password" // FIX: Added autocomplete
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