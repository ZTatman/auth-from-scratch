import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface TokenExpiredError extends Error {
  name: "TokenExpiredError";
  message: string;
  expiredAt: string;
}

// Types
import type { JwtPayload } from "../types";

/**
 * Extends the Express Request interface to include authenticated user information.
 */
export interface AuthenticatedRequest extends Request {
  /** JWT payload containing user information */
  user?: JwtPayload;
}

/**
 * Middleware to verify JWT tokens in incoming requests.
 *
 * Extracts the JWT token from the Authorization header, validates it using the JWT_SECRET,
 * and attaches the decoded payload to the request object. Returns appropriate error responses
 * for missing or invalid tokens.
 *
 * @param req - The Express request object, extended with AuthenticatedRequest interface
 * @param res - The Express response object
 * @param next - The Express next function to pass control to the next middleware
 */
export const authenticateToken = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): void => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1]; // Extract token from "Bearer <token>"

  if (!token) {
    res.status(401).json({
      success: false,
      message: "Access token required",
    });
    return;
  }

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    res.status(500).json({
      success: false,
      message: "Server configuration error",
    });
    return;
  }

  jwt.verify(token, jwtSecret, (err, decoded) => {
    if (err) {
      if (err.name === "TokenExpiredError") {
        res.status(401).json({
          success: false,
          message: "Token expired",
        });
        return;
      }

      res.status(403).json({
        success: false,
        message: "Invalid token",
      });
      return;
    }

    // Validate payload structure before assigning to prevent undefined values
    if (
      typeof decoded === "object" &&
      decoded !== null &&
      "userId" in decoded &&
      "username" in decoded &&
      typeof decoded.userId === "string" &&
      typeof decoded.username === "string"
    ) {
      req.user = decoded as JwtPayload;
      next();
    } else {
      res.status(403).json({
        success: false,
        message: "Invalid token payload",
      });
    }
  });
};
