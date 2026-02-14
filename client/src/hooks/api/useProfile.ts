import { useMutation, useQuery } from "@tanstack/react-query";
import { deleteAccount, getProfile } from "../../api/profile";
import type { DeleteAccountResponse, SafeUser } from "@app/shared-types";

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
        throw new Error(response.message);
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
    mutationFn: async (): Promise<DeleteAccountResponse> => {
      const response = await deleteAccount();
      if (!response.success) {
        throw new Error(response.message);
      }

      return response;
    },
  });
}
