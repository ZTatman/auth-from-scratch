import { Router, Response } from "express";
import rateLimit from "express-rate-limit";
import { userRepository } from "../db/repositories/userRepository";
import { toSafeUser } from "../utils/response";
import {
  authenticateToken,
  type AuthenticatedRequest,
} from "../middleware/auth";

// Types
import type { DeleteAccountResponse, ProfileResponse } from "@app/shared-types";

const router = Router();

const profileRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 profile requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many profile requests from this IP, please try again later",
  },
});

/**
 * GET /api/profile
 *
 * Retrieves the current user's profile information.
 * This route is protected by JWT authentication middleware.
 * Returns user data excluding sensitive information like passwords.
 */
router.get(
  "/profile",
  profileRateLimiter,
  authenticateToken,
  async (
    req: AuthenticatedRequest,
    res: Response<ProfileResponse>,
  ): Promise<void> => {
    try {
      // Extract userId from the JWT payload
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: "User ID not found in token",
        });
        return;
      }

      // Fetch user from database using the ID from JWT
      const user = await userRepository.findById(userId);

      if (!user) {
        res.status(404).json({
          success: false,
          message: "User not found",
        });
        return;
      }

      // Return safe user data without sensitive information
      res.status(200).json({
        success: true,
        message: "Profile retrieved successfully",
        data: toSafeUser(user),
      });
    } catch (error) {
      console.error("Profile retrieval error:", error);
      // Return generic error message to avoid leaking internal details (DB schema, etc.)
      res.status(500).json({
        success: false,
        message: "An error occurred while retrieving your profile",
      });
    }
  },
);

/**
 * DELETE /api/profile
 *
 * Deletes the authenticated user's account.
 * This route is protected by JWT authentication middleware.
 */
router.delete(
  "/profile",
  profileRateLimiter,
  authenticateToken,
  async (
    req: AuthenticatedRequest,
    res: Response<DeleteAccountResponse>,
  ): Promise<void> => {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: "User ID not found in token",
        });
        return;
      }

      await userRepository.delete(userId);

      res.status(200).json({
        success: true,
        message: "Account deleted successfully",
        data: { userId },
      });
    } catch (error) {
      console.error("Account deletion error:", error);
      res.status(500).json({
        success: false,
        message: "An error occurred while deleting your account",
      });
    }
  },
);

export default router;
