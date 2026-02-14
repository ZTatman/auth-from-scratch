import "dotenv/config";
import express, { Application } from "express";
import cors, { type CorsOptions } from "cors";
import { authRoutes, profileRoutes } from "./routes";

// Constants
const app: Application = express();
const PORT = process.env.PORT || 3001;
const allowedOrigins = (process.env.CORS_ORIGIN || "http://localhost:3000")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error("CORS origin denied"));
  },
  credentials: true,
  methods: ["GET", "POST", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

// Middleware
app.disable("x-powered-by");
app.use(cors(corsOptions));
app.use(express.json({ limit: "10kb" }));
app.use((_req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "no-referrer");
  res.setHeader("Cross-Origin-Resource-Policy", "same-site");

  if (process.env.NODE_ENV === "production") {
    res.setHeader(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains",
    );
  }

  next();
});

// API Routes
app.use("/api", authRoutes);
app.use("/api", profileRoutes);

app.get("/", (_req, res) => {
  res.send("hello world");
});

app.listen(PORT, (): void => {
  console.log(`Express server listening at http://localhost:${PORT}`);
});
