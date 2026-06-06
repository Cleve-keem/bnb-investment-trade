"use client";

import { useQuery } from "@tanstack/react-query";
import supabase from "@/utils/supabase/supabaseClient";

export function useUser() {
  return useQuery({
    queryKey: ["auth-user"],
    queryFn: async () => {
      // Fetch the current active token session directly from Supabase core
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error || !session?.user) return null;

      // Map the user profile meta properties cleanly
      return {
        id: session.user.id,
        email: session.user.email,
        username: session.user.user_metadata?.username || "Investor",
        firstName: session.user.user_metadata?.first_name || "",
        lastName: session.user.user_metadata?.last_name || "",
        phoneNumber: session.user.user_metadata?.phone_number || "",
        isEmailVerified: !!session.user.email_confirmed_at,
        isOtpVerified: false,
      };
    },
    staleTime: Infinity, // Keep this token mapped globally to prevent excessive network spam
    gcTime: 1000 * 60 * 60,
  });
}