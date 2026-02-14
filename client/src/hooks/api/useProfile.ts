import { useMutation, useQuery } from "@tanstack/react-query";
import { deleteAccount, getProfile } from "../../api/profile";
import { ApiError } from "../../lib/api-client";
import type { DeleteAccountResponse, SafeUser } from "@app/shared-types";

type ApiFailureResponse = {
  success: false;
  message: string;
  status?: number;
};

type DeleteAccountData = Extract<DeleteAccountResponse, { success: true }>["data"];

/**
 * Read an optional HTTP status from an API error payload.
 *
 * @param response - API response object that may include status metadata
 * @returns Numeric status when provided by the API client
 */
function getResponseStatus(response: object): number | undefined {
  if ("status" in response && typeof response.status === "number") {
    return response.status;
  }

  return undefined;
}

/**
 * Convert API failure responses into status-aware errors for callers.
 *
 * @param response - Failed API response payload
 * @returns ApiError with preserved HTTP status when available
 */
function toApiError(response: ApiFailureResponse): ApiError {
  return new ApiError(response.message, response.status ?? 500);
}

/**
 * Fetch current user's profile with React Query.
 *
 * @param authToken - JWT authentication token (query disabled if undefined)
 * @returns React Query result with profile data, loading state, and error handling
 */
export function useGetProfile(authToken?: string) {
  return useQuery({
    queryKey: ["profile", authToken],
    queryFn: async (): Promise<SafeUser> => {
      const response = await getProfile();
      if (!response.success) {
        throw toApiError({
          success: false,
          message: response.message,
          status: getResponseStatus(response),
        });
      }

      return response.data;
    },
    enabled: !!authToken,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}

/**
 * Delete the current user's account.
 *
 * @returns React Query mutation for account deletion
 */
export function useDeleteAccount() {
  return useMutation({
    mutationFn: async (): Promise<DeleteAccountData> => {
      const response = await deleteAccount();
      if (!response.success) {
        throw toApiError({
          success: false,
          message: response.message,
          status: getResponseStatus(response),
        });
      }

      return response.data;
    },
  });
}
