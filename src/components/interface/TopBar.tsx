import React, { useState } from "react";
import { FaInfoCircle } from "react-icons/fa";
import Info from "../info";

const TopBar: React.FC = () => {
  const [isA0XModalOpen, setIsA0XModalOpen] = useState(false);

  return (
    <div className="fixed top-4 right-4 flex items-center gap-4 z-50">
      <button
        onClick={() => setIsA0XModalOpen(true)}
        className="p-2 bg-white rounded-full shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
      >
        <FaInfoCircle size={24} className="text-gray-700" />
      </button>

      <Info isOpen={isA0XModalOpen} onClose={() => setIsA0XModalOpen(false)} />
    </div>
  );
};

export default TopBar;
