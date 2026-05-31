"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import supabase from "@/utils/supabase/supabaseClient";

export function useAuthInitialization() {
  const setSession = useAuthStore((state) => state.setSession);
  const clearSession = useAuthStore((state) => state.clearSession);

  useEffect(() => {
    async function bootstrapSession() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        setSession({
          id: session.user.id,
          email: session.user.email || "",
          username: session.user.user_metadata?.username || "",
          firstName: session.user.user_metadata?.first_name || "",
          middleName: session.user.user_metadata?.middle_name || "",
          lastName: session.user.user_metadata?.last_name || "",
          phoneNumber: session.user.user_metadata?.phone_number || "",
          isEmailVerified: session.user.email_confirmed_at ? true : false,
          isOtpVerified: false,
        });
      } else {
        clearSession();
      }
    }

    bootstrapSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setSession({
          id: session.user.id,
          email: session.user.email || "",
          username: session.user.user_metadata?.username || "",
          firstName: session.user.user_metadata?.first_name || "",
          middleName: session.user.user_metadata?.middle_name || "",
          lastName: session.user.user_metadata?.last_name || "",
          phoneNumber: session.user.user_metadata?.phone_number || "",
          isEmailVerified: session.user.email_confirmed_at ? true : false,
          isOtpVerified: false,
        });
      } else {
        clearSession();
      }
    });

    return () => subscription.unsubscribe();
  }, [setSession, clearSession]);
}
