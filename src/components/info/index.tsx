import React, { useState } from "react";
import { FaRobot } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import {
  BsChatDots,
  BsCodeSlash,
  BsFileText,
  BsTranslate,
} from "react-icons/bs";

const Info: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const [capabilities, setCapabilities] = useState([
    {
      id: 1,
      name: "Reply on farcaster",
      description: "Every time it is tagged the agent will reply.",
      icon: <BsChatDots className="text-2xl" />,
      active: true,
      color: "#8C52FF",
    },
    {
      id: 2,
      name: "Reply to DCs",
      description: "Active on the warpcast direct messages.",
      icon: <BsCodeSlash className="text-2xl" />,
      active: true,
      color: "#00C2FF",
    },
    {
      id: 3,
      name: "Content Writer",
      description:
        "Publish two pieces of content every day, at random moments.",
      icon: <BsFileText className="text-2xl" />,
      active: false,
      color: "#FFA700",
    },
    {
      id: 4,
      name: "Notifications",
      description: "Notifies you twice every day.",
      icon: <BsTranslate className="text-2xl" />,
      active: false,
      color: "#FF5733",
    },
  ]);

  if (!isOpen) return null;

  const toggleCapability = (id: number) => {
    setCapabilities(
      capabilities.map((cap) =>
        cap.id === id ? { ...cap, active: !cap.active } : cap
      )
    );
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
          className="bg-gradient-to-b from-[#0F0718] to-[#1a0b2e] text-white p-6 rounded-xl w-full max-w-lg mx-4 relative"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white transition-colors"
          >
            ✕
          </button>

          <div className="flex items-center gap-3 mb-6">
            <FaRobot className="text-2xl text-[#8C52FF]" />
            <h2 className="text-xl font-bold">Agent Actions</h2>
          </div>

          <div className="space-y-3">
            {capabilities.map((capability) => (
              <motion.div
                key={capability.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-black/30 p-3 rounded-lg flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="p-2 rounded-lg"
                    style={{ backgroundColor: capability.color + "20" }}
                  >
                    {capability.icon}
                  </div>
                  <div>
                    <h3 className="font-medium text-sm">{capability.name}</h3>
                    <p className="text-xs text-gray-400">
                      {capability.description}
                    </p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={capability.active}
                    onChange={() => toggleCapability(capability.id)}
                  />
                  <div className="w-10 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#8C52FF]"></div>
                </label>
              </motion.div>
            ))}
          </div>

          {/* <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="mt-5 w-full py-2.5 bg-gradient-to-r from-[#8C52FF] to-[#00C2FF] rounded-lg flex items-center justify-center gap-2 hover:opacity-90 transition-opacity text-sm"
          >
            <FaPlus size={12} />
            <span onClick={() => setIsOpen(false)}>Add More Capabilities</span>
          </motion.button> */}

          {/* <p className="text-center text-xs text-gray-400 mt-3">
            Browse the marketplace for more agent capabilities
          </p> */}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default Info;
