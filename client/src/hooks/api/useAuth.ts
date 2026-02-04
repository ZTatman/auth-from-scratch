import { useMutation } from "@tanstack/react-query";
import useUser from "../useUser";
import { login as loginApi, register } from "../../api/auth";
import type { LoginResponse, RegisterResponse } from "@app/shared-types";

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
