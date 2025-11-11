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

  const resetFormData = () => {
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
      resetFormData();
    } else {
      const { username, password, confirmPassword } = formData;
      if (password === confirmPassword) {
        onRegister({ username, password, confirmPassword });
        resetFormData();
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
      (field) => formData[field as keyof AuthFormData]
    );

  return (
    <div className="bg-white p-8 rounded-lg border border-gray-200 shadow-md w-full max-w-md">
      <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
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
          required
          minLength={6}
          autoComplete="new-password"
        >
          <button
            type="button"
            className="absolute right-3 top-1/2 text-gray-500 hover:text-gray-700 transition-colors duration-200"
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
            required
            minLength={6}
            autoComplete="new-password"
          />
        )}
        {!isLoginMode && (
          <GenerateCredentialsSection
            onCredentialsGenerated={handleCredentialsGenerated}
          />
        )}
        <div className="flex justify-between items-center gap-3">
          <button
            disabled={isDisabled}
            type="submit"
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoginMode ? "Login" : "Register"}
          </button>
          {!isLoginMode && (
            <button
              type="button"
              disabled={!isResetFormEnabled}
              onClick={() => resetFormData()}
              className="w-full bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600 transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Reset Form
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
        className="block text-sm text-left font-medium text-gray-700 mb-1"
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
        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
      {children}
    </div>
  );
}
