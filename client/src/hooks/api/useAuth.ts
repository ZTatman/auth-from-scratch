import { useMutation } from "@tanstack/react-query";
import useUser from "../useUser";
import { login as loginApi, register } from "../../api/auth";
import type { LoginResponse, RegisterResponse } from "@app/shared-types";

/**
 * Creates a mutation hook that performs user login and applies authenticated user state on success.
 *
 * @returns A React Query mutation configured to call the login API; on success it sets the authenticated user and token, on error it logs the failure.
 */
export function useLogin() {
  const { login } = useUser();

  return useMutation({
    mutationFn: loginApi,
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
 * Creates a mutation hook for user registration.
 *
 * @returns A mutation object that performs the `register` API call; on success the mutation's data is a `RegisterResponse`
 */
export function useRegister() {
  return useMutation({
    mutationFn: register,
    onSuccess: (data: RegisterResponse) => {
      console.log("Registration result:", data);
    },
    onError: (error) => {
      console.error("Registration failed:", error);
    },
  });
}