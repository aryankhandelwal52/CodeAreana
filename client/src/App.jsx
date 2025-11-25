import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate, useNavigate, useSearchParams } from "react-router-dom";
import Login from "./components/Login";
import Signup from "./components/Signup";
import ContestsPage from "./components/ContestsPage";
import Lobby from "./components/Lobby";
import Contest from "./components/Contest";

function App() {
  const [user, setUser] = useState(localStorage.getItem("codearena_user") || null);
  const [roomId, setRoomId] = useState("");
  const [gameActive, setGameActive] = useState(false);
  
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Handle URL joins (e.g., ?room=123)
  useEffect(() => {
    const roomFromUrl = searchParams.get("room");
    if (roomFromUrl) {
      setRoomId(roomFromUrl);
      if (user) {
        navigate("/lobby");
      }
    }
  }, [searchParams, user, navigate]);

  const handleLogout = () => {
    localStorage.removeItem("codearena_user");
    localStorage.removeItem("codearena_token");
    setUser(null);
    navigate("/");
  };

  return (
    <div className="App font-sans text-gray-800">
      {user && (
        <div className="absolute top-4 right-4 z-50">
          <span className="mr-4 font-bold text-blue drop-shadow-md">Hi, {user}</span>
          <button onClick={handleLogout} className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-sm">
            Logout
          </button>
        </div>
      )}

      <Routes>
        {/* Auth Routes */}
        <Route path="/" element={!user ? <Login setUser={setUser} /> : <Navigate to="/contests" />} />
        <Route path="/signup" element={<Signup />} />

        {/* Protected Routes */}
        <Route 
          path="/contests" 
          element={user ? <ContestsPage setRoomId={setRoomId} onJoin={() => navigate("/lobby")} /> : <Navigate to="/" />} 
        />

        <Route 
          path="/lobby" 
          element={
            user && roomId ? (
              !gameActive ? (
                <Lobby 
                  roomId={roomId} 
                  username={user} 
                  onStart={() => setGameActive(true)} 
                />
              ) : (
                <Contest roomId={roomId} username={user} />
              )
            ) : (
              <Navigate to="/contests" />
            )
          } 
        />
      </Routes>
    </div>
  );
}

export default App;