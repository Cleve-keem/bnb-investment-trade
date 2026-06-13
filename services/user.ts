import supabase from "@/utils/supabase/supabaseClient";

export default class UserService {
  static async getUserIdAndFirstName(email: string) {
    const { data: userProfile, error: profileError } = await supabase
      .from("profiles")
      .select("id, first_name")
      .eq("email", email)
      .single();

    return { userProfile, profileError };
  }
}
