import { logger } from "@repo/common";
import { Request, Response, NextFunction } from "express";

export const loggingMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const logData = {
    ip: req.ip,
    userAgent: req.get("user-agent"),
    params: req.params,
    query: req.query,
    body: req.body,
  };

  logger.info(`${req.method} ${req.url}`, { metadata: logData });

  next();
};
