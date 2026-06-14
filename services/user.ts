import supabase from "@/utils/supabase/supabaseClient";

export default class UserService {
  static async getUserByEmail(email: string) {
    const { data: userProfile, error: profileError } = await supabase
      .from("users")
      .select("id, first_name")
      .eq("email", email)
      .maybeSingle();

    return { userProfile, profileError };
  }
}
