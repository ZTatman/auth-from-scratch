import { useMutation } from "@tanstack/react-query";
import useUser from "../useUser";
import { authApi } from "../../api/auth";
import type { LoginResponse, RegisterResponse } from "@app/shared-types";

/**
 * Login mutation hook.
 *
 * Handles user login via React Query mutation. On successful login with a token,
 * automatically updates the user context with the authenticated user data.
 *
 * @returns React Query mutation object for login operations
 */
export function useLogin() {
  const { login } = useUser();

  return useMutation({
    mutationFn: authApi.login,
    onSuccess: (response: LoginResponse) => {
      if (response.success && response.data?.token) {
        login(response.data.user, response.data.token);
      }
    },
    onError: (error) => {
      console.error("Login failed:", error);
    },
  });
}

/**
 * Register mutation hook.
 *
 * Handles user registration via React Query mutation.
 * Note: Registration does not auto-login; users must login separately after registering.
 *
 * @returns React Query mutation object for registration operations
 */
export function useRegister() {
  return useMutation({
    mutationFn: authApi.register,
    onSuccess: (data: RegisterResponse) => {
      console.log("Registration result:", data);
    },
    onError: (error) => {
      console.error("Registration failed:", error);
    },
  });
}
