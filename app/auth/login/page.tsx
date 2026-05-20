"use client";

import FormField from "@/components/forms/FormField";
import Logo from "@/components/Logo";
import { loginConstants } from "@/constants/auth";
import { ShieldCheck, UserPlus } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="flex justify-center items-center min-h-screen p-3 bg-black text-white">
      <div>
        {/* header */}
        <div className="flex flex-col items-center gap-2 mb-8">
          <Logo />
          <h2 className="font-bold">
            <span className="text-[#e9ce39]">BNB</span> Investment Trade
          </h2>
          <p>Secure . Reliable . Trusted</p>
        </div>
        <div className="border border-[#e9cf393a] p-6 rounded-md">
          <h3 className="font-semibold text-2xl mb-1">Welcome Back</h3>
          <p className="text-[12px] mb-5 text-gray-400">
            Please login to your account
          </p>
          <form>
            {loginConstants.map((field) => (
              <FormField key={field.id} field={field} />
            ))}
            <button
              type="submit"
              className="w-full bg-[#dabc17] text-black font-semibold py-2 rounded-md my-4"
            >
              Login
            </button>
            {/* ------------ or -------- */}
            <div className="flex items-center gap-2 text-gray-400 text-xs text-center my-2">
              <span className="w-full h-px bg-gray-800 block"></span>
              <span>or</span>
              <span className="w-full h-px bg-gray-800 block"></span>
            </div>
            <Link
              href="/auth/register"
              type="button"
              className="flex items-center justify-center gap-2 w-full border border-[#e9cf393a] text-xs text-brand py-2 rounded-md my-4"
            >
              <UserPlus size={15} />
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
