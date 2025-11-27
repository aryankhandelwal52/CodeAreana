import React from "react";

export default function Leaderboard({ players, currentUser, compact = false }) {
  if (!players || players.length === 0)
    return (
      <div className="text-center text-gray-400 italic p-6 text-lg rounded-xl border border-gray-200 bg-gray-50">
        No players yet...
      </div>
    );

  const sorted = [...players].sort((a, b) => (b.score || 0) - (a.score || 0));
  const userRank = sorted.findIndex((p) => p.username === currentUser) + 1;

  const getMedal = (rank) => {
    switch (rank) {
      case 1:
        return "🥇";
      case 2:
        return "🥈";
      case 3:
        return "🥉";
      default:
        return `#${rank}`;
    }
  };

  return (
    <div className={`bg-white rounded-3xl shadow-2xl p-6 border border-purple-200 ${
        compact ? 'max-w-none' : 'max-w-md mx-auto'
      }`}
    >
      <h3 className="text-3xl font-extrabold text-center mb-5 text-purple-700 drop-shadow-md">
        🏆 Leaderboard
      </h3>

      <p className="text-center text-gray-600 mb-6 text-lg">
        Your Rank:{" "}
        <span className="text-purple-700 font-bold">{userRank}</span> /{" "}
        {sorted.length}
      </p>

      <ul className="space-y-3 divide-y divide-gray-100">
        {sorted.map((p, i) => (
          <li
            key={i}
            className={`flex justify-between items-center p-4 rounded-2xl shadow-sm transition-all duration-300 transform hover:scale-[1.01] hover:shadow-md ${
              p.username === currentUser
                ? "bg-purple-100 text-purple-800 font-semibold ring-2 ring-purple-300"
                : "bg-white"
            }`}
          >
            <div className="flex items-center space-x-4">
              <span className="text-2xl">{getMedal(i + 1)}</span>
              <span className="text-gray-800 text-lg">
                {p.username}{" "}
                {p.username === currentUser && (
                  <span className="text-sm text-purple-500 font-medium">
                    (You)
                  </span>
                )}
              </span>
            </div>
            <span className="font-bold text-gray-700 text-xl">{p.score || 0} pts</span>
          </li>
        ))}
      </ul>
    </div>
  );
}