import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useState } from "react";
import { AuthApi } from "@/libs/api/auth.api";

export function useLoginMutation() {
  const router = useRouter();

  const { mutate, isPending } = useMutation({
    mutationFn: AuthApi.login,

    onMutate: () => {
      return toast.loading("Verifying credentials...");
    },

    onSuccess: (data, variables, contextToastId) => {
      toast.dismiss(contextToastId);
      toast.success("Welcome back!");

      if (data.data.role === "admin") return router.push("/admin/dashboard");

      router.push("/dashboard");
    },

    onError(error, variables, contextToastId) {
      toast.dismiss(contextToastId);
      toast.error(error.message);
    },
  });

  return { mutate, isPending };
}

export function useRegisterMutation() {
  const router = useRouter();

  const { mutate, isPending } = useMutation({
    mutationFn: AuthApi.register,

    onMutate: () => {
      return toast.loading("Processing validation records...");
    },

    onSuccess(data, variables, contextToastId) {
      toast.dismiss(contextToastId);
      toast.success(
        "Registration successful! Please check your email to verify your account.",
      );
      router.push(
        `/auth/verify-email?email=${encodeURIComponent(data.data.email)}`,
      );
    },

    onError: (error: any, variables, contextToastId) => {
      toast.dismiss(contextToastId);
      if (error.status === 429) {
        alert("Too many attempts. Please try again in an hour.");
      } else {
        toast.error(error.message);
      }
    },
  });
  return { mutate, isPending };
}

export function useForgotPasswordMutation(onSuccessCallback?: () => void) {
  const [emailSent, setEmailSent] = useState<boolean>(false);

  const { mutate, isPending } = useMutation({
    mutationFn: async (email: string) => {
      const response = await fetch(`/api/v1/auth/send-password-reset-link`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || "Failed to transmit custom recovery parameters.",
        );
      }

      return result;
    },
    onMutate: () => {
      return toast.loading("Processing validation records...");
    },
    onSuccess: (data, variables, contextToastId) => {
      toast.dismiss(contextToastId);
      toast.success(
        "A custom reset link has been dispatched to your email address.",
      );
      setEmailSent(true);

      if (onSuccessCallback) onSuccessCallback();
    },
    onError: (error: any, variables, contextToastId) => {
      toast.dismiss(contextToastId);
      toast.error(
        error.message || "Failed to process recovery initialization.",
      );
    },
  });

  return { mutate, isPending, emailSent };
}
