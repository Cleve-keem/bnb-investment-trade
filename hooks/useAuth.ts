import { useCurrentUser } from "./useCurrentUser";

export function useAuth() {
  const query = useCurrentUser();

  return {
    user: query.data?.data,
    isLoading: query.isLoading,
    isAuthenticated: !!query.data?.data,
    refetch: query.refetch,
  };
}
