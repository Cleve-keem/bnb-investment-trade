"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Briefcase,
  History,
  Menu,
  X,
  TrendingUp,
  Wallet,
  Clock,
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCcw,
  ShieldCheck,
  User,
} from "lucide-react";

import { usePortfolio } from "@/hooks/usePortfolio";
import useTransaction from "@/hooks/useTransaction";

// 🌟 STRICK ARCHITECTURAL INTERFACES
interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string; size?: number }>;
}

export default function DashboardPortal() {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  const { portfolio, loadingPortfolio } = usePortfolio();
  const { transactions, loadingLedger } = useTransaction();

  const navigation: NavigationItem[] = [
    {
      name: "Active Ledger Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Investment Portfolios",
      href: "/dashboard/investments",
      icon: Briefcase,
    },
    { name: "Audit Transactions", href: "/dashboard/ledger", icon: History },
  ];

  return (
    <div className="min-h-screen bg-black text-[#F4F4F5] font-sans antialiased flex selection:bg-[#dabc17]/30 selection:text-white">
      {/* 1. DESKTOP PERSISTENT STRUCTURAL SIDEBAR */}
      <aside
        className={`${
          sidebarOpen ? "w-64" : "w-20"
        } bg-[#09090B] border-r border-[#1E1E24] transition-all duration-300 ease-in-out p-5 flex flex-col justify-between hidden md:flex z-20`}
      >
        <div className="space-y-7">
          {/* Brand Logo Alignment */}
          <div className="flex items-center gap-3 h-10 px-2">
            <div className="relative w-6 h-6 shrink-0 transition-transform duration-300 hover:rotate-12">
              <Image
                src="/logo2.png"
                alt="BNB Logo"
                fill
                sizes="24px" // 🚀 Added this prop to match your w-6 h-6 boundaries (6 * 4px = 24px)
                className="object-contain"
                priority
              />
            </div>
            {sidebarOpen && (
              <span className="font-semibold tracking-tight text-base bg-gradient-to-r from-white via-[#F4F4F5] to-gray-400 bg-clip-text text-transparent">
                <span className="text-[#dabc17] font-bold">BNB</span> Ledger
              </span>
            )}
          </div>

          {/* Navigation Options Router Matrix */}
          <nav className="space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group relative ${
                    isActive
                      ? "bg-[#18181B] text-white font-semibold shadow-sm border border-[#27272A]"
                      : "text-zinc-400 hover:text-zinc-100 hover:bg-[#09090B]"
                  }`}
                >
                  <Icon
                    className={`flex-shrink-0 ${isActive ? "text-[#dabc17]" : "text-zinc-400 group-hover:text-zinc-200"}`}
                    size={18}
                  />
                  {sidebarOpen && <span className="truncate">{item.name}</span>}

                  {/* Premium Micro-border Anchor Marker */}
                  {isActive && (
                    <span className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-[#dabc17] rounded-r-md" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Global System Health Token */}
        {sidebarOpen && (
          <div className="p-3.5 rounded-xl border border-[#1E1E24] bg-[#09090B]/50 backdrop-blur-sm">
            <p className="text-[10px] text-zinc-500 font-medium tracking-widest uppercase mb-1.5">
              Security Node
            </p>
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-xs text-zinc-300 font-mono font-medium tracking-tight">
                Active Edge Tunneling
              </span>
            </div>
          </div>
        )}
      </aside>

      {/* 2. MOBILE SLIDE-OUT DRAWER OVERLAY PANEL */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-50 md:hidden bg-black/60 backdrop-blur-sm transition-opacity"
          onClick={() => setMobileMenuOpen(false)}
        >
          <aside
            className="w-72 bg-[#09090B] border-r border-[#1E1E24] h-full p-6 flex flex-col justify-between"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-6">
              <div className="flex items-center justify-between h-10">
                <div className="flex items-center gap-3">
                  <Image src="/logo2.png" alt="Logo" width={24} height={24} />
                  <span className="font-semibold text-lg text-white">
                    <span className="text-[#dabc17]">BNB</span> Ledger
                  </span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-zinc-400 hover:text-white p-1"
                >
                  <X size={20} />
                </button>
              </div>
              <nav className="space-y-1">
                {navigation.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                        isActive
                          ? "bg-[#18181B] text-white border border-[#27272A]"
                          : "text-zinc-400 hover:bg-zinc-900"
                      }`}
                    >
                      <Icon
                        className={
                          isActive ? "text-[#dabc17]" : "text-zinc-400"
                        }
                        size={18}
                      />
                      <span>item.name</span>
                    </Link>
                  );
                })}
              </nav>
            </div>
          </aside>
        </div>
      )}

      {/* 3. MAIN APP PORTAL CONTAINER */}
      <div className="flex-1 flex flex-col min-w-0 max-w-7xl mx-auto w-full">
        {/* VIEWPORT INTERACTION HEADER BANNER */}
        <header className="h-16 bg-black border-b border-[#1E1E24] px-4 sm:px-8 flex items-center justify-between sticky top-0 z-10 backdrop-blur-md bg-black/80">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-zinc-400 hover:text-white p-2 rounded-lg hover:bg-zinc-900 hidden md:block transition-all"
              aria-label="Toggle Navigation Panel"
            >
              <Menu size={18} />
            </button>
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="text-zinc-400 hover:text-white p-2 rounded-lg hover:bg-zinc-900 md:hidden transition-all"
              aria-label="Open Navigation Mobile Menu"
            >
              <Menu size={20} />
            </button>
            <div className="h-4 w-px bg-zinc-800 hidden md:block" />
            <h1 className="text-sm font-semibold text-zinc-200 tracking-tight hidden sm:block">
              Control Center Workspace
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-semibold text-zinc-100 font-sans tracking-tight">
                Institutional Account
              </p>
              <p className="text-[10px] text-[#dabc17] font-mono tracking-wider uppercase font-medium">
                Node Verified
              </p>
            </div>
            <div className="w-9 h-9 rounded-full bg-gradient-to-b from-[#1E1E24] to-[#09090B] border border-[#27272A] flex items-center justify-center text-zinc-300 hover:text-white hover:border-zinc-600 transition-all cursor-pointer shadow-inner">
              <User size={16} />
            </div>
          </div>
        </header>

        {/* WORKSPACE INTERACTIVE SCROLL GRID BODY */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-8">
          {/* HIGH-END METRIC KPI GLANCE GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* KPI METRIC CARD 1: BALANCE ASSETS */}
            <div className="p-6 rounded-xl border border-[#1E1E24] bg-gradient-to-b from-[#09090B] to-black shadow-sm group hover:border-zinc-700 transition-all duration-300 relative overflow-hidden flex flex-col justify-between min-h-[135px]">
              <div className="flex items-start justify-between w-full">
                <div className="space-y-1">
                  <p className="text-xs text-zinc-400 font-medium tracking-wide">
                    Total Liquid Net Balances
                  </p>
                  {loadingPortfolio ? (
                    <div className="h-7 bg-zinc-900 animate-pulse rounded mt-1.5 w-40"></div>
                  ) : (
                    <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-mono mt-1">
                      $
                      {portfolio?.total_balance?.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                      })}
                    </h2>
                  )}
                </div>
                <div className="p-2.5 rounded-lg bg-[#18181B] border border-[#27272A] text-zinc-400 group-hover:text-[#dabc17] group-hover:border-[#dabc17]/30 transition-colors">
                  <Wallet size={16} />
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 mt-4 pt-3 border-t border-zinc-900 w-full">
                <span className="text-emerald-400 font-semibold flex items-center">
                  🛡️ Protected Ledger
                </span>
              </div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#dabc17] opacity-[0.01] group-hover:opacity-[0.02] rounded-full blur-3xl transition-opacity pointer-events-none" />
            </div>

            {/* KPI METRIC CARD 2: COMPOUNDING APY REVENUE */}
            <div className="p-6 rounded-xl border border-[#1E1E24] bg-gradient-to-b from-[#09090B] to-black shadow-sm group hover:border-zinc-700 transition-all duration-300 relative overflow-hidden flex flex-col justify-between min-h-[135px]">
              <div className="flex items-start justify-between w-full">
                <div className="space-y-1">
                  <p className="text-xs text-zinc-400 font-medium tracking-wide">
                    Compound Performance APY
                  </p>
                  {loadingPortfolio ? (
                    <div className="h-7 bg-zinc-900 animate-pulse rounded mt-1.5 w-24"></div>
                  ) : (
                    <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#dabc17] font-mono mt-1">
                      +{portfolio?.active_yield_rate}%
                    </h2>
                  )}
                </div>
                <div className="p-2.5 rounded-lg bg-[#18181B] border border-[#27272A] text-zinc-400 group-hover:text-[#dabc17] group-hover:border-[#dabc17]/30 transition-colors">
                  <TrendingUp size={16} />
                </div>
              </div>
              <div className="text-[11px] text-zinc-500 mt-4 pt-3 border-t border-zinc-900 w-full flex items-center gap-1">
                Real-time algorithmic indexing yield acceleration vectors.
              </div>
            </div>

            {/* KPI METRIC CARD 3: IN FLIGHT BLOCKED ESCROW */}
            <div className="p-6 rounded-xl border border-[#1E1E24] bg-gradient-to-b from-[#09090B] to-black shadow-sm group hover:border-zinc-700 transition-all duration-300 relative overflow-hidden flex flex-col justify-between min-h-[135px] sm:col-span-2 lg:col-span-1">
              <div className="flex items-start justify-between w-full">
                <div className="space-y-1">
                  <p className="text-xs text-zinc-400 font-medium tracking-wide">
                    In-Flight Escrow Assets
                  </p>
                  {loadingPortfolio ? (
                    <div className="h-7 bg-zinc-900 animate-pulse rounded mt-1.5 w-32"></div>
                  ) : (
                    <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-300 font-mono mt-1">
                      $
                      {portfolio?.pending_allocations?.toLocaleString(
                        undefined,
                        { minimumFractionDigits: 2 },
                      )}
                    </h2>
                  )}
                </div>
                <div className="p-2.5 rounded-lg bg-[#18181B] border border-[#27272A] text-zinc-400 group-hover:text-zinc-200 transition-colors">
                  <Clock size={16} />
                </div>
              </div>
              <div className="text-[11px] text-zinc-500 mt-4 pt-3 border-t border-zinc-900 w-full flex items-center gap-1">
                Awaiting final cryptographic consensus signature execution.
              </div>
            </div>
          </div>

          {/* LOWER TWO COLUMN LAYOUT CONTENT GRID MAP */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* PLATFORM CHART PANEL WRAPPER AREA */}
            <div className="lg:col-span-2 p-6 rounded-xl border border-[#1E1E24] bg-[#09090B] flex flex-col justify-between group hover:border-zinc-800 transition-all min-h-[380px]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full">
                <div>
                  <h3 className="font-semibold text-base text-zinc-100 tracking-tight">
                    Performance Analytics Engine
                  </h3>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Asset optimization historical trace analytics.
                  </p>
                </div>
                <div className="flex items-center gap-2 bg-black border border-[#1E1E24] p-1 rounded-lg self-start sm:self-auto">
                  <button className="px-2.5 py-1 text-[11px] font-medium rounded-md bg-[#18181B] text-white border border-[#27272A] transition-all">
                    7 Days
                  </button>
                  <button className="px-2.5 py-1 text-[11px] font-medium rounded-md text-zinc-400 hover:text-white transition-all">
                    30 Days
                  </button>
                </div>
              </div>

              {/* Chart Interface Sandbox Mounting Box */}
              <div className="flex-1 flex flex-col items-center justify-center border border-dashed border-[#27272A] bg-black/40 rounded-lg mt-5 p-6 group-hover:bg-black/20 transition-all">
                <div className="p-3 rounded-full bg-[#18181B] border border-[#27272A] text-zinc-500 mb-2 group-hover:scale-105 transition-transform duration-300">
                  <RefreshCcw size={18} className="animate-spin-[12s]" />
                </div>
                <p className="text-xs font-medium text-zinc-300 font-mono tracking-tight">
                  Awaiting Chart Context Integration
                </p>
                <p className="text-[11px] text-zinc-500 mt-0.5 text-center max-w-xs">
                  Mount your tracking components inside this viewport boundary
                  wrapper block node.
                </p>
              </div>
            </div>

            {/* HIGH END LOG AUDIT TRAIL MONITOR */}
            <div className="p-6 rounded-xl border border-[#1E1E24] bg-[#09090B] flex flex-col group hover:border-zinc-800 transition-all min-h-[380px]">
              <div className="mb-5">
                <h3 className="font-semibold text-base text-zinc-100 tracking-tight">
                  Recent Audit Trails
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Real-time immutable ledger operations.
                </p>
              </div>

              {/* Transactions Execution Log Stream */}
              <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 custom-scrollbar">
                {loadingLedger ? (
                  Array.from({ length: 4 }).map((_, idx) => (
                    <div
                      key={idx}
                      className="h-[62px] bg-[#18181B]/40 border border-[#27272A]/40 animate-pulse rounded-xl w-full"
                    />
                  ))
                ) : transactions?.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-xs text-zinc-500 italic p-6 text-center border border-dashed border-[#27272A] rounded-xl">
                    No verified operations recorded on this chain profile.
                  </div>
                ) : (
                  transactions?.map((tx: any) => {
                    const isWithdrawal = tx.type === "withdrawal";
                    return (
                      <div
                        key={tx.id}
                        className="p-3 rounded-xl bg-black border border-[#1E1E24] hover:border-zinc-700 flex items-center justify-between transition-all duration-200 group/row"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={`p-2 rounded-lg flex-shrink-0 border ${
                              isWithdrawal
                                ? "bg-red-500/5 border-red-500/10 text-red-400"
                                : "bg-emerald-500/5 border-emerald-500/10 text-emerald-400"
                            }`}
                          >
                            {isWithdrawal ? (
                              <ArrowDownLeft size={14} />
                            ) : (
                              <ArrowUpRight size={14} />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-xs text-zinc-200 capitalize truncate tracking-tight">
                              {tx.type.replace("_", " ")}
                            </p>
                            <p className="text-[10px] font-mono text-zinc-500 mt-0.5">
                              {new Date(tx.created_at).toLocaleDateString(
                                undefined,
                                {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                },
                              )}
                            </p>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0 pl-3">
                          <p className="font-semibold font-mono text-xs text-zinc-100">
                            {isWithdrawal ? "-" : "+"}$
                            {tx.amount.toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                            })}
                          </p>
                          <span
                            className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-medium tracking-tight font-mono mt-0.5 border uppercase ${
                              tx.status === "completed"
                                ? "bg-emerald-500/5 text-emerald-400 border-emerald-500/10"
                                : "bg-amber-500/5 text-amber-400 border-amber-500/10"
                            }`}
                          >
                            {tx.status}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>

        {/* STRUCTURAL ARCHITECTURAL FOOTER */}
        <footer className="h-12 border-t border-[#1E1E24] px-4 sm:px-8 flex items-center justify-between text-[10px] text-zinc-500 font-mono tracking-tight bg-black">
          <p>© 2026 BNB Investment Group. Confidential Ledger.</p>
          <div className="flex items-center gap-1 text-zinc-400 font-medium">
            <ShieldCheck size={12} className="text-[#dabc17]" />
            <span>FIPS 140-3 Cryptographic Isolation</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
