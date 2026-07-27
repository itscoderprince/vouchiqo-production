"use client";

import { useCallback, useEffect, useState } from "react";
import { getSocket } from "@/lib/socket/client";

/**
 * Custom hook to connect and manage Socket.IO client instance.
 *
 * @param {{ userId?: string, role?: string, autoConnect?: boolean }} [options]
 * @returns {{ isConnected: boolean, isAuthenticated: boolean, socket: import("socket.io-client").Socket, emit: Function }}
 */
export function useSocket(options = {}) {
  const { userId, role, autoConnect = true } = options;
  const [isConnected, setIsConnected] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const socket = getSocket({ userId, role });

  useEffect(() => {
    if (!socket || !autoConnect) return;

    if (userId) {
      socket.auth = { userId, role };
    }

    if (!socket.connected) {
      socket.connect();
    }

    function onConnect() {
      setIsConnected(true);
      setIsAuthenticated(true);
    }

    function onDisconnect(reason) {
      setIsConnected(false);
      setIsAuthenticated(false);
      if (reason === "io server disconnect") {
        // Server disconnected the socket, manual reconnect required
        socket.connect();
      }
    }

    function onConnectError(err) {
      setIsConnected(false);
      setIsAuthenticated(false);
      console.warn("[useSocket] Socket connection error:", err.message);
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("connect_error", onConnectError);

    // Initial state check
    if (socket.connected) {
      setIsConnected(true);
      setIsAuthenticated(true);
    }

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("connect_error", onConnectError);
    };
  }, [socket, userId, role, autoConnect]);

  const emit = useCallback(
    (eventName, data) => {
      if (socket && isConnected) {
        socket.emit(eventName, data);
      }
    },
    [socket, isConnected],
  );

  return { isConnected, isAuthenticated, socket, emit };
}
