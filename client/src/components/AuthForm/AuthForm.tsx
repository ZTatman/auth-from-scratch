import { useState, useMemo } from "react";

// Zod validation
import {
  PASSWORD_REQUIREMENTS,
  checkPasswordRequirements,
} from "@app/shared-types";

// Types
import type { ActivityLogEntry, LoginForm, RegisterForm } from "../../types";

// shadcn components
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

// Components
import { ToggleSwitch } from "../ToggleSwitch/ToggleSwitch";
import { GenerateCredentialsSection } from "../GenerateCredentialsSection/GenerateCredentialsSection";

// Internal form state (always includes all fields)
interface FormState {
  username: string;
  password: string;
  confirmPassword: string;
}

const initialFormData: FormState = {
  username: "",
  password: "",
  confirmPassword: "",
};

interface AuthFormProps {
  onLogin: (data: LoginForm) => Promise<boolean>;
  onRegister: (data: RegisterForm) => Promise<void>;
  setActivityLog: React.Dispatch<React.SetStateAction<ActivityLogEntry[]>>;
}

/**
 * Renders an authentication form that supports toggling between register and login modes.
 *
 * The component handles user input, password visibility, generated credentials, form submission,
 * and activity log updates. In login mode it calls `onLogin` and clears the form on success.
 * In register mode it calls `onRegister` when passwords match; when they don't, it appends an
 * error entry to `setActivityLog`.
 *
 * Features inline password requirement hints that update in real-time as the user types.
 *
 * @param onLogin - Called with `{ username, password }` when submitting in login mode; should return `true` on successful authentication.
 * @param onRegister - Called with `{ username, password, confirmPassword }` when submitting in register mode.
 * @param setActivityLog - State updater for appending activity log entries (used to record registration errors).
 * @returns The rendered authentication form element.
 */
export function AuthForm({
  onLogin,
  onRegister,
  setActivityLog,
}: AuthFormProps) {
  const [isLoginMode, setIsLoginMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState<FormState>(initialFormData);

  // Check password requirements in real-time
  const passwordValidation = useMemo(
    () => checkPasswordRequirements(formData.password),
    [formData.password],
  );

  // Check if passwords match
  const passwordsMatch =
    formData.password === formData.confirmPassword &&
    formData.confirmPassword !== "";

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value.trim(),
    }));
  };

  const clearFormData = () => {
    setFormData(initialFormData);
  };

  const handleCredentialsGenerated = (username: string, password: string) => {
    setFormData((prev) => ({
      ...prev,
      username,
      password,
      confirmPassword: password,
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isLoginMode) {
      const { username, password } = formData;
      const success = await onLogin({ username, password });
      if (success) clearFormData();
    } else {
      const { username, password, confirmPassword } = formData;
      if (password === confirmPassword) {
        await onRegister({
          username,
          password,
          confirmPassword,
        });
      } else {
        setActivityLog((prev) => [
          ...prev,
          {
            timestamp: new Date().toISOString(),
            status: "error",
            type: "register",
            message: "Password confirmation does not match",
            requirement: "password and confirmPassword must match",
          },
        ]);
      }
    }
  };

  const isDisabled =
    !formData.username ||
    !formData.password ||
    (!isLoginMode && !formData.confirmPassword);

  const isResetFormEnabled =
    !isLoginMode &&
    (formData.username !== "" ||
      formData.password !== "" ||
      formData.confirmPassword !== "");

  return (
    <div className="space-y-6">
      {/* Mode Toggle */}
      <div className="flex justify-center">
        <ToggleSwitch
          checked={isLoginMode}
          onChange={setIsLoginMode}
          leftLabel="Register"
          rightLabel="Login"
        />
      </div>

      <form className="space-y-4" onSubmit={handleSubmit} autoComplete="off">
        {/* Username Field */}
        <div className="space-y-2">
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            type="text"
            name="username"
            placeholder="Enter your username"
            value={formData.username}
            onChange={handleChange}
            required
          />
        </div>

        {/* Password Field */}
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              autoComplete="new-password"
              required
              className="pr-16"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 h-7 -translate-y-1/2 text-xs"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? "Hide" : "Show"}
            </Button>
          </div>

          {/* Password Requirements Hints (only in register mode) */}
          {!isLoginMode && formData.password.length > 0 && (
            <PasswordRequirements validation={passwordValidation} />
          )}
        </div>

        {/* Confirm Password Field (only in register mode) */}
        {!isLoginMode && (
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type={showPassword ? "text" : "password"}
              name="confirmPassword"
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={handleChange}
              autoComplete="new-password"
              required
            />
            {/* Password match indicator */}
            {formData.confirmPassword.length > 0 && (
              <div className="flex items-center gap-2 text-xs">
                {passwordsMatch ? (
                  <>
                    <CheckIcon className="h-3.5 w-3.5 text-green-500" />
                    <span className="text-green-600">Passwords match</span>
                  </>
                ) : (
                  <>
                    <XIcon className="h-3.5 w-3.5 text-destructive" />
                    <span className="text-destructive">
                      Passwords do not match
                    </span>
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {/* Generate Credentials Section (only in register mode) */}
        {!isLoginMode && (
          <GenerateCredentialsSection
            onCredentialsGenerated={handleCredentialsGenerated}
          />
        )}

        {/* Form Actions */}
        <div className="flex items-center gap-3 pt-2">
          <Button type="submit" disabled={isDisabled} className="flex-1">
            {isLoginMode ? "Login" : "Register"}
          </Button>
          {!isLoginMode && (
            <Button
              type="button"
              variant="outline"
              disabled={!isResetFormEnabled}
              onClick={clearFormData}
              className="flex-1"
            >
              Clear Form
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}

// ============================================
// Password Requirements Component
// ============================================

interface PasswordRequirementsProps {
  validation: ReturnType<typeof checkPasswordRequirements>;
}

/**
 * Displays password requirements with real-time checkmark/X indicators.
 */
function PasswordRequirements({ validation }: PasswordRequirementsProps) {
  const requirements = [
    { key: "minLength", ...PASSWORD_REQUIREMENTS.minLength, met: validation.minLength },
    { key: "uppercase", ...PASSWORD_REQUIREMENTS.uppercase, met: validation.uppercase },
    { key: "lowercase", ...PASSWORD_REQUIREMENTS.lowercase, met: validation.lowercase },
    { key: "number", ...PASSWORD_REQUIREMENTS.number, met: validation.number },
    { key: "specialChar", ...PASSWORD_REQUIREMENTS.specialChar, met: validation.specialChar },
  ];

  return (
    <div className="rounded-md border border-dashed p-3">
      <p className="mb-2 text-xs font-medium text-muted-foreground">
        Password requirements:
      </p>
      <ul className="space-y-1">
        {requirements.map((req) => (
          <li key={req.key} className="flex items-center gap-2 text-xs">
            {req.met ? (
              <CheckIcon className="h-3.5 w-3.5 text-green-500" />
            ) : (
              <XIcon className="h-3.5 w-3.5 text-muted-foreground" />
            )}
            <span
              className={req.met ? "text-green-600" : "text-muted-foreground"}
            >
              {req.message}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ============================================
// Icon Components
// ============================================

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  );
}
