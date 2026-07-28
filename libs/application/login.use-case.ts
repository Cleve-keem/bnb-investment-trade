import { AccountPolicyService } from "../auth/account-policy.service";
import { AuthService } from "../auth/auth.service";
import { AuthMapper } from "../mappers/auth.mapper";
import { UserRepository } from "../repositories/user.repository";
import { LoginSchemaInput } from "../validations/auth";

export class LoginUseCase {
  constructor(
    private readonly authService: AuthService,
    private readonly repository: UserRepository,
    private readonly policy: AccountPolicyService,
  ) {}

  async execute(credentials: LoginSchemaInput) {
    const auth = await this.authService.login(credentials);
    const profile = await this.repository.findById(auth.user.id);

    this.policy.ensureCanLogin(profile);

    return AuthMapper.fromLogin(auth?.user, profile);
  }
}
