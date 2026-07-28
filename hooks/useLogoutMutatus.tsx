"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { AuthApi } from "@/libs/api/auth.api";

export function useLogoutMutation() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: AuthApi.logout,

    onSuccess() {
      queryClient.clear();

      router.replace("/auth/login");
    },
  });
}
