"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { KeyRound, ShieldAlert, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import Logo from "@/components/Logo";

export default function VerifyOtpPage() {
  const [otp, setOtp] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const router = useRouter();
  
  const user = useAuthStore((state) => state.user);
  // Grab our store state mutator action
  // const updateProfile = useAuthStore((state) => useAuthStore.getState().updateProfile);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length < 6) {
      toast.error("Please enter a valid 6-digit cryptographic security code.");
      return;
    }

    setIsVerifying(true);
    const loadingToast = toast.loading("Validating OTP authentication node...");

    try {
      // 🚀 REST API/Edge Function Call: Send the code to your backend to verify
      // const response = await AuthService.verifyOtpCode(user?.email, otp);
      
      // Simulating a successful code validation match loop for verification setup:
      if (otp === "123456") { // Replace with your backend verification result logic
        // updateProfile({ isOtpVerified: true });
        toast.dismiss(loadingToast);
        toast.success("Identity authorization verified. Ledger access granted.");
        router.push("/dashboard");
      } else {
        throw new Error("Invalid security token code. Access denied.");
      }
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
          <h2 className="text-xl font-semibold"><span className="text-[#e9ce39]">BNB</span> Security Node</h2>
        </div>

        <div className="border border-gray-900 bg-[#050505] p-6 rounded-xl shadow-2xl space-y-6">
          <div>
            <h3 className="font-bold text-xl text-white mb-1">Two-Factor Authorization</h3>
            <p className="text-xs text-gray-400">
              An encrypted one-time security code was sent to <span className="text-white font-medium">{user?.email || "your registered email"}</span>.
            </p>
          </div>

          <form onSubmit={handleVerify} className="space-y-4">
            <div className="relative flex items-center">
              <KeyRound size={18} className="absolute left-3 text-gray-500" />
              <input
                type="text"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                placeholder="Enter 6-digit OTP code"
                className="w-full bg-[#121212] border border-gray-800 focus:border-[#dabc17] rounded-md py-2.5 pl-10 text-center text-lg font-mono tracking-[0.5em] outline-none transition-all"
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

          {/* Account Manager Institutional Banner */}
          <div className="border border-[#e9cf391f] bg-[#e9cf3905] p-4 rounded-lg space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#e9ce39]">
              <MessageSquare size={14} /> Contact Account Manager
            </div>
            <p className="text-[11px] text-gray-400 leading-relaxed">
              If you experience network delivery delays or need immediate manual ledger clearance, please connect with your designated **BNB Investment Account Manager** directly for dynamic verification.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}