import { createClient } from "@/libs/supabase/browser";

export default class UserService {
  static async getUserByEmail(email: string) {
    const supabase = createClient();
    const { data: userProfile, error: profileError } = await supabase
      .from("users")
      .select("id, first_name")
      .eq("email", email)
      .maybeSingle();

    return { userProfile, profileError };
  }

  static async getUserProfile(userId: string) {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) throw error;
    return data;
  }
}
