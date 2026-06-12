import { LoginSchemaInput } from "@/libs/validations/auth";
import AuthService from "@/services/auth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

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

export function useRegisterMutation() {}

