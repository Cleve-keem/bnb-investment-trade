"use client";

import FormField from "@/components/forms/FormField";
import Logo from "@/components/Logo";
import { registrationConstants } from "@/constants/auth";
import Link from "next/link";

export default function RegistrationPage() {
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
          <Link
            href="/auth/login"
            className="hover:underline text-gray-400 text-xs mb-2 block"
          >
            &larr; Back to Login
          </Link>
          <h3 className="font-semibold text-2xl mb-1">Create Account</h3>
          <p className="text-[12px] mb-5">
            Fill in your details to get started
          </p>

          <form>
            {registrationConstants.map((field) => (
              <FormField key={field.id} field={field} />
            ))}
            <button
              type="submit"
              className="w-full bg-[#dabc17] text-black font-semibold py-2 rounded-md my-4"
            >
              Finish Signing Up
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
