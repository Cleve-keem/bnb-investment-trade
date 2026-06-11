"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@supabase/supabase-js";
import { useState } from "react";
import Link from "next/link";

// Initialize standard client instance safely
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
);

export default function DashboardPortal() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // 🚀 Fetch real-time portfolio metrics via TanStack Query
  const { data: portfolio, isLoading: loadingPortfolio } = useQuery({
    queryKey: ["portfolio-metrics"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("portfolios")
        .select("*")
        .single();
      if (error && error.code !== "PGRST116") throw error; // Allow empty row exceptions for new signups
      return (
        data || {
          total_balance: 0,
          active_yield_rate: 0,
          pending_allocations: 0,
        }
      );
    },
    refetchInterval: 10000, // Background updates metrics every 10 seconds automatically
  });

  // 🚀 Fetch transaction list records simultaneously
  const { data: transactions, isLoading: loadingLedger } = useQuery({
    queryKey: ["ledger-history"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ledger_transactions")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5);
      if (error) throw error;
      return data || [];
    },
  });

  return (
    <div className="min-h-screen bg-black text-white font-sans antialiased flex">
      {/* PERSISTENT STRUCTURAL SIDEBAR */}
      <aside
        className={`${sidebarOpen ? "w-64" : "w-20"} bg-[#050505] border-r border-gray-900 transition-all duration-300 p-6 flex flex-col justify-between hidden md:flex`}
      >
        <div className="space-y-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-[#dabc17] flex items-center justify-center text-black font-black tracking-tighter">
              B
            </div>
            {sidebarOpen && (
              <span className="font-bold tracking-tight text-lg">
                <span className="text-[#dabc17]">BNB</span> Ledger
              </span>
            )}
          </div>

          <nav className="space-y-2">
            <Link
              href="/dashboard"
              className="flex items-center gap-3 px-4 py-3 rounded-lg bg-gray-900 text-white text-sm font-medium transition-all"
            >
              📊 <span>{sidebarOpen && "Active Ledger Dashboard"}</span>
            </Link>
            <Link
              href="/dashboard/investments"
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:text-white hover:bg-gray-900 text-sm font-medium transition-all"
            >
              💼 <span>{sidebarOpen && "Investment Portfolios"}</span>
            </Link>
            <Link
              href="/dashboard/ledger"
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:text-white hover:bg-gray-900 text-sm font-medium transition-all"
            >
              📜 <span>{sidebarOpen && "Audit Transactions"}</span>
            </Link>
          </nav>
        </div>

        {sidebarOpen && (
          <div className="p-4 rounded-xl border border-gray-900 bg-[#0a0a0a] text-center">
            <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">
              Security Node
            </p>
            <p className="text-xs text-green-400 font-mono font-bold flex items-center justify-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>{" "}
              Encrypted Operational State
            </p>
          </div>
        )}
      </aside>

      {/* CORE WORKSPACE CONTENT PANEL */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* TOP LEVEL NAVIGATION HEADER */}
        <header className="h-16 bg-[#050505] border-b border-gray-900 px-6 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-gray-400 hover:text-white text-sm hidden md:block"
          >
            {sidebarOpen ? "Collapse Navigation" : "Expand"}
          </button>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-xs font-bold text-white">Institutional Mode</p>
              <p className="text-[10px] text-gray-500">Routing Live Nodes</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center text-xs font-bold text-[#dabc17]">
              INV
            </div>
          </div>
        </header>

        {/* WORKSPACE DATA DASHBOARD GRID */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TOP METRIC CARDS BANNER */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* CARD 1: PORTFOLIO VALUE */}
            <div className="p-6 rounded-xl border border-gray-900 bg-[#050505] shadow-xl relative overflow-hidden">
              <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">
                Total Cleared Portfolio Value
              </p>
              {loadingPortfolio ? (
                <div className="h-8 bg-gray-900 animate-pulse rounded mt-2 w-3/4"></div>
              ) : (
                <p className="text-3xl font-bold tracking-tight text-white mt-2">
                  $
                  {portfolio?.total_balance?.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                  })}
                </p>
              )}
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#dabc17] opacity-[0.02] rounded-full blur-2xl"></div>
            </div>

            {/* CARD 2: ACTIVE REVENUE RATE */}
            <div className="p-6 rounded-xl border border-gray-900 bg-[#050505] shadow-xl">
              <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">
                Compound Annual Ledger Yield
              </p>
              {loadingPortfolio ? (
                <div className="h-8 bg-gray-900 animate-pulse rounded mt-2 w-1/2"></div>
              ) : (
                <p className="text-3xl font-bold tracking-tight text-[#dabc17] mt-2">
                  +{portfolio?.active_yield_rate}%{" "}
                  <span className="text-xs text-gray-500 font-medium font-sans">
                    APY
                  </span>
                </p>
              )}
            </div>

            {/* CARD 3: ESCROW PENALTY / PENDING STATS */}
            <div className="p-6 rounded-xl border border-gray-900 bg-[#050505] shadow-xl sm:col-span-2 lg:col-span-1">
              <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">
                In-Flight Pending Allocations
              </p>
              {loadingPortfolio ? (
                <div className="h-8 bg-gray-900 animate-pulse rounded mt-2 w-3/4"></div>
              ) : (
                <p className="text-3xl font-bold tracking-tight text-gray-400 mt-2">
                  $
                  {portfolio?.pending_allocations?.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                  })}
                </p>
              )}
            </div>
          </div>

          {/* LOWER INTERACTIVE SPLIT PANEL */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* PLATFORM CHARTS & ANALYTICS PLACEHOLDER PANEL */}
            <div className="lg:col-span-2 p-6 rounded-xl border border-gray-900 bg-[#050505] h-80 flex flex-col justify-between">
              <div>
                <h4 className="font-bold text-lg text-white">
                  Performance Metrics Feed
                </h4>
                <p className="text-xs text-gray-500">
                  Historical performance yield matrix evaluation mapping.
                </p>
              </div>
              <div className="flex-1 flex items-center justify-center border border-dashed border-gray-900 rounded-lg mt-4 text-xs text-gray-500 font-mono">
                [Visual Analytics Chart Interface Node Mounting Point]
              </div>
            </div>

            {/* TRANSACTION AUDIT LEDGER */}
            <div className="p-6 rounded-xl border border-gray-900 bg-[#050505] h-80 flex flex-col">
              <h4 className="font-bold text-lg text-white mb-1">
                Recent Audit Trails
              </h4>
              <p className="text-xs text-gray-500 mb-4">
                Real-time ledger events logging.
              </p>

              <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                {loadingLedger ? (
                  [1, 2, 3].map((n) => (
                    <div
                      key={n}
                      className="h-12 bg-gray-900 animate-pulse rounded-lg w-full"
                    ></div>
                  ))
                ) : transactions?.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-xs text-gray-600 italic">
                    No historic allocations recorded yet.
                  </div>
                ) : (
                  transactions?.map((tx: any) => (
                    <div
                      key={tx.id}
                      className="p-3 rounded-lg bg-[#0a0a0a] border border-gray-900 flex items-center justify-between text-xs font-mono"
                    >
                      <div>
                        <p
                          className={`font-bold capitalize ${tx.type === "withdrawal" ? "text-red-400" : "text-green-400"}`}
                        >
                          {tx.type.replace("_", " ")}
                        </p>
                        <p className="text-[10px] text-gray-500">
                          {new Date(tx.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-white">
                          ${tx.amount.toLocaleString()}
                        </p>
                        <p
                          className={`text-[9px] uppercase font-bold tracking-tight ${tx.status === "completed" ? "text-green-500" : "text-yellow-500"}`}
                        >
                          {tx.status}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
