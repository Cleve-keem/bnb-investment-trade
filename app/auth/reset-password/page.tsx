"use client";

import FormField from "@/components/forms/FormField";
import Logo from "@/components/Logo";
import {
  ResetPasswordInput,
  resetPasswordSchema,
} from "@/libs/validations/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { ArrowLeft, CheckCircle2, Lock, ShieldAlert } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import Link from "next/link";

function ResetPasswordFormContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [complete, setComplete] = useState<boolean>(false);

  // Extract variables passed from the custom Resend email template link
  const email = searchParams.get("email") || "";
  const token = searchParams.get("token") || "";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const updatePasswordMutation = useMutation({
    mutationFn: async (values: ResetPasswordInput) => {
      const response = await fetch("/api/v1/auth/confirm-password-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          token,
          password: values.password,
        }),
      });

      const result = await response.json();
      if (!response.ok)
        throw new Error(
          result.error || "Failed to re-initialize account credentials.",
        );
      return result;
    },
    onMutate: () => {
      return toast.loading("Overwriting cryptographic profile nodes...");
    },
    onSuccess: (data, variables, contextToastId) => {
      toast.dismiss(contextToastId);
      toast.success("Security keys successfully modified!");
      setComplete(true);
    },
    onError: (error: any, variables, contextToastId) => {
      toast.dismiss(contextToastId);
      toast.error(error.message || "Failed to commit credential updates.");
    },
  });

  // Safe fallback if an investor lands here without proper verification signatures
  if (!email || !token) {
    return (
      <div className="text-center py-6">
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 mb-4 inline-block">
          <ShieldAlert size={28} />
        </div>
        <h3 className="font-semibold text-xl text-zinc-100 tracking-tight mb-2">
          Invalid Security Trace
        </h3>
        <p className="text-xs text-zinc-400 max-w-xs leading-relaxed mb-6 mx-auto">
          This secure link is either malformed, broken, or has expired. Please
          initiate a new passkey recovery request sequence.
        </p>
        <Link
          href="/auth/forgot-password"
          className="inline-flex items-center gap-2 text-xs font-medium text-[#e9ce39] hover:underline"
        >
          <ArrowLeft size={14} /> Re-request recovery link
        </Link>
      </div>
    );
  }

  return (
    <>
      {!complete ? (
        <>
          <div className="mb-6">
            <h3 className="font-semibold text-2xl text-zinc-100 tracking-tight mb-1.5">
              Reset Security Keys
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Establishing a new secure override trace password for account
              identifier:{" "}
              <span className="text-zinc-200 font-medium">{email}</span>
            </p>
          </div>

          <form
            onSubmit={handleSubmit((values) =>
              updatePasswordMutation.mutate(values),
            )}
            className="flex flex-col space-y-4"
          >
            <FormField
              field={{
                id: 1,
                name: "New Master Password",
                fieldName: "password",
                type: "password",
                placeholder: "••••••••••••",
                icon: Lock,
              }}
              register={register}
              error={errors.password?.message}
            />

            <FormField
              field={{
                id: 2,
                name: "Confirm Master Password",
                fieldName: "confirmPassword",
                type: "password",
                placeholder: "••••••••••••",
                icon: Lock,
              }}
              register={register}
              error={errors.confirmPassword?.message}
            />

            <button
              type="submit"
              disabled={updatePasswordMutation.isPending}
              className={`w-full bg-[#dabc17] text-black font-bold py-2.5 rounded-lg text-sm tracking-wide transition-all ${
                updatePasswordMutation.isPending
                  ? "opacity-50 cursor-not-allowed scale-[0.99]"
                  : "hover:bg-[#ebd026] active:scale-[0.98]"
              }`}
            >
              {updatePasswordMutation.isPending
                ? "Updating Security Ledgers..."
                : "Commit Credential Override"}
            </button>
          </form>
        </>
      ) : (
        /* SUCCESS COMPLETION FLOW STATE */
        <div className="text-center py-4 flex flex-col items-center">
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mb-4 animate-bounce">
            <CheckCircle2 size={26} />
          </div>
          <h3 className="font-semibold text-xl text-zinc-100 tracking-tight mb-2">
            Credentials Rewritten
          </h3>
          <p className="text-xs text-zinc-400 max-w-xs leading-relaxed mb-6">
            Your master password node has been cleanly overwritten. You can now
            securely log back into your dashboard workspace.
          </p>
          <button
            onClick={() => router.push("/auth/login")}
            className="w-full bg-zinc-900 border border-zinc-800 text-zinc-200 hover:text-white hover:bg-zinc-800 font-medium py-2 rounded-lg text-xs transition-colors"
          >
            Proceed to Secure Login Gate
          </button>
        </div>
      )}
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="flex justify-center items-center min-h-screen p-4 bg-black text-white antialiased">
      <div className="w-full max-w-md p-4">
        {/* Branding Node Header */}
        <div className="flex flex-col items-center gap-2 mb-8">
          <Logo />
          <h2 className="text-xl">
            <span className="text-[#e9ce39] font-semibold">BNB</span> Investment
            Trade
          </h2>
          <p className="text-xs text-zinc-500 tracking-wider">
            Secure . Reliable . Trusted
          </p>
        </div>

        {/* Central Card Container */}
        <div className="border border-[#e9cf393a] bg-[#09090B] p-6 rounded-xl shadow-2xl relative overflow-hidden">
          {/* Next.js requires useSearchParams hooks to be wrapped in a Suspense boundary */}
          <Suspense
            fallback={
              <div className="text-zinc-500 text-xs text-center py-8">
                Mounting secure handshake tunnel...
              </div>
            }
          >
            <ResetPasswordFormContent />
          </Suspense>

          {/* Bottom Navigation Safety Anchor */}
          {!updatePasswordMutationIsPendingPlaceholder && (
            <div className="mt-6 pt-5 border-t border-zinc-900 flex justify-center">
              <Link
                href="/auth/login"
                className="inline-flex items-center gap-2 text-xs font-medium text-zinc-500 hover:text-zinc-400 transition-colors group"
              >
                <ArrowLeft
                  size={12}
                  className="transition-transform group-hover:-translate-x-0.5"
                />
                <span>Return to terminal gate</span>
              </Link>
            </div>
          )}

          <div className="absolute top-0 right-0 w-24 h-24 bg-[#dabc17] opacity-[0.01] rounded-full blur-2xl pointer-events-none" />
        </div>
      </div>
    </div>
  );
}

// Global placeholder variable for the absolute bottom condition check rule context block
const updatePasswordMutationIsPendingPlaceholder = false;
