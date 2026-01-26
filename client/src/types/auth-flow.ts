// ============================================
// AUTH FLOW VISUALIZATION TYPES
// ============================================

/**
 * Status of an individual auth flow step.
 */
export type AuthStepStatus = "pending" | "in_progress" | "success" | "error";

/**
 * Step definition with label and description.
 */
export interface StepDefinition {
  id: string;
  label: string;
  description: string;
}

/**
 * Represents a single step in the authentication flow visualization.
 */
export interface AuthStep {
  id: string;
  label: string;
  description: string;
  status: AuthStepStatus;
  detail?: string;
  timestamp?: string;
}

/**
 * Request details captured for the inspector.
 */
export interface RequestDetails {
  method: string;
  url: string;
  headers: Record<string, string>;
  body: Record<string, unknown>;
}

/**
 * Response details captured for the inspector.
 */
export interface ResponseDetails {
  status: number;
  statusText: string;
  body: Record<string, unknown>;
}

/**
 * Complete auth flow entry with steps and request/response details.
 */
export interface AuthFlowEntry {
  id: string;
  type: "login" | "register";
  timestamp: string;
  status: "pending" | "success" | "error";
  steps: AuthStep[];
  request?: RequestDetails;
  response?: ResponseDetails;
  token?: string;
  message?: string;
}

/**
 * Login flow steps with educational descriptions.
 */
export const LOGIN_FLOW_STEPS: StepDefinition[] = [
  {
    id: "request",
    label: "Request Sent",
    description: "Client sends {username, password} to /api/login",
  },
  {
    id: "validate",
    label: "Finding User",
    description: "Database lookup by username",
  },
  {
    id: "process",
    label: "Verifying Password",
    description: "bcrypt compares password against stored hash",
  },
  {
    id: "token",
    label: "Creating Token",
    description: "JWT generated with userId, username, 1hr expiry",
  },
  {
    id: "store",
    label: "Storing Token",
    description: "Token saved to localStorage for future requests",
  },
];

/**
 * Registration flow steps with educational descriptions.
 */
export const REGISTER_FLOW_STEPS: StepDefinition[] = [
  {
    id: "request",
    label: "Request Sent",
    description: "Client sends {username, password} to /api/register",
  },
  {
    id: "validate",
    label: "Validating Input",
    description: "Server checks username format and password requirements",
  },
  {
    id: "check_user",
    label: "Checking Username",
    description: "Database query to verify username isn't taken",
  },
  {
    id: "hash",
    label: "Hashing Password",
    description: "bcrypt converts password to secure hash (10 salt rounds)",
  },
  {
    id: "create",
    label: "Creating User",
    description: "New user record saved to database",
  },
];

/**
 * Create initial steps for a login flow.
 */
export function createLoginSteps(): AuthStep[] {
  return LOGIN_FLOW_STEPS.map((step) => ({
    id: step.id,
    label: step.label,
    description: step.description,
    status: "pending" as AuthStepStatus,
  }));
}

/**
 * Create initial steps for a registration flow.
 */
export function createRegisterSteps(): AuthStep[] {
  return REGISTER_FLOW_STEPS.map((step) => ({
    id: step.id,
    label: step.label,
    description: step.description,
    status: "pending" as AuthStepStatus,
  }));
}

/**
 * Generate a unique ID for an auth flow entry.
 */
export function generateFlowId(): string {
  return `flow-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
