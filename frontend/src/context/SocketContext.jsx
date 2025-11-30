import React, { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    console.warn("useSocket used outside SocketProvider - returning null");
    return null;
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user) {
      console.log("🔄 Initializing Socket.io connection...");

      // ✅ FIX: Use Vite environment variable or fallback
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
      console.log("🔗 Connecting to:", API_URL);

      // Connect to Socket.io server
      const newSocket = io(API_URL, {
        auth: {
          userId: user.id,
          role: user.role,
        },
        transports: ["websocket", "polling"],
      });

      setSocket(newSocket);

      // Join appropriate room based on user role
      if (user.role === "driver") {
        newSocket.emit("join-driver-room", user.id);
        console.log(`🚚 Driver ${user.id} joined driver room`);
      } else if (user.role === "customer") {
        newSocket.emit("join-customer-room", user.id);
        console.log(`📦 Customer ${user.id} joined customer room`);
      }

      // Connection events
      newSocket.on("connect", () => {
        console.log("✅ Connected to server via Socket.io");
      });

      newSocket.on("disconnect", (reason) => {
        console.log("❌ Disconnected from server:", reason);
      });

      newSocket.on("connect_error", (error) => {
        console.error("🚨 Socket connection error:", error);
      });

      // Cleanup on unmount
      return () => {
        console.log("🧹 Cleaning up Socket.io connection");
        newSocket.close();
      };
    } else {
      // Disconnect if not authenticated
      if (socket) {
        socket.close();
        setSocket(null);
      }
    }
  }, [isAuthenticated, user?.id, user?.role]);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};
