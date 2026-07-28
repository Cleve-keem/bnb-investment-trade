export interface AuthUserDto {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  is_email_verified?: boolean;
  is_suspended?: boolean;
}

export interface RegisterResponseDto {
  id: string;
  email: string;
  emailConfirmationSent: boolean;
}
