import React, { useState, useRef, useEffect } from "react";
import { useWebSocket, ChatMessage } from "../hooks/useWebSocket";

export const ChatComponent: React.FC = () => {
  const { messages, connectionStatus, sendMessage, connect, disconnect } =
    useWebSocket();
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && connectionStatus === "connected") {
      sendMessage(inputValue.trim());
      setInputValue("");
    }
  };

  const getStatusColor = () => {
    switch (connectionStatus) {
      case "connected":
        return "text-green-500";
      case "connecting":
        return "text-yellow-500";
      case "error":
        return "text-red-500";
      default:
        return "text-gray-500";
    }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case "connected":
        return "Connected";
      case "connecting":
        return "Connecting...";
      case "disconnected":
        return "Disconnected";
      case "error":
        return "Connection Error";
      default:
        return "Unknown";
    }
  };

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto bg-white shadow-lg">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">Chat Application</h1>
        <div className="flex items-center gap-4">
          <span className={`text-sm ${getStatusColor()}`}>
            ● {getStatusText()}
          </span>
          <div className="flex gap-2">
            <button
              onClick={connect}
              disabled={
                connectionStatus === "connected" ||
                connectionStatus === "connecting"
              }
              className="px-3 py-1 bg-green-500 text-white rounded text-sm disabled:bg-gray-400"
            >
              Connect
            </button>
            <button
              onClick={disconnect}
              disabled={connectionStatus === "disconnected"}
              className="px-3 py-1 bg-red-500 text-white rounded text-sm disabled:bg-gray-400"
            >
              Disconnect
            </button>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            No messages yet. Start a conversation!
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === "me" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.sender === "me"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-gray-800"
                }`}
              >
                <div className="text-sm">{message.content}</div>
                <div className="text-xs opacity-75 mt-1">
                  {message.timestamp.toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={handleSendMessage} className="p-4 border-t bg-gray-50">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={
              connectionStatus === "connected"
                ? "Type your message..."
                : "Connect to start chatting"
            }
            disabled={connectionStatus !== "connected"}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
          />
          <button
            type="submit"
            disabled={connectionStatus !== "connected" || !inputValue.trim()}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 transition-colors"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
};
