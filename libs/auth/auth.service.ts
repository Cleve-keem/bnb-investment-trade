import { AuthError, SupabaseClient } from "@supabase/supabase-js";
import { LoginSchemaInput } from "@/libs/validations/auth";
import { RegistrationFormType } from "@/types/auth";

export class AuthService {
  constructor(private readonly supabase: SupabaseClient) {}
  // login();
  async login(credentials: LoginSchemaInput) {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email: credentials.email.trim(),
      password: credentials.password,
    });

    if (error) {
      throw new AuthError(error.message);
    }

    if (!data.user) {
      throw new AuthError("Authentication failed.");
    }

    console.log(data);
    return data;
  }
  // register()
  async register(credentials: RegistrationFormType) {
    const { data, error } = await this.supabase.auth.signUp({
      email: credentials.email.trim(),
      password: credentials.password.trim(),
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/login?verified=true`,
        data: {
          email: credentials.email.trim(),
          username: credentials.username.trim(),
          phone_number: credentials.phoneNumber.trim(),
          first_name: credentials.firstname.trim(),
          last_name: credentials.lastname.trim(),
          middle_name: credentials.middlename?.trim(),
          user_role: "investor",
          is_suspended: false,
        },
      },
    });

    if (error) {
      console.log(error.message);
      throw new AuthError(error.message);
    }

    return data;
  }

  async getCurrentUser() {
    const {
      data: { user },
      error,
    } = await this.supabase.auth.getUser();

    if (error || !user) {
      throw new Error("Unauthorized");
    }

    return user;
  }

  // logout()
  async logout() {
    const { error } = await this.supabase.auth.signOut();

    if (error) {
      throw new Error(error.message);
    }
  }
}
