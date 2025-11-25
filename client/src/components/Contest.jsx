import React, { useState, useEffect, useRef } from "react";
import { socket } from "../socket.js";
import Leaderboard from "./Leaderboard.jsx";
import CodeEditor from "./CodeEditor.jsx";
import { problems } from "../probdata/problems.js";
import ReactMarkdown from "react-markdown";

export default function Contest({ roomId, username }) {
  const [notification, setNotification] = useState("");
  const [contestStarted, setContestStarted] = useState(false);
  const [contestTimeLeft, setContestTimeLeft] = useState(0);
  const [players, setPlayers] = useState([]);
  const [userProblem, setUserProblem] = useState(0);

  const [code, setCode] = useState("// Start coding here...\n");
  const [language, setLanguage] = useState("javascript");
  const notificationSound = useRef(null);
  
  useEffect(() => {
    socket.emit("join-room", { roomId, username });

    socket.on("notification", (msg) => {
      setNotification(msg);
      if (notificationSound.current) notificationSound.current.play().catch(e => null);
      setTimeout(() => setNotification(""), 4000);
    });

    socket.on("room-users", (users) => {
      setPlayers(users);

      const me = users.find((u) => u.username === username);
      if (me) setUserProblem(me.problemIndex);
    });

    socket.on("contest-started", ({ remainingTime, users }) => {
      setContestStarted(true);
      setPlayers(users);

      const me = users.find((u) => u.username === username);
      if (me) setUserProblem(me.problemIndex);

      setContestTimeLeft(Math.floor(remainingTime / 1000));

      const timer = setInterval(() => {
        setContestTimeLeft((t) => {
          if (t <= 1) {
            clearInterval(timer);
            setNotification("🎉 Contest ended!");
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    });

    socket.on("contest-ended", (finalPlayers) => {
      setPlayers(finalPlayers);
      setContestStarted(false);
      setNotification("🎉 Contest ended!");
    });

    return () => {
      socket.off("notification");
      socket.off("room-users");
      socket.off("contest-started");
      socket.off("contest-ended");
    };
  }, [roomId, username]);

  const handleSubmit = () => {
    if (userProblem < problems.length) {
        socket.emit("problem-solved", roomId, username, problems[userProblem].points);
    }
  };

  if (userProblem >= problems.length)
    return (
      <div className="min-h-screen bg-gray-100 p-10 flex flex-col items-center">
        <h1 className="text-4xl font-bold mb-8 text-indigo-800 text-center">🎉 All Problems Completed!</h1>
        <Leaderboard players={players} currentUser={username} />
      </div>
    );

  const problem = problems[userProblem];

  return (
    <div className="max-w-7xl mx-auto my-10 p-6 border rounded-xl shadow-2xl bg-white flex flex-col gap-6">
      
      {/* 🛑 FIX: Kept the Arena ID for context, removed duplicate username/logout */}
      <div className="flex justify-between items-center bg-gray-50 p-4 border-b border-gray-200 rounded-t-xl -mx-6 -mt-6">
        <h2 className="text-2xl font-extrabold text-gray-700 ml-4">Arena: {roomId}</h2>
        {/* The duplicate username/logout section was removed from here. */}
      </div>
      
      {/* Timer (Visibility Fixed: high contrast background) */}
      {contestStarted && (
        <div className={`text-3xl font-mono font-bold text-center p-3 rounded-lg ${
          contestTimeLeft < 300 ? "bg-red-100 text-red-600 animate-pulse" : "bg-indigo-600 text-white"
        }`}>
          ⏱️ Time Left: {Math.floor(contestTimeLeft / 60)}:
          {String(contestTimeLeft % 60).padStart(2, "0")}
        </div>
      )}

      {/* Notification */}
      {notification && (
        <div className="bg-yellow-300 text-yellow-900 px-4 py-2 rounded font-bold text-center animate-bounce">
          🔔 {notification}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-auto">
        {/* Left: Problem Statement (Fixed with Prose and dark examples) */}
        <div className="overflow-y-auto pr-2">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 shadow-lg">
            <h2 className="text-2xl font-bold text-blue-900 mb-4 border-b pb-2">
              🚀 Problem {userProblem + 1} of {problems.length}
            </h2>

            <div className="prose max-w-none text-gray-800 leading-relaxed">
              <ReactMarkdown 
                 components={{
                   // Ensures examples (code blocks) are visible (dark background, light text)
                   pre: ({ children }) => (
                     <pre className="bg-gray-800 text-gray-200 p-3 rounded-lg overflow-x-auto text-sm my-4">
                       {children}
                     </pre>
                   ),
                 }}
              >
                {problem.statement}
              </ReactMarkdown>
            </div>
          </div>
        </div>

        {/* Right: Code Editor */}
        <div className="flex flex-col h-full">
          <CodeEditor
            key={userProblem}
            language={language}
            setLanguage={setLanguage}
            code={code}
            setCode={setCode}
            onSubmit={handleSubmit}
            problem={problem}
          />
        </div>
      </div>

      {/* Leaderboard */}
      <div className="mt-4">
        <Leaderboard players={players} currentUser={username} compact={false} />
      </div>

      <audio ref={notificationSound} src="/notification.wav" />
    </div>
  );
}