import { io } from "socket.io-client";

let socket = null;

//this is a connect socket action not a event
export const connectSocket = (options = {}) => {
  if (!socket) {
    socket = io(import.meta.env.VITE_BASE_URL, {
      withCredentials: true,
      transports: ["websocket"],
      ...options,
    });
  }
  return socket;
};

export const getSocket = () => socket;

////this is a disconnect socket action not a event
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
