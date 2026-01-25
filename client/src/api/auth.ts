// Types
import type { LoginResponse, RegisterResponse } from "@app/shared-types";
import type { LoginForm, RegisterForm } from "../types";

/**
 * Register a new user.
 *
 * @param formData - Username and password for registration
 * @returns RegisterResponse with user data on success, or error details on failure
 */
export async function register(formData: RegisterForm): Promise<RegisterResponse> {
  try {
    const response = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    return await response.json();
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Registration failed",
    };
  }
}

/**
 * Login with existing credentials.
 *
 * @param formData - Username and password for login
 * @returns LoginResponse with user data and token on success, or error details on failure
 */
export async function login(formData: LoginForm): Promise<LoginResponse> {
  try {
    const response = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    return await response.json();
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Login failed",
    };
  }
}

// For compatibility with existing imports
export const authApi = { register, login };
