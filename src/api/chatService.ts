// api/chatService.ts
// Types for our API responses and parameters

export interface ChatResponse {
  message: string;
  timestamp: Date;
}

export interface ChatHistoryItem {
  id: number;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
  userId: string;
}

export interface ChatSession {
  sessionId: string;
  userId: string;
  messages: ChatHistoryItem[];
  createdAt: Date;
}

/**
 * Service for handling chat API operations
 */
export const chatService = {
  currentSession: null as ChatSession | null,

  /**
   * Initialize or retrieve a chat session for a user
   * @param {string} userId - The ID of the user
   * @returns {Promise<void>}
   */
  initSession: async (userId: string): Promise<void> => {
    console.log("🔄 Initializing chat session for user:", userId);
    const API_ROUTE = import.meta.env.VITE_API_ROUTE || "";

    try {
      const response = await fetch(`${API_ROUTE}/api/chat/session`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
        credentials: "include", // Include cookies in the request
      });

      if (!response.ok) {
        console.error(
          `❌ Failed to initialize chat session: ${response.status} ${response.statusText}`
        );
        throw new Error(
          `Failed to initialize chat session: ${response.status} ${response.statusText}`
        );
      }

      const session = await response.json();
      chatService.currentSession = session;
      console.log("✅ Chat session initialized successfully", session);
    } catch (error) {
      console.error("❌ Error initializing chat session:", error);
      throw new Error("Failed to initialize chat session. Please try again.");
    }
  },

  /**
   * Send a message to the chat API and get a response
   * @param {string} message - The user's message
   * @param {string} userId - The ID of the user sending the message
   * @returns {Promise<ChatResponse>} - Promise containing the bot's response
   */
  sendMessage: async (
    message: string,
    userId: string
  ): Promise<ChatResponse> => {
    try {
      console.log("📤 Sending message:", message);
      if (!chatService.currentSession) {
        console.log("⚠️ No active session, initializing...");
        await chatService.initSession(userId);
      }

      if (!chatService.currentSession) {
        throw new Error("Failed to initialize session");
      }

      // Add user message to local session immediately

      const userMessage: ChatHistoryItem = {
        id: Date.now(),
        text: message,
        sender: "user",
        timestamp: new Date(),
        userId,
      };

      chatService.currentSession.messages.push(userMessage);

      const API_ROUTE = import.meta.env.VITE_API_ROUTE || "";
      console.log(`Sending message to ${API_ROUTE}/api/chat`);

      const response = await fetch(`${API_ROUTE}/api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message,
          userId,
          sessionId: chatService.currentSession.sessionId,
        }),
        credentials: "include", // Include cookies in the request
      });

      if (!response.ok) {
        console.error(
          `❌ API request failed: ${response.status} ${response.statusText}`
        );
        throw new Error(
          `API request failed: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();
      console.log("📥 Received response:", data);

      // Update local session with bot message
      if (chatService.currentSession) {
        chatService.currentSession.messages.push({
          id: Date.now() + 1,
          text: data.message,
          sender: "bot",
          timestamp: new Date(data.timestamp),
          userId,
        });
        console.log("💾 Updated local session with new message");
      }

      return data;
    } catch (error) {
      console.error("❌ Error sending message:", error);
      throw new Error("Failed to send message. Please try again.");
    }
  },

  /**
   * Get chat history for the current user's session
   * @param {string} userId - The ID of the user
   * @param {number} limit - Maximum number of messages to retrieve
   * @returns {Promise<ChatHistoryItem[]>} - Promise containing history messages
   */
  getChatHistory: async (
    userId: string,
    limit: number = 50
  ): Promise<ChatHistoryItem[]> => {
    try {
      console.log("📚 Fetching chat history for user:", userId);
      const API_ROUTE = import.meta.env.VITE_API_ROUTE || "";
      console.log("API_ROUTE:", API_ROUTE);

      // Create the URL with parameters
      const url = new URL(`${API_ROUTE}/api/chat/history`);
      url.searchParams.append("userId", userId);
      url.searchParams.append("limit", limit.toString());
      console.log("Full URL:", url.toString());

      // Try with fetch directly
      const response = await fetch(url.toString(), {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        credentials: "include", // Include cookies in the request
        mode: "cors", // Explicitly request CORS mode
      });

      console.log("🔄 Response status:", response.status);

      if (!response.ok) {
        console.error(
          `❌ Failed to fetch chat history: ${response.status} ${response.statusText}`
        );

        // Try to read the error response
        let errorText = "";
        try {
          errorText = await response.text();
        } catch (e) {
          errorText = "Unable to read error response";
        }

        console.error("Error response:", errorText);
        throw new Error(
          `Failed to fetch chat history: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();
      console.log(
        "📜 Retrieved chat history:",
        data.messages?.length || 0,
        "messages"
      );

      // Update current session with fetched data
      if (data.session) {
        chatService.currentSession = data.session;
        console.log("💾 Updated current session with fetched data");
      }

      return data.messages || [];
    } catch (error) {
      console.error("❌ Error fetching chat history:", error);

      // Fallback: If we can't get history from the server, but we have a local session,
      // use the messages from there
      if (chatService.currentSession) {
        console.log("⚠️ Using local session messages as fallback");
        return chatService.currentSession.messages;
      }

      // Otherwise return an empty array to prevent UI crashes
      return [];
    }
  },

  /**
   * Clear chat history for a user
   * @param {string} userId - The ID of the user
   * @returns {Promise<void>}
   */
  clearHistory: async (userId: string): Promise<void> => {
    try {
      console.log("🗑️ Clearing chat history for user:", userId);
      const API_ROUTE = import.meta.env.VITE_API_ROUTE || "";

      const response = await fetch(`${API_ROUTE}/api/chat/history`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
        credentials: "include", // Include cookies in the request
      });

      if (!response.ok) {
        console.error(
          `❌ Failed to clear chat history: ${response.status} ${response.statusText}`
        );
        throw new Error(
          `Failed to clear chat history: ${response.status} ${response.statusText}`
        );
      }

      chatService.currentSession = null;
      console.log("✨ Chat history cleared successfully");
    } catch (error) {
      console.error("❌ Error clearing chat history:", error);
      throw new Error("Failed to clear chat history. Please try again.");
    }
  },
};
