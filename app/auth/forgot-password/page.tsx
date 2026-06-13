"use client";

import FormField from "@/components/forms/FormField";
import Logo from "@/components/Logo";
import { ArrowLeft, KeyRound, Lock, ShieldCheck } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import {
  forgotPasswordSchema,
  ForgotPasswordSchemaInput,
} from "@/libs/validations/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForgotPasswordMutation } from "@/hooks/auth";

export default function ForgotPasswordPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordSchemaInput>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const {
    mutate: forgotPasswordMutation,
    isPending,
    emailSent,
  } = useForgotPasswordMutation();

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

        {/* Central Core Surface Card */}
        <div className="border border-[#e9cf393a] bg-[#09090B] p-6 rounded-xl shadow-2xl relative overflow-hidden">
          {!emailSent ? (
            <>
              <div className="mb-6">
                <h3 className="font-semibold text-2xl text-zinc-100 tracking-tight mb-1.5">
                  Recover Access
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Enter your verified security email context below. We will
                  dispatch a cryptographic reset credential link.
                </p>
              </div>

              <form
                className="flex flex-col space-y-4"
                onSubmit={handleSubmit(({ email }) =>
                  forgotPasswordMutation(email),
                )}
              >
                <FormField
                  field={{
                    id: 1,
                    name: "email",
                    fieldName: "email",
                    type: "email",
                    icon: Lock,
                  }}
                  register={register}
                  error={
                    errors["email" as keyof ForgotPasswordSchemaInput]?.message
                  }
                />

                <button
                  type="submit"
                  className={`w-full bg-[#dabc17] text-black font-bold py-2.5 rounded-lg text-sm tracking-wide transition-all ${
                    isPending
                      ? "opacity-50 cursor-not-allowed scale-[0.99]"
                      : "hover:bg-[#ebd026] active:scale-[0.98]"
                  }`}
                >
                  {isPending
                    ? "Transmitting Reset Request..."
                    : "Request Reset Link"}
                </button>
              </form>
            </>
          ) : (
            /* SUCCESS FEEDBACK STATE */
            <div className="text-center py-4 flex flex-col items-center">
              <div className="p-3 rounded-xl bg-[#dabc17]/10 border border-[#dabc17]/20 text-[#dabc17] mb-4">
                <KeyRound size={24} />
              </div>
              <h3 className="font-semibold text-xl text-zinc-100 tracking-tight mb-2">
                Check Your Ledger Inbox
              </h3>
              <p className="text-xs text-zinc-400 max-w-xs leading-relaxed mb-6">
                If an account exists for that address, a secure credential
                override trace link has been sent.
              </p>
            </div>
          )}

          {/* BACK TO LOGIN ROOT ANCHOR */}
          <div className="mt-6 pt-5 border-t border-zinc-900 flex justify-center">
            <Link
              href="/auth/login"
              className="inline-flex items-center gap-2 text-xs font-medium text-zinc-400 hover:text-[#dabc17] transition-colors group"
            >
              <ArrowLeft
                size={14}
                className="transition-transform group-hover:-translate-x-0.5"
              />
              <span>Return to secure login gate</span>
            </Link>
          </div>

          <div className="absolute top-0 right-0 w-24 h-24 bg-[#dabc17] opacity-[0.01] rounded-full blur-2xl pointer-events-none" />
        </div>

        {/* Structural Security Badge */}
        <div className="flex justify-center gap-2 mt-10">
          <ShieldCheck size={15} className="text-zinc-500" />
          <p className="text-[10px] text-center text-zinc-500 leading-5">
            Your identity nodes are shielded using <br /> end-to-end
            cryptographic integrity protocols
          </p>
        </div>
      </div>
    </div>
  );
}
