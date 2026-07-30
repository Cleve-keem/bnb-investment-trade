"use client";

import { createClient } from "@/libs/supabase/browser";
import { useQuery } from "@tanstack/react-query";

export function useUser() {
  const supabase = createClient();
  
  return useQuery({
    queryKey: ["auth-user"],
    queryFn: async () => {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();
      if (error || !session?.user) return null;

      const { data: profile, error: profileError } = await supabase
        .from("users")
        .select("user_role, is_suspended")
        .eq("id", session.user.id)
        .single();

      if (profileError) {
        throw new Error("Failed to load user profile.");
      }

      return {
        id: session.user.id,
        email: session.user.email,
        username: session.user.user_metadata?.username || "Investor",
        firstName: session.user.user_metadata?.first_name || "",
        lastName: session.user.user_metadata?.last_name || "",
        phoneNumber: session.user.user_metadata?.phone_number || "",
        is_email_verified: !!session.user.email_confirmed_at,
        is_otp_verified: false,
        user_role: profile.user_role,
        is_suspended: profile.is_suspended,
      };
    },
    staleTime: Infinity,
    gcTime: 1000 * 60 * 60,
  });
}
