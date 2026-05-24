import { RegistrationFormType } from "@/types/auth";
import supabase from "@/utils/supabase/supabaseClient";

export default class AuthService {
  static async registerUser(credentials: RegistrationFormType) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: credentials.email,
        password: credentials.password,
        options: {
          data: {
            first_name: credentials.firstname,
            last_name: credentials.lastname,
            middle_name: credentials.middlename,
            phone_number: credentials.phoneNumber,
          },
        },
      });

      if (error) {
        throw error;
      }

      return data;
    } catch (error: any) {
      throw error;
    }
  }
}
