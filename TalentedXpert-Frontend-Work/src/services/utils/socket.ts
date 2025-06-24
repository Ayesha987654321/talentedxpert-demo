import { io, Socket } from "socket.io-client";
import { SOCKET_URL } from "../requests/requests";

let socketInstance: Socket | null = null;

export const getSocket = (token: string, profileId: string): Socket | null => {
  if (socketInstance && socketInstance.connected) {
    return socketInstance;
  }

  try {
    console.log(SOCKET_URL)
    socketInstance = io(`${SOCKET_URL}`, {
      auth: { token, profileId },
      autoConnect: true,
      transports: ["websocket"],
      query: {
        profileId: profileId,
      },
    });

    socketInstance.on("connect", () => {
      console.log("Socket connected:", socketInstance?.id);
    });

    socketInstance.on("connect_error", (err) => {
      console.error("Socket connection error:", err);
      socketInstance = null;
    });

    socketInstance.on("disconnect", () => {
      console.log("Socket disconnected");
    });

    return socketInstance;
  } catch (err) {
    console.error("Failed to create socket:", err);
    return null;
  }
};

export const closeSocket = () => {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }
};

export const getCurrentSocket = (): Socket | null => {
  return socketInstance;
};
