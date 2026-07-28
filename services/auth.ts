import supabase from "@/libs/supabase/browser";
import { LoginSchemaInput } from "@/libs/validations/auth";
import { RegistrationFormType } from "@/types/auth";

export default class AuthService {
  static async registerUser(credentials: RegistrationFormType) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: credentials.email.trim(),
        password: credentials.password,
        options: {
          emailRedirectTo:
            typeof window !== "undefined"
              ? `${window.location.origin}/auth/login?verified=true`
              : undefined,
          data: {
            username: credentials.username.trim(),
            first_name: credentials.firstname.trim(),
            last_name: credentials.lastname.trim(),
            middle_name: credentials?.middlename?.trim(),
            phone_number: credentials.phoneNumber.trim(),
            user_role: "investor",
          },
        },
      });

      if (error) throw error;
      return data;
    } catch (error: any) {
      let friendlyMessage =
        error.message ||
        "An unexpected error occurred during profile registration.";

      if (error.message?.includes("User already registered")) {
        friendlyMessage = "An account with this email address already exists.";
      } else if (error.message?.includes("weak_password")) {
        friendlyMessage = "Security risk: Your password must be stronger.";
      }

      throw new Error(friendlyMessage);
    }
  }

  static async loginUser(credential: LoginSchemaInput) {
    try {
      const { data: authData, error: authError } =
        await supabase.auth.signInWithPassword({
          email: credential.email,
          password: credential.password,
        });

      if (authError || !authData.user) throw authError;
      
      const { data: profile, error: profileError } = await supabase
        .from("users")
        .select("id, email, first_name, last_name, user_role, is_suspended")
        .eq("id", authData.user.id)
        .single();

      if (profileError) {
        throw new Error("Failed to load associated user profile.");
      }

      if (profile.is_suspended) {
        await supabase.auth.signOut();
        throw new Error("This account node has been isolated.");
      }

      return {
        user: authData.user,
        session: authData.session,
        profile,
      };
    } catch (error: any) {
      throw new Error(
        error.message || "An unexpected error occurred Loggin in.",
      );
    }
  }

  static async forgotPassword(email: string) {
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });
      if (error) throw error;
      return data;
    } catch (error: any) {
      throw new Error(
        error.message || "Failed to initialize password recovery.",
      );
    }
  }

  static async resetPassword(password: string) {
    try {
      const { data, error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) throw error;

      return data;
    } catch (error: any) {
      throw new Error(
        error.message ||
          "An unexpected error occurred while resetting password.",
      );
    }
  }
}
