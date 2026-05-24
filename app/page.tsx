"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Shield, TrendingUp, BarChart3, ArrowRight } from "lucide-react";
import supabase from "@/utils/supabase/supabaseClient";
import Logo from "@/components/Logo";

export default function Home() {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    async function checkSession() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session) {
          router.replace("/dashboard");
        } else {
          setCheckingAuth(false);
        }
      } catch (error) {
        console.error("Auth initialization failure:", error);
        setCheckingAuth(false);
      }
    }
    checkSession();
  }, [router]);

  if (checkingAuth) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-black text-white">
        <div className="animate-pulse flex flex-col items-center gap-3">
          <div className="w-16 h-16 relative mb-2">
            <Image
              src="/logo2.png"
              alt="BNB Logo"
              fill
              className="object-contain"
              priority
              sizes="(max-width: 768px) 48px, 48px"
            />
          </div>
          <h2 className="text-xl font-semibold tracking-wide">
            <span className="text-[#e9ce39]">BNB Investment</span> Trade
          </h2>
          <p className="text-xs text-gray-500 uppercase tracking-widest">
            Initializing Secure Session...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col selection:bg-[#dabc17] selection:text-black">
      {/* Structural Header Navigation */}
      <header className="border-b border-gray-900 bg-black/50 backdrop-blur-md sticky top-0 z-50 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Image
            src="/logo2.png"
            alt="BNB Logo"
            width={32}
            height={32}
            priority
            sizes="(max-width: 768px) 48px, 48px"
          />
          <span className="font-bold text-lg hidden sm:inline">
            <span className="text-[#e9ce39]">BNB</span> Investment Trade
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/auth/login"
            className="text-xs font-semibold uppercase tracking-wider text-gray-400 hover:text-white transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/auth/register"
            className="bg-[#dabc17] text-black font-semibold text-xs uppercase tracking-wider px-4 py-2 rounded hover:bg-[#ebd026] transition-all"
          >
            Get Started
          </Link>
        </div>
      </header>

      {/* Main Feature Lander Grid */}
      <main className="max-w-5xl mx-auto px-6 py-12 md:py-24 grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
        {/* Pitch Hero Text */}
        <div className="md:col-span-7 space-y-6 text-center md:text-left">
          <div className="inline-flex items-center gap-2 bg-gray-950 border border-gray-900 px-3 py-1 rounded-full text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
            <Shield size={12} className="text-[#dabc17]" /> Next-Gen Wealth
            Infrastructure
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-tight">
            Secure Wealth Systems. <br />
            <span className="text-[#e9ce39]">Reliable Capital Growth.</span>
          </h1>
          <p className="text-sm text-gray-400 max-w-md mx-auto md:mx-0 leading-relaxed">
            Access institutional-grade digital asset ledgers managed under
            strict cryptographic verification layers. Secure, automated
            compliance tools built for modern global investors.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start pt-2">
            <Link
              href="/auth/register"
              className="flex items-center justify-center gap-2 bg-[#dabc17] text-black font-bold px-6 py-3.5 rounded-md text-sm hover:bg-[#ebd026] active:scale-[0.98] transition-all group"
            >
              Establish Account Portfolio
              <ArrowRight
                size={16}
                className="group-hover:translate-x-1 transition-transform"
              />
            </Link>
          </div>
        </div>

        {/* Dynamic Trust Cards (Fills space previously lost to the splash timer) */}
        <div className="md:col-span-5 grid grid-cols-1 gap-4 w-full">
          <div className="border border-gray-900 bg-linear-to-br from-gray-950 to-black p-5 rounded-xl space-y-2">
            <div className="p-2 bg-gray-900/50 w-fit rounded-lg text-[#e9ce39]">
              <TrendingUp size={20} />
            </div>
            <h3 className="font-semibold text-sm">Optimized Yield Mechanics</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Algorithmic transaction pooling optimized to eliminate capital
              execution inefficiencies.
            </p>
          </div>

          <div className="border border-gray-900 bg-linear-to-br from-gray-950 to-black p-5 rounded-xl space-y-2">
            <div className="p-2 bg-gray-900/50 w-fit rounded-lg text-[#e9ce39]">
              <BarChart3 size={20} />
            </div>
            <h3 className="font-semibold text-sm">Real-Time Balances</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Cryptographic tracking delivers sub-second balance auditing via
              direct service layers.
            </p>
          </div>
        </div>
      </main>

      {/* Compliance Footer Anchor */}
      <footer className="border-t border-gray-900 py-6 text-center text-[10px] text-gray-600 space-y-1">
        <p>
          &copy; {new Date().getFullYear()} BNB Investment Trade. All assets
          fully protected under multi-signature protocol layers.
        </p>
        <p className="max-w-md mx-auto px-4">
          Financial trading carries execution risk. Ensure compliance
          verification parameters match legal ID states exactly before fund
          allocation.
        </p>
      </footer>
    </div>
  );
}
