// Types
import type { ProfileResponse } from "@app/shared-types";

/**
 * Fetch current user's profile from the server.
 *
 * @returns ProfileResponse with user data on success, or error details on failure
 */
export async function getProfile(): Promise<ProfileResponse> {
  const token = localStorage.getItem("auth_token");

  if (!token) {
    return { success: false, message: "No authentication token" };
  }

  try {
    const response = await fetch("/api/profile", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();
    return data;
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Request failed",
    };
  }
}

// For compatibility with existing imports
export const profileApi = { getProfile };
