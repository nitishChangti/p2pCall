import express from "express";
const app = express();
import User from "./routes/user.routes.js";
import cors from "cors";
app.use(
  cors({
    origin: [
      `http://localhost:5173`, // Your frontend on Vercel
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);

import cookieParser from "cookie-parser";
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/users", User);

// Add this route before your error handlers
app.get("/socket-health", (req, res) => {
  res.json({
    message: "Socket.IO server is running",
    endpoint: `http://localhost:${process.env.PORT || 3000}`,
    socketPath: "/socket.io",
    transports: ["websocket", "polling"],
  });
});

export { app };
