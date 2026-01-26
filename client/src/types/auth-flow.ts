// ============================================
// AUTH FLOW VISUALIZATION TYPES
// ============================================

/**
 * Status of an individual auth flow step.
 */
export type AuthStepStatus = "pending" | "in_progress" | "success" | "error";

/**
 * Represents a single step in the authentication flow visualization.
 */
export interface AuthStep {
  id: string;
  label: string;
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
 * Default steps for the authentication flow visualization.
 */
export const AUTH_FLOW_STEPS = [
  { id: "request", label: "Request sent" },
  { id: "validate", label: "Server validating" },
  { id: "process", label: "Processing credentials" },
  { id: "token", label: "Token created" },
  { id: "store", label: "Token stored" },
] as const;

/**
 * Create initial steps for a new auth flow entry.
 */
export function createInitialSteps(): AuthStep[] {
  return AUTH_FLOW_STEPS.map((step) => ({
    id: step.id,
    label: step.label,
    status: "pending" as AuthStepStatus,
  }));
}

/**
 * Generate a unique ID for an auth flow entry.
 */
export function generateFlowId(): string {
  return `flow-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
