import { apiClient } from "../lib/api-client";
import type { ProfileResponse } from "@app/shared-types";

export async function getProfile(): Promise<ProfileResponse> {
  return apiClient.get<ProfileResponse>("/api/profile", true);
}
