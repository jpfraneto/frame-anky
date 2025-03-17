import React, { useState } from "react";
import { FaInfoCircle } from "react-icons/fa";
import Info from "../info";
import Leaderboard from "../leaderboard";
import { useAnky } from "../providers/AnkyProvider";

const TopBar: React.FC = () => {
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const { isAnkyModeActive } = useAnky();

  if (isAnkyModeActive) {
    return <></>;
  }
  return (
    <div className="fixed top-4 right-4 flex items-center gap-4 z-50">
      <button
        onClick={() => setIsInfoModalOpen(true)}
        className="p-2 bg-white rounded-full shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
      >
        <FaInfoCircle size={24} className="text-gray-700" />
      </button>

      <button
        onClick={() => setIsLeaderboardOpen(true)}
        className="px-4 py-2 bg-white text-gray-800 rounded-full shadow-lg hover:shadow-xl transition-shadow"
      >
        Leaderboard
      </button>

      <Info
        isOpen={isInfoModalOpen}
        onClose={() => setIsInfoModalOpen(false)}
      />
      <Leaderboard
        isOpen={isLeaderboardOpen}
        onClose={() => setIsLeaderboardOpen(false)}
      />
    </div>
  );
};

export default TopBar;
