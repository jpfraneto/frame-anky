import React, { useState, useRef, useEffect } from "react";
import MessageList from "./MessageList";
import InputArea from "./InputArea";
import { motion } from "framer-motion";
import { useFarcaster } from "../providers/FarcasterProvider";

export interface SessionStats {
  wordCount: number;
  keystrokeCount: number;
  duration: string;
  wpm: number;
  finalScore: number;
}

export interface ChatHistoryItem {
  id: number;
  text: string;
  sender: "user" | "assistant";
  timestamp: Date;
  fid: string;
  sessionStats?: SessionStats;
}

interface EnhancedChatInterfaceProps {
  agentFid: number;
  agentId: string;
}

const EnhancedChatInterface: React.FC<EnhancedChatInterfaceProps> = ({
  agentFid,
}) => {
  const [messages, setMessages] = useState<ChatHistoryItem[]>([]);
  const [inputMessage, setInputMessage] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [isInitializing, setIsInitializing] = useState<boolean>(true);
  const [activeStatsMessageId, setActiveStatsMessageId] = useState<
    number | null
  >(null);

  const inputRef = useRef<HTMLInputElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const { frameContext } = useFarcaster();

  // Show initialization animation
  useEffect(() => {
    setTimeout(() => {
      setIsInitializing(false);
    }, 2000);
  }, []);

  // Initialize messages with welcome message
  useEffect(() => {
    const initialMessage: ChatHistoryItem = {
      id: Date.now(),
      text: "Your doppelganger is ready to chat. How can I assist you today?",
      sender: "assistant",
      timestamp: new Date(),
      fid: agentFid.toString(),
    };
    setMessages([initialMessage]);
  }, [agentFid]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setInputMessage(e.target.value);
  };

  const handleSendMessage = async (
    e: React.FormEvent<HTMLFormElement> | null
  ) => {
    if (e) {
      e.preventDefault();
    }

    if (!inputMessage.trim()) return;

    const newMessage: ChatHistoryItem = {
      id: Date.now(),
      text: inputMessage,
      sender: "user",
      timestamp: new Date(),
      fid: agentFid.toString(),
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputMessage("");
    setIsLoading(true);

    try {
      // Add API call here to send message to agent
      // const response = await sendMessageToAgent(inputMessage, agentId);

      // Mock response for now
      const responseMessage: ChatHistoryItem = {
        id: Date.now() + 1,
        text: "This is a mock response from the doppelganger",
        sender: "assistant",
        timestamp: new Date(),
        fid: agentFid.toString(),
      };

      setMessages((prev) => [...prev, responseMessage]);
    } catch (err) {
      setError("Failed to send message");
    } finally {
      setIsLoading(false);
    }
  };

  if (isInitializing) {
    return (
      <div className="flex items-center justify-center h-screen bg-black">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 2,
              ease: "linear",
            }}
            className="w-16 h-16 border-4 border-white border-t-transparent rounded-full mx-auto mb-4"
          />
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-white text-xl"
          >
            Initializing your doppelganger...
          </motion.p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-var(--keyboard-height,0px))] w-full border border-gray-200 shadow-md bg-black overflow-hidden">
      <MessageList
        messages={messages}
        isLoading={isLoading}
        error={error}
        messagesEndRef={messagesEndRef as React.RefObject<HTMLDivElement>}
        activeStatsMessageId={activeStatsMessageId}
        toggleStatsDisplay={setActiveStatsMessageId}
        frameContext={frameContext!}
        agentPfp={frameContext?.user.pfpUrl}
      />

      <InputArea
        inputMessage={inputMessage}
        handleInputChange={handleInputChange}
        handleSendMessage={handleSendMessage}
        isLoading={isLoading}
        inputRef={inputRef}
      />
    </div>
  );
};

export default EnhancedChatInterface;
