import dotenv from "dotenv";

dotenv.config();

interface Env {
  mongodbUri: string;
  port: number;
  nodeEnv: string;
  clientUrl: string;
}

function readEnv(): Env {
  const mongodbUri = process.env.MONGODB_URI;
  if (!mongodbUri) {
    throw new Error("Missing required environment variable: MONGODB_URI");
  }

  return {
    mongodbUri,
    port: Number(process.env.PORT) || 5000,
    nodeEnv: process.env.NODE_ENV || "development",
    clientUrl: process.env.CLIENT_URL || "http://localhost:5173"
  };
}

export const env = readEnv();
