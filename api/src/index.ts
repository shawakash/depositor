import express, { Request, Response } from "express";
import { API_PORT } from "./config";
import cors from "cors";
import { v1Router } from "./router/v1";
import { loggingMiddleware } from "./utils/logger";
import { logger } from "@repo/common";

const corsOptions = {
  origin: "*",
  optionsSuccessStatus: 200,
};

cors(corsOptions);

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(loggingMiddleware);

app.get("/", (_req: Request, res: Response) => {
  return res.status(200).json({
    time: new Date().toISOString(),
    uptime: process.uptime(),
    status: "ok",
  });
});

app.get("/_health", (_req: Request, res: Response) => {
  return res.status(200).json({
    uptime: process.uptime(),
    message: "OK",
    timestamp: Date.now(),
  });
});

app.use("/v1", v1Router);

app.listen(API_PORT, () => {
  logger.info(`Server is running on port: ${API_PORT}`);
});
