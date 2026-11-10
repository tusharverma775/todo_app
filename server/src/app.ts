import express, { Application } from "express";
import cors from "cors";
import taskRoutes from "./routes/task.routes";
import { notFoundHandler, errorHandler } from "./middlewares/errorHandler";
import { env } from "./config/env";

export function createApp(): Application {
  const app = express();

  app.use(cors({ origin: env.clientUrl }));
  app.use(express.json());

  app.get("/health", (_req, res) => {
    res.status(200).json({ success: true, message: "OK" });
  });

  app.use("/tasks", taskRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
