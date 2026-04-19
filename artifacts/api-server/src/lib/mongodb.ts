import mongoose from "mongoose";
import { logger } from "./logger";

const MONGODB_URI = process.env["MONGODB_URI"];

let isConnected = false;

export async function connectMongoDB(): Promise<void> {
  if (!MONGODB_URI) {
    logger.warn("MONGODB_URI is not set — MongoDB-dependent features (auth) will be unavailable");
    return;
  }

  if (isConnected) return;

  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    isConnected = true;
    logger.info("MongoDB connected successfully");
  } catch (err) {
    logger.error({ err }, "MongoDB connection failed");
    throw err;
  }
}

mongoose.connection.on("disconnected", () => {
  isConnected = false;
  logger.warn("MongoDB disconnected");
});

mongoose.connection.on("reconnected", () => {
  isConnected = true;
  logger.info("MongoDB reconnected");
});
