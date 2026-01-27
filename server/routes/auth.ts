import { Router, Response, Request } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { userRepository } from "../db/repositories/userRepository";
import { toSafeUser } from "../utils/response";

// Zod validation
import {
  loginSchema,
  registerCredentialsSchema,
  getFirstZodError,
} from "@app/shared-types";

// Types
import type { RegisterResponse, LoginResponse } from "@app/shared-types";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET;
const DUMMY_HASH = bcrypt.hashSync("dummy-password", 10);

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is required");
}

/**
 * POST /api/register
 *
 * Register a new user with username and password.
 * Validates password complexity and checks for existing usernames.
 */
router.post(
  "/register",
  async (req: Request, res: Response<RegisterResponse>): Promise<void> => {
    try {
      // 1. Validate request body with Zod
      const parseResult = registerCredentialsSchema.safeParse(req.body);
      if (!parseResult.success) {
        const firstError = getFirstZodError(parseResult.error);
        res.status(400).json({
          success: false,
          message: firstError?.message ?? "Invalid request",
          requirement: firstError?.message,
        });
        return;
      }

      const { username, password } = parseResult.data;

      // 2. Check for already existing user
      const existingUser = await userRepository.findByUsername(username);
      if (existingUser) {
        res.status(400).json({
          success: false,
          message: "User already exists",
        });
        return;
      }

      // 3. Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);

      // 4. Create new user
      const newUser = await userRepository.create(username, hashedPassword);

      // 5. Return response with data wrapper (no password)
      res.status(201).json({
        success: true,
        message: "User registered successfully",
        data: {
          user: toSafeUser(newUser),
        },
      });
    } catch (error) {
      // 6. Handle server error - log internally but return generic message
      console.error("Registration error:", error);
      res.status(500).json({
        success: false,
        message: "An error occurred during registration",
      });
    }
  },
);

/**
 * POST /api/login
 *
 * Authenticate user with username and password.
 * Returns JWT token for authenticated sessions.
 */
router.post(
  "/login",
  async (req: Request, res: Response<LoginResponse>): Promise<void> => {
    try {
      // 1. Validate request body with Zod
      const parseResult = loginSchema.safeParse(req.body);
      if (!parseResult.success) {
        const firstError = getFirstZodError(parseResult.error);
        res.status(400).json({
          success: false,
          message: firstError?.message ?? "Username and password are required.",
        });
        return;
      }

      const { username, password } = parseResult.data;

      // 2. Find user by username
      const user = await userRepository.findByUsername(username);

      // 3. Always perform password comparison (even if user doesn't exist)
      // This prevents user enumeration by making timing consistent
      let isPasswordValid = false;
      if (user) {
        isPasswordValid = await bcrypt.compare(password, user.password);
      } else {
        // Perform a dummy bcrypt comparison to maintain consistent timing
        await bcrypt.compare(password, DUMMY_HASH);
      }

      // 4. Return same error for invalid user or password (prevents enumeration)
      if (!user || !isPasswordValid) {
        res.status(401).json({
          success: false,
          message: "Invalid credentials",
        });
        return;
      }

      // 5. Create JSON Web Token
      const payload = {
        userId: user.id,
        username: user.username,
      };
      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "1h" });

      // 6. Return response with data wrapper (no password)
      res.status(200).json({
        success: true,
        message: "Login successful",
        data: {
          user: toSafeUser(user),
          token,
        },
      });
    } catch (error) {
      // 7. Handle server error - log internally but return generic message
      console.error("Login error:", error);
      res.status(500).json({
        success: false,
        message: "An error occurred during login",
      });
    }
  },
);

export default router;
