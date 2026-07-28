import { SupabaseClient } from "@supabase/supabase-js";

export class UserRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async findById(userId: string) {
    const { data, error } = await this.supabase
      .from("users")
      .select(
        `
        id,
        email,
        first_name,
        last_name,
        user_role,
        is_suspended
        `,
      )
      .eq("id", userId)
      .single();

    if (error) {
      throw new Error("Unable to retrieve user profile.");
    }

    return data;
  }

  async updateOtpStatus(userId: string) {
    const { error } = await this.supabase
      .from("users")
      .update({
        is_otp_verified: true,
      })
      .eq("id", userId);

    if (error) {
      throw error;
    }
  }
}
