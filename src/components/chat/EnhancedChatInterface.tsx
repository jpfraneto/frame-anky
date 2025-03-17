import React, { useState, useRef, useEffect } from "react";
import { calculateSessionScore } from "../../lib/scoreCalculator";
import { calculateFlowScore } from "../../lib/flowCalculator";
import MessageList from "./MessageList";
import InputArea from "./InputArea";
import AnkyModeNotification from "./AnkyModeNotification";
import { FrameContext } from "../providers/FarcasterProvider";
import { useAnky } from "../providers/AnkyProvider";
interface Keystroke {
  key: string;
  time: number; // Time since last keystroke in seconds
  timestamp: number; // Absolute timestamp
}

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
  frameContext: FrameContext;
}

const EnhancedChatInterface: React.FC<EnhancedChatInterfaceProps> = ({
  frameContext,
}) => {
  const [messages, setMessages] = useState<ChatHistoryItem[]>([]);
  const [inputMessage, setInputMessage] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [keystrokes, setKeystrokes] = useState<Keystroke[]>([]);
  const [flowScore, setFlowScore] = useState<number>(0);
  const [showAnkyMode, setShowAnkyMode] = useState<boolean>(false);
  const [sessionLongString, setSessionLongString] = useState<string>("");

  const [conversationId, setConversationId] = useState<string>("");
  const [activeStatsMessageId, setActiveStatsMessageId] = useState<
    number | null
  >(null);

  const inputRef = useRef<HTMLInputElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const writingStartTimeRef = useRef<number | null>(null);
  const lastKeystrokeTimeRef = useRef<number | null>(null);
  const keystrokeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
    null
  );

  const { setIsAnkyModeActive } = useAnky();

  // Get FID from the frame context
  const fid = frameContext?.user.fid || "anonymous";

  // Initialize conversation ID if it doesn't exist
  useEffect(() => {
    if (!conversationId) {
      console.log("the flow score is: ", flowScore);
      const newConversationId = `anky-${fid}-${Date.now()}`;
      setConversationId(newConversationId);
      console.log("Created new conversation ID:", newConversationId);
    }
  }, [fid, conversationId]);

  useEffect(() => {
    const loadChatHistory = async (): Promise<void> => {
      if (!conversationId) return;

      try {
        setIsLoading(true);

        // Load history from local storage initially if available
        const storedConversation = localStorage.getItem(
          `anky-conversation-${conversationId}`
        );
        if (storedConversation) {
          try {
            const conversation = JSON.parse(storedConversation);

            // Convert the conversation format to ChatHistoryItem[]
            const historyMessages: ChatHistoryItem[] = conversation.map(
              (msg: any, index: number) => ({
                id: index,
                text: msg.content,
                sender: msg.role === "user" ? "user" : "assistant",
                timestamp: new Date(),
                fid: fid,
              })
            );

            setMessages(historyMessages);
            console.log(
              "Loaded chat history from storage:",
              historyMessages.length,
              "messages"
            );
          } catch (error) {
            console.error("Failed to parse stored conversation:", error);
          }
        }

        setIsLoading(false);
      } catch (err) {
        console.error("Failed to load chat history:", err);
        setError("Failed to load chat history");
        setIsLoading(false);
      }
    };

    loadChatHistory();
  }, [fid, conversationId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();

    // If the last message is from the assistant, focus the input field
    const lastMessage = messages[messages.length - 1];
    if (lastMessage && lastMessage.sender === "assistant") {
      if (isFullscreen && textareaRef.current) {
        textareaRef.current.focus();
      } else if (!isFullscreen && inputRef.current) {
        inputRef.current.focus();
      }
    }
  }, [messages, isFullscreen]);

  // Focus the textarea when entering fullscreen mode
  useEffect(() => {
    if (isFullscreen && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isFullscreen]);

  // Progress interval for Anky mode
  useEffect(() => {
    if (isFullscreen && lastKeystrokeTimeRef.current) {
      progressIntervalRef.current = setInterval(() => {
        const timeSinceLastKeystroke =
          Date.now() - lastKeystrokeTimeRef.current!;
        const progress = Math.min((timeSinceLastKeystroke / 8000) * 100, 100);

        if (progress >= 100) {
          handleSendMessage(null);
        }
      }, 100);
    }

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [isFullscreen, keystrokes, inputMessage]);

  const scrollToBottom = (): void => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ): void => {
    const currentTime = Date.now();
    setInputMessage(e.target.value);

    if (!writingStartTimeRef.current) {
      writingStartTimeRef.current = currentTime;
      // Initialize session long string with user ID, session ID and timestamp
      setSessionLongString(
        `${fid}\n${conversationId}\n${currentTime}\n${inputMessage}`
      );
    }

    const timeSinceLastKeystroke = lastKeystrokeTimeRef.current
      ? (currentTime - lastKeystrokeTimeRef.current) / 1000
      : 0;

    const newChar = e.target.value.slice(-1);
    const timeStr = timeSinceLastKeystroke.toFixed(3);

    // Update session long string with new keystroke
    if (e.target.value.length < inputMessage.length) {
      setSessionLongString((prev) => `${prev}\nBackspace ${timeStr}`);
    } else if (newChar === "\n") {
      setSessionLongString((prev) => `${prev}\nEnter ${timeStr}`);
    } else if (newChar === " ") {
      setSessionLongString((prev) => `${prev}\n ${timeStr}`);
    } else {
      setSessionLongString((prev) => `${prev}\n${newChar} ${timeStr}`);
    }

    const newKeystroke: Keystroke = {
      key: newChar,
      time: timeSinceLastKeystroke,
      timestamp: currentTime,
    };

    setKeystrokes((prev) => [...prev, newKeystroke]);

    // Check if we should enter Anky mode
    if (currentTime - writingStartTimeRef.current >= 8000) {
      if (!isFullscreen) {
        setIsFullscreen(true);
        setIsAnkyModeActive(true);
        setShowAnkyMode(true);
        setTimeout(() => setShowAnkyMode(false), 2000);

        // Calculate flow score once we enter Anky mode
        const score = calculateFlowScore(keystrokes);
        setFlowScore(score);
      }
    }

    lastKeystrokeTimeRef.current = currentTime;

    if (keystrokeTimerRef.current) {
      clearTimeout(keystrokeTimerRef.current);
    }

    keystrokeTimerRef.current = setTimeout(() => {
      if (e.target.value.trim() !== "") {
        handleSendMessage(null);
      }
    }, 8000);
  };

  const handleSendMessage = async (
    e: React.FormEvent<HTMLFormElement> | null
  ): Promise<void> => {
    if (e) {
      e.preventDefault();
    }
    console.log("IN HERE, the session long string is", sessionLongString);

    if (inputMessage.trim() === "" || !conversationId) return;

    let sessionStats: SessionStats | undefined;

    // Only calculate session stats if we entered Anky mode (full screen)
    if (writingStartTimeRef.current && isFullscreen) {
      const sessionData = {
        text: inputMessage,
        keystrokes,
        sessionStartTime: writingStartTimeRef.current,
        sessionDuration: (Date.now() - writingStartTimeRef.current) / 1000 / 60,
        emergenciesUsed: 0,
        userConfig: {
          avgWordsPerMinute: 30,
          currentStreak: 1,
        },
      };

      const stats = calculateSessionScore(sessionData);
      sessionStats = {
        wordCount: stats.wordCount,
        keystrokeCount: keystrokes.length,
        duration: stats.duration,
        wpm: Math.round(stats.wordCount / (Number(stats.duration) / 60)),
        finalScore: stats.finalScore,
      };
    }

    // Reset our writing tracking state
    writingStartTimeRef.current = null;
    lastKeystrokeTimeRef.current = null;
    setKeystrokes([]);
    setFlowScore(0);

    if (keystrokeTimerRef.current) {
      clearTimeout(keystrokeTimerRef.current);
    }
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }
    setIsFullscreen(false);

    const userMessage: ChatHistoryItem = {
      id: Date.now(),
      text: inputMessage,
      sender: "user",
      timestamp: new Date(),
      fid: fid.toString(),
      sessionStats,
    };

    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInputMessage("");
    setError(null);

    try {
      setIsLoading(true);

      // Get existing conversation from localStorage if it exists
      let conversation: Array<{ role: string; content: string }> = [];
      const storedConversation = localStorage.getItem(
        `anky-conversation-${conversationId}`
      );

      if (storedConversation) {
        try {
          conversation = JSON.parse(storedConversation);
        } catch (error) {
          console.error("Failed to parse stored conversation:", error);
        }
      }

      // Add the new user message to conversation
      conversation.push({
        role: "user",
        content: inputMessage,
      });

      // Save intermediate state
      localStorage.setItem(
        `anky-conversation-${conversationId}`,
        JSON.stringify(conversation)
      );

      // Call the Anky chat API
      const response = await fetch(
        `${import.meta.env.VITE_API_ROUTE}/anky/chat`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: inputMessage,
            fid: fid,
            conversationId: conversationId,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(
          `API request failed: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();

      // Add assistant's response to messages
      const botMessage: ChatHistoryItem = {
        id: Date.now() + 1,
        text: data.data.message,
        sender: "assistant",
        timestamp: new Date(),
        fid: fid.toString(),
      };

      setMessages((prevMessages) => [...prevMessages, botMessage]);

      // Save complete conversation to localStorage
      localStorage.setItem(
        `anky-conversation-${conversationId}`,
        JSON.stringify(data.data.conversation)
      );

      setIsLoading(false);
    } catch (err) {
      console.error("Error sending message:", err);
      setError("Failed to get response. Please try again.");
      setIsLoading(false);
    }
  };

  const toggleStatsDisplay = (messageId: number) => {
    if (activeStatsMessageId === messageId) {
      setActiveStatsMessageId(null);
    } else {
      setActiveStatsMessageId(messageId);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-var(--keyboard-height,0px))] w-full border border-gray-200  shadow-md bg-gray-50 overflow-hidden">
      <AnkyModeNotification show={showAnkyMode} />

      <MessageList
        messages={messages}
        isLoading={isLoading}
        error={error}
        messagesEndRef={messagesEndRef as React.RefObject<HTMLDivElement>}
        toggleStatsDisplay={toggleStatsDisplay}
        activeStatsMessageId={activeStatsMessageId}
      />

      <InputArea
        inputMessage={inputMessage}
        handleInputChange={handleInputChange}
        handleSendMessage={handleSendMessage}
        isLoading={isLoading}
        isFullscreen={isFullscreen}
        inputRef={inputRef}
        textareaRef={textareaRef}
      />
    </div>
  );
};

export default EnhancedChatInterface;
