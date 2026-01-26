import { useState, useCallback } from "react";

// Types
import type { LoginResponse, RegisterResponse } from "@app/shared-types";
import type {
  ActivityLogEntry,
  LoginForm,
  RegisterForm,
  AuthFlowEntry,
  AuthStep,
} from "../../types";
import { createInitialSteps, generateFlowId } from "../../types";

// Hooks
import { useLogin, useRegister } from "../../hooks";

// shadcn components
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// Components
import { NavigationBar } from "../NavigationBar/NavigationBar";
import { AuthForm } from "../AuthForm/AuthForm";
import { AuthFlowPanel } from "./AuthFlowPanel";

// Simulated delay for educational visualization (ms)
const STEP_DELAY = 400;

/**
 * Utility to delay execution for step visualization.
 */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Create an activity log entry from an API response (for backwards compatibility).
 */
function createLogEntry(
  result: LoginResponse | RegisterResponse,
  type: "login" | "register",
): ActivityLogEntry {
  if (result.success) {
    return {
      timestamp: new Date().toISOString(),
      status: "success",
      type,
      message: result.message,
      user: result.data.user,
      ...(result.data.token && { token: result.data.token }),
    };
  } else {
    return {
      timestamp: new Date().toISOString(),
      status: "error",
      type,
      message: result.message,
      ...(result.requirement && { requirement: result.requirement }),
    };
  }
}

/**
 * AuthPage component with split-screen layout.
 *
 * Left panel: Login/Register form
 * Right panel: Authentication flow visualization with step-by-step walkthrough
 */
export function AuthPage() {
  // Legacy activity log for backward compatibility (used by AuthForm for validation errors)
  const [_activityLog, setActivityLog] = useState<ActivityLogEntry[]>([]);

  // New auth flow entries for enhanced visualization
  const [authFlows, setAuthFlows] = useState<AuthFlowEntry[]>([]);

  // Currently active flow (for step animation)
  const [activeFlowId, setActiveFlowId] = useState<string | null>(null);

  const loginMutation = useLogin();
  const registerMutation = useRegister();

  /**
   * Update a specific step in a flow entry.
   */
  const updateFlowStep = useCallback(
    (flowId: string, stepId: string, updates: Partial<AuthStep>) => {
      setAuthFlows((prev) =>
        prev.map((flow) => {
          if (flow.id !== flowId) return flow;
          return {
            ...flow,
            steps: flow.steps.map((step) =>
              step.id === stepId ? { ...step, ...updates } : step,
            ),
          };
        }),
      );
    },
    [],
  );

  /**
   * Update a flow entry.
   */
  const updateFlow = useCallback(
    (flowId: string, updates: Partial<AuthFlowEntry>) => {
      setAuthFlows((prev) =>
        prev.map((flow) => (flow.id === flowId ? { ...flow, ...updates } : flow)),
      );
    },
    [],
  );

  /**
   * Simulate the auth flow steps with delays for educational effect.
   */
  const runAuthFlowSteps = useCallback(
    async (
      flowId: string,
      type: "login" | "register",
      apiCall: () => Promise<LoginResponse | RegisterResponse>,
    ): Promise<LoginResponse | RegisterResponse> => {
      // Step 1: Request sent
      updateFlowStep(flowId, "request", {
        status: "in_progress",
        timestamp: new Date().toISOString(),
      });
      await delay(STEP_DELAY);
      updateFlowStep(flowId, "request", { status: "success" });

      // Step 2: Server validating
      updateFlowStep(flowId, "validate", {
        status: "in_progress",
        timestamp: new Date().toISOString(),
      });
      await delay(STEP_DELAY);

      // Make the actual API call
      let result: LoginResponse | RegisterResponse;
      try {
        result = await apiCall();
      } catch (error) {
        // Mark validation as failed
        updateFlowStep(flowId, "validate", {
          status: "error",
          detail: error instanceof Error ? error.message : "Request failed",
        });
        throw error;
      }

      if (!result.success) {
        // Mark validation as failed
        updateFlowStep(flowId, "validate", {
          status: "error",
          detail: result.message,
        });
        return result;
      }

      updateFlowStep(flowId, "validate", { status: "success" });

      // Step 3: Processing credentials
      updateFlowStep(flowId, "process", {
        status: "in_progress",
        timestamp: new Date().toISOString(),
      });
      await delay(STEP_DELAY);
      updateFlowStep(flowId, "process", { status: "success" });

      // For login, continue with token steps
      if (type === "login" && result.success && result.data.token) {
        // Step 4: Token created
        updateFlowStep(flowId, "token", {
          status: "in_progress",
          timestamp: new Date().toISOString(),
        });
        await delay(STEP_DELAY);
        updateFlowStep(flowId, "token", {
          status: "success",
          detail: `JWT token received`,
        });

        // Step 5: Token stored
        updateFlowStep(flowId, "store", {
          status: "in_progress",
          timestamp: new Date().toISOString(),
        });
        await delay(STEP_DELAY);
        updateFlowStep(flowId, "store", {
          status: "success",
          detail: "Stored in localStorage",
        });
      }

      return result;
    },
    [updateFlowStep],
  );

  /**
   * Handle login form submission with flow visualization.
   */
  const handleLogin = async (data: LoginForm): Promise<boolean> => {
    const flowId = generateFlowId();
    const newFlow: AuthFlowEntry = {
      id: flowId,
      type: "login",
      timestamp: new Date().toISOString(),
      status: "pending",
      steps: createInitialSteps(),
      request: {
        method: "POST",
        url: "/api/login",
        headers: { "Content-Type": "application/json" },
        body: { username: data.username, password: "***" },
      },
    };

    setAuthFlows((prev) => [newFlow, ...prev]);
    setActiveFlowId(flowId);

    try {
      const result = await runAuthFlowSteps(flowId, "login", () =>
        loginMutation.mutateAsync(data),
      );

      // Update flow with response
      updateFlow(flowId, {
        status: result.success ? "success" : "error",
        response: {
          status: result.success ? 200 : 401,
          statusText: result.success ? "OK" : "Unauthorized",
          body: result as unknown as Record<string, unknown>,
        },
        token: result.success ? result.data.token : undefined,
        message: result.message,
      });

      // Also update legacy activity log
      setActivityLog((prev) => [...prev, createLogEntry(result, "login")]);

      return result.success;
    } catch (error) {
      updateFlow(flowId, {
        status: "error",
        message: error instanceof Error ? error.message : "Login failed",
      });

      setActivityLog((prev) => [
        ...prev,
        {
          timestamp: new Date().toISOString(),
          status: "error",
          type: "login",
          message: error instanceof Error ? error.message : "Login failed",
        },
      ]);

      return false;
    } finally {
      setActiveFlowId(null);
    }
  };

  /**
   * Handle register form submission with flow visualization.
   */
  const handleRegister = async (data: RegisterForm): Promise<void> => {
    const flowId = generateFlowId();

    // For registration, we don't have token steps
    const registrationSteps = createInitialSteps().filter(
      (step) => step.id !== "token" && step.id !== "store",
    );

    const newFlow: AuthFlowEntry = {
      id: flowId,
      type: "register",
      timestamp: new Date().toISOString(),
      status: "pending",
      steps: registrationSteps,
      request: {
        method: "POST",
        url: "/api/register",
        headers: { "Content-Type": "application/json" },
        body: {
          username: data.username,
          password: "***",
          confirmPassword: "***",
        },
      },
    };

    setAuthFlows((prev) => [newFlow, ...prev]);
    setActiveFlowId(flowId);

    try {
      const result = await runAuthFlowSteps(flowId, "register", () =>
        registerMutation.mutateAsync(data),
      );

      updateFlow(flowId, {
        status: result.success ? "success" : "error",
        response: {
          status: result.success ? 201 : 400,
          statusText: result.success ? "Created" : "Bad Request",
          body: result as unknown as Record<string, unknown>,
        },
        message: result.message,
      });

      setActivityLog((prev) => [...prev, createLogEntry(result, "register")]);
    } catch (error) {
      updateFlow(flowId, {
        status: "error",
        message: error instanceof Error ? error.message : "Registration failed",
      });

      setActivityLog((prev) => [
        ...prev,
        {
          timestamp: new Date().toISOString(),
          status: "error",
          type: "register",
          message:
            error instanceof Error ? error.message : "Registration failed",
        },
      ]);
    } finally {
      setActiveFlowId(null);
    }
  };

  /**
   * Clear all auth flow entries.
   */
  const handleClearFlows = () => {
    setAuthFlows([]);
    setActivityLog([]);
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      {/* Navigation */}
      <NavigationBar />

      {/* Split-screen layout */}
      <div className="grid flex-1 grid-cols-1 gap-6 p-6 md:grid-cols-[2fr_3fr]">
        {/* Left Panel - Auth Form */}
        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="text-2xl">Authentication</CardTitle>
            <CardDescription>
              Login or create a new account to continue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AuthForm
              onLogin={handleLogin}
              onRegister={handleRegister}
              setActivityLog={setActivityLog}
            />
          </CardContent>
        </Card>

        {/* Right Panel - Auth Flow Visualization */}
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="text-2xl">Authentication Flow</CardTitle>
            <CardDescription>
              Watch the authentication process step by step
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            <AuthFlowPanel
              flows={authFlows}
              activeFlowId={activeFlowId}
              onClear={handleClearFlows}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
