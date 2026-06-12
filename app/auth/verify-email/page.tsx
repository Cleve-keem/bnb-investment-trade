"use client";

import { useUser } from "@/hooks/useUser";
import { ArrowRight, ExternalLink, Mail } from "lucide-react";
import Link from "next/link";

export default function VerifyAccount() {
  const { data: user } = useUser();

  return (
    <div className="min-h-screen text-white flex flex-col items-center justify-center p-6 bg-black">
      {/* Upper Content Section */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center bg-zinc-900 border border-zinc-800 size-16 rounded-2xl relative mb-5">
          <Mail className="size-7 text-zinc-200" />
          <span className="absolute -top-1 -right-1 size-3 bg-yellow-500 rounded-full animate-pulse" />
        </div>

        <h2 className="text-3xl font-black mb-3 tracking-tight bg-linear-to-b from-white to-zinc-400 bg-clip-text text-transparent">
          Check your mail
        </h2>
        <p className="text-zinc-400 max-w-sm mx-auto text-sm leading-relaxed">
          We’ve sent a verification link to <br />
          <span className="text-white font-medium underline decoration-yellow-500/40 underline-offset-4">
            {user?.email}
          </span>
        </p>
      </div>

      {/* Interactive Form Actions */}
      <div className="w-full max-w-sm mx-auto space-y-3">
        {/* Primary CTA Link (Styled like a button) */}
        <a
          href="https://gmail.com"
          target="_blank"
          rel="noopener noreferrer"
          className="flex w-full h-12 bg-yellow-500 hover:bg-yellow-400 text-black font-semibold rounded-xl items-center justify-center gap-2 transition-all shadow-lg shadow-yellow-500/10 active:scale-[0.99]"
        >
          Open Mailbox
          <ExternalLink className="size-4 stroke-[2.5]" />
        </a>

        {/* Secondary Navigation Link */}
        <Link href="/auth/register" className="block">
          <button className="flex w-full h-12 rounded-xl text-zinc-400 hover:text-white items-center justify-center gap-2 transition-colors text-sm font-medium">
            I've verified my account
            <ArrowRight className="size-4" />
          </button>
        </Link>

        {/* Separator */}
        <div className="relative py-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-zinc-800" />
          </div>
          <div className="relative flex justify-center text-[10px] uppercase tracking-widest">
            <span className="bg-black px-4 text-zinc-500 font-semibold">
              Didn't get the email?
            </span>
          </div>
        </div>
        {/* Resend Actions */}
        <div className="text-center space-y-5">
          <button className="h-10 px-6 rounded-xl border border-dashed border-zinc-700 text-sm text-zinc-300 hover:text-white hover:border-yellow-500 hover:bg-yellow-500/5 transition-all active:scale-[0.98]">
            Resend Link
          </button>

          <p className="text-xs text-zinc-500 leading-relaxed max-w-xs mx-auto">
            Check your spam or junk folder if you don't see it in your inbox
            within a few minutes.
          </p>
        </div>
      </div>
    </div>
  );
}
