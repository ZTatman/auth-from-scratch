import type {
  LoginResponse,
  RegisterResponse,
  ErrorResponse,
} from "@app/shared-types";
import type { LoginForm, RegisterForm } from "../types";

export const registerUser = async (
  formData: RegisterForm,
): Promise<RegisterResponse> => {
  try {
    const response = await fetch("/api/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    const result: RegisterResponse = await response.json();
    return result;
  } catch (error) {
    console.error(error);
    // Return error in the same format as server
    const errorResponse: ErrorResponse = {
      success: false,
      message:
        error instanceof Error ? error.message : "Unknown error occurred",
    };
    return errorResponse;
  }
};

export const loginUser = async (
  formData: LoginForm,
): Promise<LoginResponse> => {
  try {
    const response = await fetch("/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    const result: LoginResponse = await response.json();
    return result;
  } catch (error) {
    console.error(error);
    // Return error in the same format as server
    const errorResponse: ErrorResponse = {
      success: false,
      message:
        error instanceof Error ? error.message : "Unknown error occurred",
    };
    return errorResponse;
  }
};
