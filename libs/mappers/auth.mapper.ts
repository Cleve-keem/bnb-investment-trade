import { AuthUserDto } from "@/libs/dto/auth.dto";

interface UserProfile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  user_role: string;
  is_suspended: boolean;
}

export class AuthMapper {
  static toDto(auth: any, profile: UserProfile): AuthUserDto {
    console.log(auth);
    return {
      id: auth.user?.id,
      email: profile.email,
      firstName: profile.first_name,
      lastName: profile.last_name,
      role: profile.user_role,
      is_email_verified: !!auth.email_confirmed_at,
      is_suspended: profile.is_suspended,
    };
  }
  static fromProfile(profile: UserProfile): AuthUserDto {
    return {
      id: profile.id,
      email: profile.email,
      firstName: profile.first_name,
      lastName: profile.last_name,
      role: profile.user_role,
      is_suspended: profile.is_suspended,
    };
  }

  static fromLogin(user: any, profile: UserProfile): AuthUserDto {
    return {
      id: user.id,
      email: profile.email,
      firstName: profile.first_name,
      lastName: profile.last_name,
      role: profile.user_role,
      is_email_verified: !!user.email_confirmed_at,
      is_suspended: profile.is_suspended,
    };
  }
}
