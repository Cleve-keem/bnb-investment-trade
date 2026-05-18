"use client";

import Image from "next/image";
import { useEffect } from "react";

export default function Onboarding() {
  useEffect(() => {
    const timer = setTimeout(() => {
      window.location.href = "/auth/register";
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex items-center h-screen p-4">
      <div className="">
        <p className="text-sm mb-1">Welcome to</p>
        <div className="flex items-center">
          {/* <Logo /> */}
          <Image
            src="/logo2.png"
            alt="logo"
            width={40}
            height={40}
            className="mr-1"
            priority
          />
          <h2 className="font-semibold text-xl">
            <span className="text-[#e9ce39]">BNB Investment</span> Trade
          </h2>
        </div>
      </div>
    </div>
  );
}
