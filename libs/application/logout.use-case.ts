import { AuthService } from "@/libs/auth/auth.service";

export class LogoutUseCase {
  constructor(private readonly authService: AuthService) {}

  async execute() {
    await this.authService.logout();
  }
}
