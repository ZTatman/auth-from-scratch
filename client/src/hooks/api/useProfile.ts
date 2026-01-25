import { useQuery } from "@tanstack/react-query";
import { getProfile } from "../../api/profile";

/**
 * Fetch current user's profile with React Query.
 *
 * @param authToken - JWT authentication token (query disabled if undefined)
 * @returns React Query result with profile data, loading state, and error handling
 */
export function useGetProfile(authToken?: string) {
  return useQuery({
    queryKey: ["profile"],
    queryFn: getProfile,
    enabled: !!authToken,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}
