import { apiClient } from "../lib/api-client";
import type { LoginResponse, RegisterResponse } from "@app/shared-types";
import type { LoginFormData, RegisterFormData } from "@app/shared-types";

export async function register(
  formData: RegisterFormData,
): Promise<RegisterResponse> {
  return apiClient.post<RegisterResponse>("/api/register", formData);
}

export async function login(formData: LoginFormData): Promise<LoginResponse> {
  return apiClient.post<LoginResponse>("/api/login", formData);
}
