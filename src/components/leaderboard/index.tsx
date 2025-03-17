import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaMedal, FaChartLine, FaTrophy } from "react-icons/fa";

interface LeaderboardEntry {
  username: string;
  wpm: number;
  score: number;
  duration: number;
  rank: number;
}

interface LeaderboardProps {
  isOpen: boolean;
  onClose: () => void;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ isOpen, onClose }) => {
  const [selectedEntry, setSelectedEntry] = useState<LeaderboardEntry | null>(
    null
  );

  const leaderboardData: LeaderboardEntry[] = [
    {
      username: "WritingMaster",
      wpm: 85,
      score: 2450,
      duration: 45,
      rank: 1,
    },
    {
      username: "FlowState",
      wpm: 72,
      score: 1980,
      duration: 30,
      rank: 2,
    },
    {
      username: "Wordsmith",
      wpm: 68,
      score: 1750,
      duration: 35,
      rank: 3,
    },
    {
      username: "StoryWeaver",
      wpm: 65,
      score: 1620,
      duration: 25,
      rank: 4,
    },
    {
      username: "Scribbler",
      wpm: 61,
      score: 1480,
      duration: 28,
      rank: 5,
    },
  ];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", damping: 20 }}
          className="bg-gradient-to-b from-[#0F0718] to-[#1a0b2e] text-white p-8 rounded-xl max-w-xl relative"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white transition-colors"
          >
            ✕
          </button>

          <div className="flex flex-col items-center text-center gap-6 mb-8">
            <div className="flex gap-4">
              <FaMedal className="text-[#FFA700] text-3xl" />
              <FaChartLine className="text-[#8C52FF] text-3xl" />
              <FaTrophy className="text-[#00C2FF] text-3xl" />
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-[#8C52FF] to-[#00C2FF] text-transparent bg-clip-text">
              Leaderboard
            </h2>
            <p className="text-gray-300 max-w-md">
              Our top writers who have mastered the art of flow state writing.
              Join them by practicing regularly and improving your scores.
            </p>
          </div>

          <div className="bg-black/20 rounded-lg overflow-hidden backdrop-blur-sm">
            <div className="grid grid-cols-2 p-4 font-semibold text-gray-300">
              <div>Rank</div>
              <div>Score</div>
            </div>

            {leaderboardData.map((entry) => (
              <div
                key={entry.username}
                className="grid grid-cols-2 p-4 border-b border-gray-700/50 hover:bg-white/5 transition-colors relative"
              >
                <div className="font-medium">#{entry.rank}</div>
                <div
                  className="cursor-pointer hover:text-blue-400"
                  onClick={() =>
                    setSelectedEntry(
                      selectedEntry?.rank === entry.rank ? null : entry
                    )
                  }
                >
                  {entry.score}
                </div>

                {selectedEntry?.rank === entry.rank && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute z-10 bg-white rounded-lg shadow-lg border border-gray-200 p-3 mt-2 w-64 right-0 top-full"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-lg font-semibold text-gray-800">
                        Writing Stats
                      </h3>
                      <button
                        onClick={() => setSelectedEntry(null)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        ✕
                      </button>
                    </div>

                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex justify-between">
                        <span className="font-medium">Words/min:</span>
                        <span>{entry.wpm}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Duration:</span>
                        <span>{entry.duration}m</span>
                      </div>
                      <div className="flex justify-between border-t pt-2 mt-1">
                        <span className="font-bold">Final Score:</span>
                        <span className="font-bold">{entry.score}</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default Leaderboard;
