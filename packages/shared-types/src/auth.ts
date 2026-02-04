// ============================================
// SHARED TYPES (Single source of truth)
// ============================================

// User without sensitive fields (safe to send to client)
// Note: createdAt is string because Date becomes string over JSON
export interface SafeUser {
  id: string;
  username: string;
  createdAt: string;
}

// Success response (has data)
export interface SuccessResponse<T> {
  success: true;
  message: string;
  data: T;
}

// Error response (no data, optional requirement)
export interface ErrorResponse {
  success: false;
  message: string;
  requirement?: string;
}

// Union type for API responses
export type ApiResponse<T> = SuccessResponse<T> | ErrorResponse;

// Auth-specific data payloads
export interface AuthData {
  user: SafeUser;
  token?: string; // Present for login, undefined for register
}

// Composed response types
export type LoginResponse = ApiResponse<AuthData>;
export type RegisterResponse = ApiResponse<AuthData>;
export type ProfileResponse = ApiResponse<SafeUser>;
export type DeleteAccountResponse = ApiResponse<{ userId: string }>;
