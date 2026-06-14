import { LoginSchemaInput, RegisterSchemaInput } from "@/libs/validations/auth";
import AuthService from "@/services/auth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useUser } from "./useUser";
import { useState } from "react";
import supabase from "@/utils/supabase/supabaseClient";
import UserService from "@/services/user";

export function useLoginMutation() {
  const queryClient = useQueryClient();
  const router = useRouter();

  const { mutate, isPending } = useMutation({
    mutationFn: async (credentials: LoginSchemaInput) => {
      const authResult = await AuthService.loginUser(credentials);
      if (!authResult?.user) throw new Error("Authentication node rejection.");
      return authResult;
    },

    onMutate: () => {
      return toast.loading("Verifying transaction credentials...");
    },

    onSuccess: async (data, variables, contextToastId) => {
      toast.dismiss(contextToastId);
      toast.success("Identity verified! Dispatching authentication code...");

      queryClient.setQueryData(["auth-user"], {
        id: data.user.id,
        email: data.user.email,
        username: data.user.user_metadata?.username || "Investor",
        firstName: data.user.user_metadata?.first_name || "",
        lastName: data.user.user_metadata?.last_name || "",
        isVerified: !!data.user.email_confirmed_at,
        isOtpVerified: false,
      });

      try {
        await fetch("/api/v1/auth/send-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: data.user.id,
            email: data.user.email,
            firstName: data.user.user_metadata?.first_name || "",
          }),
        });

        router.push("/auth/verify-otp");
      } catch (err) {
        toast.error("Failed to seed transaction OTP. Contact network manager.");
      }
    },
    onError: (error: any, variables, contextToastId) => {
      toast.dismiss(contextToastId);
      toast.error(error.message || "Invalid login credentials.");
    },
  });

  return { mutate, isPending };
}

export function useRegisterMutation() {
  const queryClient = useQueryClient();
  const router = useRouter();

  const { mutate, isPending } = useMutation({
    mutationFn: async (formData: RegisterSchemaInput) => {
      // 1. Core user registration with Supabase Auth
      const userData = await AuthService.registerUser(formData);

      if (!userData?.user) {
        throw new Error(
          "Initialization vectors failed to assign account profiles.",
        );
      }
      return userData;
    },
    onMutate: () => {
      return toast.loading("Processing validation records...");
    },
    onSuccess: async (data, variables, contextToastId) => {
      toast.dismiss(contextToastId);
      toast.success(
        "Security profile initialized! Please request your access token from your manager.",
      );

      queryClient.setQueryData(["auth-user"], {
        id: data.user?.id,
        email: data.user?.email,
        username: data.user?.user_metadata?.username || "Investor",
        firstName:
          data.user?.user_metadata?.first_name || variables.firstname || "",
        lastName:
          data.user?.user_metadata?.last_name || variables.lastname || "",
        isVerified: false,
        isOtpVerified: false,
      });

      try {
        await fetch("/api/v1/auth/send-email-verification", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: data.user?.id,
            email: data.user?.email,
            firstName: data.user?.user_metadata?.first_name || "",
          }),
        });

        router.push("/auth/verify-email");
      } catch (err) {
        toast.error("Failed to seed transaction OTP. Contact network manager.");
      }
    },
    onError: (error: any, variables, contextToastId) => {
      toast.dismiss(contextToastId);
      if (error.status === 429) {
        alert("Too many attempts. Please try again in an hour.");
      } else {
        toast.error(
          error.message ||
            "Registration sequence failed. Please verify credentials.",
        );
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
