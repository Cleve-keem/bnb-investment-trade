"use client";

import FormField from "@/components/forms/FormField";
import Logo from "@/components/Logo";
import { loginConstants } from "@/constants/auth";
import { loginSchema, LoginSchemaInput } from "@/libs/validations/auth";
import AuthService from "@/services/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ShieldCheck, UserPlus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

const { register, handleSubmit, formState: { errors } } = useForm<LoginSchemaInput>({
    resolver: zodResolver(loginSchema),
  });

 const loginMutation = useMutation({
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

      // Hydrate TanStack's cache immediately so the user's data is available across the app
      queryClient.setQueryData(["auth-user"], {
        id: data.user.id,
        email: data.user.email,
        username: data.user.user_metadata?.username || "Investor",
        firstName: data.user.user_metadata?.first_name || "",
        lastName: data.user.user_metadata?.last_name || "",
        isVerified: !!data.user.email_confirmed_at,
        isOtpVerified: false,
      });

      // Trigger our server side OTP delivery endpoint
      try {
        await fetch("/api/auth/send-otp", {
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
  })

  return (
    <div className="flex justify-center items-center min-h-screen p-3 bg-black text-white">
      <div className="p-4">
        {/* header */}
        <div className="flex flex-col items-center gap-2 mb-8">
          <Logo />
          <h2 className="text-xl">
            <span className="text-[#e9ce39] font-semibold">BNB</span> Investment
            Trade
          </h2>
          <p className="text-xs">Secure . Reliable . Trusted</p>
        </div>
        <div className="border border-[#e9cf393a] p-6 rounded-md">
          <h3 className="font-semibold text-2xl mb-1">Welcome Back</h3>
          <p className="text-[12px] mb-5 text-gray-400">
            Please login to your account
          </p>
          <form onSubmit={handleSubmit((values) => loginMutation.mutate(values))} className="flex flex-col">
            {loginConstants.map((field) => {
              const fieldError =
                errors[field.fieldName as keyof LoginSchemaInput]?.message;
              return (
                <FormField
                  key={field.id}
                  field={field}
                  register={register}
                  error={fieldError}
                />
              );
            })}
            <button
              type="submit"
              disabled={loginMutation.isPending}
              className={`w-full bg-[#dabc17] text-black font-bold py-2.5 rounded-md my-4 text-sm tracking-wide transition-all ${
                loginMutation.isPending
                  ? "opacity-50 cursor-not-allowed scale-[0.99]"
                  : "hover:bg-[#ebd026] active:scale-[0.98]"
              }`}
            >
              {loginMutation.isPending ? "Opening Secure Session..." : "Login"}
            </button>
            {/* ------------ or -------- */}
            <div className="flex items-center gap-2 text-gray-600 text-xs text-center my-2">
              <span className="w-full h-px bg-gray-900 block"></span>
              <span className="uppercase text-[10px] tracking-widest text-gray-500">
                or
              </span>
              <span className="w-full h-px bg-gray-900 block"></span>
            </div>
            <Link
              href="/auth/register"
              className="flex items-center justify-center gap-2 w-full border border-gray-900 text-xs text-gray-300 hover:text-white hover:border-[#dabc17] py-2.5 rounded-md my-4 transition-all"
            >
              <UserPlus size={15} className="text-[#dabc17]" />
              Create Account
            </Link>
          </form>
        </div>

        <div className="flex justify-center gap-2 mt-10">
          <ShieldCheck size={15} className="text-gray-400" />
          <p className="text-[10px] text-center text-gray-500 leading-5">
            Your assests are protected with <br /> industry-leading security
          </p>
        </div>
      </div>
    </div>
  );
}
