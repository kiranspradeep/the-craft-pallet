import winston from "winston";

const { combine, timestamp, printf, colorize, errors } = winston.format;

const logFormat = printf((info) => {
  const level = info.level;
  const message = String(info.message);
  const ts = info["timestamp"] as string | undefined;
  const stack = info["stack"] as string | undefined;

  return `${ts} [${level}]: ${stack || message}`;
});

export const logger = winston.createLogger({
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
  format: combine(
    colorize(),
    timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    errors({ stack: true }),
    logFormat
  ),
  transports: [new winston.transports.Console()],
});