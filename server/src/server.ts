import { createApp } from "./app";
import { connectDatabase } from "./config/db";
import { env } from "./config/env";

async function start() {
  try {
    await connectDatabase();
    console.log("Connected to MongoDB");

    const app = createApp();
    app.listen(env.port, () => {
      console.log(`Server listening on port ${env.port}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

start();
