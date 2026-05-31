import { LoginSchemaInput } from "@/libs/validations/auth";
import { RegistrationFormType } from "@/types/auth";
import supabase from "@/utils/supabase/supabaseClient";

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
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credential.email,
        password: credential.password,
      });
      if (error) throw error;
      return data;
    } catch (error: any) {
      throw new Error(
        error.message || "An unexpected error occurred Loggin in.",
      );
    }
  }
}
