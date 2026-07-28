export type RegistrationFormType = {
  username: string;
  firstname: string;
  email: string;
  lastname: string;
  middlename?: string | undefined;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
};

export type UserProfile = {
  id: string | number;
  first_name: string;
  last_name: string;
  middle_name?: string | undefined;
  email: string;
  username: string;
  phone_number?: string;
  user_role: "investor" | "admin";
  is_suspended: boolean;
  is_emai_verified?: boolean;
};
