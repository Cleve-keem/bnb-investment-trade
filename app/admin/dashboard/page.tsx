"use client";

import { useState } from "react";
import {
  Users,
  Search,
  ShieldAlert,
  KeyRound,
  DollarSign,
  UserX,
  Edit3,
  RefreshCw,
  CheckCircle2,
  XCircle,
  TrendingUp,
} from "lucide-react";

import Logo from "@/components/Logo";
import {
  useAdminDashboardList,
  useToggleSuspendMutation,
  useUpdateBalanceMutation,
} from "@/hooks/admin";

export default function AdminDashboardPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [newBalance, setNewBalance] = useState<string>("");
  const [newYield, setNewYield] = useState<string>("");
  const { users, isPending: isLoading, refetch } = useAdminDashboardList();
  const toggleSuspendMutation = useToggleSuspendMutation();
  const { updateBalanceMutation, selectedUser, setSelectedUser } =
    useUpdateBalanceMutation();

  // Filter Logic
  const filteredUsers = users?.filter(
    (u) =>
      u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.last_name?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8 antialiased">
      {/* Top Header Workspace Node */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 border-b border-zinc-800 pb-6">
        <div className="flex items-center gap-3">
          <Logo />
          <div>
            <h1 className="text-xl font-bold tracking-tight">
              <span className="text-[#e9ce39]">BNB</span> Admin Console
            </h1>
            <p className="text-xs text-zinc-500">
              Node Management & Capital Oversight
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
              size={14}
            />
            <input
              type="text"
              placeholder="Filter by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#09090B] border border-zinc-800 rounded-lg pl-9 pr-3 py-2 text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-[#e9ce39] transition-colors"
            />
          </div>
          <button
            onClick={() => refetch()}
            className="p-2 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-lg text-zinc-400 hover:text-white transition-colors"
            title="Refresh Ledger Cache"
          >
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {/* Metric Quick Stats */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-[#09090B] border border-[#e9cf3920] p-4 rounded-xl flex items-center gap-4">
          <div className="p-3 bg-[#e9ce3915] text-[#e9ce39] rounded-lg">
            <Users size={20} />
          </div>
          <div>
            <p className="text-xs text-zinc-500 uppercase tracking-wider font-medium">
              Total Registered Nodes
            </p>
            <p className="text-xl font-bold text-zinc-100">
              {users?.length || 0}
            </p>
          </div>
        </div>

        <div className="bg-[#09090B] border border-[#e9cf3920] p-4 rounded-xl flex items-center gap-4">
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-lg">
            <DollarSign size={20} />
          </div>
          <div>
            <p className="text-xs text-zinc-500 uppercase tracking-wider font-medium">
              System Liquidity Pool
            </p>
            <p className="text-xl font-bold text-zinc-100">
              $
              {users
                ?.reduce((acc, u) => acc + (u.portfolio?.total_balance || 0), 0)
                .toLocaleString("en-US", { minimumFractionDigits: 2 }) ||
                "0.00"}
            </p>
          </div>
        </div>

        <div className="bg-[#09090B] border border-[#e9cf3920] p-4 rounded-xl flex items-center gap-4">
          <div className="p-3 bg-amber-500/10 text-amber-400 rounded-lg">
            <KeyRound size={20} />
          </div>
          <div>
            <p className="text-xs text-zinc-500 uppercase tracking-wider font-medium">
              Active Auth Requests
            </p>
            <p className="text-xl font-bold text-zinc-100">
              {users?.filter((u) => u.latest_otp && !u.latest_otp.is_used)
                .length || 0}{" "}
              Pending
            </p>
          </div>
        </div>
      </div>

      {/* Main Ledger Table */}
      <div className="max-w-7xl mx-auto bg-[#09090B] border border-[#e9cf393a] rounded-xl overflow-hidden shadow-2xl">
        <div className="px-6 py-4 border-b border-zinc-900 flex justify-between items-center">
          <h2 className="text-sm font-semibold text-zinc-200">
            Investor Ledger Matrix
          </h2>
          <span className="text-xs text-zinc-500">
            {filteredUsers?.length || 0} records matching filter
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-400">
            <thead className="bg-zinc-950/80 uppercase text-[10px] tracking-wider text-zinc-500 border-b border-zinc-900">
              <tr>
                <th className="px-6 py-3">Investor Profile</th>
                <th className="px-6 py-3">Portfolio Balance</th>
                <th className="px-6 py-3">Yield Rate</th>
                <th className="px-6 py-3">Recent OTP Code</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-8 text-center text-zinc-600"
                  >
                    Querying admin authorization records...
                  </td>
                </tr>
              ) : filteredUsers?.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-8 text-center text-zinc-600"
                  >
                    No matching investor nodes found.
                  </td>
                </tr>
              ) : (
                filteredUsers?.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-zinc-900/40 transition-colors"
                  >
                    {/* User Identity */}
                    <td className="px-6 py-4">
                      <div className="font-medium text-zinc-200">
                        {user.first_name || "Investor"} {user.last_name || ""}
                      </div>
                      <div className="text-[11px] text-zinc-500">
                        {user.email}
                      </div>
                    </td>

                    {/* Balance */}
                    <td className="px-6 py-4 font-mono font-semibold text-zinc-200">
                      $
                      {user.portfolio?.total_balance?.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                      })}
                    </td>

                    {/* Yield */}
                    <td className="px-6 py-4 font-mono text-emerald-400">
                      +{user.portfolio?.active_yield_rate}%
                    </td>

                    {/* OTP Security Monitor */}
                    <td className="px-6 py-4">
                      {user.latest_otp ? (
                        <div className="flex items-center gap-2">
                          <span className="font-mono bg-zinc-900 text-[#e9ce39] px-2 py-0.5 rounded border border-[#e9ce3930] text-[11px]">
                            {user.latest_otp.code}
                          </span>
                          {user.latest_otp.is_used ? (
                            <CheckCircle2 size={12} className="text-zinc-600" />
                          ) : (
                            <span className="text-[10px] text-amber-400 animate-pulse">
                              Active
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-zinc-600 text-[11px]">
                          No active OTP
                        </span>
                      )}
                    </td>

                    {/* Account Access Status */}
                    <td className="px-6 py-4">
                      {user.is_suspended ? (
                        <span className="inline-flex items-center gap-1 text-[10px] text-red-400 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20">
                          <XCircle size={10} /> Suspended
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                          <CheckCircle2 size={10} /> Operational
                        </span>
                      )}
                    </td>

                    {/* Action Panel */}
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setNewBalance(
                            user.portfolio?.total_balance?.toString() || "0",
                          );
                          setNewYield(
                            user.portfolio?.active_yield_rate?.toString() ||
                              "0",
                          );
                        }}
                        className="p-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-md text-zinc-300 hover:text-white transition-colors"
                        title="Edit Capital Node"
                      >
                        <Edit3 size={12} />
                      </button>

                      <button
                        onClick={() =>
                          toggleSuspendMutation.mutate({
                            userId: user.id,
                            suspend: !user.is_suspended,
                          })
                        }
                        className={`p-1.5 rounded-md border transition-colors ${
                          user.is_suspended
                            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20"
                            : "bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20"
                        }`}
                        title={
                          user.is_suspended
                            ? "Reactivate Node"
                            : "Suspend Access"
                        }
                      >
                        <UserX size={12} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Capital Balance Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-center p-4 z-50">
          <div className="bg-[#09090B] border border-[#e9cf3940] w-full max-w-md p-6 rounded-xl shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-zinc-900 pb-3">
              <h3 className="font-semibold text-sm text-zinc-100">
                Override Balance: {selectedUser.first_name}{" "}
                {selectedUser.last_name}
              </h3>
              <button
                onClick={() => setSelectedUser(null)}
                className="text-zinc-500 hover:text-white text-xs"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[11px] text-zinc-400 font-medium mb-1 block">
                  Total Balance ($ USD)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={newBalance}
                  onChange={(e) => setNewBalance(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-[#e9ce39]"
                />
              </div>

              <div>
                <label className="text-[11px] text-zinc-400 font-medium mb-1 block">
                  Active Yield Rate (%)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={newYield}
                  onChange={(e) => setNewYield(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-[#e9ce39]"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                onClick={() => setSelectedUser(null)}
                className="px-3 py-1.5 rounded-lg border border-zinc-800 text-xs text-zinc-400 hover:bg-zinc-900"
              >
                Cancel
              </button>
              <button
                onClick={() =>
                  updateBalanceMutation.mutate({
                    userId: selectedUser.id,
                    balance: parseFloat(newBalance) || 0,
                    yieldRate: parseFloat(newYield) || 0,
                  })
                }
                disabled={updateBalanceMutation.isPending}
                className="px-3 py-1.5 rounded-lg bg-[#dabc17] hover:bg-[#ebd026] text-black font-bold text-xs transition-colors"
              >
                {updateBalanceMutation.isPending
                  ? "Updating..."
                  : "Commit Override"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
