import React from "react";
import { ChatHistoryItem } from "./EnhancedChatInterface";
import SessionStatsDropdown from "./SessionStatsDropdown";

interface MessageListProps {
  messages: ChatHistoryItem[];
  isLoading: boolean;
  error: string | null;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  toggleStatsDisplay: (messageId: number) => void;
  activeStatsMessageId: number | null;
}

const MessageList: React.FC<MessageListProps> = ({
  messages,
  isLoading,
  error,
  messagesEndRef,
  toggleStatsDisplay,
  activeStatsMessageId,
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
          <p>No messages yet. Start a conversation with Anky!</p>
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
          className={`relative ${
            message.sender === "user" ? "self-end" : "self-start"
          }`}
        >
          <div
            className={`max-w-[70%] p-3 rounded-2xl ${
              message.sender === "user"
                ? "ml-auto bg-blue-500 text-white rounded-br-sm"
                : "mr-auto bg-gray-200 text-gray-800 rounded-bl-sm"
            }`}
          >
            <div className="mb-1">{message.text}</div>
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
      ))}

      {isLoading && (
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
  );
};

export default MessageList;
