import { Server } from "socket.io";

let io;
export function initializeSocket(server) {
  io = new Server(server, {
    cors: {
      origin: ["http://localhost:5173", "https://uber-seven-beta.vercel.app"], // your frontend (Vite, React, etc.)
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log(
      `user is connected to socket and user SocketId is :${socket.id}`,
    );
  });
}
