// ChatInterface.tsx
import React, { useState, useRef, useEffect } from "react";

// Define types for our messages
interface Message {
  id: number;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
}

// Sample message data structure for initial state
const initialMessages: Message[] = [
  {
    id: 1,
    text: "Hello! How can I help you today?",
    sender: "bot",
    timestamp: new Date(),
  },
];

const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputMessage, setInputMessage] = useState<string>("");
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll to bottom when messages update
  const scrollToBottom = (): void => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle sending a new message
  const handleSendMessage = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();

    if (inputMessage.trim() === "") return;

    // Add user message
    const userMessage: Message = {
      id: messages.length + 1,
      text: inputMessage,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages([...messages, userMessage]);
    setInputMessage("");

    // Simulate bot response (replace with actual API call)
    simulateBotResponse(inputMessage);
  };

  // Simulate a bot response (replace with actual API call)
  const simulateBotResponse = (userInput: string): void => {
    setIsTyping(true);

    // Simulate network delay
    setTimeout(() => {
      const botMessage: Message = {
        id: messages.length + 2,
        text: generateBotResponse(userInput),
        sender: "bot",
        timestamp: new Date(),
      };

      setMessages((prevMessages) => [...prevMessages, botMessage]);
      setIsTyping(false);
    }, 1000);
  };

  // Simple bot response generator (replace with actual logic or API)
  const generateBotResponse = (userInput: string): string => {
    const input = userInput.toLowerCase();

    if (input.includes("hello") || input.includes("hi")) {
      return "Hello there! How can I assist you today?";
    } else if (input.includes("help")) {
      return "I'm here to help! Please tell me what you need assistance with.";
    } else if (input.includes("bye")) {
      return "Goodbye! Feel free to return if you have more questions.";
    } else {
      return "Thanks for your message. How else can I help you?";
    }
  };

  // Format timestamp
  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="flex flex-col max-w-md h-[600px] mx-auto border border-gray-200 rounded-lg shadow-md bg-gray-50 overflow-hidden">
      <div className="bg-blue-500 text-white p-4 text-center">
        <h2 className="text-lg font-semibold m-0">Chat Assistant</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`max-w-[70%] p-3 rounded-2xl ${
              message.sender === "user"
                ? "self-end bg-blue-500 text-white rounded-br-sm"
                : "self-start bg-gray-200 text-gray-800 rounded-bl-sm"
            }`}
          >
            <div className="mb-1">{message.text}</div>
            <div className="text-xs opacity-70 text-right">
              {formatTime(message.timestamp)}
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="self-start p-3 bg-gray-200 text-gray-800 rounded-2xl rounded-bl-sm inline-block">
            <div className="flex items-center">
              <span className="h-2 w-2 bg-gray-500 rounded-full mx-0.5 animate-bounce"></span>
              <span
                className="h-2 w-2 bg-gray-500 rounded-full mx-0.5 animate-bounce"
                style={{ animationDelay: "0.2s" }}
              ></span>
              <span
                className="h-2 w-2 bg-gray-500 rounded-full mx-0.5 animate-bounce"
                style={{ animationDelay: "0.4s" }}
              ></span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <form
        className="flex p-3 bg-white border-t border-gray-200"
        onSubmit={handleSendMessage}
      >
        <input
          type="text"
          value={inputMessage}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setInputMessage(e.target.value)
          }
          placeholder="Type your message..."
          className="flex-1 py-3 px-4 border border-gray-300 rounded-full outline-none focus:border-blue-500"
        />
        <button
          type="submit"
          className="bg-blue-500 text-white border-none rounded-full px-4 ml-2 font-semibold transition-colors hover:bg-blue-600 active:bg-blue-700"
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default ChatInterface;
