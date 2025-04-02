import React from "react";
import { ChatHistoryItem } from "./EnhancedChatInterface";
import SessionStatsDropdown from "./SessionStatsDropdown";
import { FrameContext } from "../providers/FarcasterProvider";

interface MessageListProps {
  messages: ChatHistoryItem[];
  isLoading: boolean;
  error: string | null;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  toggleStatsDisplay: (messageId: number) => void;
  activeStatsMessageId: number | null;
  frameContext: FrameContext;
  agentPfp?: string;
}

const MessageList: React.FC<MessageListProps> = ({
  messages,
  isLoading,
  error,
  messagesEndRef,
  toggleStatsDisplay,
  activeStatsMessageId,
  frameContext,
  agentPfp = "/anky.png",
}) => {
  const formatTime = (date: Date): string => {
    return new Date(date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
      {messages.length === 0 && !isLoading && !error && (
        <div className="text-center text-gray-500 my-auto">
          <p>No messages yet. Start chatting with your doppelganger!</p>
        </div>
      )}

      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded-lg self-center">
          <p>{error}</p>
        </div>
      )}

      {messages.map((message) => (
        <div
          key={message.id}
          className={`relative flex items-end gap-2 ${
            message.sender === "user" ? "flex-row-reverse" : "flex-row"
          }`}
        >
          <div className="flex-shrink-0">
            {message.sender === "user" ? (
              <div className="w-8 h-8 rounded-full flex items-center justify-center">
                <img
                  src={frameContext.user.pfpUrl}
                  alt="User avatar"
                  className="w-full h-full rounded-full object-cover"
                />
              </div>
            ) : (
              <div className="w-8 h-8 rounded-full flex items-center justify-center">
                <img
                  src={agentPfp}
                  alt="Agent avatar"
                  className="w-full h-full rounded-full object-cover"
                />
              </div>
            )}
          </div>

          <div className="flex flex-col max-w-[70%] min-w-[100px]">
            <div
              className={`p-3 rounded-2xl ${
                message.sender === "user"
                  ? "bg-blue-500 text-white rounded-br-sm"
                  : "bg-gray-200 text-gray-800 rounded-bl-sm"
              }`}
            >
              <div className="mb-1 break-words">{message.text}</div>
              <div className="text-xs opacity-70 text-right">
                {formatTime(message.timestamp)}
              </div>
              {message.sessionStats && (
                <div
                  className="mt-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-full cursor-pointer hover:bg-blue-700 transition-colors flex items-center justify-center"
                  onClick={() => toggleStatsDisplay(message.id)}
                >
                  <span>Score: {message.sessionStats.finalScore}</span>
                  <span className="ml-1">
                    {activeStatsMessageId === message.id ? "▲" : "▼"}
                  </span>
                </div>
              )}
            </div>

            {activeStatsMessageId === message.id && message.sessionStats && (
              <SessionStatsDropdown
                stats={message.sessionStats}
                close={() => toggleStatsDisplay(message.id)}
                isUserMessage={message.sender === "user"}
              />
            )}
          </div>
        </div>
      ))}

      {isLoading && (
        <div className="flex items-end gap-2">
          <div className="w-8 h-8 rounded-full flex items-center justify-center">
            <img
              src={agentPfp}
              alt="Agent avatar"
              className="w-full h-full rounded-full object-cover animate-pulse"
            />
          </div>
          <div className="p-3 bg-gray-200 text-gray-800 rounded-2xl rounded-bl-sm">
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
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
