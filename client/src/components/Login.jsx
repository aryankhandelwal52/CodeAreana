import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Login({ setUser }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const BACKEND_URL = import.meta.env.VITE_BACKEND || "http://localhost:5000";

  const handleLogin = async (e) => {
    e.preventDefault();
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
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
      alert("Login failed. Check server connection.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-linear-to-r from-blue-500 to-indigo-600">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-96">
        <h1 className="text-3xl font-bold text-center mb-6 text-indigo-700">CodeArena</h1>
        <h2 className="text-xl font-semibold mb-4 text-center text-gray-600">Sign In</h2>
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <input className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400" type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
          <input className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400" type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
          <button className="bg-indigo-600 text-white p-3 rounded-lg font-bold hover:bg-indigo-700 transition" type="submit">Login</button>
        </form>
        <p className="mt-4 text-center text-gray-600">
          New here? <Link to="/signup" className="text-indigo-500 font-semibold hover:underline">Create Account</Link>
        </p>
      </div>
    </div>
  );
}