import type {
  LoginResponse,
  RegisterResponse,
  ErrorResponse,
} from "@app/shared-types";
import type { LoginForm, RegisterForm } from "../types";

export const registerUser = async (
  formData: RegisterForm,
): Promise<RegisterResponse> => {
  // Try/catch handles NETWORK errors (DNS failure, CORS block, Request Timeout, Server Down/No Internet)
  try {
    const response = await fetch("/api/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    // Check for HTTP Errors (Unauthorized/Forbidden 401/403, Bad Request 400, Server Error 500)
    if (!response.ok) {
      try {
        const errorResponse: ErrorResponse = await response.json();
        return errorResponse;
      } catch {
        return {
          success: false,
          message: `Request Failed: ${response.status} ${response.statusText}`,
        };
      }
    }

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
  // Try/catch handles NETWORK errors (DNS failure, CORS block, Request Timeout, Server Down/No Internet)
  try {
    const response = await fetch("/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    // Check for HTTP Errors (Unauthorized/Forbidden 401/403, Bad Request 400, Server Error 500)
    if (!response.ok) {
      try {
        const errorResponse: ErrorResponse = await response.json();
        return errorResponse;
      } catch {
        return {
          success: false,
          message: `Request Failed: ${response.status} ${response.statusText}`,
        };
      }
    }

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
