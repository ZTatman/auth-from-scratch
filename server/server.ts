import "dotenv/config";
import express, {
  Application,
  NextFunction,
  Request,
  Response,
} from "express";
import cors, { type CorsOptions } from "cors";
import helmet from "helmet";
import { authRoutes, profileRoutes } from "./routes";

// Constants
const app: Application = express();
const IS_PRODUCTION = process.env.NODE_ENV === "production";
const PUBLIC_HOST = process.env.PUBLIC_HOST;

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

app.use(
  helmet({
    // Enable CSP in production (default Helmet policy), keep it disabled in non-production if needed.
    contentSecurityPolicy: IS_PRODUCTION ? undefined : false,
    strictTransportSecurity: IS_PRODUCTION,
  }),
);

// ---------- HTTPS redirect (production only) ----------
// Railway terminates TLS at its edge and forwards HTTP internally,
// setting the X-Forwarded-Proto header. If a request somehow arrives
// without HTTPS (e.g. user types http://), redirect them.
if (IS_PRODUCTION) {
  /**
   * Redirect plaintext requests to the canonical HTTPS origin in production.
   *
   * @param req - The incoming Express request
   * @param res - The Express response used for redirects or errors
   * @param next - The next middleware in the pipeline
   * @returns `void`
   */
  app.use((req: Request, res: Response, next: NextFunction): void => {
    if (!req.secure) {
      const host = PUBLIC_HOST ?? req.get("host");
      if (!host) {
        res
          .status(400)
          .json({ success: false, message: "Missing host header" });
        return;
      }

      res.redirect(308, `https://${host}${req.originalUrl}`);
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
    `Express server listening at http://localhost:${PORT} [${IS_PRODUCTION ? "production" : "development"}]`,
  );
});
