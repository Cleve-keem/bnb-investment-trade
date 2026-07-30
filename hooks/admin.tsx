import { createClient } from "@/libs/supabase/browser";
import { AdminUser } from "@/types/admin";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

// 1. Fetch All Users with Portfolio and OTP status
export function useAdminDashboardList() {
  const supabase = createClient();

  const {
    data: users,
    isPending,
    refetch,
  } = useQuery({
    queryKey: ["admin-users-list"],
    queryFn: async () => {
      // Fetch users base profile
      const { data: profiles, error: profileErr } = await supabase
        .from("users")
        .select("id, email, first_name, last_name");

      if (profileErr) throw profileErr;

      // Fetch all portfolios
      const { data: portfolios } = await supabase
        .from("portfolios")
        .select("*");

      //   Fetch active/latest OTPs
      const { data: otps } = await supabase
        .from("security_otps")
        .select("user_id, email, otp_code, expires_at");

      // Merge data models
      const merged: AdminUser[] = (profiles || []).map((user) => {
        const userPort = portfolios?.find((p) => p.user_id === user.id);
        const userOtp = otps?.find(
          (o) => o.user_id === user.id || o?.email === user.email,
        );

        return {
          ...user,
          portfolio: userPort
            ? {
                total_balance: userPort.total_balance ?? 0,
                active_yield_rate: userPort.active_yield_rate ?? 0,
                pending_allocations: userPort.pending_allocations ?? 0,
              }
            : {
                total_balance: 0,
                active_yield_rate: 0,
                pending_allocations: 0,
              },
          latest_otp: userOtp
            ? {
                code: userOtp.otp_code,
                expires_at: userOtp.expires_at,
              }
            : undefined,
        };
      });

      return merged;
    },
  });

  return { users, isPending, refetch };
}

// 2. Mutation: Update User Balance & Yield
export function useUpdateBalanceMutation() {
  const supabase = createClient();
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const queryClient = useQueryClient();

  const updateBalanceMutation = useMutation({
    mutationFn: async ({
      userId,
      balance,
      yieldRate,
    }: {
      userId: string;
      balance: number;
      yieldRate: number;
    }) => {
      const { error } = await supabase.from("portfolios").upsert({
        user_id: userId,
        total_balance: balance,
        active_yield_rate: yieldRate,
        updated_at: new Date().toISOString(),
      });

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Investor balance node successfully updated!");
      queryClient.invalidateQueries({ queryKey: ["admin-users-list"] });
      setSelectedUser(null);
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to commit balance update.");
    },
  });

  return { updateBalanceMutation, selectedUser, setSelectedUser };
}

// 3. Mutation: Toggle User Suspension / Revoke Access
export function useToggleSuspendMutation() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  const toggleSuspendMutation = useMutation({
    mutationFn: async ({
      userId,
      suspend,
    }: {
      userId: string;
      suspend: boolean;
    }) => {
      const { error } = await supabase
        .from("users")
        .update({ is_suspended: suspend })
        .eq("id", userId);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      toast.success(
        variables.suspend
          ? "Investor node isolated and suspended."
          : "Investor profile access restored.",
      );
      queryClient.invalidateQueries({ queryKey: ["admin-users-list"] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to update suspension status.");
    },
  });

  return toggleSuspendMutation;
}
