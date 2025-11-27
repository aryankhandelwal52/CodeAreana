import React from "react";

export default function ContestsPage({ setRoomId, onJoin }) {
  
  const createPrivateRoom = () => {
    const randomId = "arena-" + Math.random().toString(36).substr(2, 6);
    setRoomId(randomId);
    onJoin(); 
  };

  const joinExisting = (id) => {
    setRoomId(id);
    onJoin();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6">
      <h1 className="text-4xl font-extrabold text-indigo-800 mb-10">🏆 CodeArena Contests</h1>

      <div className="grid md:grid-cols-2 gap-8 max-w-4xl w-full">

        <div className="bg-white p-8 rounded-xl shadow-lg border border-indigo-100 flex flex-col items-center text-center hover:shadow-2xl transition">
          <div className="text-6xl mb-4">🏠</div>
          <h2 className="text-2xl font-bold mb-2">Private Room</h2>
          <p className="text-gray-500 mb-6">Create a room and invite up to 2 friends.</p>
          <button 
            onClick={createPrivateRoom}
            className="bg-indigo-600 text-white px-8 py-3 rounded-full font-bold text-lg hover:bg-indigo-700 w-full"
          >
            Create Room
          </button>
        </div>

        
        <div className="bg-white p-8 rounded-xl shadow-lg border border-green-100 flex flex-col items-center text-center hover:shadow-2xl transition">
          <div className="text-6xl mb-4">🌍</div>
          <h2 className="text-2xl font-bold mb-2">Public Arena</h2>
          <p className="text-gray-500 mb-6">Join the global daily contest room.</p>
          <button 
            onClick={() => joinExisting("global-arena-1")}
            className="bg-green-600 text-white px-8 py-3 rounded-full font-bold text-lg hover:bg-green-700 w-full"
          >
            Join Global
          </button>
        </div>
      </div>
    </div>
  );
}