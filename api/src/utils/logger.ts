import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import path from "path";
import { Request, Response, NextFunction } from "express";

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

const colors = {
  error: "red",
  warn: "yellow",
  info: "green",
  http: "magenta",
  debug: "blue",
};

winston.addColors(colors);

const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss:ms" }),
  winston.format.colorize({ all: true }),
  winston.format.printf((info) => {
    const { timestamp, level, message, metadata = {}, stack } = info;
    let log = `${timestamp} ${level}: ${message}`;

    if (
      metadata &&
      typeof metadata === "object" &&
      Object.keys(metadata).length > 0
    ) {
      log += ` ${JSON.stringify(metadata)}`;
    }

    if (stack) {
      log += `\n${stack}`;
    }

    return log;
  }),
);

const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss:ms" }),
  winston.format.errors({ stack: true }),
  winston.format.metadata({
    fillExcept: ["message", "level", "timestamp", "label"],
  }),
  winston.format.printf((info) => {
    const { timestamp, level, message, metadata = {}, stack } = info;
    let log = `${timestamp} [${level.toUpperCase()}] ${message}`;

    if (
      metadata &&
      typeof metadata === "object" &&
      Object.keys(metadata).length > 0
    ) {
      log += ` ${JSON.stringify(metadata)}`;
    }

    if (stack) {
      log += `\n${stack}`;
    }

    return log;
  }),
);

const transports = [
  new winston.transports.Console({
    format: consoleFormat,
  }),

  new DailyRotateFile({
    filename: path.join("logs", "error-%DATE%.log"),
    datePattern: "YYYY-MM-DD",
    level: "error",
    format: fileFormat,
    maxSize: "20m",
    maxFiles: "14d",
  }),

  new DailyRotateFile({
    filename: path.join("logs", "combined-%DATE%.log"),
    datePattern: "YYYY-MM-DD",
    format: fileFormat,
    maxSize: "20m",
    maxFiles: "14d",
  }),
];

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  levels,
  transports,
});

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

export default logger;
