import { useState, useEffect, useRef, useCallback } from "react";

export interface ChatMessage {
  id: string;
  content: string;
  timestamp: Date;
  sender: string;
}

export interface UseWebSocketReturn {
  messages: ChatMessage[];
  connectionStatus: "connecting" | "connected" | "disconnected" | "error";
  sendMessage: (content: string) => void;
  connect: () => void;
  disconnect: () => void;
}

export const useWebSocket = (
  url: string = "ws://localhost:8080/ws",
): UseWebSocketReturn => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<
    "connecting" | "connected" | "disconnected" | "error"
  >("disconnected");
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<number>();

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    setConnectionStatus("connecting");

    try {
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log("WebSocket connected");
        setConnectionStatus("connected");
      };

      ws.onmessage = (event) => {
        console.log("Received message:", event.data);

        // For now, treat all messages as simple text
        // Later you can parse JSON messages here
        const newMessage: ChatMessage = {
          id: Date.now().toString(),
          content: event.data,
          timestamp: new Date(),
          sender: "other", // You'll want to determine this properly later
        };

        setMessages((prev) => [...prev, newMessage]);
      };

      ws.onclose = (event) => {
        console.log("WebSocket closed:", event.code, event.reason);
        setConnectionStatus("disconnected");
        wsRef.current = null;

        // Auto-reconnect after 3 seconds if not manually disconnected
        if (event.code !== 1000) {
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, 3000);
        }
      };

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        setConnectionStatus("error");
      };
    } catch (error) {
      console.error("Failed to create WebSocket:", error);
      setConnectionStatus("error");
    }
  }, [url]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    if (wsRef.current) {
      wsRef.current.close(1000, "Manual disconnect");
      wsRef.current = null;
    }
    setConnectionStatus("disconnected");
  }, []);

  const sendMessage = useCallback((content: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(content);

      // Add our own message to the list
      const newMessage: ChatMessage = {
        id: Date.now().toString(),
        content,
        timestamp: new Date(),
        sender: "me",
      };
      setMessages((prev) => [...prev, newMessage]);
    } else {
      console.warn("WebSocket is not connected");
    }
  }, []);

  // Auto-connect on mount
  useEffect(() => {
    connect();

    // Cleanup on unmount
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    messages,
    connectionStatus,
    sendMessage,
    connect,
    disconnect,
  };
};
