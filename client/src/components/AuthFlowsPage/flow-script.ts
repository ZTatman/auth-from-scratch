export type FlowVariant =
  | "client"
  | "server"
  | "database"
  | "storage"
  | "idp"
  | "resource";

export type FlowProtocol = "jwt" | "oauth" | "api-key";

export type FlowTokenType =
  | "credentials"
  | "db-query"
  | "password-hash"
  | "jwt"
  | "bearer"
  | "auth-code"
  | "access-token"
  | "refresh-token"
  | "api-key";

export type FlowStepKind =
  | "request"
  | "verification"
  | "token-issued"
  | "token-storage"
  | "authenticated-request"
  | "redirect"
  | "consent"
  | "exchange";

export interface FlowParticipant {
  id: string;
  label: string;
  role: string;
  detail: string;
  laneIndex: number;
  variant: FlowVariant;
}

export interface FlowStep {
  id: string;
  from: string;
  to: string;
  title: string;
  description: string;
  detail: string;
  durationMs: number;
  pauseAfterMs: number;
  tokenType: FlowTokenType;
  kind: FlowStepKind;
  variant: FlowVariant;
  securityNote?: string;
  requestSample?: string;
  responseSample?: string;
  failurePathIds?: string[];
  requiresUserInteraction?: boolean;
}

export interface FlowDefinition {
  id: string;
  version: string;
  title: string;
  protocol: FlowProtocol;
  assumptions: string[];
  prerequisites: string[];
  whatThisProves: string[];
  participants: FlowParticipant[];
  steps: FlowStep[];
}

export type FlowRegistry = Record<string, FlowDefinition>;

const FLOW_ORDER = ["jwt-password", "oauth-auth-code", "api-key"] as const;

export const DEFAULT_FLOW_ID = FLOW_ORDER[0];

/**
 * Validate a flow definition and report structural issues.
 *
 * @param flow - Candidate flow definition
 * @returns Human-readable validation errors; empty when valid
 */
export function validateFlowDefinition(flow: FlowDefinition): string[] {
  const errors: string[] = [];
  const participantIds = new Set(
    flow.participants.map((participant) => participant.id),
  );
  const stepIds = new Set(flow.steps.map((step) => step.id));

  if (flow.participants.length === 0) {
    errors.push(`Flow "${flow.id}" must include at least one participant`);
  }

  if (flow.steps.length === 0) {
    errors.push(`Flow "${flow.id}" must include at least one step`);
  }

  for (const step of flow.steps) {
    if (!participantIds.has(step.from)) {
      errors.push(
        `Step "${step.id}" references unknown source participant "${step.from}"`,
      );
    }

    if (!participantIds.has(step.to)) {
      errors.push(
        `Step "${step.id}" references unknown target participant "${step.to}"`,
      );
    }

    if (step.durationMs <= 0) {
      errors.push(`Step "${step.id}" must have durationMs > 0`);
    }

    if (step.pauseAfterMs < 0) {
      errors.push(`Step "${step.id}" must have pauseAfterMs >= 0`);
    }

    for (const failurePathId of step.failurePathIds ?? []) {
      if (!stepIds.has(failurePathId)) {
        errors.push(
          `Step "${step.id}" references unknown failure path "${failurePathId}"`,
        );
      }
    }
  }

  return errors;
}

/**
 * Assert that a flow definition is valid for playback.
 *
 * @param flow - Flow definition to validate
 */
export function assertValidFlowDefinition(flow: FlowDefinition): void {
  const errors = validateFlowDefinition(flow);
  if (errors.length > 0) {
    throw new Error(errors.join("; "));
  }
}

export const FLOW_REGISTRY: FlowRegistry = {
  "jwt-password": {
    id: "jwt-password",
    version: "1.0.0",
    title: "JWT Password Login",
    protocol: "jwt",
    assumptions: [
      "Token storage is localStorage for demo clarity",
      "Client and API are trusted development environments",
    ],
    prerequisites: [
      "User account already exists",
      "Auth server has password hash and JWT signing key configured",
    ],
    whatThisProves: [
      "Password-based login creates a signed bearer token",
      "Authenticated API access depends on token verification, not session state",
    ],
    participants: [
      {
        id: "client",
        label: "Client (Browser)",
        role: "Requester",
        detail: "UI + API client",
        laneIndex: 0,
        variant: "client",
      },
      {
        id: "server",
        label: "Auth Server",
        role: "Issuer",
        detail: "Express + JWT middleware",
        laneIndex: 1,
        variant: "server",
      },
      {
        id: "database",
        label: "Database",
        role: "Identity Store",
        detail: "Postgres via Prisma",
        laneIndex: 2,
        variant: "database",
      },
      {
        id: "storage",
        label: "Local Storage",
        role: "Client Token Store",
        detail: "auth_token",
        laneIndex: 3,
        variant: "storage",
      },
    ],
    steps: [
      {
        id: "jwt-1",
        from: "client",
        to: "server",
        title: "Client sends login request",
        description: "Browser submits credentials to the auth server.",
        detail: "POST /auth/login with username + password.",
        durationMs: 1200,
        pauseAfterMs: 400,
        tokenType: "credentials",
        kind: "request",
        variant: "client",
        securityNote:
          "Credentials should only be sent over HTTPS to prevent interception.",
        requestSample:
          "POST /auth/login\n{ username: \"demo\", password: \"••••••••\" }",
        responseSample: "401 Unauthorized (if credentials are invalid)",
      },
      {
        id: "jwt-2",
        from: "server",
        to: "database",
        title: "Database lookup",
        description: "Server fetches the user record and password hash.",
        detail: "Prisma reads users table for the submitted username.",
        durationMs: 1100,
        pauseAfterMs: 350,
        tokenType: "db-query",
        kind: "verification",
        variant: "database",
        securityNote:
          "Lookup responses should not leak whether a username exists.",
        requestSample: "SELECT id, password_hash FROM users WHERE username = ?",
      },
      {
        id: "jwt-3",
        from: "database",
        to: "server",
        title: "Server verifies credentials",
        description: "Hash comparison determines whether login is valid.",
        detail: "bcrypt.compare(password, storedHash) runs on the auth server.",
        durationMs: 1000,
        pauseAfterMs: 350,
        tokenType: "password-hash",
        kind: "verification",
        variant: "server",
        securityNote:
          "Use timing-safe comparison and uniform error messages to reduce user enumeration.",
      },
      {
        id: "jwt-4",
        from: "server",
        to: "client",
        title: "JWT is issued",
        description: "Auth server signs and returns the JWT.",
        detail: "Response includes signed token + safe user payload.",
        durationMs: 1200,
        pauseAfterMs: 350,
        tokenType: "jwt",
        kind: "token-issued",
        variant: "server",
        securityNote:
          "JWTs should have short expiry and include issuer/audience claims.",
        responseSample:
          "200 OK\n{ token: \"<jwt>\", user: { id: 1, username: \"demo\" } }",
      },
      {
        id: "jwt-5",
        from: "client",
        to: "storage",
        title: "JWT stored in localStorage",
        description: "Client persists auth_token for session continuity.",
        detail: 'window.localStorage.setItem("auth_token", token)',
        durationMs: 900,
        pauseAfterMs: 400,
        tokenType: "jwt",
        kind: "token-storage",
        variant: "storage",
        securityNote:
          "localStorage is vulnerable to XSS; httpOnly cookies are safer in production.",
      },
      {
        id: "jwt-6",
        from: "client",
        to: "server",
        title: "Authenticated requests",
        description: "Client sends Bearer token on protected API calls.",
        detail: "Authorization: Bearer <token> on each subsequent request.",
        durationMs: 1100,
        pauseAfterMs: 700,
        tokenType: "bearer",
        kind: "authenticated-request",
        variant: "client",
        securityNote:
          "Protected routes must verify signature, expiry, issuer, and audience before authorizing.",
        requestSample:
          "GET /profile\nAuthorization: Bearer <jwt>",
      },
    ],
  },
  "oauth-auth-code": {
    id: "oauth-auth-code",
    version: "0.1.0",
    title: "OAuth 2.1 Authorization Code",
    protocol: "oauth",
    assumptions: [
      "PKCE is enabled",
      "Authorization server and resource server trust each other",
    ],
    prerequisites: [
      "OAuth client is registered with redirect URI",
      "Identity provider endpoints are configured",
    ],
    whatThisProves: [
      "Client obtains access token without handling user password directly",
    ],
    participants: [
      {
        id: "client",
        label: "Client App",
        role: "OAuth Client",
        detail: "SPA with PKCE",
        laneIndex: 0,
        variant: "client",
      },
      {
        id: "idp",
        label: "Identity Provider",
        role: "Authorization Server",
        detail: "Consent + token endpoints",
        laneIndex: 1,
        variant: "idp",
      },
      {
        id: "server",
        label: "Resource Server",
        role: "API",
        detail: "Protected resource host",
        laneIndex: 2,
        variant: "resource",
      },
    ],
    steps: [
      {
        id: "oauth-1",
        from: "client",
        to: "idp",
        title: "Client starts authorization request",
        description: "Browser is redirected to IdP with PKCE parameters.",
        detail: "GET /authorize?client_id=...&code_challenge=...",
        durationMs: 1100,
        pauseAfterMs: 400,
        tokenType: "auth-code",
        kind: "redirect",
        variant: "idp",
        requiresUserInteraction: true,
        securityNote:
          "PKCE protects the authorization code from interception attacks.",
      },
      {
        id: "oauth-2",
        from: "idp",
        to: "client",
        title: "IdP returns authorization code",
        description: "User authenticates and grants consent.",
        detail: "302 redirect with ?code=...&state=...",
        durationMs: 1000,
        pauseAfterMs: 500,
        tokenType: "auth-code",
        kind: "consent",
        variant: "idp",
        requiresUserInteraction: true,
      },
      {
        id: "oauth-3",
        from: "client",
        to: "idp",
        title: "Client exchanges code for tokens",
        description:
          "Client sends authorization code + code verifier to token endpoint.",
        detail: "POST /token with code_verifier and auth code",
        durationMs: 1200,
        pauseAfterMs: 600,
        tokenType: "access-token",
        kind: "exchange",
        variant: "client",
        securityNote:
          "State and nonce values must be validated before token exchange.",
      },
      {
        id: "oauth-4",
        from: "client",
        to: "server",
        title: "Client calls API with access token",
        description: "Resource server verifies token and returns data.",
        detail: "Authorization: Bearer <access_token>",
        durationMs: 1000,
        pauseAfterMs: 700,
        tokenType: "access-token",
        kind: "authenticated-request",
        variant: "resource",
      },
    ],
  },
  "api-key": {
    id: "api-key",
    version: "0.1.0",
    title: "API Key Authentication",
    protocol: "api-key",
    assumptions: ["Key is generated server-side and scoped to a service account"],
    prerequisites: [
      "Client has a provisioned key ID/secret",
      "Key rotation policy is available",
    ],
    whatThisProves: [
      "Server authenticates requests using key material instead of user login",
    ],
    participants: [
      {
        id: "client",
        label: "Service Client",
        role: "Caller",
        detail: "Backend job or trusted service",
        laneIndex: 0,
        variant: "client",
      },
      {
        id: "server",
        label: "API Gateway",
        role: "Validator",
        detail: "Checks key scope and quota",
        laneIndex: 1,
        variant: "server",
      },
      {
        id: "database",
        label: "Key Registry",
        role: "Store",
        detail: "Hashed keys + scopes",
        laneIndex: 2,
        variant: "database",
      },
    ],
    steps: [
      {
        id: "api-key-1",
        from: "client",
        to: "server",
        title: "Client sends API key",
        description: "Request includes key identifier and signature/header.",
        detail: "x-api-key: <key-id>.<secret-or-signature>",
        durationMs: 1000,
        pauseAfterMs: 350,
        tokenType: "api-key",
        kind: "request",
        variant: "client",
        securityNote:
          "Never ship long-lived API keys to public browser clients.",
      },
      {
        id: "api-key-2",
        from: "server",
        to: "database",
        title: "Gateway validates key",
        description: "Gateway checks key status, scope, and revocation state.",
        detail: "Lookup key hash and policy constraints",
        durationMs: 1100,
        pauseAfterMs: 400,
        tokenType: "api-key",
        kind: "verification",
        variant: "database",
      },
      {
        id: "api-key-3",
        from: "server",
        to: "client",
        title: "Authorized API response",
        description: "Request succeeds when scope and quota checks pass.",
        detail: "200 response with requested resource payload",
        durationMs: 900,
        pauseAfterMs: 600,
        tokenType: "api-key",
        kind: "authenticated-request",
        variant: "server",
      },
    ],
  },
};

/**
 * Return flow definition by ID with safe fallback to the default flow.
 *
 * @param flowId - Flow ID requested by UI
 * @returns Matching flow definition or default flow when unknown
 */
export function getFlowDefinitionById(flowId: string): FlowDefinition {
  return FLOW_REGISTRY[flowId] ?? FLOW_REGISTRY[DEFAULT_FLOW_ID];
}

/**
 * Return flow definitions in UI display order.
 *
 * @returns Ordered flow definition list
 */
export function getFlowDefinitionList(): FlowDefinition[] {
  return FLOW_ORDER.map((flowId) => FLOW_REGISTRY[flowId]);
}

for (const flow of Object.values(FLOW_REGISTRY)) {
  assertValidFlowDefinition(flow);
}

// Backward-compatible exports used by existing tests and components.
export type FlowEvent = FlowStep;
export type FlowScript = FlowDefinition;
export const JWT_FLOW_SCRIPT = FLOW_REGISTRY["jwt-password"];

/**
 * Backward-compatible validator alias.
 *
 * @param script - Flow definition to validate
 * @returns Validation errors for the flow definition
 */
export function validateFlowScript(script: FlowScript): string[] {
  return validateFlowDefinition(script);
}

/**
 * Backward-compatible assertion alias.
 *
 * @param script - Flow definition to validate
 */
export function assertValidFlowScript(script: FlowScript): void {
  assertValidFlowDefinition(script);
}
