import { RegistrationFormType } from "@/types/auth";
import { AuthService } from "../auth/auth.service";

export class RegisterUseCase {
  constructor(private readonly authService: AuthService) {}

  async execute(credentials: RegistrationFormType) {
    const auth = await this.authService.register(credentials);

    console.log("auth from register use case", auth);

    return {
      id: auth.user?.id,
      email: auth.user?.email,
      emailConfirmationSent: true,
    };
  }
}
