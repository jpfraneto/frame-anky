import React from "react";
import { FaRobot } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

const Info: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const steps = [
    {
      id: 1,
      title: "Personality Analysis",
      description:
        "We analyze your Farcaster data to identify 8 core characteristics that define you. You then choose a polarity of each one of those.",
      color: "#808080",
    },
    {
      id: 2,
      title: "Digital Twin Creation",
      description:
        "Based on your choices, we create a Farcaster account that mirrors your personality and interaction patterns.",
      color: "#A0A0A0",
    },
    {
      id: 3,
      title: "Deployment",
      description:
        "Your doppelganger is deployed on Farcaster, with a clanker token associated with it. It's ready to engage with the community in your unique style.",
      color: "#C0C0C0",
    },
  ];

  return (
    <AnimatePresence>
      <motion.div
        onClick={onClose}
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
          className="bg-gradient-to-b from-gray-900 to-black text-white p-6 rounded-xl w-full max-w-lg mx-4 relative"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white transition-colors"
          >
            ✕
          </button>

          <div className="flex items-center gap-3 mb-6">
            <FaRobot className="text-2xl text-gray-400" />
            <h2 className="text-2xl font-bold">
              How <span className="text-purple-600 text-2xl">FAR</span>TWINS
              Works
            </h2>
          </div>

          <div className="space-y-6">
            {steps.map((step) => (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: step.id * 0.1 }}
                className="relative"
              >
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xl font-bold shrink-0 bg-gray-800">
                    {step.id}
                  </div>
                  <div>
                    <h3 className="font-bold text-2xl mb-2 text-gray-300">
                      {step.title}
                    </h3>
                    <p className="text-gray-400 text-xl leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
                {step.id !== steps.length && (
                  <div className="absolute left-4 top-12 w-[1px] h-12 opacity-30 bg-gradient-to-b from-gray-500 to-transparent" />
                )}
              </motion.div>
            ))}
          </div>

          <div className="mt-2 text-center text-xl text-gray-700">
            All of this is powered by /a0x, an agentic creation framework.
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default Info;
