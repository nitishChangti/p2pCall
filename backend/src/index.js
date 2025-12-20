// import dotenv from 'dotenv'
// dotenv.config()
import "./bootstrap.js";
import { createServer } from "node:http";
import { app } from "./app.js";
const server = createServer(app);
import { initializeSocket } from "./socket.js";
initializeSocket(server);
import connectDB from "./db/index.js";

connectDB()
  .then(() => {
    app.on("error", (err) => {
      console.error("Server error:", err);
    });
    server.listen(process.env.PORT, () => {
      console.log(
        `Server with socket.io is running on port ${process.env.PORT}`,
      );
    });
  })
  .catch((error) => {
    console.warn("MONGODB db connection failed !!!", error.message);
    console.log("MONGODB db connection failed !!!", error);
  });
