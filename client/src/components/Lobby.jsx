import React, { useState, useEffect } from "react";
import { socket } from "../socket";

export default function Lobby({ roomId, setRoomId, setUsername, onStart }) {
  const [localName, setLocalName] = useState("");
  const [players, setPlayers] = useState([]);
  const [joined, setJoined] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const [error, setError] = useState(""); // Existing error state

  useEffect(() => {
    socket.on("contest-countdown", (time) => setCountdown(time));
    socket.on("room-users", (users) => {
      setPlayers(users.map((u) => u.username));
      // Clear error on successful user list update
      if (users.length > 0) setError("");
    });
    
    // Assuming onStart handles the navigation/state change to Contest
    socket.on("contest-started", () => onStart()); 

    socket.on("error-message", (msg) => {
      setError(msg);
      // Clear error after 4 seconds
      setTimeout(() => setError(""), 4000); 
    });

    return () => {
      socket.off("contest-countdown");
      socket.off("room-users");
      socket.off("contest-started");
      socket.off("error-message");
    };
  }, [onStart]);

  const joinRoom = () => {
    // FIX: Replaced alert() with setError()
    if (!localName.trim()) {
        setError("Enter your name to join the room.");
        setTimeout(() => setError(""), 4000); // Clear error after 4 seconds
        return;
    }
    setError(""); // Clear previous errors
    socket.connect();
    socket.emit("join-room", { roomId, username: localName });
    setUsername(localName);
    setJoined(true);
  };

  const startContest = () => socket.emit("start-contest", roomId);

  return (
    <div 
      className="flex items-center justify-center min-h-screen p-6" 
      style={{ backgroundImage: "linear-gradient(135deg, #1f2937 0%, #0f172a 100%)" }}
    >
      <div className="bg-gray-800 p-8 rounded-xl shadow-2xl max-w-lg w-full text-white">
        <h1 className="text-4xl font-extrabold text-center mb-6 text-indigo-400">
          Contest Lobby: {roomId}
        </h1>

        {error && (
            <p className="bg-red-900 text-red-300 p-3 rounded-lg text-center mb-4 border border-red-700">
                {error}
            </p>
        )}

        {!joined ? (
          <div className="flex flex-col gap-4">
            <input
              className="p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter your name"
              value={localName}
              onChange={(e) => setLocalName(e.target.value)}
            />
            <button
              onClick={joinRoom}
              className="bg-indigo-600 text-white p-3 rounded-lg font-bold hover:bg-indigo-700 transition duration-300"
            >
              Join Room
            </button>
          </div>
        ) : (
          <div>
            <p className="text-center text-lg mb-4 text-indigo-300">
              Logged in as: <span className="font-semibold text-white">{localName}</span>
            </p>

            <h2 className="text-2xl font-bold mb-3 text-indigo-400 border-b border-indigo-700 pb-2">
              Players ({players.length})
            </h2>
            <ul className="space-y-2 mb-6">
              {players.map((p, i) => (
                <li
                  key={i}
                  className="p-2 bg-gray-700 rounded-lg flex items-center"
                >
                  <span className="text-xl mr-3 font-mono text-indigo-300 w-6 text-center">{i + 1}.</span>
                  <span className="font-medium">{p}</span>
                  {p === localName && (
                    <span className="ml-auto text-xs font-semibold text-green-400 bg-gray-600 px-2 py-0.5 rounded-full">YOU</span>
                  )}
                </li>
              ))}
            </ul>

            {players.length >= 2 ? (
              <button
                onClick={startContest}
                className="w-full bg-green-600 text-white p-3 rounded-lg font-bold text-lg hover:bg-green-700 transition duration-300 shadow-lg"
              >
                🚀 Start Contest
              </button>
            ) : (
              <p className="text-yellow-400 text-center text-lg mt-4">
                Waiting for at least 2 players to join...
              </p>
            )}
            
            {countdown !== null && countdown > 0 && (
                <p className="text-xl font-bold text-yellow-300 text-center mt-4">
                    Contest starting in {countdown}s...
                </p>
            )}

          </div>
        )}
      </div>
    </div>
  );
}