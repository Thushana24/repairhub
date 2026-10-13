import type { ErrorRequestHandler, RequestHandler } from "express";
import { AppError } from "../utils/AppError";
import { logger } from "../config/logger";

export const notFound: RequestHandler = (req, _res, next) => {
  next(new AppError(404, `Route not found: ${req.method} ${req.originalUrl}`));
};

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof AppError) {
    res
      .status(err.status)
      .json({ success: false, message: err.message, errors: err.errors });
    return;
  }
  logger.error(err);
  res.status(500).json({ success: false, message: "Something went wrong" });
};
