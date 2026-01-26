import { useState, useCallback } from "react";

// Types
import type {
  LoginResponse,
  RegisterResponse,
  SafeUser,
} from "@app/shared-types";
import type {
  ActivityLogEntry,
  LoginForm,
  RegisterForm,
  AuthFlowEntry,
  AuthStep,
} from "../../types";
import {
  createLoginSteps,
  createRegisterSteps,
  generateFlowId,
} from "../../types";

// Hooks
import { useRegister, useUser } from "../../hooks";

// API
import { authApi } from "../../api/auth";

// Utils
import { saveToken, saveUser } from "../../utils/user";

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
 * Pending login credentials after successful auth flow.
 * User must click "Continue" to complete the login.
 */
interface PendingLogin {
  user: SafeUser;
  token: string;
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

  // Pending login - user must click "Continue" to complete
  const [pendingLogin, setPendingLogin] = useState<PendingLogin | null>(null);

  const { login } = useUser();
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
        prev.map((flow) =>
          flow.id === flowId ? { ...flow, ...updates } : flow,
        ),
      );
    },
    [],
  );

  /**
   * Run login flow steps with delays for educational effect.
   */
  const runLoginFlowSteps = useCallback(
    async (
      flowId: string,
      apiCall: () => Promise<LoginResponse>,
    ): Promise<LoginResponse> => {
      // Step 1: Request Sent
      updateFlowStep(flowId, "request", {
        status: "in_progress",
        timestamp: new Date().toISOString(),
      });
      await delay(STEP_DELAY);
      updateFlowStep(flowId, "request", { status: "success" });

      // Step 2: Finding User
      updateFlowStep(flowId, "validate", {
        status: "in_progress",
        timestamp: new Date().toISOString(),
      });
      await delay(STEP_DELAY);

      // Make the actual API call
      let result: LoginResponse;
      try {
        result = await apiCall();
      } catch (error) {
        updateFlowStep(flowId, "validate", {
          status: "error",
          detail: error instanceof Error ? error.message : "Request failed",
        });
        throw error;
      }

      if (!result.success) {
        updateFlowStep(flowId, "validate", {
          status: "error",
          detail: result.message,
        });
        return result;
      }

      updateFlowStep(flowId, "validate", {
        status: "success",
        detail: "User found in database",
      });

      // Step 3: Verifying Password
      updateFlowStep(flowId, "process", {
        status: "in_progress",
        timestamp: new Date().toISOString(),
      });
      await delay(STEP_DELAY);
      updateFlowStep(flowId, "process", {
        status: "success",
        detail: "Password hash matches",
      });

      // Step 4: Creating Token
      updateFlowStep(flowId, "token", {
        status: "in_progress",
        timestamp: new Date().toISOString(),
      });
      await delay(STEP_DELAY);
      updateFlowStep(flowId, "token", {
        status: "success",
        detail: "eyJhbGciOiJIUzI1NiIs...",
      });

      // Step 5: Storing Token - actually store to localStorage
      if (result.success && result.data.token) {
        updateFlowStep(flowId, "store", {
          status: "in_progress",
          timestamp: new Date().toISOString(),
        });
        await delay(STEP_DELAY);

        // Actually store the token and user in localStorage
        saveToken(result.data.token);
        saveUser(result.data.user);

        updateFlowStep(flowId, "store", {
          status: "success",
          detail: "localStorage.setItem('auth_token', ...)",
        });
      }

      return result;
    },
    [updateFlowStep],
  );

  /**
   * Run registration flow steps with delays for educational effect.
   */
  const runRegisterFlowSteps = useCallback(
    async (
      flowId: string,
      apiCall: () => Promise<RegisterResponse>,
    ): Promise<RegisterResponse> => {
      // Step 1: Request Sent
      updateFlowStep(flowId, "request", {
        status: "in_progress",
        timestamp: new Date().toISOString(),
      });
      await delay(STEP_DELAY);
      updateFlowStep(flowId, "request", { status: "success" });

      // Step 2: Validating Input
      updateFlowStep(flowId, "validate", {
        status: "in_progress",
        timestamp: new Date().toISOString(),
      });
      await delay(STEP_DELAY);

      // Make the actual API call
      let result: RegisterResponse;
      try {
        result = await apiCall();
      } catch (error) {
        updateFlowStep(flowId, "validate", {
          status: "error",
          detail: error instanceof Error ? error.message : "Request failed",
        });
        throw error;
      }

      // Check for validation errors
      if (!result.success) {
        // Determine which step failed based on the error
        const errorMsg = result.message.toLowerCase();
        if (
          errorMsg.includes("password") ||
          errorMsg.includes("username is required")
        ) {
          updateFlowStep(flowId, "validate", {
            status: "error",
            detail: result.message,
          });
        } else if (errorMsg.includes("exists") || errorMsg.includes("taken")) {
          updateFlowStep(flowId, "validate", { status: "success" });
          updateFlowStep(flowId, "check_user", {
            status: "error",
            detail: result.message,
          });
        } else {
          updateFlowStep(flowId, "validate", {
            status: "error",
            detail: result.message,
          });
        }
        return result;
      }

      updateFlowStep(flowId, "validate", {
        status: "success",
        detail: "All requirements met",
      });

      // Step 3: Checking Username
      updateFlowStep(flowId, "check_user", {
        status: "in_progress",
        timestamp: new Date().toISOString(),
      });
      await delay(STEP_DELAY);
      updateFlowStep(flowId, "check_user", {
        status: "success",
        detail: "Username is available",
      });

      // Step 4: Hashing Password
      updateFlowStep(flowId, "hash", {
        status: "in_progress",
        timestamp: new Date().toISOString(),
      });
      await delay(STEP_DELAY);
      updateFlowStep(flowId, "hash", {
        status: "success",
        detail: "$2a$10$...",
      });

      // Step 5: Creating User
      updateFlowStep(flowId, "create", {
        status: "in_progress",
        timestamp: new Date().toISOString(),
      });
      await delay(STEP_DELAY);
      updateFlowStep(flowId, "create", {
        status: "success",
        detail: "User saved to database",
      });

      return result;
    },
    [updateFlowStep],
  );

  /**
   * Handle login form submission with flow visualization.
   * Note: Does NOT auto-redirect. User must click "Continue" to complete login.
   */
  const handleLogin = async (data: LoginForm): Promise<boolean> => {
    const flowId = generateFlowId();
    const newFlow: AuthFlowEntry = {
      id: flowId,
      type: "login",
      timestamp: new Date().toISOString(),
      status: "pending",
      steps: createLoginSteps(),
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
      // Call API directly instead of using useLogin hook
      // This prevents auto-redirect so user can see the flow
      const result = await runLoginFlowSteps(flowId, () => authApi.login(data));

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

      // Handle successful login
      if (result.success && result.data.token) {
        // 1. Set pending login for the banner UI
        setPendingLogin({
          user: result.data.user,
          token: result.data.token,
        });
        
        // 2. Immediately update global auth state (so Navbar updates)
        login(result.data.user, result.data.token);
      }

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
   * Complete the pending login and redirect to dashboard.
   */
  const handleContinueLogin = () => {
    if (pendingLogin) {
      login(pendingLogin.user, pendingLogin.token);
      setPendingLogin(null);
    }
  };

  /**
   * Handle register form submission with flow visualization.
   */
  const handleRegister = async (data: RegisterForm): Promise<void> => {
    const flowId = generateFlowId();

    const newFlow: AuthFlowEntry = {
      id: flowId,
      type: "register",
      timestamp: new Date().toISOString(),
      status: "pending",
      steps: createRegisterSteps(),
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
      const result = await runRegisterFlowSteps(flowId, () =>
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
    setPendingLogin(null);
  };

  return (
    <div className="bg-background flex min-h-screen w-full flex-col">
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
              pendingLogin={pendingLogin}
              onContinueLogin={handleContinueLogin}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
