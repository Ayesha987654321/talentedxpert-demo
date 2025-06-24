import { RootState } from "@/store/Store";
import {
  getSocket,
  closeSocket,
  getCurrentSocket,
} from "@/services/utils/socket";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Socket } from "socket.io-client";

const useSocket = () => {
  const token = useSelector((state: RootState) => state.auth.token);
  const user = useSelector((state: RootState) => state.user);
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    if (!token || !user?.profile?.length) {
      setSocket(null);
      closeSocket();
      return;
    }

    const profileId = user?.profile[0]?.id;
    if (token && !profileId) {
      setSocket(null);
      closeSocket();
      return;
    }

    // Get or reuse the singleton socket
    const existingSocket = getCurrentSocket();
    if (existingSocket && existingSocket.connected) {
      setSocket(existingSocket);
    } else {
      if (token && profileId && !existingSocket) {
        const newSocket = getSocket(token, profileId);
        setSocket(newSocket);
      }
    }

    // Cleanup on unmount or when token/profile changes
    return () => {
      // Avoid closing socket here to keep it alive for other components
    };
  }, [token, user]);

  return { socket };
};

export default useSocket;
