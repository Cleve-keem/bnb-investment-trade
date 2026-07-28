"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, ShieldAlert, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import Logo from "@/components/Logo";
import { useQueryClient } from "@tanstack/react-query";
import { useUser } from "@/hooks/useUser";

export default function VerifyOtpForm() {
  const [isVerifying, setIsVerifying] = useState(false);
  const [otp, setOtp] = useState("");
  const queryClient = useQueryClient();
  const router = useRouter();

  const { data: user } = useUser();

  const handleVerifySuccess = async (e: React.FormEvent) => {
    e.preventDefault();

    if (otp.length < 6) {
      toast.error("Please enter a valid 6-digit cryptographic security code.");
      return;
    }

    setIsVerifying(true);
    const loadingToast = toast.loading("Validating OTP authentication node...");

    try {
      const response = await fetch("/api/v1/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: otp,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Mismatched validation credentials.");
      }

      queryClient.setQueryData(["auth-user"], (oldData: any) => {
        if (!oldData) return null;
        return {
          ...oldData,
          is_otp_verified: true,
        };
      });

      toast.dismiss(loadingToast);
      toast.success("Identity authorization verified. Ledger access granted.");
      router.push("/dashboard");
    } catch (error: any) {
      toast.dismiss(loadingToast);
      toast.error(error.message || "OTP verification failed.");
      setIsVerifying(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen p-3 bg-black text-white antialiased">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center gap-2 mb-8">
          <Logo />
          <h2 className="text-xl font-semibold">
            <span className="text-[#e9ce39]">BNB</span> Security Node
          </h2>
        </div>

        <div className="border border-gray-900 bg-[#050505] p-6 rounded-xl shadow-2xl space-y-6">
          <div>
            <h3 className="font-bold text-xl text-white mb-1">
              Please enter the BNB Acceptance Verification Code to proceed.
            </h3>
            <p className="text-xs text-gray-400">
              An encrypted one-time security code was sent to{" "}
              <span className="text-white font-medium">{user?.email}</span>.
            </p>
          </div>

          <form onSubmit={handleVerifySuccess} className="space-y-4">
            <div className="relative flex items-center">
              <KeyRound size={18} className="absolute left-3 text-gray-500" />
              <input
                type="text"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                placeholder="Enter 6-digit code"
                className="w-full bg-[#121212] border border-gray-800 focus:border-[#dabc17] rounded-md py-2.5 pl-10 text-lg outline-none transition-all"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isVerifying}
              className="w-full bg-[#dabc17] text-black font-bold py-2.5 rounded-md text-sm transition-all tracking-wide disabled:opacity-50"
            >
              {isVerifying ? "Verifying Token..." : "Authorize Security Token"}
            </button>
          </form>

          <div className="border border-[#e9cf391f] bg-[#e9cf3905] p-4 rounded-lg space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#e9ce39]">
              <MessageSquare size={14} /> Contact Account Manager
            </div>
            <p className="text-[11px] text-gray-400 leading-relaxed">
              If you experience network delivery delays or need immediate manual
              ledger clearance, please connect with your designated **BNB
              Investment Account Manager** directly for dynamic verification.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
