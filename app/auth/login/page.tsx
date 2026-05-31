"use client";

import FormField from "@/components/forms/FormField";
import Logo from "@/components/Logo";
import { loginConstants } from "@/constants/auth";
import { loginSchema, LoginSchemaInput } from "@/libs/validations/auth";
import AuthService from "@/services/auth";
import { useAuthStore } from "@/store/useAuthStore";
import { zodResolver } from "@hookform/resolvers/zod";
import { ShieldCheck, UserPlus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export default function LoginPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginSchemaInput>({
    resolver: zodResolver(loginSchema),
  });
  const setSession = useAuthStore((state) => state.setSession);
  const router = useRouter();

  const onSubmit = async (data: LoginSchemaInput) => {
    const loadingToast = toast.loading("Logging in...");

    try {
      const authResult = await AuthService.loginUser(data);
      if (authResult?.user) {
        setSession({
          id: authResult.user.id,
          email: authResult.user.email || "",
          username: authResult.user.user_metadata?.username || "",
          firstName: authResult.user.user_metadata?.first_name || "",
          middleName: authResult.user.user_metadata?.middle_name || "",
          lastName: authResult.user.user_metadata?.last_name || "",
          phoneNumber: authResult.user.user_metadata?.phone_number || "",
          isEmailVerified: authResult.user.email_confirmed_at ? true : false,
          isOtpVerified: false,
        });
      }
      toast.dismiss(loadingToast);
      toast.success("Check your email to calm your secure code!");
      router.push("/auth/verify-otp");
    } catch (error: any) {
      toast.dismiss(loadingToast);
      toast.error(error.message || "Login failed.");
    }
  };

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
          <form onSubmit={handleSubmit(onSubmit)}>
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
              disabled={isSubmitting}
              className={`w-full bg-[#dabc17] text-black font-bold py-2.5 rounded-md my-4 text-sm tracking-wide transition-all ${
                isSubmitting
                  ? "opacity-50 cursor-not-allowed scale-[0.99]"
                  : "hover:bg-[#ebd026] active:scale-[0.98]"
              }`}
            >
              {isSubmitting ? "Opening Secure Session..." : "Login"}
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
