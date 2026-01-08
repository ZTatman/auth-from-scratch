import { useState } from "react";

// Types
import type {
  ActivityLogEntry,
  LoginForm,
  LoginResponseResult,
  RegisterForm,
  RegisterResponseResult,
} from "./types";

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
  result: LoginResponseResult | RegisterResponseResult,
  type: "login" | "register",
): ActivityLogEntry {
  return {
    timestamp: new Date().toISOString(),
    status: result.success ? "success" : "error",
    type,
    message: result.message,
    ...(result.success && result.user && { user: result.user }),
    ...(result.requirement && { requirement: result.requirement }),
    ...("token" in result && result.token && { token: result.token }),
  };
}

function AppContent() {
  const { login } = useUser();
  const [activityLog, setActivityLog] = useState<ActivityLogEntry[]>([]);

  const handleLogin = async (data: LoginForm) => {
    const result = await loginUser(data);
    // Only update context if login was successful and we have user + token
    if (result.success && result.user && result.token) {
      login(result.user, result.token);
    }
    // add to activity log
    setActivityLog((prev) => [...prev, createLogEntry(result, "login")]);
  };

  const handleRegister = async (data: RegisterForm) => {
    const result = await registerUser(data);
    // Note: Register doesn't return a token, so we don't auto-login after registration
    // add to activity log
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
