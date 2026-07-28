import { useQuery } from "@tanstack/react-query";
import { AuthApi } from "@/libs/api/auth.api";

export function useCurrentUser() {
  return useQuery({
    queryKey: ["current-user"],
    queryFn: AuthApi.me,
    retry: false,
    staleTime: 1000 * 60 * 5,
  });
}
