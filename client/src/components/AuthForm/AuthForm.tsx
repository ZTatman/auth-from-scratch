import { useState } from "react";
import type {
  ActivityLogEntry,
  AuthFormData,
  LoginForm,
  RegisterForm,
} from "../../types";
import { ToggleSwitch } from "../ToggleSwitch/ToggleSwitch";
import { GenerateCredentialsSection } from "../GenerateCredentialsSection/GenerateCredentialsSection";

const initialFormData = {
  username: "",
  password: "",
  confirmPassword: "",
};

interface AuthFormProps {
  onLogin: (data: LoginForm) => void;
  onRegister: (data: RegisterForm) => void;
  setActivityLog: React.Dispatch<React.SetStateAction<ActivityLogEntry[]>>;
}

export function AuthForm({
  onLogin,
  onRegister,
  setActivityLog,
}: AuthFormProps) {
  const [isLoginMode, setIsLoginMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState<AuthFormData>(initialFormData);

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

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isLoginMode) {
      const { username, password } = formData;
      onLogin({ username, password });
      clearFormData();
    } else {
      const { username, password, confirmPassword } = formData;
      if (password === confirmPassword) {
        onRegister({ username, password, confirmPassword });
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
    ["username", "password", "confirmPassword"].some(
      (field) => formData[field as keyof AuthFormData],
    );

  return (
    <div className="w-full max-w-md rounded-lg border border-gray-200 bg-white p-8 shadow-md">
      <h1 className="mb-8 text-center text-3xl font-bold text-gray-800">
        Example Auth Login Page
      </h1>
      <div className="mb-6 flex justify-center">
        <ToggleSwitch
          checked={isLoginMode}
          onChange={setIsLoginMode}
          leftLabel="Register"
          rightLabel="Login"
        />
      </div>
      <form className="space-y-4" onSubmit={handleSubmit} autoComplete="off">
        <InputField
          label="Username"
          type="text"
          name="username"
          placeholder="Enter your username"
          value={formData.username}
          onChange={handleChange}
          required
        />
        <InputField
          className="relative"
          label="Password"
          type={showPassword ? "text" : "password"}
          name="password"
          placeholder="Enter your password"
          value={formData.password}
          onChange={handleChange}
          minLength={6}
          autoComplete="new-password"
          required
        >
          <button
            type="button"
            className="absolute top-1/2 right-3 text-gray-500 transition-colors duration-200 hover:text-gray-700"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </InputField>
        {!isLoginMode && (
          <InputField
            label="Confirm Password"
            type={showPassword ? "text" : "password"}
            name="confirmPassword"
            placeholder="Confirm your password"
            value={formData.confirmPassword || ""}
            onChange={handleChange}
            minLength={6}
            autoComplete="new-password"
            required
          />
        )}
        {!isLoginMode && (
          <GenerateCredentialsSection
            onCredentialsGenerated={handleCredentialsGenerated}
          />
        )}
        <div className="flex items-center justify-between gap-3">
          <button
            disabled={isDisabled}
            type="submit"
            className="w-full rounded-md bg-blue-500 px-4 py-2 font-medium text-white transition-colors duration-200 hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoginMode ? "Login" : "Register"}
          </button>
          {!isLoginMode && (
            <button
              type="button"
              disabled={!isResetFormEnabled}
              onClick={() => clearFormData()}
              className="w-full rounded-md bg-gray-500 px-4 py-2 font-medium text-white transition-colors duration-200 hover:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Clear Form
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

interface InputFieldProps {
  label: string;
  type: string;
  name: string;
  placeholder: string;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  required: boolean;
  minLength?: number;
  children?: React.ReactNode;
  className?: string;
  autoComplete?: string;
}

function InputField({
  label,
  type,
  name,
  placeholder,
  value,
  onChange,
  required,
  minLength,
  children,
  className,
  autoComplete,
}: InputFieldProps) {
  return (
    <div className={className}>
      <label
        htmlFor={name}
        className="mb-1 block text-left text-sm font-medium text-gray-700"
      >
        {label}
      </label>
      <input
        id={name}
        type={type}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        minLength={minLength}
        autoComplete={autoComplete || "off"}
        className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
      />
      {children}
    </div>
  );
}
