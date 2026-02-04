import { apiClient } from "../lib/api-client";
import type { LoginResponse, RegisterResponse } from "@app/shared-types";
import type { LoginFormData, RegisterFormData } from "@app/shared-types";

/**
 * Create a new user account using the provided registration data.
 *
 * @param formData - User registration fields (e.g., name, email, password)
 * @returns The API's `RegisterResponse` object containing registration result data
 */
export async function register(
  formData: RegisterFormData,
): Promise<RegisterResponse> {
  return apiClient.post<RegisterResponse>("/api/register", formData);
}

/**
 * Authenticate a user with the provided credentials.
 *
 * @param formData - Credentials and any fields required by the login endpoint
 * @returns The server's `LoginResponse` payload returned after a successful login
 */
export async function login(formData: LoginFormData): Promise<LoginResponse> {
  return apiClient.post<LoginResponse>("/api/login", formData);
}