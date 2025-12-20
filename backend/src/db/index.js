import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";
import config from "../config/config.js";
const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${config.get("MONGODB_URL")}/${DB_NAME}`,
    );
    console.log(`MongoDB connected: ${connectionInstance.connection.host}`);
  } catch (error) {
    console.log(" MONGODB Connection Failed:", error.message);
    console.warn(
      "Please check your MongoDB connection string and ensure the database is running.",
    );
    process.exit(1); // Exit the process with failure
  }
};

export default connectDB;
