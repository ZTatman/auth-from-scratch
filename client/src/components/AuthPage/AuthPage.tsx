import { useState, useCallback } from "react";
import { toast } from "sonner";

// Types
import type { LoginResponse, RegisterResponse } from "@app/shared-types";
import type { AuthFlowEntry, AuthStep } from "../../types";
import type { LoginFormData, RegisterFormData } from "@app/shared-types";
import {
  createLoginSteps,
  createRegisterSteps,
  generateFlowId,
} from "../../types";

// Hooks
import { useRegister, useUser } from "../../hooks";

// API
import { login as loginApi } from "../../api/auth";

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
 * Redact sensitive token data from API responses before storing in UI state.
 *
 * @param result - Login or register API response
 * @returns Response data with any token value redacted
 */
function redactTokenFromResponse(
  result: LoginResponse | RegisterResponse,
): Record<string, unknown> {
  if (result.success && result.data.token) {
    return {
      ...result,
      data: { ...result.data, token: "<redacted>" },
    } as unknown as Record<string, unknown>;
  }

  return result as unknown as Record<string, unknown>;
}

/**
 * AuthPage component with split-screen layout.
 *
 * Left panel: Login/Register form
 * Right panel: Authentication flow visualization with step-by-step walkthrough
 */
export function AuthPage() {
  // Auth flow entries for enhanced visualization
  const [authFlows, setAuthFlows] = useState<AuthFlowEntry[]>([]);

  // Currently active flow (for step animation)
  const [activeFlowId, setActiveFlowId] = useState<string | null>(null);
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
        detail: "JWT generated",
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
  const handleLogin = async (data: LoginFormData): Promise<boolean> => {
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
      const result = await runLoginFlowSteps(flowId, () => loginApi(data));

      // Update flow with response
      updateFlow(flowId, {
        status: result.success ? "success" : "error",
        response: {
          status: result.success ? 200 : 401,
          statusText: result.success ? "OK" : "Unauthorized",
          body: redactTokenFromResponse(result),
        },
        message: result.message,
      });

      // Handle successful login
      if (result.success) {
        if (result.data.token) {
          // 1. Immediately log user in (updates Navbar)
          login(result.data.user, result.data.token);
        }
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }

      return result.success;
    } catch (error) {
      updateFlow(flowId, {
        status: "error",
        message: error instanceof Error ? error.message : "Login failed",
      });

      toast.error(error instanceof Error ? error.message : "Login failed");

      return false;
    } finally {
      setActiveFlowId(null);
    }
  };

  /**
   * Handle register form submission with flow visualization.
   */
  const handleRegister = async (data: RegisterFormData): Promise<void> => {
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
          body: redactTokenFromResponse(result),
        },
        message: result.message,
      });

      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      updateFlow(flowId, {
        status: "error",
        message: error instanceof Error ? error.message : "Registration failed",
      });

      toast.error(
        error instanceof Error ? error.message : "Registration failed",
      );
    } finally {
      setActiveFlowId(null);
    }
  };

  /**
   * Clear all auth flow entries.
   */
  const handleClearFlows = () => {
    setAuthFlows([]);
  };

  return (
    <div className="bg-background flex min-h-screen w-full flex-col">
      {/* Navigation */}
      <NavigationBar />

      {/* Split-screen layout */}
      <div className="grid flex-1 grid-cols-1 gap-6 p-6 md:grid-cols-[2fr_3fr]">
        {/* Left Panel - Auth Form */}
        <Card className="border-border/60 h-fit border">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Authentication</CardTitle>
            <CardDescription>
              Login or create a new account to continue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AuthForm onLogin={handleLogin} onRegister={handleRegister} />
          </CardContent>
        </Card>

        {/* Right Panel - Auth Flow Visualization */}
        <Card className="border-border/60 flex flex-col border">
          <CardHeader className="text-center">
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
