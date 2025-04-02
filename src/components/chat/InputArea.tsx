import React from "react";
import { motion, AnimatePresence } from "framer-motion";

interface InputAreaProps {
  inputMessage: string;
  handleInputChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  handleSendMessage: (
    e: React.FormEvent<HTMLFormElement> | null
  ) => Promise<void>;
  isLoading: boolean;
  inputRef: React.RefObject<HTMLInputElement | null>;
}

const InputArea: React.FC<InputAreaProps> = ({
  inputMessage,
  handleInputChange,
  handleSendMessage,
  isLoading,
  inputRef,
}) => {
  return (
    <AnimatePresence>
      <motion.form
        className="flex flex-col bg-white border-t border-gray-200 p-3"
        onSubmit={(e) => handleSendMessage(e)}
        initial={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex p-3">
          <input
            ref={inputRef}
            type="text"
            value={inputMessage}
            onChange={handleInputChange}
            placeholder="Type your message..."
            className="flex-1 h-12 py-3 px-4 border border-gray-300 rounded-lg outline-none focus:border-blue-500"
            disabled={isLoading}
            autoFocus
          />
          <button
            type="submit"
            className="bg-blue-500 text-white border-none rounded-full px-4 ml-2 font-semibold transition-colors hover:bg-blue-600 active:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed"
            disabled={isLoading || inputMessage.trim() === ""}
          >
            Send
          </button>
        </div>
      </motion.form>
    </AnimatePresence>
  );
};

export default InputArea;
