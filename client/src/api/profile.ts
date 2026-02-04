import { apiClient } from "../lib/api-client";
import type { ProfileResponse } from "@app/shared-types";

/**
 * Fetches the current user's profile.
 *
 * @returns The profile data as a `ProfileResponse`.
 */
export async function getProfile(): Promise<ProfileResponse> {
  return apiClient.get<ProfileResponse>("/api/profile", true);
}