import "dotenv/config";
import express, { Request, Response, Application } from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt, { Secret } from "jsonwebtoken";
import { userRepository } from "./db/repositories/userRepository";

const app: Application = express();

const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET as Secret;

// Middleware
app.use(cors());
app.use(express.json());

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

app.post("/register", async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password } = req.body as {
      username: string;
      password: string;
    };

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
    // const existingUser = users.find((user) => user.username === username);
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

    // 4. Create new user and store
    // const newUser: User = {
    //   id: crypto.randomUUID(),
    //   username,
    //   _createdAt: new Date().toISOString(),
    //   password: hashedPassword,
    // };
    // users.push(newUser);
    const newUser = await userRepository.create(username, hashedPassword);
    console.log(":: new user created!: ", newUser);
    // 5. Return response
    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: newUser,
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
});

app.post("/login", async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password } = req.body as {
      username: string;
      password: string;
    };

    // 1. Find user by username
    const user = await userRepository.findByUsername(username);

    // 2. Always perform password comparison (even if user doesn't exist)
    // This prevents user enumeration by making timing consistent
    let isPasswordValid = false;
    if (user) {
      isPasswordValid = await bcrypt.compare(password, user.password);
    } else {
      // Perform a dummy bcrypt comparison with a fake hash to maintain consistent timing
      // This prevents attackers from determining if a user exists based on response time
      await bcrypt.compare(
        password,
        "$2a$10$dummy.hash.to.prevent.timing.attacks",
      );
    }

    // 3. Return same error message for both invalid user and invalid password
    // This prevents user enumeration attacks
    if (!user || !isPasswordValid) {
      res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
      return;
    }

    // 4. Create JSON Web Token
    const token = jwt.sign(
      { userId: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: "1h" },
    );

    // 5. Return response
    res.status(200).json({
      success: true,
      message: "Login successful",
      user,
      token,
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
});

app.get("/", (_req: Request, res: Response): void => {
  res.send("hello world");
});

app.listen(PORT, (): void => {
  console.log(`Express server listening at http://localhost:${PORT}`);
});
