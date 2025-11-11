export interface AuthFormData {
  username: string;
  password: string;
  confirmPassword?: string;
}

export interface LoginForm {
  username: string;
  password: string;
}

export interface RegisterForm {
  username: string;
  password: string;
  confirmPassword: string;
}

type ActivityLogStatus = "success" | "error";

type ActivityLogType = "register" | "login";

export interface User {
  id: string;
  _createdAt: string;
  username: string;
  password: string;
}

// Base API response type with common fields
interface BaseApiResponse {
  success: boolean;
  message: string;
}

// Optional fields that can be added to responses
interface WithUser {
  user?: User;
}

interface WithToken {
  token?: string;
}

interface WithRequirement {
  requirement?: string;
}

// Composed response types using intersection types
export type RegisterResponseResult = BaseApiResponse &
  WithUser &
  WithRequirement;

export type LoginResponseResult = BaseApiResponse &
  WithUser &
  WithToken &
  WithRequirement;

// Activity log entry - shares common fields but uses different structure
export interface ActivityLogEntry {
  timestamp: string;
  status: ActivityLogStatus;
  type: ActivityLogType;
  message: string;
  requirement?: string;
  user?: User;
  token?: string;
}
