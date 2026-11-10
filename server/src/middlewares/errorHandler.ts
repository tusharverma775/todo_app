import { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/AppError";

export function notFoundHandler(_req: Request, res: Response): void {
  res.status(404).json({
    success: false,
    message: "Route not found"
  });
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(err.errors ? { errors: err.errors } : {})
    });
    return;
  }

  if (err && typeof err === "object" && "name" in err && err.name === "CastError") {
    res.status(400).json({
      success: false,
      message: "Invalid identifier supplied"
    });
    return;
  }

  console.error(err);
  res.status(500).json({
    success: false,
    message: "Internal server error"
  });
}
