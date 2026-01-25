import "dotenv/config";
import express, { Application } from "express";
import cors from "cors";
import { authRoutes, profileRoutes } from "./routes";

// Constants
const app: Application = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use("/api", authRoutes);
app.use("/api", profileRoutes);

app.get("/", (_req, res) => {
  res.send("hello world");
});

app.listen(PORT, (): void => {
  console.log(`Express server listening at http://localhost:${PORT}`);
});
