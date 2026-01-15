// ============================================
// CLIENT-ONLY TYPES
// ============================================

import type { SafeUser } from "@app/shared-types";

// Form data types
export interface LoginForm {
  username: string;
  password: string;
}

export interface RegisterForm extends LoginForm {
  confirmPassword: string;
}

// Activity log types
type ActivityLogStatus = "success" | "error";
type ActivityLogType = "register" | "login";

export interface ActivityLogEntry {
  timestamp: string;
  status: ActivityLogStatus;
  type: ActivityLogType;
  message: string;
  requirement?: string;
  user?: SafeUser;
  token?: string;
}
