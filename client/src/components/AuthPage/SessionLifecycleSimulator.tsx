import { useEffect, useMemo, useState, type ReactElement } from "react";

// Components
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// Hooks
import useUser from "../../hooks/useUser";

type SessionStatus = "no_session" | "active" | "expired";
type EventTone = "info" | "success" | "warning";

interface SessionEvent {
  id: string;
  timestamp: string;
  message: string;
  tone: EventTone;
}

interface JwtPayload {
  exp?: number;
  iat?: number;
}

const REFRESH_WINDOW_MS = 60 * 60 * 1000;
const EVENT_LIMIT = 5;

/**
 * Decode a base64url JWT payload into an object.
 *
 * @param token - JWT token string
 * @returns Parsed payload or null if decoding fails
 */
function decodeJwtPayload(token: string): JwtPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
    const json = atob(padded);
    const payload = JSON.parse(json) as JwtPayload;

    return payload;
  } catch {
    return null;
  }
}

/**
 * Format a duration in milliseconds into a friendly label.
 *
 * @param ms - Duration in milliseconds
 * @returns Human-readable duration string
 */
function formatDuration(ms: number): string {
  if (ms <= 0) return "00:00:00";
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return [hours, minutes, seconds]
    .map((unit) => String(unit).padStart(2, "0"))
    .join(":");
}

/**
 * Format a timestamp as 12-hour HH:MM AM/PM.
 *
 * @param timestampMs - Date timestamp in milliseconds
 * @returns Time string formatted as HH:MM AM/PM
 */
function formatTimeShort(timestampMs: number): string {
  return new Date(timestampMs).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Get token expiration time in milliseconds since epoch.
 *
 * @param token - JWT token string
 * @returns Expiration timestamp in ms or null if missing
 */
function getTokenExpirationMs(token: string): number | null {
  const payload = decodeJwtPayload(token);
  if (!payload?.exp) return null;
  return payload.exp * 1000;
}

/**
 * Panel that simulates token expiry, refresh, and time travel for demos.
 */
export function SessionLifecycleSimulator(): ReactElement {
  const { authToken, logout } = useUser();

  const [timeOffsetMs, setTimeOffsetMs] = useState<number>(0);
  const [simulatedExpMs, setSimulatedExpMs] = useState<number | null>(null);
  const [forcedExpired, setForcedExpired] = useState<boolean>(false);
  const [events, setEvents] = useState<SessionEvent[]>([]);
  const [, setTick] = useState<number>(0);

  const nowMs = Date.now() + timeOffsetMs;

  useEffect(() => {
    if (!authToken) {
      setSimulatedExpMs(null);
      setForcedExpired(false);
      setTimeOffsetMs(0);
      return;
    }

    const expMs = getTokenExpirationMs(authToken);
    setSimulatedExpMs(expMs);
    setForcedExpired(false);
    setTimeOffsetMs(0);
  }, [authToken]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTick((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const effectiveExpMs = forcedExpired ? nowMs - 1000 : simulatedExpMs;
  const status: SessionStatus = useMemo(() => {
    if (!authToken) return "no_session";
    if (effectiveExpMs && nowMs >= effectiveExpMs) return "expired";
    if (forcedExpired) return "expired";
    return "active";
  }, [authToken, effectiveExpMs, forcedExpired, nowMs]);

  const remainingMs = effectiveExpMs ? Math.max(effectiveExpMs - nowMs, 0) : 0;

  const statusMeta = {
    no_session: { label: "No Session", variant: "outline" as const },
    active: { label: "Active", variant: "default" as const },
    expired: { label: "Expired", variant: "destructive" as const },
  };

  const pushEvent = (message: string, tone: EventTone) => {
    const event: SessionEvent = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      timestamp: new Date().toLocaleTimeString(),
      message,
      tone,
    };
    setEvents((prev) => [event, ...prev].slice(0, EVENT_LIMIT));
  };

  const handleAdvanceTime = (ms: number) => {
    setTimeOffsetMs((prev) => prev + ms);
    pushEvent(`Advanced time by ${formatDuration(ms)}.`, "info");
  };

  const handleExpireNow = () => {
    if (!authToken) {
      pushEvent("No session to expire.", "warning");
      return;
    }
    setForcedExpired(true);
    pushEvent("Forced token expiration (simulated).", "warning");
  };

  const handleRefresh = () => {
    if (!authToken) {
      pushEvent("No session to refresh.", "warning");
      return;
    }
    setForcedExpired(false);
    setSimulatedExpMs(nowMs + REFRESH_WINDOW_MS);
    pushEvent("Simulated refresh: new expiry issued.", "success");
  };

  const handleReset = () => {
    setTimeOffsetMs(0);
    setForcedExpired(false);
    setSimulatedExpMs(authToken ? getTokenExpirationMs(authToken) : null);
    pushEvent("Simulation reset to real time.", "info");
  };

  const handleSimulateRequest = () => {
    if (!authToken) {
      pushEvent("No session: redirect to /auth.", "warning");
      return;
    }
    if (status === "expired") {
      pushEvent("Token expired: client logs out.", "warning");
      logout();
      return;
    }
    pushEvent("Protected request allowed (token valid).", "success");
  };

  const expLabel = effectiveExpMs
    ? formatTimeShort(effectiveExpMs)
    : "Unknown";

  return (
    <div className="space-y-4 rounded-lg bg-muted/40 p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-foreground">
            Session Lifecycle Simulator
          </h3>
          <p className="text-muted-foreground text-xs">
            Advance time, expire tokens, and simulate refresh behavior.
          </p>
        </div>
        <Badge variant={statusMeta[status].variant}>
          {statusMeta[status].label}
        </Badge>
      </div>

      <div className="grid gap-2 text-xs text-muted-foreground">
        <div className="flex items-center justify-between">
          <span>Simulated time</span>
          <span className="font-medium text-foreground">
            {formatTimeShort(nowMs)}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span>Token expiry (simulated)</span>
          <span className="font-medium text-foreground">{expLabel}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Time remaining</span>
          <span className="font-medium text-foreground">
            {status === "active" && effectiveExpMs
              ? formatDuration(remainingMs)
              : "—"}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span>Time offset</span>
          <span className="font-medium text-foreground">
            {timeOffsetMs === 0
              ? "0m"
              : `${timeOffsetMs > 0 ? "+" : "-"}${formatDuration(
                  Math.abs(timeOffsetMs),
                )}`}
          </span>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="secondary" onClick={() => handleAdvanceTime(15 * 60 * 1000)}>
          +15m
        </Button>
        <Button size="sm" variant="secondary" onClick={() => handleAdvanceTime(60 * 60 * 1000)}>
          +1h
        </Button>
        <Button size="sm" variant="secondary" onClick={() => handleAdvanceTime(6 * 60 * 60 * 1000)}>
          +6h
        </Button>
        <Button size="sm" variant="outline" onClick={handleExpireNow}>
          Expire now
        </Button>
        <Button size="sm" onClick={handleRefresh}>
          Refresh token
        </Button>
        <Button size="sm" variant="ghost" onClick={handleReset}>
          Reset
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm" variant="outline" onClick={handleSimulateRequest}>
          Simulate protected request
        </Button>
        <span className="text-muted-foreground text-[11px]">
          Uses the simulated clock; expired sessions log out on request.
        </span>
      </div>

      <div>
        <div className="mb-2 text-xs font-semibold text-foreground">
          Recent events
        </div>
        {events.length === 0 ? (
          <p className="text-muted-foreground text-xs">
            No simulation events yet.
          </p>
        ) : (
          <div className="space-y-2">
            {events.map((event) => (
              <div
                key={event.id}
                className="flex items-start justify-between gap-3 rounded-md bg-background px-3 py-2 text-xs shadow-sm"
              >
                <div className="flex-1 text-foreground">{event.message}</div>
                <span className="text-muted-foreground shrink-0">
                  {event.timestamp}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
