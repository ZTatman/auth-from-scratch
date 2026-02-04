import { apiClient } from "../lib/api-client";
import type { DeleteAccountResponse, ProfileResponse } from "@app/shared-types";

export async function getProfile(): Promise<ProfileResponse> {
  return apiClient.get<ProfileResponse>("/api/profile", true);
}

/**
 * Delete the authenticated user's account.
 *
 * @returns DeleteAccountResponse with deleted user ID on success
 */
export async function deleteAccount(): Promise<DeleteAccountResponse> {
  return apiClient.delete<DeleteAccountResponse>("/api/profile", true);
}
