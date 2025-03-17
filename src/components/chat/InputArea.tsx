import React, { useState, useEffect, useRef } from "react";
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
  isFullscreen: boolean;
  inputRef: React.RefObject<HTMLInputElement | null>;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
}

const InputArea: React.FC<InputAreaProps> = ({
  inputMessage,
  handleInputChange,
  handleSendMessage,
  isLoading,
  isFullscreen,
  inputRef,
  textareaRef,
}) => {
  // Session duration in milliseconds (8 minutes)
  const SESSION_DURATION = 8 * 60 * 1000;

  // Inactivity thresholds
  const INACTIVITY_WARNING_THRESHOLD = 3000; // 3 seconds
  const INACTIVITY_TIMEOUT = 8000; // 8 seconds

  // State for tracking progress and inactivity
  const [sessionProgress, setSessionProgress] = useState(0);
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);
  const [lastKeystrokeTime, setLastKeystrokeTime] = useState<number>(
    Date.now()
  );
  const [inactivityTime, setInactivityTime] = useState(0);

  // Refs for intervals
  const sessionTimerRef = useRef<NodeJS.Timeout | null>(null);
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Handle cleanup on unmount
  useEffect(() => {
    return () => {
      // Clean up on unmount
      if (sessionTimerRef.current) {
        clearInterval(sessionTimerRef.current);
      }
      if (inactivityTimerRef.current) {
        clearInterval(inactivityTimerRef.current);
      }
    };
  }, []);

  // Reset all timers and state when exiting fullscreen
  useEffect(() => {
    if (!isFullscreen) {
      // Reset all session state when exiting fullscreen
      setSessionStartTime(null);
      setSessionProgress(0);
      setLastKeystrokeTime(Date.now());
      setInactivityTime(0);

      // Clear timers
      if (sessionTimerRef.current) {
        clearInterval(sessionTimerRef.current);
        sessionTimerRef.current = null;
      }
      if (inactivityTimerRef.current) {
        clearInterval(inactivityTimerRef.current);
        inactivityTimerRef.current = null;
      }
    }
  }, [isFullscreen]);

  // Set up session timer
  useEffect(() => {
    if (isFullscreen) {
      // Always set a new session start time when entering fullscreen
      if (!sessionStartTime) {
        setSessionStartTime(Date.now());
      }

      // Clear any existing timer
      if (sessionTimerRef.current) {
        clearInterval(sessionTimerRef.current);
      }

      // Start a new timer to update progress
      sessionTimerRef.current = setInterval(() => {
        const elapsed = Date.now() - sessionStartTime!;
        const progress = Math.min((elapsed / SESSION_DURATION) * 100, 100);
        setSessionProgress(progress);

        // End session when time is up
        if (elapsed >= SESSION_DURATION) {
          if (sessionTimerRef.current) {
            clearInterval(sessionTimerRef.current);
          }
          // Here you would handle session completion
          // For example: handleSendMessage(null);
        }
      }, 100);
    }

    return () => {
      if (sessionTimerRef.current) {
        clearInterval(sessionTimerRef.current);
      }
    };
  }, [isFullscreen, sessionStartTime, handleSendMessage]);

  // Set up inactivity timer
  useEffect(() => {
    if (isFullscreen) {
      // Clear any existing timer
      if (inactivityTimerRef.current) {
        clearInterval(inactivityTimerRef.current);
      }

      // Start a new timer to check inactivity
      inactivityTimerRef.current = setInterval(() => {
        const currentInactivityTime = Date.now() - lastKeystrokeTime;
        setInactivityTime(currentInactivityTime);

        // End session if inactive for too long
        if (currentInactivityTime >= INACTIVITY_TIMEOUT) {
          if (inactivityTimerRef.current) {
            clearInterval(inactivityTimerRef.current);
          }
          if (sessionTimerRef.current) {
            clearInterval(sessionTimerRef.current);
          }
          // Handle session timeout due to inactivity
          // For example: handleSendMessage(null);
        }
      }, 100);
    }

    return () => {
      if (inactivityTimerRef.current) {
        clearInterval(inactivityTimerRef.current);
      }
    };
  }, [isFullscreen, lastKeystrokeTime, handleSendMessage]);

  // Update last keystroke time when typing
  const handleInput = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setLastKeystrokeTime(Date.now());
    handleInputChange(e);
  };

  // Calculate inactivity warning level (0 to 1)
  const getInactivityWarningLevel = () => {
    if (inactivityTime < INACTIVITY_WARNING_THRESHOLD) {
      return 0; // No warning yet
    }

    // Calculate warning level from 0 to 1 based on how close we are to timeout
    const warningDuration = INACTIVITY_TIMEOUT - INACTIVITY_WARNING_THRESHOLD;
    const warningTime = inactivityTime - INACTIVITY_WARNING_THRESHOLD;
    return Math.min(warningTime / warningDuration, 1);
  };

  const warningLevel = getInactivityWarningLevel();

  // Format time for display (MM:SS)
  const formatTimeRemaining = () => {
    if (!sessionStartTime) return "08:00";

    const elapsed = Date.now() - sessionStartTime;
    const remaining = Math.max(SESSION_DURATION - elapsed, 0);

    const minutes = Math.floor(remaining / 60000);
    const seconds = Math.floor((remaining % 60000) / 1000);

    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
      2,
      "0"
    )}`;
  };

  return (
    <AnimatePresence>
      <motion.form
        className={`flex flex-col bg-white border-t border-gray-200 ${
          isFullscreen ? "fixed inset-0 z-40" : "p-3"
        }`}
        onSubmit={(e) => handleSendMessage(e)}
        initial={{ opacity: 1, y: 0 }}
        animate={isFullscreen ? { opacity: 1, y: 0 } : {}}
        exit={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.3 }}
      >
        {isFullscreen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center p-4 bg-blue-500 text-white"
            style={{
              boxShadow:
                warningLevel > 0
                  ? `0 0 ${Math.round(20 * warningLevel)}px ${Math.round(
                      10 * warningLevel
                    )}px rgba(${255 * warningLevel}, 0, 0, ${
                      0.3 + 0.7 * warningLevel
                    })`
                  : "none",
              transition: "box-shadow 0.3s ease",
            }}
          >
            <div className="flex-1 flex items-center">
              <div
                className="w-full h-2 bg-blue-300 rounded-full overflow-hidden"
                style={{
                  boxShadow:
                    warningLevel > 0
                      ? `0 0 ${Math.round(10 * warningLevel)}px ${Math.round(
                          5 * warningLevel
                        )}px rgba(${255 * warningLevel}, 0, 0, ${
                          0.5 + 0.5 * warningLevel
                        })`
                      : "none",
                  transition: "box-shadow 0.3s ease",
                }}
              >
                <motion.div
                  className="h-full bg-white"
                  style={{ width: `${sessionProgress}%` }}
                />
              </div>
              <div className="ml-4 text-lg font-bold">
                {formatTimeRemaining()}
              </div>
            </div>
          </motion.div>
        )}

        <div className="flex p-3">
          {isFullscreen ? (
            <motion.textarea
              ref={textareaRef}
              value={inputMessage}
              onChange={handleInput}
              onFocus={(e) => {
                // Set cursor position to end of text
                const length = e.target.value.length;
                e.target.setSelectionRange(length, length);
              }}
              placeholder="aca vamos de nuevo. escribiendo..."
              className="flex-1 py-3 px-4 border border-gray-300 rounded-lg outline-none focus:border-blue-500 resize-none transition-all duration-300 h-[calc(100vh-var(--keyboard-height,0px)-120px)] text-xl p-6"
              disabled={isLoading}
              style={{
                background: "rgba(255,255,255,0.95)",
              }}
              autoFocus // Ensure focus when textarea is shown
            />
          ) : (
            <input
              ref={inputRef}
              type="text"
              value={inputMessage}
              onChange={handleInput}
              placeholder="Type your message to Anky..."
              className="flex-1 h-12 py-3 px-4 border border-gray-300 rounded-lg outline-none focus:border-blue-500"
              disabled={isLoading}
              autoFocus // Ensure focus when input is shown
            />
          )}
          {!isFullscreen && (
            <button
              type="submit"
              className="bg-blue-500 text-white border-none rounded-full px-4 ml-2 font-semibold transition-colors hover:bg-blue-600 active:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed"
              disabled={isLoading || inputMessage.trim() === ""}
            >
              Send
            </button>
          )}
        </div>
      </motion.form>
    </AnimatePresence>
  );
};

export default InputArea;
