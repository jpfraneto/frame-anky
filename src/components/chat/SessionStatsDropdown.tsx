import React from "react";
import { motion } from "framer-motion";
import { SessionStats } from "./EnhancedChatInterface";

interface SessionStatsDropdownProps {
  stats: SessionStats;
  close: () => void;
  isUserMessage: boolean;
}

const SessionStatsDropdown: React.FC<SessionStatsDropdownProps> = ({
  stats,
  close,
  isUserMessage,
}) => {
  const formatDuration = (minutes: number) => {
    const mins = Math.floor(minutes);
    const secs = Math.round((minutes - mins) * 60);
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`absolute z-10 bg-white rounded-lg shadow-lg border border-gray-200 p-3 mt-2 w-64 
        ${isUserMessage ? "right-0" : "left-0"}`}
    >
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-semibold">Writing Stats</h3>
        <button onClick={close} className="text-gray-400 hover:text-gray-600">
          ✕
        </button>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="font-medium">Words:</span>
          <span>{stats.wordCount}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-medium">Keystrokes:</span>
          <span>{stats.keystrokeCount}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-medium">Duration:</span>
          <span>{formatDuration(Number(stats.duration))}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-medium">Words/min:</span>
          <span>{stats.wpm}</span>
        </div>
        <div className="flex justify-between border-t pt-2 mt-1">
          <span className="font-bold">Final Score:</span>
          <span className="font-bold">{stats.finalScore}</span>
        </div>
      </div>
    </motion.div>
  );
};

export default SessionStatsDropdown;
