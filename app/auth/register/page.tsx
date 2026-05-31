"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Logo from "@/components/Logo";
import FormField from "@/components/forms/FormField";
import { registrationConstants } from "@/constants/auth";
import AuthService from "@/services/auth";
import { useForm } from "react-hook-form";
import { registerSchema, RegisterSchemaInput } from "@/libs/validations/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuthStore } from "@/store/useAuthStore";

export default function RegistrationPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterSchemaInput>({
    resolver: zodResolver(registerSchema),
  });
  const setSession = useAuthStore((state) => state.setSession);
  const router = useRouter();

  async function onSubmit(data: RegisterSchemaInput) {
    const loadingToast = toast.loading("Processing validation records...");

    try {
      const authResult = await AuthService.registerUser(data);
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
      toast.success(
        "Security profile initialized! Check your email to verify authorization.",
      );
      router.push("/auth/verify-email");
    } catch (error: any) {
      toast.dismiss(loadingToast);
      toast.error(error.message || "Registration failed.");
    }
  }

  return (
    <div className="flex justify-center items-center min-h-screen p-4 bg-black text-white antialiased">
      <div className="w-full max-w-xl">
        <div className="flex flex-col items-center gap-2 mb-6">
          <Logo />
          <h2 className="text-2xl font-tracking-tight">
            <span className="text-[#e9ce39] font-bold">BNB</span> Investment
            Trade
          </h2>
          <p className="text-xs text-gray-500 uppercase tracking-widest">
            Secure &bull; Reliable &bull; Trusted
          </p>
        </div>

        <div className="border border-gray-900 bg-[#050505] p-8 rounded-xl shadow-2xl">
          <Link
            href="/auth/login"
            className="hover:text-white text-gray-500 text-xs transition-colors mb-4 inline-block"
          >
            &larr; Return to Secure Gateway
          </Link>
          <h3 className="font-bold text-2xl tracking-tight text-white mb-1">
            Create Institutional Account
          </h3>
          <p className="text-xs text-gray-400 mb-6">
            Verify your compliance parameters to access active ledgers.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-1">
            {registrationConstants.map((field) => {
              const fieldError =
                errors[field.fieldName as keyof RegisterSchemaInput]?.message;

              let nameGroupError = undefined;
              if (field.fieldName === "nameGroup") {
                nameGroupError =
                  errors.firstname?.message ||
                  errors.middlename?.message ||
                  errors.lastname?.message;
              }
              return (
                <FormField
                  key={field.id}
                  field={field}
                  register={register}
                  error={fieldError || nameGroupError}
                />
              );
            })}

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full bg-[#dabc17] text-black font-bold py-3 rounded-md mt-6 text-sm transition-all tracking-wide ${isSubmitting ? "opacity-50 cursor-not-allowed scale-[0.99]" : "hover:bg-[#ebd026] active:scale-[0.98]"}`}
            >
              {isSubmitting
                ? "Encrypting Account Profile..."
                : "Establish Secure Profile"}
            </button>
          </form>

          <p className="text-gray-400 text-xs text-center mt-5">
            By creating an account, you agree to our{" "}
            <span className="hover:underline text-brand cursor-pointer">
              Terms of Service
            </span>{" "}
            and{" "}
            <span className="hover:underline text-brand cursor-pointer">
              Privacy Policy
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
