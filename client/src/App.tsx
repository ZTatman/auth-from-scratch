import { useState } from "react";

// Types
import type {
  ActivityLogEntry,
  LoginForm,
  LoginResponseResult,
  RegisterForm,
  RegisterResponseResult,
} from "./types";

// API
import { loginUser, registerUser } from "./api";

// Components
import { AuthForm } from "./components/AuthForm/AuthForm";
import { ActivityLog } from "./components/ActivityLog/ActivityLog";

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

function App() {
  const [activityLog, setActivityLog] = useState<ActivityLogEntry[]>([]);

  const handleLogin = async (data: LoginForm) => {
    const result = await loginUser(data);
    setActivityLog((prev) => [...prev, createLogEntry(result, "login")]);
  };

  const handleRegister = async (data: RegisterForm) => {
    const result = await registerUser(data);
    setActivityLog((prev) => [...prev, createLogEntry(result, "register")]);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-start pt-20">
      <AuthForm
        onLogin={handleLogin}
        onRegister={handleRegister}
        setActivityLog={setActivityLog}
      />
      <ActivityLog entries={activityLog} onClear={() => setActivityLog([])} />
    </div>
  );
}

export default App;
