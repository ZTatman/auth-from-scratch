import { useState } from "react";

// Types
import type { LoginResponse, RegisterResponse } from "@app/shared-types";
import type { ActivityLogEntry, LoginForm, RegisterForm } from "./types";

// API / Hooks
import { loginUser, registerUser } from "./api";
import { useUser } from "./hooks";

// Components
import { NavigationBar } from "./components/NavigationBar/NavigationBar";
import { AuthForm } from "./components/AuthForm/AuthForm";
import { ActivityLog } from "./components/ActivityLog/ActivityLog";
import { UserProvider } from "./components/UserContext/UserContext";

// Styles
import "./App.css";

/**
 * Create an activity log entry describing the outcome of a login or register API response.
 *
 * @param result - The `LoginResponse` or `RegisterResponse` whose outcome is recorded; when `success` is true the entry includes `data.user` and an optional `data.token`, otherwise it may include `requirement`.
 * @param type - Label for the entry, either `"login"` or `"register"`.
 * @returns An ActivityLogEntry containing an ISO timestamp, `status` ("success" or "error"), `type`, `message`, and either `user` (with optional `token`) on success or `requirement` on error.
 */
function createLogEntry(
  result: LoginResponse | RegisterResponse,
  type: "login" | "register",
): ActivityLogEntry {
  if (result.success) {
    // TypeScript automatically narrows: result is SuccessResponse<AuthData>
    return {
      timestamp: new Date().toISOString(),
      status: "success",
      type,
      message: result.message,
      user: result.data.user,
      ...(result.data.token && { token: result.data.token }),
    };
  } else {
    // TypeScript automatically narrows: result is ErrorResponse
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
 * Renders the main application content and manages authentication flows and the activity log.
 *
 * Maintains an in-memory activity log, provides handlers for login and registration to the
 * AuthForm, and updates user context on successful login when a token is returned.
 *
 * @returns The JSX for the app content including the navigation bar, authentication form, and activity log.
 */
function AppContent() {
  const { login } = useUser();
  const [activityLog, setActivityLog] = useState<ActivityLogEntry[]>([]);

  const handleLogin = async (data: LoginForm): Promise<boolean> => {
    const result = await loginUser(data);
    // Only update context if login was successful and we have user + token
    if (result.success && result.data.token) {
      // TypeScript automatically narrows: result.data exists and has user
      login(result.data.user, result.data.token);
    }
    setActivityLog((prev) => [...prev, createLogEntry(result, "login")]);
    return result.success;
  };

  const handleRegister = async (data: RegisterForm): Promise<void> => {
    const result = await registerUser(data);
    // Note: Register doesn't return a token, so we don't auto-login after registration
    setActivityLog((prev) => [...prev, createLogEntry(result, "register")]);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-start gap-4 gap-y-8 bg-gray-100">
      <NavigationBar />
      <AuthForm
        onLogin={handleLogin}
        onRegister={handleRegister}
        setActivityLog={setActivityLog}
      />
      <ActivityLog entries={activityLog} onClear={() => setActivityLog([])} />
    </div>
  );
}

function App() {
  return (
    <UserProvider>
      <AppContent />
    </UserProvider>
  );
}

export default App;