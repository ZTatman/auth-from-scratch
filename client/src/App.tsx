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

// Helper function to convert API response to ActivityLogEntry
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
