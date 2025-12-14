import type {
  LoginForm,
  LoginResponseResult,
  RegisterForm,
  RegisterResponseResult,
} from "../types";

export const registerUser = async (
  formData: RegisterForm,
): Promise<RegisterResponseResult> => {
  try {
    const response = await fetch("/api/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    const result: RegisterResponseResult = await response.json();
    return result;
  } catch (error) {
    console.error(error);
    // Return error in the same format as server
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
};

export const loginUser = async (
  formData: LoginForm,
): Promise<LoginResponseResult> => {
  try {
    const response = await fetch("/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    const result: LoginResponseResult = await response.json();
    return result;
  } catch (error) {
    console.error(error);
    // Return error in the same format as server
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
};
