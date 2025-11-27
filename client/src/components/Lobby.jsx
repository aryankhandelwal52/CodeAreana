import React, { useState, useEffect } from "react";
import { socket } from "../socket";

export default function Lobby({ roomId, username, onStart }) {
  const [players, setPlayers] = useState([]);
  const [countdown, setCountdown] = useState(null);
  const [instructionMode, setInstructionMode] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    socket.connect();
    socket.emit("join-room", { roomId, username });

    socket.on("room-users", (users) => setPlayers(users));
    
    // Server triggers this when Admin clicks Start
    socket.on("instruction-phase", () => setInstructionMode(true));
    
    // Updates the 10s countdown
    socket.on("contest-countdown", (time) => setCountdown(time));
    
    // Actual game start
    socket.on("contest-started", () => onStart());

    socket.on("error-message", (msg) => {
      setError(msg);
      setTimeout(() => setError(""), 3000);
    });

    return () => {
      socket.off("room-users");
      socket.off("instruction-phase");
      socket.off("contest-countdown");
      socket.off("contest-started");
      socket.off("error-message");
    };
  }, [roomId, username, onStart]);

  const handleStart = () => {
    socket.emit("start-contest", roomId);
  };

  const copyLink = () => {
    const url = `${window.location.origin}/?room=${roomId}`;
    navigator.clipboard.writeText(url);
    alert("Room link copied!");
  };

  // --- 10 Second Instruction Screen ---
  if (instructionMode) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-indigo-900 text-white p-6 text-center">
        <h1 className="text-5xl font-extrabold mb-4 text-yellow-400 animate-pulse">
          Starting in {countdown}...
        </h1>
        <div className="bg-white/10 p-8 rounded-xl backdrop-blur-lg max-w-2xl w-full border border-white/20">
          <h2 className="text-3xl font-bold mb-6 border-b border-white/20 pb-4">📜 Instructions</h2>
          <ul className="text-left space-y-4 text-xl">
            <li>⏱️ You have <strong>45 minutes</strong> to solve problems.</li>
            <li>🚀 <strong>Speed matters!</strong> First to solve gets ahead.</li>
            <li>🥇 Leaderboard updates <strong>live</strong>.</li>
            <li>❌ Do <strong>NOT</strong> refresh the page.</li>
          </ul>
        </div>
      </div>
    );
  }
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-linear-to-br from-indigo-600 to-purple-700 text-white font-sans">
      <div className="bg-white/10 backdrop-blur-md p-10 rounded-3xl shadow-2xl w-full max-w-lg text-center border border-white/20">
        <h2 className="text-4xl font-extrabold mb-2">Lobby</h2>
        <div className="inline-block bg-black/30 px-4 py-1 rounded-full text-sm font-mono mb-8">
          ID: {roomId}
        </div>

        {error && <div className="bg-red-500 text-white p-2 rounded mb-4 font-bold">{error}</div>}

        <div className="mb-8 text-left">
          <div className="flex justify-between items-end mb-2">
            <h3 className="text-xl font-bold text-indigo-200">Players</h3>
            <span className="text-sm bg-indigo-500 px-2 rounded">{players.length}/3</span>
          </div>
          <ul className="space-y-2">
            {players.map((p, i) => (
              <li key={i} className="flex items-center bg-white/10 p-3 rounded-lg border border-white/5">
                <span className="w-8 h-8 flex items-center justify-center bg-indigo-500 rounded-full mr-3 font-bold text-sm">
                  {i + 1}
                </span>
                <span className="font-medium text-lg">{p.username}</span>
                {p.username === username && (
                  <span className="ml-auto text-xs bg-yellow-400 text-black px-2 py-1 rounded font-bold">YOU</span>
                )}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex gap-4 flex-col sm:flex-row">
          <button 
            onClick={copyLink} 
            className="flex-1 bg-blue-500 hover:bg-blue-600 py-3 rounded-xl font-bold transition shadow-lg"
          >
            🔗 Invite Friend
          </button>
          
          <button 
            onClick={handleStart} 
            disabled={players.length < 2}
            className={`flex-1 py-3 rounded-xl font-bold transition shadow-lg ${
              players.length < 2 
              ? "bg-gray-500 cursor-not-allowed opacity-50" 
              : "bg-green-500 hover:bg-green-600 transform hover:scale-105"
            }`}
          >
            🚀 Start Contest
          </button>
        </div>
        {players.length < 2 && (
          <p className="mt-4 text-sm text-gray-300">Waiting for at least 2 players...</p>
        )}
      </div>
    </div>
  );
}