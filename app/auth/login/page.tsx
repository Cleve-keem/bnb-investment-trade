"use client";

import { useEffect, Suspense } from "react";
import {
  useForm,
  UseFormRegister,
  FieldErrors,
  UseFormHandleSubmit,
} from "react-hook-form";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { ShieldCheck, UserPlus } from "lucide-react";

import FormField from "@/components/forms/FormField";
import Logo from "@/components/Logo";
import { loginConstants } from "@/constants/auth";
import { loginSchema, LoginSchemaInput } from "@/libs/validations/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLoginMutation } from "@/hooks/auth";

interface LoginFormContentProps {
  register: UseFormRegister<LoginSchemaInput>;
  errors: FieldErrors<LoginSchemaInput>;
  handleSubmit: UseFormHandleSubmit<LoginSchemaInput>;
}

// Safely wraps searchParams to protect Netlify build
function LoginNotificationHandler() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const verified = searchParams.get("verified");
    const error = searchParams.get("error");

    if (verified === "true") {
      toast.success(
        "Security authorization confirmed! Access ledger unlocked. Please sign in.",
      );
    }

    if (error) {
      if (error === "token_expired") {
        toast.error("Verification parameters expired. Please re-register.");
      } else {
        toast.error("Invalid verification trace context mapping.");
      }
    }
  }, [searchParams]);

  return null;
}

function LoginFormContent({
  register,
  errors,
  handleSubmit,
}: LoginFormContentProps) {
  const { mutate: loginMutate, isPending } = useLoginMutation();

  return (
    <form
      onSubmit={handleSubmit((values) => loginMutate(values))}
      className="flex flex-col"
    >
      {loginConstants.map((field) => {
        const fieldError =
          errors[field.fieldName as keyof LoginSchemaInput]?.message;
        return (
          <div key={field.id}>
            {field.fieldName === "password" ? (
              <>
                <FormField
                  field={field}
                  register={register}
                  error={fieldError}
                />
                <Link
                  href="/auth/forgot-password"
                  className="text-xs text-[#dabc17]"
                >
                  Forgot password?
                </Link>
              </>
            ) : (
              <FormField field={field} register={register} error={fieldError} />
            )}
          </div>
        );
      })}

      <button
        type="submit"
        disabled={isPending}
        className={`w-full bg-[#dabc17] text-black font-bold py-2.5 rounded-md my-4 text-sm tracking-wide transition-all ${
          isPending
            ? "opacity-50 cursor-not-allowed scale-[0.99]"
            : "hover:bg-[#ebd026] active:scale-[0.98]"
        }`}
      >
        {isPending ? "Opening Secure Session..." : "Login"}
      </button>

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
  );
}

export default function LoginPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginSchemaInput>({
    resolver: zodResolver(loginSchema),
  });

  return (
    <div className="flex justify-center items-center min-h-screen p-3 bg-black text-white antialiased">
      <Suspense fallback={null}>
        <LoginNotificationHandler />
      </Suspense>

      <div className="w-full max-w-md p-4">
        <div className="flex flex-col items-center gap-2 mb-8">
          <Logo />
          <h2 className="text-xl">
            <span className="text-[#e9ce39] font-semibold">BNB</span> Investment
            Trade
          </h2>
          <p className="text-xs text-gray-500 tracking-wider">
            Secure . Reliable . Trusted
          </p>
        </div>

        <div className="border border-[#e9cf393a] bg-[#050505] p-6 rounded-md shadow-2xl">
          <h3 className="font-semibold text-2xl mb-1">Welcome Back</h3>
          <p className="text-[12px] mb-5 text-gray-400">
            Please login to your account
          </p>

          <LoginFormContent
            register={register}
            errors={errors}
            handleSubmit={handleSubmit}
          />
        </div>

        <div className="flex justify-center gap-2 mt-10">
          <ShieldCheck size={15} className="text-gray-400" />
          <p className="text-[10px] text-center text-gray-500 leading-5">
            Your assets are protected with <br /> industry-leading security
          </p>
        </div>
      </div>
    </div>
  );
}
