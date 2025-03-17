import React, { useState } from "react";
import { FaFeather, FaChartLine } from "react-icons/fa";
import { RiMentalHealthFill } from "react-icons/ri";
import { motion, AnimatePresence } from "framer-motion";

const Info: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const [currentScreen, setCurrentScreen] = useState(0);

  if (!isOpen) return null;

  const screens = [
    {
      icon: <FaFeather className="text-[#8C52FF] text-3xl" />,
      title: "Flow Writing",
      description:
        "Transform your stream-of-consciousness writing into a meditative experience with immersive visual and audio feedback.",
    },
    {
      icon: <RiMentalHealthFill className="text-[#00C2FF] text-3xl" />,
      title: "AI Companion",
      description:
        "Chat with Anky, your mystical writing companion that provides prompts and insights about your writing patterns.",
    },
    {
      icon: <FaChartLine className="text-[#FFA700] text-3xl" />,
      title: "Track & Earn",
      description:
        "Build writing streaks, unlock achievements, and earn rewards while training your capacity to enter a flow state.",
    },
  ];

  const handleNext = () => {
    if (currentScreen === screens.length - 1) {
      onClose();
      setCurrentScreen(0);
    } else {
      setCurrentScreen(currentScreen + 1);
    }
  };

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
          className="bg-gradient-to-b from-[#0F0718] to-[#1a0b2e] text-white p-8 rounded-xl max-w-xl relative cursor-pointer"
          onClick={handleNext}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white transition-colors"
          >
            ✕
          </button>

          <motion.div
            key={currentScreen}
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -50, opacity: 0 }}
            className="py-8"
          >
            <div className="flex flex-col items-center text-center gap-6">
              {screens[currentScreen].icon}
              <h2 className="text-3xl font-bold bg-gradient-to-r from-[#8C52FF] to-[#00C2FF] text-transparent bg-clip-text">
                {screens[currentScreen].title}
              </h2>
              <p className="text-gray-300 max-w-md">
                {screens[currentScreen].description}
              </p>
            </div>
          </motion.div>

          <div className="flex justify-center gap-2 mt-8">
            {screens.map((_, idx) => (
              <div
                key={idx}
                className={`w-2 h-2 rounded-full transition-colors ${
                  idx === currentScreen ? "bg-[#8C52FF]" : "bg-gray-600"
                }`}
              />
            ))}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default Info;
