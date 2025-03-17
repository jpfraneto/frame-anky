import React from "react";
import { motion, AnimatePresence } from "framer-motion";

interface AnkyModeNotificationProps {
  show: boolean;
}

const AnkyModeNotification: React.FC<AnkyModeNotificationProps> = ({
  show,
}) => {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5, y: -50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, y: 50 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
        >
          <div className="text-6xl font-bold text-white text-shadow-lg">
            ANKY MODE ON
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AnkyModeNotification;
