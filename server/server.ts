import "dotenv/config";
import express, { Application } from "express";
import cors, { type CorsOptions } from "cors";
import { authRoutes, profileRoutes } from "./routes";

// Constants
const app: Application = express();
const isProduction = process.env.NODE_ENV === "production";

app.set("trust proxy", 1);
const PORT = process.env.PORT || 3001;
const allowedOrigins = (process.env.CORS_ORIGIN || "http://localhost:3000")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    // Allow clients without an Origin header (e.g., curl, health checks).
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
app.disable("x-powered-by"); // Remove server framework leads like X-Powered-By: Express in response headers
app.use(cors(corsOptions));
app.use(express.json({ limit: "10kb" })); // Cap json accepted payloads at 10kb, prevents DOS or json bombs

// ---------- Security headers ----------
app.use((_req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; base-uri 'self'; frame-ancestors 'none'",
  );
  res.setHeader("Referrer-Policy", "no-referrer");
  res.setHeader("Cross-Origin-Resource-Policy", "same-site");

  // HSTS: Tell browsers to always use HTTPS for this domain.
  // Only sent in production so local dev (http://localhost) isn't affected.
  if (isProduction) {
    res.setHeader(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains; preload",
    );
  }

  next();
});

// ---------- HTTPS redirect (production only) ----------
// Railway terminates TLS at its edge and forwards HTTP internally,
// setting the X-Forwarded-Proto header. If a request somehow arrives
// without HTTPS (e.g. user types http://), redirect them.
if (isProduction) {
  app.use((req, res, next) => {
    if (req.headers["x-forwarded-proto"] !== "https") {
      res.redirect(301, `https://${req.hostname}${req.originalUrl}`);
      return;
    }
    next();
  });
}

// ---------- Health check ----------
// Railway (and other platforms) ping this to know your service is alive.
// A dedicated endpoint is better than relying on "/" because it can also
// verify downstream dependencies like the database.
app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

// API Routes
app.use("/api", authRoutes);
app.use("/api", profileRoutes);

app.get("/", (_req, res) => {
  res.send("hello world");
});

app.listen(PORT, (): void => {
  console.log(
    `Express server listening at http://localhost:${PORT} [${isProduction ? "production" : "development"}]`,
  );
});
