"use client";

import { createContext, useContext } from "react";
import { useSocket } from "@/hooks/use-socket";
import { useUser } from "@/hooks/use-user";

const SocketContext = createContext({
  socket: null,
  isConnected: false,
  isAuthenticated: false,
  emit: () => {},
});

export function SocketProvider({ children }) {
  const { user } = useUser();
  const socketState = useSocket({
    userId: user?.id || user?._id,
    role: user?.role || "customer",
    autoConnect: true,
  });

  return (
    <SocketContext.Provider value={socketState}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocketContext() {
  return useContext(SocketContext);
}
