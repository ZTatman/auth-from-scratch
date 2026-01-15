import "dotenv/config";
import express, { Request, Response, Application } from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt, { Secret } from "jsonwebtoken";
import { userRepository } from "./db/repositories/userRepository";

// Types
import type {
  RegisterResponse,
  LoginResponse,
  SafeUser,
} from "@app/shared-types";
import type { JwtPayload, AuthCredentials } from "./types";
import type { User } from "./generated/prisma/client";

// Constants
const app: Application = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET;
const DUMMY_HASH = bcrypt.hashSync("dummy-password", 10);

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is required");
}

// Middleware
app.use(cors());
app.use(express.json());

/**
 * Helper function to strip password from user object and convert Date to string for JSON
 * @param user - The user object to convert
 * @returns The safe user object
 */
function toSafeUser(user: User): SafeUser {
  return {
    id: user.id,
    username: user.username,
    createAt: user.createAt.toISOString(),
  };
}

/**
 * Helper function to validate the password
 * @param password - The password to validate
 * @returns The validation message
 */
function validatePassword(password: string): string {
  if (password.length < 8) {
    return "Password must be at least 8 characters long";
  }
  if (!/[A-Z]/.test(password)) {
    return "Password must contain at least one uppercase letter";
  }
  if (!/[a-z]/.test(password)) {
    return "Password must contain at least one lowercase letter";
  }
  if (!/\d/.test(password)) {
    return "Password must contain at least one number";
  }
  if (!/[@$!%*?&]/.test(password)) {
    return "Password must contain at least one special character (@, $, !, %, *, ?, &)";
  }
  return "";
}

app.post(
  "/register",
  async (req: Request, res: Response<RegisterResponse>): Promise<void> => {
    try {
      const { username, password } = req.body as AuthCredentials;

      if (!username || !password) {
        res.status(400).json({
          success: false,
          message: "Username and password are required",
        });
        return;
      }

      // 1. Check password validation requirements
      const validationMessage = validatePassword(password);
      if (validationMessage) {
        res.status(400).json({
          success: false,
          message: validationMessage,
          requirement: validationMessage,
        });
        return;
      }

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
      // 6. Handle server error
      console.error(error);
      res.status(500).json({
        success: false,
        message:
          error instanceof Error ? error.message : "Unknown error occurred",
      });
    }
  },
);

app.post(
  "/login",
  async (req: Request, res: Response<LoginResponse>): Promise<void> => {
    try {
      const { username, password } = req.body as AuthCredentials;

      // 1. Validate request body
      if (!username || !password) {
        res.status(400).json({
          success: false,
          message: "Username and password are required.",
        });
        return;
      }

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
      const payload: JwtPayload = {
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
      // 7. Handle server error
      console.error(error);
      res.status(500).json({
        success: false,
        message:
          error instanceof Error ? error.message : "Unknown error occurred",
      });
    }
  },
);

app.get("/", (_req: Request, res: Response): void => {
  res.send("hello world");
});

app.listen(PORT, (): void => {
  console.log(`Express server listening at http://localhost:${PORT}`);
});
